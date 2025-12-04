const createProduct = (id, title, subtitle, price, originalPrice, rating, reviews, weight, tag, tagColor, image, timer) => ({
  id,
  title,
  subtitle,
  price,
  originalPrice,
  rating,
  reviews,
  weight,
  tag,
  tagColor,
  image,
  timer
});

// Strictly using provided assets
const img1 = "assets/images/722835edaa.jpg";
const img2 = "assets/images/bd0f2dca23.jpg";
const img3 = "assets/images/b04e8d74c7.jpg";
const img4 = "assets/images/30ac2fd156.jpg";
const img5 = "assets/images/f42711648f.jpg";

// Colors mapped to palette: red->primary, purple->slate, green->medium/slate
export const bestSellers = [
  createProduct(1, "Glow+ Dewy Sunscreen", "SPF 50+ PA++++ with Papaya", 599, null, 4.8, 806, "80g", "Best Seller", "primary", img2),
  createProduct(2, "Detan+ Dewy Sunscreen", "SPF 50+ PA++++ with Cherry", 599, null, 4.8, 395, "80g", "Best Seller", "primary", img5),
  createProduct(3, "Illuminate+ Dewy Sunscreen", "SPF 50+ with Wild Berries", 499, null, 4.8, 362, "50g", "Best Seller", "primary", img1),
  createProduct(4, "Glow+ Hydra Gel Moisturizer", "Vitamin C & Papaya", 499, null, 4.8, 287, "200g", "Best Seller", "primary", img3),
  createProduct(5, "Refresh+ Sun Kissed Vanilla", "Body Mist with Zemea", 499, null, 4.8, 347, "150ml", "Best Seller", "primary", img4),
];

export const lightningSale = [
  createProduct(6, "Glow+ Dewy Sunscreen", "SPF 50+ PA++++", 838, 1198, 4.8, 103, "160g", "6h:26m:25s", "slate", img1, true),
  createProduct(7, "Glow Milk Fluid Moisturizer", "Pack of 2", 449, 898, 4.8, 86, "140ml", "6h:26m:25s", "slate", img3, true),
  createProduct(8, "Illuminate+ Dewy Sunscreen", "SPF 50+ PA++++", 499, 999, 4.8, 57, "125g", "6h:26m:25s", "slate", img2, true),
  createProduct(9, "Refresh+ Perfume Body Mist", "Trio Pack", 1047, 1497, 4.7, 96, "450ml", "6h:26m:25s", "slate", img4, true),
  createProduct(10, "Glow+ Day & Night Combo", "Cleansers & Brightening", 1257, 1796, 4.9, 233, "-", "6h:26m:25s", "slate", img5, true),
];

export const trending = [
  createProduct(11, "Glow+ Dewy Sunscreen", "SPF 50+ PA++++", 449, null, 4.8, 624, "50g", "Trending", "medium", img2),
  createProduct(12, "Detan+ Dewy Sunscreen", "SPF 50+ PA++++", 449, null, 4.8, 348, "50g", "Trending", "medium", img5),
  createProduct(13, "Refresh+ Dewy Floral Kiss", "Perfume Body Mist", 499, null, 4.8, 205, "150ml", "Trending", "medium", img4),
  createProduct(14, "Refresh+ Cherry Blossom", "Perfume Body Mist", 499, null, 4.7, 158, "150ml", "Trending", "medium", img1),
  createProduct(15, "Radiance+ Dewy Sunscreen", "SPF 50+ PA++++", 449, null, 4.8, 458, "50g", "Trending", "medium", img3),
];

export const moisturizers = [
  createProduct(16, "Bright+ Hydra Gel Moisturizer", "Blueberry & Kojic Acid", 499, null, 4.6, 90, "200g", "New Launch", "medium", img3),
  createProduct(17, "Glow+ Mousse Night Gel", "Bright Plump Skin", 599, null, 4.9, 118, "50g", "Trending", "medium", img5),
  createProduct(18, "Glow+ Oil Free Moisturizer", "Papaya & Vitamin C", 399, null, 4.9, 116, "100g", "Trending", "medium", img3),
  createProduct(19, "Illuminate+ Oil Free Moisturizer", "Wild Berries & Alpha Arbutin", 399, null, 5.0, 170, "100g", "Trending", "medium", img2),
  createProduct(20, "5 Barrier+ Repair Moisturizer", "Avocado & 5 Ceramides", 399, null, 4.9, 91, "100g", "Trending", "medium", img5),
];

