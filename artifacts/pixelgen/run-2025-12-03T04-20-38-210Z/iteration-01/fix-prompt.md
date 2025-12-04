# Fix Plan: "KILRR" E-commerce Layout Restoration

Based on the comparison between Base (desired) and Target (current) states, the primary issue is a complete loss of content visibility in the main body area on both Desktop and Mobile. The header remains, but the product catalog, hero sections, and footer are missing or hidden.

## 1. Global Layout & Visibility (Critical)
The entire `main` content area is not rendering or is hidden.
*   **Fix Container Visibility:** Inspect the main content wrapper (e.g., `main`, `#root > div:not(header)`). Ensure it does not have `display: none`, `visibility: hidden`, `opacity: 0`, or `height: 0` with `overflow: hidden`.
*   **Fix Z-Index Context:** Ensure the white background of the body isn't overlaying the content.
*   **React/JS Rendering:** If this is a Single Page Application, check for a JavaScript error preventing the mounting of the Home Page component.

## 2. Desktop Navigation Bar
The secondary category navigation bar is missing in the Target.
*   **HTML Structure:** Inject a secondary nav bar below the main header containing links: "LEAN LABEL", "ALL-IN-ONE MASALAS", "100% CLEAN LABEL", etc.
*   **CSS Styling:**
    *   **Container:** `display: flex; justify-content: center; gap: 2rem; padding: 10px 0; background-color: #fbece6;` (light peach tone from base).
    *   **Typography:** Uppercase, sans-serif, font-size `12px` or `14px`, color `#D6562B` (Brand Orange/Terracotta). Letter-spacing `1px`.
    *   **Separators:** Add vertical pipe `|` separators between links or use borders.

## 3. "New Flavor Everyday" Section
This section acts as the product feed header.
*   **Layout:** Center aligned container.
*   **Typography:** Heading "NEW FLAVOR EVERYDAY" should be `font-size: 2rem; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 2rem;`.
*   **Toggle Component:** Recreate the "TIKKAS" vs "GRAVIES" switch.
    *   **Wrapper:** Flex container, centered.
    *   **Left (Tikkas):** Background `#D6562B`, text white.
    *   **Right (Gravies):** White background, dark text, border.
    *   **Center Icon:** Place the circular illustrative icon absolutely positioned between the two toggles.

## 4. Product List Component (Responsive)
The product cards are missing. Rebuild using a responsive grid/flex layout.

### Desktop Styles
*   **Layout:** Vertical list of product rows.
*   **Card Container:** `display: flex; flex-direction: row; gap: 40px; margin-bottom: 60px; max-width: 1200px; margin-left: auto; margin-right: auto;`.
*   **Left Column (Images):**
    *   Width: `50%`.
    *   Main Image: Large aspect ratio (4:3).
    *   Thumbnails: Row of 3-4 small images below main image.
*   **Right Column (Details):**
    *   Width: `50%`.
    *   **Title:** `font-weight: 800; text-transform: uppercase; font-size: 1.5rem;`.
    *   **Price:** Display Current Price (`font-weight: bold; font-size: 1.2rem`) and Original Price (`text-decoration: line-through; color: #999; margin-left: 10px`).
    *   **Description:** `line-height: 1.6; margin: 20px 0;`.
    *   **CTA Button:** `background-color: #D6562B; color: white; padding: 12px 30px; border-radius: 4px; text-transform: uppercase; font-weight: bold; border: none; cursor: pointer;`.

### Mobile Styles
*   **Layout:** Vertical stack (Column).
*   **Card Container:** `flex-direction: column; padding: 0 15px; margin-bottom: 40px;`.
*   **Image Section:**
    *   Full width image.
    *   **Badge:** Add "XX BOUGHT TODAY" pill badge: `position: absolute; top: 10px; left: 10px; background: white; padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);`.
    *   **Pagination Dots:** Overlay dots at the bottom center of the image.
*   **Details Section:**
    *   Title and Price inline or closely stacked.
    *   **CTA Button:** Full width or `width: 100%` block button.

## 5. Mobile Hero & Deals Section (Mobile Only)
Restore the specific mobile marketing sections hidden in Target.
*   **Hero Image:** "MARINADE READY IN..." banner image. Ensure `width: 100%; height: auto; object-fit: cover;`.
*   **Deals Banner:**
    *   "GET KILLER DEALS" heading.
    *   Ribbon Container: Flex row.
    *   Ribbons: Red background with white text, arrow-shape CSS (using `clip-path` or pseudo-elements `::after` borders).
*   **Featured Collections Grid:**
    *   Two-column grid for "TIKKA MASALAS" and "GRAVY MASALAS".
    *   Style: Dark background card, product image, price overlay, "Pack of X" badge, and "ADD +" button at bottom.

## 6. Social Proof & Footer
*   **Testimonials:** Restore "150K+ GANG MEMBERS" section. Use a carousel/slider library for the user review cards.
*   **Slay The Mess:**
    *   **Desktop:** Split screen layout (50/50). Left side food prep, right side packaged product. Center circle with arrow button.
    *   **Mobile:** Stack images vertically.
*   **Accordions:** Restore "NEED MORE EVIDENCE?" section.
    *   Style: Simple border-bottom layout. Flex row (Text left, '+' icon right).
*   **Footer:** Ensure background color matches design (looks like light gray/white) and "TOGETHER WE ARE GONNA KILL IT" typography matches the header font.