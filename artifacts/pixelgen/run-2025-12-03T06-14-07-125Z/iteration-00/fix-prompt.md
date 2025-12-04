Here is the consolidated plan to fix the UI issues and align the Target with the Base design.

### 1. Mobile Layout & Content Fixes (High Priority)

The mobile version has significant structural deviations, including missing sections and incorrect flex layouts.

*   **Restore "Killer Deals" Section**:
    *   **Issue**: The "GET KILLER DEALS" section (containing "TIKKA MASALAS" and "GRAVY MASALAS" promo cards) is completely missing in the Target mobile view between the Hero and "NEW FLAVOR EVERYDAY".
    *   **Fix**: Ensure the `.promo-banners` or equivalent container is not `display: none` on mobile.
    *   **Structure**: Insert the two promo cards stacked vertically. Each card must include the background image, "TIKKA/GRAVY MASALAS" title, Price comparison, and "Add" button.
    *   **Header**: Add the "GET KILLER DEALS" header with the "EXPRESS DELIVERY" and "BEST PRICES" ribbon graphics above these cards.

*   **Refactor Product Card Layout (Mobile)**:
    *   **Issue**: Target stacks all content vertically. Base uses a Flex row layout for the info section.
    *   **Fix**: Update the product info container CSS for mobile:
        ```css
        @media (max-width: 768px) {
          .product-card .info-container {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center; /* or flex-start depending on alignment */
          }
          .product-card .text-content {
            flex: 1;
            padding-right: 12px;
          }
          .product-card .add-btn-container {
            width: auto;
            flex-shrink: 0;
          }
          .product-card .add-btn {
            width: auto; /* Prevent full width */
            padding: 10px 20px;
          }
        }
        ```
    *   **Thumbnails**: Ensure thumbnails are positioned immediately below the main image and above the info container.

*   **Fix "Shop Now" Bottom CTA**:
    *   **Issue**: The large "SHOP NOW" button in the footer area ("TOGETHER WE ARE GONNA KILL IT") is missing or styled incorrectly in Target.
    *   **Fix**: Add or style the CTA button to match Base: Rust background (`#C0532C`), white text, uppercase, large padding.

### 2. Desktop Layout & Alignment

*   **Product List Grid Alignment**:
    *   **Issue**: The vertical rhythm and thumbnail placement are off.
    *   **Fix**:
        *   Ensure the main product list uses a consistent grid: `display: grid; grid-template-columns: 1fr 1fr; gap: 40px;`.
        *   **Thumbnails**: Verify that the thumbnail strip is contained *within* the left column (image column), strictly below the main image.
        *   **Vertical Spacing**: Align the right column (content) to the top of the image container (or vertically center if that matches Base better—Base looks top-aligned with slight padding).

*   **Review Section ("105K+ Gang Members")**:
    *   **Issue**: Misalignment in the grid of review cards.
    *   **Fix**:
        *   Set container to `display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;`.
        *   Ensure all cards have equal height (`height: 100%`).
        *   Align the star ratings and text consistently.

*   **Footer Styling**:
    *   **Issue**: Background color mismatch.
    *   **Fix**: Change the footer background color from White (`#FFFFFF`) to the Base's Off-White/Beige (approx `#F9F9F9` or `#F4F4F4`).

### 3. Global Styling & Typography

*   **Typography**:
    *   **Price Styling**: Ensure the current price (`₹69`) is **Bold** and larger, and the original price (`₹70`) is `text-decoration: line-through` and lighter color (grey).
    *   **Headings**: Ensure the "Killr" custom font (distressed typography) is applied to section headers like "NEW FLAVOR EVERYDAY" and "TOGETHER WE ARE GONNA KILL IT".

*   **Buttons**:
    *   **Color**: Standardize all "+ ADD" and "SHOP NOW" buttons to the brand Rust color (`#C0532C`).
    *   **Border Radius**: Ensure buttons have a slight border-radius (approx 4px) as per Base.

*   **Comparison Slider ("Slay the Mess")**:
    *   **Fix**: Ensure the `z-index` of the "WITHOUT KILRR" / "WITH KILRR" labels is higher than the image but lower than the slider handle if necessary. Fix the centering of the slider handle icon.