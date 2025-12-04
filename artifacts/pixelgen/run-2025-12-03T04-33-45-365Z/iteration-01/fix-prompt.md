Here is the consolidated plan to fix the missing rendering and align the UI with the Base designs.

### **Root Cause Analysis**
The Target screenshots for both Desktop and Mobile are completely blank (White Screen), resulting in a 100% diff. This indicates a critical rendering failure (e.g., component crash, `opacity: 0`, `visibility: hidden`, or zero height on `#root`). The instructions below focus on reconstructing the layout and styles to match the Base design pixel-perfectly.

---

### **1. Global Styles & Layout Fixes**

*   **Root Container:** Ensure the main app container has `min-height: 100vh` and is visible.
*   **Typography:**
    *   **Primary Headings:** Implement a distressed/brush style font (e.g., custom font file) for branding ("KILRR", "GET KILLER TASTE", "AAT KUCH...").
    *   **Body Text:** Use a clean geometric sans-serif (e.g., Montserrat or Futura) for readability.
    *   **Colors:** Define CSS variables:
        *   `--primary-orange`: `#D35400` (Buttons, Cart Badge)
        *   `--text-dark`: `#1A1A1A`
        *   `--text-muted`: `#999999` (Strikethrough prices)
        *   `--bg-light-pink`: `#FFF0EB` (Marquee strip)

### **2. Component: Header & Banner**

*   **Top Bar:**
    *   Background: Black (`#000`). Text: White, centered, small caps (`12px`), "FREE SHIPPING OVER ₹399".
*   **Navigation:**
    *   **Desktop:** Logo left, Icons (Cart, User) right.
    *   **Mobile:** Logo center, Icons right. Add padding `1rem`.
*   **Hero Section:**
    *   Background: Dark, texture-rich image with overlaid product images.
    *   Text: "GET KILLER TASTE WITH ZERO FUSS" centered, white, large scale (approx `4rem` desktop, `2rem` mobile).
    *   **Marquee Strip:** Below hero, implement a flex container with background `--bg-light-pink`. Text "100% CLEAN LABEL | ALL-IN-ONE MASALAS" repeated. Ensure color is `--primary-orange`.

### **3. Component: Product Listing (Critical Layout)**

*   **Structure:**
    *   **Desktop:** Create a `row` layout.
        *   Left: Image Gallery (Main image large, 3 small thumbnails below).
        *   Right: Details (Title, Price, Description, CTA).
        *   Align: `center` vertically. `gap: 60px`.
    *   **Mobile:** Create a `column` layout.
        *   Image Top (full width), Details Bottom.
*   **Badges:**
    *   Overlay "XXX BOUGHT TODAY" badge on the top-left of the main product image.
    *   Style: White background, rounded-right, small fire icon, bold text `10px`.
*   **Typography & Pricing:**
    *   Title: Uppercase, Bold (`1.2rem`).
    *   Price: Flex row. Current price (Bold, Black) + Original price (Strikethrough, Muted, smaller).
    *   Description: Light weight, line-height `1.5`.
*   **CTA Button:**
    *   Text: "ADD +".
    *   Style: Background `--primary-orange`, Text White, Rounded corners (`4px`), Padding `12px 24px`.
    *   **Mobile Specific:** Button can be full-width or large fixed width.

### **4. Component: "Get Killer Deals" (Mobile Specific)**

*   **Visibility:** Ensure this section renders on Mobile between Hero and Product List (as seen in Mobile Base).
*   **Cards:** Dark background cards (Black/Dark Grey).
*   **Content:** "TIKKA MASALAS" vs "GRAVY MASALAS".
    *   Display "Pack of 10" / "Pack of 4" in yellow/beige badges.
    *   Orange "ADD +" buttons at the bottom of the card.

### **5. Component: Reviews ("Gang Members")**

*   **Layout:**
    *   Heading: "150K+ GANG MEMBERS", Subhead: "THEY'RE SCREAMING WITH JOY" (Orange).
    *   **Grid:**
        *   Desktop: 4 columns.
        *   Mobile: Horizontal scroll container (carousel).
*   **Card Style:**
    *   White background, slight shadow.
    *   Image (round) top-left or top-center.
    *   Star Rating: 5 Orange stars.
    *   Text: Left-aligned.

### **6. Component: Marketing Split & Footer**

*   **Visual Split ("SLAY THE MESS"):**
    *   **Desktop:** Two equal columns. Left image (Ingredients), Right image (Pack + Dish). Center circle overlay with arrow if it's a slider, otherwise static.
    *   **Mobile:** Stack images vertically.
*   **FAQ Accordion:**
    *   Clean list with border-bottom.
    *   Flex layout: Question (left) + Plus Icon (right).
*   **Footer:**
    *   Pre-footer CTA: "TOGETHER WE ARE GONNA KILL IT" centered with "SHOP NOW" button.
    *   Links: Grid layout. Logo on left (desktop) or top (mobile). Links (About Us, Policies) in columns.

### **7. Floating Elements**

*   **Cart Button:** Implement a fixed position Floating Action Button (FAB).
    *   Position: `fixed`, `bottom: 20px`, `right: 20px`.
    *   Style: Orange circle, white icon, Badge showing count (e.g., '0') on top-right border.

### **CSS Implementation Summary**

```css
/* Fix for Layout Shift / Blank Screen */
#root, body, html {
    height: 100%;
    width: 100%;
    margin: 0;
    overflow-x: hidden; /* Prevent horizontal scroll */
}

/* Product Card - Desktop */
@media (min-width: 768px) {
    .product-card {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        padding: 40px 0;
    }
    .product-image-container {
        width: 45%;
        max-width: 500px;
    }
    .product-details {
        width: 45%;
        padding-left: 40px;
    }
}

/* Product Card - Mobile */
@media (max-width: 767px) {
    .product-card {
        display: flex;
        flex-direction: column;
        padding: 20px 0;
        border-bottom: 1px solid #eee;
    }
    .product-image-container {
        width: 100%;
    }
    .product-details {
        width: 100%;
        padding: 16px;
    }
}

/* Button Standard */
.btn-primary {
    background-color: #D35400;
    color: white;
    border: none;
    text-transform: uppercase;
    font-weight: bold;
    letter-spacing: 1px;
    cursor: pointer;
}
```