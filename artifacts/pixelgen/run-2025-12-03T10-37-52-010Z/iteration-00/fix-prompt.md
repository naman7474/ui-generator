Here is the consolidated plan to fix the UI issues and align the Target with the Base.

### 1. Desktop Layout & Navigation
*   **Remove Hero Banner:**
    *   Hide or remove the `<section>` containing the "GET KILLER TASTE WITH ZERO FUSS" background image. The Base layout begins immediately with the header and category navigation.
    *   `display: none;` on the hero container.
*   **Fix Category Sub-Navigation:**
    *   The Target currently renders this as a scrolling ticker/marquee. Change this to a static centered list to match Base.
    *   **Container:** Set `display: flex`, `justify-content: center`, `align-items: center`, `padding: 12px 0`, `background-color: #ffece6` (pale peach).
    *   **Items:** Remove marquee animation. Style links with `text-transform: uppercase`, `color: #e67e73` (salmon pink), `font-size: 11px`, `letter-spacing: 1px`, `font-weight: 600`.
    *   **Separators:** Ensure the vertical pipe `|` separators have consistent margin (e.g., `margin: 0 15px`).

### 2. Mobile Specific Content & Layout
*   **Restore Missing Top Sections:**
    *   The Mobile Target is missing two key sections at the top. Inject or unhide them in the following order:
        1.  **Marinade Banner:** An image banner "MARINADE READY IN..." (Black background).
        2.  **Killer Deals Grid:** A 2-column section titled "GET KILLER DEALS".
            *   **Left Card:** "TIKKA MASALAS" (Black Bg). Includes Pricing (`₹629`) and CTA.
            *   **Right Card:** "GRAVY MASALAS" (Brown Bg). Includes Pricing (`₹585`) and CTA.
            *   **Styling:** Ensure flex row with `gap: 10px`, full width.
*   **Product Image Overlays (Mobile):**
    *   **Badge:** Add a "BOUGHT TODAY" badge to the top-left of the product image.
        *   CSS: `position: absolute; top: 12px; left: 12px; background: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; z-index: 2; box-shadow: 0 2px 4px rgba(0,0,0,0.1);`
    *   **Pagination Dots:** Add carousel indicators at the bottom center of the image area.
        *   CSS: `display: flex; gap: 4px; position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);`
        *   Dots: `width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.5);`. Active dot should be white.

### 3. Product List Components (Shared)
*   **Typography & Headings:**
    *   **Product Titles:** Increase `letter-spacing` to `0.5px` and ensure `font-weight: 700`. Align font-family to geometric sans-serif (match branding).
    *   **Prices:** Ensure the current price (`₹69`) is bold and the crossed-out price (`₹70`) is lighter grey with `text-decoration: line-through`.
*   **Buttons:**
    *   **"+ ADD" Button:** Match the Base color perfectly.
        *   Background: `#cc5533` (Burnt Orange).
        *   Text: White, Uppercase, Bold.
        *   Padding: `10px 24px` (Desktop), Full width or large block (Mobile).
        *   Border radius: `2px` or `4px` (slightly rounded).

### 4. Spacing & Margins
*   **Section Headers:**
    *   The "NEW FLAVOR EVERYDAY" header needs consistent top/bottom padding (`padding: 40px 0`).
    *   The toggle buttons (TIKKAS / GRAVIES) should be centered immediately below this header with `margin-bottom: 30px`.
*   **Product Items:**
    *   Increase vertical spacing between product rows on Desktop (`margin-bottom: 60px`).
    *   On Mobile, ensure a clear separator or margin between the product card and the next item (`margin-bottom: 30px`).

### 5. Footer & FAQ
*   **FAQ Accordion:**
    *   Ensure the border lines between items are light grey (`#eee`).
    *   Verify the font weight of the questions ("What's in each pack?") is semi-bold (`600`).
*   **Footer Bottom:**
    *   Center align the text "END OF KILRR CASE FILE...".
    *   Fix alignment of footer columns (About Us, Help) to be left-aligned within their container, but the container itself should be centered or container-constrained (max-width: 1200px).