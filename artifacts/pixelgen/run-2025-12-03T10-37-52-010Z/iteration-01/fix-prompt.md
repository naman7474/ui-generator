Here is the consolidated plan to align the Target UI with the Base design.

## 1. Hero & Header Section
**Priority: High**

*   **Desktop - Hero Overlay:**
    *   **Issue:** The text overlay "GET KILLER TASTE WITH ZERO FUSS" and the associated subheading are missing in the Target version (only the background image is visible).
    *   **Fix:** Restore the hero text container. Center it over the hero image with white text, uppercase font, and appropriate drop-shadows to match the Base design.

*   **Mobile - Deals Banner:**
    *   **Issue:** The brown ribbon banner containing "EXPRESS DELIVERY | BEST PRICES" is missing between the "GET KILLER DEALS" header and the product cards.
    *   **Fix:** Insert the banner component below the section header. Use background color `#a52a2a` (approximate brown), white text, and ensure the "lightning" and "fire" icons are present.

## 2. Category Navigation (Tabs)
**Priority: High**

*   **Both Devices - "New Flavor Everyday" Tabs:**
    *   **Issue:** The "TIKKAS" and "GRAVIES" tabs in the Target version are simple text buttons. The Base version uses large pill-shaped containers that include a circular food image/avatar on the right side of the text.
    *   **Fix:**
        *   Update the Tab component structure to accept an image.
        *   **Tikkas Tab:** Brown background, white text, circular food image on the right.
        *   **Gravies Tab:** White background, brown border, circular food image on the right, and the "NEW LAUNCH" badge (if applicable from Base assets).

## 3. Product Cards (Deals & List)
**Priority: Medium**

*   **Mobile - Deal Cards (Tikka/Gravy Masalas):**
    *   **Issue:** The "TIKKA MASALAS" card is missing the black "Pack of 15" pill badge. Currently, only "Pack of 10" is visible.
    *   **Fix:** Add the secondary badge "Pack of 15" with black background and white text next to the "Pack of 10" badge.

*   **Mobile - Product List Items (Tandoori Blast, etc.):**
    *   **Issue:** The row of small ingredient/spice-level thumbnail icons (chilis, garlic) located immediately below the main product image is missing in the Target version.
    *   **Fix:** Restore the thumbnail strip container between the product image and the title. Ensure appropriate spacing (margin-top: 8px).

*   **Desktop - Typography:**
    *   **Issue:** The "₹69" price font weight appears lighter in the Target version compared to the Base.
    *   **Fix:** Increase `font-weight` for the current price to 700 (bold) to match the visual prominence of the Base screenshot.

## 4. Footer & CTA
**Priority: Low**

*   **Mobile - "Shop Now" Button:**
    *   **Issue:** The bottom "SHOP NOW" button in the Target version is a standard rectangle. The Base version has a distinct style (possibly texture, wider letter spacing, or specific arrow decorations on the sides).
    *   **Fix:** Adjust the "SHOP NOW" button styles:
        *   Increase letter-spacing.
        *   Ensure the chevron/arrow icons `>` are present if missing.
        *   Match the specific brown shade and padding to the Base screenshot.

*   **Desktop - Footer Logo:**
    *   **Issue:** The footer logo color in the Target seems to be a standard dark color, whereas Base uses the brand orange.
    *   **Fix:** Apply the brand orange color (matching the header logo) to the Footer "KILRR" logo svg/text.