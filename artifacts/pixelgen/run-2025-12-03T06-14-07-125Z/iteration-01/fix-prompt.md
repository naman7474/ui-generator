Here is the consolidated plan to align the Target UI with the Base UI.

## 1. Layout Structure & Sections

### Desktop
*   **Remove Hero & Deals Sections**: The Base desktop view does not display the large "Get Killer Taste" hero banner or the "Get Killer Deals" section.
    *   **Action**: Apply `display: none` to the Hero container and the Deals container on desktop breakpoints.
    *   **Action**: Ensure the flow is: Header `->` Marquee Bar ("100% Clean Label...") `->` "New Flavor Everyday" section.

### Mobile
*   **Hero Image Replacement**: The Target uses a generic spices image, while the Base uses a specific "Marinade Ready In" (Stopwatch) image.
    *   **Action**: Update the `src` or `background-image` of the mobile hero section to the "Marinade Ready In" visual.
*   **Remove Marquee**: The Marquee bar is not visible between the Hero and Deals sections in the Base mobile view.
    *   **Action**: Hide the Marquee bar on mobile breakpoints.
*   **Restore "Anger R.I.P." Section**: The Base mobile view contains a section with the text "ANGER R.I.P." and a brick background ("AAT KUCH KHATE HAIN") situated between the "Slay the Mess" slider and "Need More Evidence". This is missing in the Target.
    *   **Action**: Insert the HTML structure for the "Anger R.I.P." section into the DOM for mobile view.

## 2. Product Card Components ("New Flavor Everyday")

### Mobile Styles
*   **Title & Price Layout**: In the Target, the Title and Price are stacked vertically. In the Base, they are on the same row.
    *   **Action**: Update the product info container to use Flexbox.
    ```css
    .product-info-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        width: 100%;
    }
    ```
*   **Spacing**: Reduce the vertical gap between the Description and the "Add" button to match the tighter spacing in the Base.

### Desktop Styles
*   **Vertical Alignment**: The diff indicates a vertical shift in the product details column.
    *   **Action**: Ensure the top margin/padding of the text column aligns exactly with the top of the main product image. Remove any extra `margin-top` on the product title element.

## 3. Global Typography & Spacing

*   **Section Headers**: The "New Flavor Everyday" header in the Base appears closer to the content below it.
    *   **Action**: Reduce `margin-bottom` on the `.section-title` for "New Flavor Everyday".
*   **Marquee Bar**: Ensure the scrolling text bar spans the full width without unexpected layout shifts (indicated by red noise in diffs).
    *   **Action**: Check `overflow-x: hidden` and `white-space: nowrap` properties to prevent layout trashing.

## 4. Summary of Code Fixes

### HTML/CSS Adjustments

**Desktop (`@media min-width: 1024px`)**
```css
/* Hide sections not present in Base Desktop */
.hero-banner-large, 
.killer-deals-section {
    display: none !important;
}

/* Ensure Marquee is positioned correctly */
.marquee-bar {
    order: -1; /* Depending on flex parent, or ensure it sits right below header */
    margin-bottom: 40px;
}
```

**Mobile (`@media max-width: 767px`)**
```css
/* Update Hero Image */
.mobile-hero-image {
    background-image: url('path-to-stopwatch-image.jpg');
    /* Ensure aspect ratio matches Base */
}

/* Hide Marquee on Mobile */
.marquee-bar {
    display: none;
}

/* Fix Product Card Layout */
.product-card .card-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.product-card .product-title {
    margin-bottom: 0;
}
.product-card .product-price {
    text-align: right;
}

/* Reveal Missing Section */
.anger-rip-section {
    display: block;
}
```