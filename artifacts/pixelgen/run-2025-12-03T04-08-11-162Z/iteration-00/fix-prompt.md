Here is the consolidated plan to restore the missing UI and align the Target layout to the Base design.

### 1. Global Layout & Visibility
The primary issue is that the main content body is completely missing or hidden in the Target state for both Desktop and Mobile.

*   **Main Container:** Ensure the primary content wrapper (e.g., `<main>` or `.page-content`) is visible.
    *   **Fix:** Remove any `display: none` or `visibility: hidden` applied to the content container. Ensure `min-height` is set to viewport height minus header.
*   **Typography:**
    *   **Font Family:** Apply a geometric sans-serif font (e.g., Montserrat or similar) globally.
    *   **Headings:** Set `text-transform: uppercase` and `letter-spacing: 2px` for section titles (e.g., "NEW FLAVOR EVERYDAY", "150K+ GANG MEMBERS").

### 2. Header & Announcement Bar
*   **Announcement Bar:**
    *   **CSS:** Set background to black (`#000`), text color to white, `font-size: 10px`, `text-transform: uppercase`, `text-align: center`, `padding: 8px 0`. Text: "FREE SHIPPING OVER ₹399".
*   **Logo:**
    *   Ensure the "KILRR" logo is an SVG or high-res image, colored Orange/Rust (`#C04B28`).
    *   **Desktop:** Align left. **Mobile:** Align center.
*   **Icons:**
    *   Cart & Profile icons should be aligned to the right.

### 3. Marquee Strip (Desktop)
*   **Content:** "CLEAN LABEL | ALL-IN-ONE MASALAS | 100% CLEAN LABEL..."
*   **CSS:**
    *   `background-color: #F9EBE6` (light peach/pink).
    *   `color: #C04B28` (Brand Orange).
    *   `text-transform: uppercase`.
    *   `padding: 12px 0`.
    *   `font-size: 12px`.
    *   `letter-spacing: 1px`.

### 4. Hero Section (Mobile Only)
*   **Background:** Dark texture/image.
*   **Content:** "MARINADE READY IN" text with graphic workflow (Spice Mix + Water & Oil = 1 min marinade).
*   **Fix:** Hide on Desktop (`display: none` @media min-width), Show on Mobile.

### 5. "New Flavor Everyday" Section (Product List)
**General Styles:**
*   **Section Title:** Centered, uppercase, large spacing.
*   **Tabs:** "TIKKAS" vs "GRAVIES". Active tab: Solid Rust background. Inactive: Outlined/Transparent.

**Desktop Layout (Row View):**
*   **Container:** `display: flex; flex-direction: column; gap: 40px; max-width: 1200px; margin: 0 auto;`.
*   **Product Item:** `display: flex; flex-direction: row; align-items: flex-start; gap: 30px;`.
*   **Left (Gallery):**
    *   Main Image: Large square (~400px).
    *   Thumbnails: Vertical list or small row beneath.
*   **Right (Details):**
    *   Title: `font-size: 1.5rem`, `font-weight: 700`.
    *   Price: `font-weight: bold`. Original price (strikethrough) in red (`#e74c3c`).
    *   Description: `line-height: 1.6`, `color: #333`, `margin-bottom: 20px`.
    *   Button: `background-color: #C04B28`, `color: white`, `padding: 12px 30px`, `border-radius: 4px`, `text-transform: uppercase`.

**Mobile Layout (Card View):**
*   **Container:** Vertical stack.
*   **Product Item:** `display: flex; flex-direction: column; margin-bottom: 30px;`.
*   **Image:** Full width carousel.
    *   **Badge:** "XXX BOUGHT TODAY" (White pill, top-left absolute).
*   **Details Row:**
    *   Flex row for Title (Left) and Price (Right).
*   **Action:** Button full width or block level.

### 6. Reviews Section ("150K+ Gang Members")
*   **Layout:** Horizontal scroll (carousel) on Mobile, Grid on Desktop (4 columns).
*   **Card Style:**
    *   Image: Rounded/Square thumbnail.
    *   Stars: Orange (`#f1c40f`).
    *   Text: Left aligned, small font size.

### 7. FAQ Section ("Need More Evidence?")
*   **Structure:** Vertical accordion list.
*   **Style:**
    *   Item: `border-bottom: 1px solid #eee`.
    *   Header: `display: flex; justify-content: space-between; padding: 20px 0; cursor: pointer;`.
    *   Text: `font-weight: 500`.

### 8. Footer
*   **Banner:** "TOGETHER WE ARE GONNA KILL IT".
    *   Background: Light Gray (`#f4f4f4`).
    *   Button: "SHOP NOW" (Solid Rust, large padding).
*   **Links:**
    *   Two columns: "ABOUT US", "HELP & ABOUT".
    *   Text: Left aligned, clean sans-serif, gray color.

### 9. Floating Action Button (Cart)
*   **Position:** Fixed, Bottom Right (`bottom: 20px; right: 20px;`).
*   **Style:** `background-color: #C04B28;` (Rust), `color: white`.
*   **Badge:** Tiny count badge on top right of the icon.

### CSS Fixes Summary
```css
/* Core Layout Fix */
main, .page-content {
    display: block !important;
    opacity: 1 !important;
    visibility: visible !important;
}

/* Brand Colors */
:root {
    --brand-rust: #C04B28;
    --brand-black: #1a1a1a;
}

/* Headings */
h1, h2, h3 {
    text-transform: uppercase;
    font-family: 'Montserrat', sans-serif;
    letter-spacing: 0.1em;
}

/* Buttons */
.btn-primary, .add-to-cart {
    background-color: var(--brand-rust);
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 10px 24px;
    font-weight: 600;
    text-transform: uppercase;
}

/* Desktop Product Row Structure */
@media (min-width: 768px) {
    .product-item {
        display: flex;
        gap: 4rem;
        align-items: center;
        margin-bottom: 4rem;
    }
    .product-gallery {
        flex: 1;
        max-width: 50%;
    }
    .product-details {
        flex: 1;
        text-align: left;
    }
}
```