Here is the consolidated plan to implement the designs pixel-perfectly, addressing the completely missing/blank render in the target state.

### 1. Global Styles & Typography
**Goal:** Establish the visual foundation (Fonts, Colors, Resets).

*   **HTML/Head:** Import the grunge display font (e.g., 'Mom’s Typewriter' or similar style) for headings and a clean geometric sans-serif (e.g., 'Montserrat' or 'Lato') for body text.
*   **CSS Variables:**
    *   `--primary-rust`: `#C05832` (approximate color from buttons).
    *   `--text-black`: `#000000`.
    *   `--bg-light-peach`: `#FFF5F0` (for marquee/backgrounds).
    *   `--border-gray`: `#E0E0E0`.
*   **Reset:** Apply `box-sizing: border-box` globally. Remove default margins on `body`, `h1-h6`.

### 2. Header & Top Bar
**Goal:** Fix alignment differences between Desktop and Mobile.

*   **HTML Structure:**
    *   Container: `header`.
    *   Top Bar: `div.top-bar` text "FREE SHIPPING OVER ₹399".
    *   Main Nav: `nav.navbar` containing Logo (left/center), Icons (right).
*   **CSS Fixes:**
    *   `.top-bar`: Background `#000`; Text `#FFF`; `text-align: center`; `padding: 8px`; `font-size: 12px`; `letter-spacing: 1px`.
    *   `.navbar`:
        *   **Desktop:** `display: flex; justify-content: space-between; align-items: center; padding: 20px 50px;`. Logo aligned left.
        *   **Mobile (`@media max-width: 768px`):** `padding: 15px 20px;`. Use `justify-content: center` for the logo but `position: absolute; right: 20px` for the cart/user icons to keep the logo visually centered.

### 3. Hero Section
**Goal:** Handle distinct aspect ratios and content for devices.

*   **HTML:** Use `<picture>` element to swap assets.
    *   `<source media="(min-width: 769px)" srcset="desktop-hero.jpg">`
    *   `<img src="mobile-hero.jpg" ...>`
*   **CSS Fixes:**
    *   **Desktop:** Height approx `600px`. `object-fit: cover`. Overlay text "GET KILLER TASTE..." centered using `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);`. Font: Grunge style, White, `font-size: 3rem`.
    *   **Mobile:** Height auto (aspect ratio preserved). Ensure the "Marinade Ready In" graphic is part of the image or an absolute positioned SVG overlay.

### 4. Marquee Strip (Desktop) & Killer Deals (Mobile)
**Goal:** Implement device-specific marketing sections below Hero.

*   **Desktop Marquee:**
    *   `display: flex` strip. Background: Light Peach/Pink.
    *   Text: Uppercase, Red (`--primary-rust`), separated by `|`.
    *   Content: "CLEAN LABEL | ALL-IN-ONE MASALAS | ...".
    *   **Mobile:** `display: none` (based on mobile screenshot showing "Killer Deals" instead).
*   **Mobile "Killer Deals" Section:**
    *   **Desktop:** `display: none`.
    *   **Mobile:**
        *   Header: "GET KILLER DEALS" with decorative arrows.
        *   Grid: `display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 10px;`.
        *   Cards: Dark background product images with "Add + " buttons.

### 5. "New Flavor Everyday" Product List
**Goal:** Fix the major layout shift (Row vs Column).

*   **Structure:** Section container with `max-width: 1200px; margin: 0 auto;`. Title "NEW FLAVOR EVERYDAY" centered. Tabs "TIKKAS" / "GRAVIES".
*   **Product Card HTML:**
    ```html
    <div class="product-card">
      <div class="gallery">
        <div class="badge">213 BOUGHT TODAY</div> <!-- Mobile only -->
        <img class="main-img" src="...">
        <div class="thumbs">...</div> <!-- Desktop only -->
      </div>
      <div class="info">
        <h3>TANDOORI BLAST</h3>
        <div class="price-row">
           <span class="curr">₹69</span> <span class="old">₹70</span>
        </div>
        <p class="desc">Drop a bomb of tandoori flavor...</p>
        <button class="add-btn">+ ADD</button>
      </div>
    </div>
    ```
*   **CSS Fixes (Desktop):**
    *   `.product-card`: `display: flex; gap: 40px; margin-bottom: 60px; align-items: center;`.
    *   `.gallery`: Width `50%`.
    *   `.info`: Width `50%`; `text-align: left`.
    *   `.add-btn`: `width: auto; padding: 12px 30px;`.
*   **CSS Fixes (Mobile):**
    *   `.product-card`: `display: flex; flex-direction: column; gap: 16px; margin-bottom: 40px;`.
    *   `.gallery`: Width `100%`. Enable horizontal scroll/snap for multiple images or show dots.
    *   `.info`:
        *   Title and Price should be on the same row? Checking screenshot: No, Title is above.
        *   Layout: Title (Left), Price (Right) using `display: flex; justify-content: space-between;` for the header row inside info.
    *   `.add-btn`: `width: 100%;` (Full width block).
    *   `.badge`: `position: absolute; top: 10px; left: 10px; background: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold;`.

### 6. Reviews Section ("150K+ Gang Members")
**Goal:** Grid for Desktop, Carousel for Mobile.

*   **CSS Fixes:**
    *   Container: `display: flex; gap: 20px;`.
    *   **Desktop:** `flex-wrap: nowrap; overflow: visible;`. Show all 4 cards.
    *   **Mobile:** `overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 20px;`.
    *   **Card:** White background, shadow, padding `16px`. Image circle top-left.

### 7. "Slay The Mess" Section
**Goal:** Split banner implementation.

*   **Desktop:**
    *   `display: flex; height: 500px;`.
    *   Left Div: Image (Ingredients). Right Div: Image (Packaging).
    *   Center Overlay: Play button icon absolute positioned.
*   **Mobile:**
    *   `flex-direction: column; height: auto;`.
    *   Images stack vertically.

### 8. Footer & FAQ
**Goal:** Clean accordion and footer columns.

*   **FAQ Accordion:**
    *   Border-bottom separators.
    *   Flex row for Question + Plus Icon.
    *   Hidden answer div (toggle on click).
*   **Footer Bottom:**
    *   "TOGETHER WE ARE GONNA KILL IT" text: Large font size (2rem+), centered, margin bottom `20px`.
    *   "SHOP NOW" Button: Large, centered, max-width `300px`.
    *   Columns: Flex layout for "About Us" and "Help". Stack vertically on mobile (`flex-direction: column`), side-by-side on desktop.