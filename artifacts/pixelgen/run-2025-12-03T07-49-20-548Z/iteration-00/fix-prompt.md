Here is the consolidated plan to fix the frontend implementation and align the Target with the Base design. Since the Target appears to be missing most content/styles (rendering as blank/white or unstyled), these instructions focus on reconstructing the visual layout and styles to match the Base pixel-perfectly.

### 1. Global Layout & Typography
*   **Font Setup**: Implement a primary sans-serif font (e.g., *Montserrat* or *Lato*) for body text and UI elements. Use a serif font (e.g., *Playfair Display*) for the "NEW FLAVOR EVERYDAY" and "SLAY THE MESS" headings.
*   **Colors**:
    *   Primary Brand Color: `#D35400` (Burnt Orange) for buttons, prices, and accents.
    *   Secondary Background: `#FDEBD0` (Pale Peach) for the marquee strip.
    *   Text: `#000000` (Headings), `#555555` (Descriptions), `#999999` (Strikethrough prices).
*   **Container**: Set a main container max-width of `1280px` centered with `20px` padding for desktop content.

### 2. Header & Announcement Bar
*   **Announcement Bar**:
    *   Set background to `#000000`.
    *   Text: White, uppercase, centered, font-size `11px`, letter-spacing `1px`.
*   **Navigation**:
    *   **Desktop**: Flex container, Logo aligned left, Icons (Cart, Profile) aligned right.
    *   **Mobile**: Maintain same structure. Ensure icons are size `24px` with `20px` spacing.

### 3. Hero Section (Responsive Switching)
*   **Implementation**: Use `<picture>` tag or CSS `background-image` with media queries to handle the distinct designs.
*   **Desktop**:
    *   Image: Dark background with ingredients/blender.
    *   Text: "GET KILLER TASTE WITH ZERO FUSS" centered, white, grunge/distressed font effect, large font-size (`~48px`).
*   **Mobile**:
    *   Image: "MARINADE READY IN 58 SEC" graphic with hand holding timer.
    *   **Banner Below Hero**: Add a red banner (`#D35400`) containing "GET KILLER DEALS", "EXPRESS DELIVERY", "BEST PRICES" with chevron dividers.

### 4. Category Strip & Filters
*   **Marquee Strip**:
    *   Background: Pale Peach `#FDEBD0`.
    *   Text: Red/Orange `#D35400`, uppercase, spaced with pipe `|` separators.
    *   Font-size: `12px`, bold.
*   **Filter Toggles**:
    *   Center align "TIKKAS" and "GRAVIES" pills below "NEW FLAVOR EVERYDAY".
    *   **Active State**: Background `#D35400`, Text White, rounded corners.
    *   **Inactive State**: White background, Thin border, Icon + Text.

### 5. Product Listing (Layout Shifts)
*   **Product Card Container**:
    *   **Desktop**: Apply `display: flex; flex-direction: row; gap: 40px; margin-bottom: 60px;`.
    *   **Mobile**: Apply `display: flex; flex-direction: column; gap: 24px; margin-bottom: 40px;`.
*   **Product Image**:
    *   **Desktop**: Width `50%`. Show main image + row of thumbnails below.
    *   **Mobile**: Width `100%`. Enable carousel behavior with pagination dots overlay at the bottom.
    *   **Badges**: Absolute position "X BOUGHT TODAY" badge (White pill with fire icon) on top-left of image.
*   **Product Details**:
    *   **Alignment**: Left-aligned for Desktop; Left-aligned for Mobile.
    *   **Typography**: Title in bold uppercase. Price row: Current Price (Bold) followed by Strikethrough Price (Gray).
    *   **Button**: "+ ADD" button. Background `#D35400`, Text White, border-radius `4px`, padding `10px 30px`.
        *   *Fix*: Ensure button is not full-width on desktop; allow intrinsic width.

### 6. Testimonials Section
*   **Layout**:
    *   **Desktop**: `display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;`.
    *   **Mobile**: Use a horizontal scrolling container (`overflow-x: auto`) or single-column stack.
*   **Card Style**: Image on top, Name/Rating/Date row, Bold Title, Description text.

### 7. Footer & Extras
*   **Feature Section**:
    *   Create a split layout (50/50) for the "SLAY THE MESS" section on Desktop. Stack vertically on Mobile.
    *   Images should be flush (no gap between the two distinct images).
*   **Accordion (Evidence)**:
    *   Style items with `border-bottom: 1px solid #eee`.
    *   Flex layout for text (left) and `+` icon (right).
*   **Floating Cart**:
    *   Implement a fixed Floating Action Button (FAB) `bottom: 20px; right: 20px;`.
    *   Style: Red circle, white icon, notification badge '0'.

### 8. CSS Code Snippets for Alignment

```css
/* Responsive Layout Fixes */
.product-card {
    display: flex;
    align-items: flex-start;
}
@media (max-width: 768px) {
    .product-card {
        flex-direction: column;
    }
    .product-image {
        width: 100%;
    }
    .product-details {
        width: 100%;
        padding-top: 16px;
    }
}

/* Typography Fixes */
h2.section-title {
    font-family: 'Playfair Display', serif;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin: 40px 0;
}

/* Button Styles */
.btn-primary {
    background-color: #D35400;
    color: #fff;
    border: none;
    padding: 12px 24px;
    font-weight: 600;
    text-transform: uppercase;
    border-radius: 4px;
    cursor: pointer;
}

/* Price Styling */
.price-current {
    font-weight: 700;
    font-size: 1.1em;
    color: #000;
}
.price-original {
    text-decoration: line-through;
    color: #999;
    margin-left: 8px;
    font-size: 0.9em;
}
```