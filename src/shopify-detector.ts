// src/shopify-detector.ts
// Detects Shopify store APIs and generates integration code

import { chromium, Page, Request, Response } from 'playwright';
import path from 'path';
import fs from 'fs/promises';

// ============================================================================
// TYPES
// ============================================================================

export interface ShopifyAPICall {
    endpoint: string;
    method: string;
    query?: string;
    variables?: Record<string, any>;
    operationName?: string;
    responsePreview?: any;
}

export interface ProductData {
    id: string;
    title: string;
    handle: string;
    description?: string;
    price: string;
    compareAtPrice?: string;
    images: Array<{ url: string; alt?: string }>;
    variants?: Array<{ id: string; title: string; price: string }>;
}

export interface CollectionData {
    id: string;
    title: string;
    handle: string;
    image?: { url: string; alt?: string };
    productCount?: number;
}

export interface ShopifyDetectionResult {
    isShopify: boolean;
    storeInfo: {
        domain?: string;
        name?: string;
        currency?: string;
        locale?: string;
    };
    apiCalls: ShopifyAPICall[];
    products: ProductData[];
    collections: CollectionData[];
    detectedFeatures: {
        hasCart: boolean;
        hasSearch: boolean;
        hasFilters: boolean;
        hasWishlist: boolean;
        hasReviews: boolean;
    };
}

// ============================================================================
// DETECTION
// ============================================================================