export const mists = [
  createProduct(21, "Refresh+ Perfume Body Mist Trio", "Set of 3 Irresistible Fragrances", 1047, 1497, 4.7, 96, "450ml", "6h:26m:25s", "slate", img4, true),
  createProduct(22, "Refresh+ Sun Kissed Vanilla", "Perfume Body Mist", 499, null, 4.8, 347, "150ml", "Best Seller", "primary", img1),
  createProduct(23, "Refresh+ On The Go", "Set of 3 Perfume Body Mist", 599, null, 4.8, 252, "60ml", "Trending", "medium", img4),
  createProduct(24, "Refresh+ Mist Me Not Set", "Set of 3 Perfume Body Mist", 599, null, 4.5, 88, "60ml", "New Launch", "medium", img1),
  createProduct(25, "Refresh+ Mid Night Bloom", "Perfume Body Mist", 499, null, 4.7, 209, "150ml", "Best Seller", "primary", img4),
];

export const sunscreens = [
  createProduct(26, "Radiance+ Oil Control Fluid", "For Oily Skin", 449, null, 4.6, 136, "50g", "New Launch", "medium", img2),
  createProduct(27, "Bright+ Tone Up Sunscreen", "SPF 50+ PA++++", 499, null, 4.7, 86, "50g", "-", "", img5),
  createProduct(28, "Hydrate+ Dewy Sunscreen", "SPF 50 for UVA/B", 449, null, 4.8, 135, "50g", "Trending", "medium", img1),
  createProduct(29, "Detan+ Oil Balance Fluid", "For Oily Skin", 449, null, 4.6, 74, "50g", "New Launch", "medium", img3),
  createProduct(30, "Detan+ Dewy Sunscreen Spray", "Mess-Free Application", 599, null, 4.8, 114, "100ml", "Trending", "medium", img2),
];

export const serums = [
  createProduct(31, "Glow+ Concentrate Face Serum", "Skin Brightening & Glow", 599, null, 4.8, 199, "30ml", "Best Seller", "primary", img5),
  createProduct(32, "Radiance+ Concentrate Face Serum", "Reduces Acne Marks", 599, null, 4.8, 171, "30ml", "Best Seller", "primary", img3),
  createProduct(33, "Glow+ 30X Vitamin C", "Hydrating Essence Serum", 599, null, 4.8, 64, "50ml", "-", "", img5),
];

export const cleansers = [
  createProduct(34, "Glow+ Smoothie Face Wash", "Papaya & Vitamin C", 249, null, 4.9, 233, "100ml", "Best Seller", "primary", img3),
  createProduct(35, "Detan+ Smoothie Face Wash", "Cherry Tomato & Glycolic", 249, null, 4.8, 99, "100ml", "Best Seller", "primary", img5),
  createProduct(36, "Radiance+ Smoothie Face Wash", "Watermelon & Niacinamide", 249, null, 4.9, 145, "100ml", "Trending", "medium", img3),
  createProduct(37, "Illuminate+ Smoothie Face Wash", "Wild Berries & Alpha Arbutin", 249, null, 4.8, 117, "100ml", "Trending", "medium", img1),
  createProduct(38, "Bright+ Smoothie Face Wash", "Mild Cleansing Formula", 249, null, 4.7, 78, "100ml", "-", "", img3),
];

export const bodyCare = [
  createProduct(39, "Radiance+ Silky Body Lotion", "Hydrates & Restores Skin", 349, null, 4.9, 77, "200ml", "-", "", img3),
  createProduct(40, "Radiance+ Squishy Shower Gel", "Gently Cleanses & Hydrates", 349, null, 4.7, 86, "250ml", "-", "", img3),
];

export const newLaunches = [
  createProduct(41, "Refresh+ Mist Me Not Set", "Set of 3 Perfume Body Mist", 599, null, 4.5, 88, "60ml", "New Launch", "medium", img4),
  createProduct(42, "Refresh+ Body Care Set", "Sweet Summer Kiss", 749, 999, 4.5, 67, "120g", "6h:26m:25s", "slate", img1, true),
  createProduct(43, "Bright+ Makeup-Set Sunscreen Mist", "SPF 50+ PA++++", 649, null, 4.7, 71, "80ml", "New Launch", "medium", img2),
  createProduct(44, "Bright+ Hydra Gel Moisturizer", "Blueberry & Kojic Acid", 499, null, 4.6, 90, "200g", "New Launch", "medium", img3),
  createProduct(45, "Bright+ Oil Free Moisturizer", "Lightweight & Non-Sticky", 399, null, 4.5, 66, "100g", "New Launch", "medium", img3),
];