export const detectShopifyStore = async (
    url: string,
    options: { timeout?: number; headless?: boolean } = {}
): Promise<ShopifyDetectionResult> => {
    const browser = await chromium.launch({ headless: options.headless ?? true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const apiCalls: ShopifyAPICall[] = [];
    const timeout = options.timeout ?? 30000;

    // Intercept network requests
    page.on('request', (request: Request) => {
        const reqUrl = request.url();

        // Detect Shopify Storefront API (GraphQL)
        if (reqUrl.includes('/api/') && (reqUrl.includes('graphql') || request.method() === 'POST')) {
            try {
                const postData = request.postDataJSON();
                if (postData?.query) {
                    apiCalls.push({
                        endpoint: reqUrl,
                        method: request.method(),
                        query: postData.query,
                        variables: postData.variables,
                        operationName: postData.operationName
                    });
                }
            } catch { }
        }

        // Detect Shopify AJAX API
        if (reqUrl.includes('/cart.js') ||
            reqUrl.includes('/products.json') ||
            reqUrl.includes('/collections/') ||
            reqUrl.includes('/search/suggest')) {
            apiCalls.push({
                endpoint: reqUrl,
                method: request.method()
            });
        }
    });

    // Capture some responses for schema inference
    page.on('response', async (response: Response) => {
        const reqUrl = response.url();
        if (reqUrl.includes('graphql') && response.status() === 200) {
            try {
                const data = await response.json();
                const matchingCall = apiCalls.find(c => c.endpoint === reqUrl && !c.responsePreview);
                if (matchingCall) {
                    // Store a preview (truncated) for schema inference
                    matchingCall.responsePreview = truncateObject(data, 3);
                }
            } catch { }
        }
    });

    // Navigate and wait
    await page.goto(url, { waitUntil: 'networkidle', timeout });

    // Detect store info from page
    const storeInfo = await page.evaluate(() => {
        const shopify = (window as any).Shopify;
        const meta = {
            domain: shopify?.shop || document.querySelector('meta[property="og:site_name"]')?.getAttribute('content'),
            name: document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') || document.title,
            currency: shopify?.currency?.active || 'USD',
            locale: shopify?.locale || document.documentElement.lang || 'en'
        };
        return meta;
    });

    const isShopify = await page.evaluate(() => {
        return !!(
            (window as any).Shopify ||
            document.querySelector('link[href*="cdn.shopify.com"]') ||
            document.querySelector('script[src*="cdn.shopify.com"]') ||
            document.querySelector('meta[name="shopify-checkout-api-token"]')
        );
    });

    // Extract products from page
    const products = await extractProductsFromPage(page);

    // Extract collections
    const collections = await extractCollectionsFromPage(page);

    // Detect features
    const detectedFeatures = await detectFeatures(page);

    await browser.close();

    return {
        isShopify,
        storeInfo,
        apiCalls,
        products,
        collections,
        detectedFeatures
    };
};

const extractProductsFromPage = async (page: Page): Promise<ProductData[]> => {
    return await page.evaluate(() => {
        const products: ProductData[] = [];

        // Try to get from Shopify global
        const shopifyProducts = (window as any).ShopifyAnalytics?.meta?.products ||
            (window as any).meta?.products ||
            [];

        for (const p of shopifyProducts) {
            products.push({
                id: String(p.id || p.product_id),
                title: p.name || p.title,
                handle: p.handle || p.url?.split('/').pop(),
                price: String(p.price || p.variant?.price || '0'),
                images: []
            });
        }

        // Also try to extract from DOM if no global data
        if (products.length === 0) {
            const productCards = document.querySelectorAll(
                '[data-product], .product-card, .product-item, [itemtype*="Product"]'
            );

            productCards.forEach(card => {
                const titleEl = card.querySelector('h2, h3, .product-title, [itemprop="name"]');
                const priceEl = card.querySelector('.price, [itemprop="price"], .product-price');
                const imageEl = card.querySelector('img');
                const linkEl = card.querySelector('a[href*="/products/"]');

                if (titleEl) {
                    products.push({
                        id: card.getAttribute('data-product-id') || `dom-${products.length}`,
                        title: titleEl.textContent?.trim() || '',
                        handle: linkEl?.getAttribute('href')?.split('/products/')[1]?.split('?')[0] || '',
                        price: priceEl?.textContent?.trim() || '0',
                        images: imageEl ? [{ url: imageEl.src, alt: imageEl.alt }] : []
                    });
                }
            });
        }

        return products;
    });
};

const extractCollectionsFromPage = async (page: Page): Promise<CollectionData[]> => {
    return await page.evaluate(() => {
        const collections: CollectionData[] = [];

        // Try collection links
        const collectionLinks = document.querySelectorAll('a[href*="/collections/"]');
        const seen = new Set<string>();

        collectionLinks.forEach(link => {
            const href = link.getAttribute('href') || '';
            const handle = href.split('/collections/')[1]?.split('/')[0]?.split('?')[0];

            if (handle && !seen.has(handle) && handle !== 'all') {
                seen.add(handle);
                const img = link.querySelector('img');
                collections.push({
                    id: `collection-${handle}`,
                    title: link.textContent?.trim() || handle,
                    handle,
                    image: img ? { url: img.src, alt: img.alt } : undefined
                });
            }
        });

        return collections;
    });
};

const detectFeatures = async (page: Page): Promise<ShopifyDetectionResult['detectedFeatures']> => {
    return await page.evaluate(() => {
        return {
            hasCart: !!(
                document.querySelector('[data-cart], .cart-icon, #cart, a[href*="/cart"]')
            ),
            hasSearch: !!(
                document.querySelector('input[type="search"], .search-form, [data-search]')
            ),
            hasFilters: !!(
                document.querySelector('.filter, [data-filter], .facet, .collection-filters')
            ),
            hasWishlist: !!(
                document.querySelector('.wishlist, [data-wishlist], .heart-icon')
            ),
            hasReviews: !!(
                document.querySelector('.reviews, [data-reviews], .star-rating, .yotpo')
            )
        };
    });
};

// ============================================================================
// CODE GENERATION
// ============================================================================

export interface ShopifyIntegrationCode {
    envTemplate: string;
    hooksFile: string;
    typesFile: string;
    contextFile: string;
    exampleUsage: string;
}

export const generateShopifyIntegration = (
    detection: ShopifyDetectionResult
): ShopifyIntegrationCode => {

    // Generate .env template
    const envTemplate = `
# Shopify Storefront API Configuration
# =====================================
# To get these values:
# 1. Go to Shopify Admin → Settings → Apps and sales channels
# 2. Click "Develop apps" → Create an app  
# 3. Configure Storefront API scopes (read products, collections, etc.)
# 4. Install the app and copy the Storefront access token

VITE_SHOPIFY_STORE_DOMAIN=${detection.storeInfo.domain || 'your-store.myshopify.com'}
VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-access-token
VITE_SHOPIFY_API_VERSION=2024-01
`.trim();

    // Generate TypeScript types
    const typesFile = `
// src/types/shopify.ts
// Auto-generated Shopify types based on detected API calls

export interface ShopifyProduct {
    id: string;
    title: string;
    handle: string;
    description: string;
    descriptionHtml: string;
    priceRange: {
        minVariantPrice: MoneyV2;
        maxVariantPrice: MoneyV2;
    };
    compareAtPriceRange: {
        minVariantPrice: MoneyV2;
        maxVariantPrice: MoneyV2;
    };
    images: Connection<ShopifyImage>;
    variants: Connection<ShopifyVariant>;
    tags: string[];
    vendor: string;
    productType: string;
    availableForSale: boolean;
}

export interface ShopifyCollection {
    id: string;
    title: string;
    handle: string;
    description: string;
    image?: ShopifyImage;
    products: Connection<ShopifyProduct>;
}

export interface ShopifyVariant {
    id: string;
    title: string;
    price: MoneyV2;
    compareAtPrice?: MoneyV2;
    availableForSale: boolean;
    selectedOptions: Array<{ name: string; value: string }>;
    image?: ShopifyImage;
}

export interface ShopifyImage {
    id: string;
    url: string;
    altText?: string;
    width: number;
    height: number;
}

export interface MoneyV2 {
    amount: string;
    currencyCode: string;
}

export interface Connection<T> {
    edges: Array<{ node: T; cursor: string }>;
    pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export interface CartLine {
    id: string;
    quantity: number;
    merchandise: ShopifyVariant & { product: ShopifyProduct };
}

export interface Cart {
    id: string;
    checkoutUrl: string;
    totalQuantity: number;
    cost: {
        subtotalAmount: MoneyV2;
        totalAmount: MoneyV2;
        totalTaxAmount: MoneyV2;
    };
    lines: Connection<CartLine>;
}
`.trim();

    // Generate hooks
    const hooksFile = `
// src/hooks/useShopify.ts
// Auto-generated Shopify hooks

import { useState, useEffect, useCallback } from 'react';
import type { ShopifyProduct, ShopifyCollection, Cart, Connection } from '../types/shopify';

const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
const STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const API_VERSION = import.meta.env.VITE_SHOPIFY_API_VERSION || '2024-01';

// ============================================================================
// Core Fetch Function
// ============================================================================

async function shopifyFetch<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
    const response = await fetch(
        \`https://\${SHOPIFY_DOMAIN}/api/\${API_VERSION}/graphql.json\`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
            },
            body: JSON.stringify({ query, variables }),
        }
    );
    
    if (!response.ok) {
        throw new Error(\`Shopify API error: \${response.status}\`);
    }
    
    const { data, errors } = await response.json();
    
    if (errors?.length) {
        throw new Error(errors[0].message);
    }
    
    return data;
}

// ============================================================================
// Products Hook
// ============================================================================

const PRODUCTS_QUERY = \`
    query GetProducts($first: Int!, $after: String) {
        products(first: $first, after: $after) {
            edges {
                cursor
                node {
                    id
                    title
                    handle
                    description
                    descriptionHtml
                    availableForSale
                    priceRange {
                        minVariantPrice { amount currencyCode }
                        maxVariantPrice { amount currencyCode }
                    }
                    compareAtPriceRange {
                        minVariantPrice { amount currencyCode }
                    }
                    images(first: 5) {
                        edges {
                            node { id url altText width height }
                        }
                    }
                    variants(first: 10) {
                        edges {
                            node {
                                id
                                title
                                availableForSale
                                price { amount currencyCode }
                                compareAtPrice { amount currencyCode }
                                selectedOptions { name value }
                            }
                        }
                    }
                }
            }
            pageInfo { hasNextPage hasPreviousPage }
        }
    }
\`;

export function useProducts(first = 20) {
    const [products, setProducts] = useState<ShopifyProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    
    useEffect(() => {
        setLoading(true);
        shopifyFetch<{ products: Connection<ShopifyProduct> }>(PRODUCTS_QUERY, { first })
            .then(data => {
                setProducts(data.products.edges.map(e => e.node));
                setHasNextPage(data.products.pageInfo.hasNextPage);
            })
            .catch(setError)
            .finally(() => setLoading(false));
    }, [first]);
    
    return { products, loading, error, hasNextPage };
}

// ============================================================================
// Single Product Hook
// ============================================================================

const PRODUCT_BY_HANDLE_QUERY = \`
    query GetProductByHandle($handle: String!) {
        product(handle: $handle) {
            id
            title
            handle
            description
            descriptionHtml
            availableForSale
            priceRange {
                minVariantPrice { amount currencyCode }
            }
            images(first: 10) {
                edges {
                    node { id url altText width height }
                }
            }
            variants(first: 50) {
                edges {
                    node {
                        id
                        title
                        availableForSale
                        price { amount currencyCode }
                        compareAtPrice { amount currencyCode }
                        selectedOptions { name value }
                        image { id url altText }
                    }
                }
            }
            options {
                id
                name
                values
            }
        }
    }
\`;

export function useProduct(handle: string) {
    const [product, setProduct] = useState<ShopifyProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    
    useEffect(() => {
        if (!handle) return;
        
        setLoading(true);
        shopifyFetch<{ product: ShopifyProduct }>(PRODUCT_BY_HANDLE_QUERY, { handle })
            .then(data => setProduct(data.product))
            .catch(setError)
            .finally(() => setLoading(false));
    }, [handle]);
    
    return { product, loading, error };
}

// ============================================================================
// Collections Hook
// ============================================================================

const COLLECTIONS_QUERY = \`
    query GetCollections($first: Int!) {
        collections(first: $first) {
            edges {
                node {
                    id
                    title
                    handle
                    description
                    image { url altText width height }
                }
            }
        }
    }
\`;

export function useCollections(first = 10) {
    const [collections, setCollections] = useState<ShopifyCollection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    
    useEffect(() => {
        shopifyFetch<{ collections: Connection<ShopifyCollection> }>(COLLECTIONS_QUERY, { first })
            .then(data => setCollections(data.collections.edges.map(e => e.node)))
            .catch(setError)
            .finally(() => setLoading(false));
    }, [first]);
    
    return { collections, loading, error };
}

// ============================================================================
// Cart Hook
// ============================================================================

const CREATE_CART_MUTATION = \`
    mutation CreateCart {
        cartCreate {
            cart {
                id
                checkoutUrl
                totalQuantity
                cost {
                    subtotalAmount { amount currencyCode }
                    totalAmount { amount currencyCode }
                }
                lines(first: 100) {
                    edges {
                        node {
                            id
                            quantity
                            merchandise {
                                ... on ProductVariant {
                                    id
                                    title
                                    price { amount currencyCode }
                                    product { title handle }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
\`;

const ADD_TO_CART_MUTATION = \`
    mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
            cart {
                id
                totalQuantity
                cost {
                    totalAmount { amount currencyCode }
                }
                lines(first: 100) {
                    edges {
                        node {
                            id
                            quantity
                            merchandise {
                                ... on ProductVariant {
                                    id
                                    title
                                    product { title }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
\`;

export function useCart() {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(false);
    
    const createCart = useCallback(async () => {
        setLoading(true);
        try {
            const data = await shopifyFetch<{ cartCreate: { cart: Cart } }>(CREATE_CART_MUTATION);
            setCart(data.cartCreate.cart);
            return data.cartCreate.cart;
        } finally {
            setLoading(false);
        }
    }, []);
    
    const addToCart = useCallback(async (variantId: string, quantity = 1) => {
        let currentCart = cart;
        if (!currentCart) {
            currentCart = await createCart();
        }
        
        setLoading(true);
        try {
            const data = await shopifyFetch<{ cartLinesAdd: { cart: Cart } }>(
                ADD_TO_CART_MUTATION,
                {
                    cartId: currentCart.id,
                    lines: [{ merchandiseId: variantId, quantity }]
                }
            );
            setCart(data.cartLinesAdd.cart);
            return data.cartLinesAdd.cart;
        } finally {
            setLoading(false);
        }
    }, [cart, createCart]);
    
    return {
        cart,
        loading,
        createCart,
        addToCart,
        itemCount: cart?.totalQuantity ?? 0
    };
}

// ============================================================================
// Search Hook
// ============================================================================

const SEARCH_QUERY = \`
    query Search($query: String!, $first: Int!) {
        products(first: $first, query: $query) {
            edges {
                node {
                    id
                    title
                    handle
                    priceRange {
                        minVariantPrice { amount currencyCode }
                    }
                    images(first: 1) {
                        edges {
                            node { url altText }
                        }
                    }
                }
            }
        }
    }
\`;

export function useSearch() {
    const [results, setResults] = useState<ShopifyProduct[]>([]);
    const [loading, setLoading] = useState(false);
    
    const search = useCallback(async (query: string, first = 10) => {
        if (!query.trim()) {
            setResults([]);
            return;
        }
        
        setLoading(true);
        try {
            const data = await shopifyFetch<{ products: Connection<ShopifyProduct> }>(
                SEARCH_QUERY,
                { query, first }
            );
            setResults(data.products.edges.map(e => e.node));
        } finally {
            setLoading(false);
        }
    }, []);
    
    return { results, loading, search };
}
`.trim();

    // Generate context provider
    const contextFile = `
// src/context/ShopifyContext.tsx
// Provides global Shopify state

import React, { createContext, useContext, ReactNode } from 'react';
import { useCart, useCollections } from '../hooks/useShopify';
import type { Cart, ShopifyCollection } from '../types/shopify';

interface ShopifyContextValue {
    cart: Cart | null;
    cartLoading: boolean;
    addToCart: (variantId: string, quantity?: number) => Promise<Cart>;
    itemCount: number;
    collections: ShopifyCollection[];
    collectionsLoading: boolean;
}

const ShopifyContext = createContext<ShopifyContextValue | null>(null);

export function ShopifyProvider({ children }: { children: ReactNode }) {
    const { cart, loading: cartLoading, addToCart, itemCount } = useCart();
    const { collections, loading: collectionsLoading } = useCollections();
    
    return (
        <ShopifyContext.Provider value={{
            cart,
            cartLoading,
            addToCart,
            itemCount,
            collections,
            collectionsLoading
        }}>
            {children}
        </ShopifyContext.Provider>
    );
}

export function useShopifyContext() {
    const context = useContext(ShopifyContext);
    if (!context) {
        throw new Error('useShopifyContext must be used within ShopifyProvider');
    }
    return context;
}
`.trim();

    // Example usage
    const exampleUsage = `
// Example: ProductGrid component using Shopify hooks

import { useProducts } from '../hooks/useShopify';
import { useShopifyContext } from '../context/ShopifyContext';

export function ProductGrid() {
    const { products, loading, error } = useProducts(20);
    const { addToCart, cartLoading } = useShopifyContext();
    
    if (loading) return <div>Loading products...</div>;
    if (error) return <div>Error loading products</div>;
    
    return (
        <div className="grid grid-cols-4 gap-4">
            {products.map(product => (
                <div key={product.id} className="product-card">
                    <img 
                        src={product.images.edges[0]?.node.url} 
                        alt={product.images.edges[0]?.node.altText || product.title}
                    />
                    <h3>{product.title}</h3>
                    <p>\${product.priceRange.minVariantPrice.amount}</p>
                    <button 
                        onClick={() => addToCart(product.variants.edges[0].node.id)}
                        disabled={cartLoading}
                    >
                        Add to Cart
                    </button>
                </div>
            ))}
        </div>
    );
}

// Example: Wrap your app with ShopifyProvider
// In App.tsx or main.tsx:

import { ShopifyProvider } from './context/ShopifyContext';

function App() {
    return (
        <ShopifyProvider>
            <YourApp />
        </ShopifyProvider>
    );
}
`.trim();

    return {
        envTemplate,
        hooksFile,
        typesFile,
        contextFile,
        exampleUsage
    };
};

// ============================================================================
// HELPERS
// ============================================================================

function truncateObject(obj: any, maxDepth: number, currentDepth = 0): any {
    if (currentDepth >= maxDepth) return '[truncated]';
    if (obj === null || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        return obj.slice(0, 3).map(item => truncateObject(item, maxDepth, currentDepth + 1));
    }

    const result: Record<string, any> = {};
    const keys = Object.keys(obj).slice(0, 10);
    for (const key of keys) {
        result[key] = truncateObject(obj[key], maxDepth, currentDepth + 1);
    }
    return result;
}

// ============================================================================
// MAIN EXPORT - CLI USAGE
// ============================================================================

export const runShopifyDetection = async (url: string, outputDir: string): Promise<void> => {
    console.log(`[Shopify] Detecting Shopify store at: ${url}`);

    const detection = await detectShopifyStore(url);

    if (!detection.isShopify) {
        console.log('[Shopify] This does not appear to be a Shopify store');
        return;
    }

    console.log(`[Shopify] ✓ Shopify store detected: ${detection.storeInfo.name}`);
    console.log(`[Shopify] - Domain: ${detection.storeInfo.domain}`);
    console.log(`[Shopify] - Products found: ${detection.products.length}`);
    console.log(`[Shopify] - Collections found: ${detection.collections.length}`);
    console.log(`[Shopify] - API calls captured: ${detection.apiCalls.length}`);

    // Generate integration code
    const integration = generateShopifyIntegration(detection);

    // Write files
    await fs.mkdir(path.join(outputDir, 'src/hooks'), { recursive: true });
    await fs.mkdir(path.join(outputDir, 'src/types'), { recursive: true });
    await fs.mkdir(path.join(outputDir, 'src/context'), { recursive: true });

    await fs.writeFile(path.join(outputDir, '.env.template'), integration.envTemplate);
    await fs.writeFile(path.join(outputDir, 'src/hooks/useShopify.ts'), integration.hooksFile);
    await fs.writeFile(path.join(outputDir, 'src/types/shopify.ts'), integration.typesFile);
    await fs.writeFile(path.join(outputDir, 'src/context/ShopifyContext.tsx'), integration.contextFile);
    await fs.writeFile(path.join(outputDir, 'SHOPIFY_USAGE.md'), integration.exampleUsage);

    // Save detection results
    await fs.writeFile(
        path.join(outputDir, 'shopify-detection.json'),
        JSON.stringify(detection, null, 2)
    );

    console.log(`[Shopify] ✓ Integration code generated in ${outputDir}`);
    console.log('[Shopify] Next steps:');
    console.log('  1. Copy .env.template to .env and fill in your Storefront API token');
    console.log('  2. Import and use the generated hooks in your components');
    console.log('  3. See SHOPIFY_USAGE.md for examples');
};