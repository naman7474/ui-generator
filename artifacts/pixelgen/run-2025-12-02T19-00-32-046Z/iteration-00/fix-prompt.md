Here is the consolidated plan to fix the UI/UX issues and align the implementation with the design mockups.

## 1. Global Styles & Typography
**Goal:** Fix global diff noise caused by font rendering and box-model mismatches.

*   **CSS Reset:** Ensure `box-sizing: border-box` is applied to all elements.
*   **Typography:**
    *   Verify the brand font (appears to be a geometric sans-serif like **Futura**, **Montserrat**, or **Poppins**) is loaded correctly. The diff heatmap noise suggests a fallback font might be rendering.
    *   Enable font smoothing: `-webkit-font-smoothing: antialiased;`.
    *   Set a base `line-height` (e.g., `1.5`) and `color` (dark grey/black) to match the mockups.
*   **Layout:** Remove default `body` margins/padding.

```css
* {
    box-sizing: border-box;
}
body {
    margin: 0;
    font-family: 'YourBrandFont', sans-serif; /* Replace with actual font */
    -webkit-font-smoothing: antialiased;
    color: #1a1a1a;
}
```

## 2. Header & Hero Section
**Goal:** Align header elements and fix Hero background scaling.

*   **Top Bar:** Ensure the "FREE SHIPPING OVER ₹399" bar has consistent height (e.g., `30px`) and `font-size: 12px` with `text-transform: uppercase`.
*   **Main Header:**
    *   **Desktop:** Use Flexbox to separate Logo (left) and Icons (Cart/Profile - right). Vertically center items.
    *   **Mobile:** Ensure the Logo is centered if required by design, or keep left.
*   **Hero Image:**
    *   **Desktop:** Set `background-size: cover` and `background-position: center top`. Ensure the text "GET KILLER TASTE..." is HTML text overlay, not part of the image, for accessibility and responsiveness.
    *   **Mobile:** Switch to the mobile-specific hero image (vertical orientation). Use the `<picture>` element or CSS media queries.
    *   **Overlay:** Position the "AS SEEN ON" badge (Mobile) to `bottom: 10px; right: 10px;`.

## 3. Product Layouts (Critical Layout Shifts)
**Goal:** Fix the layout difference between Desktop (Side-by-Side) and Mobile (Stacked).

### Desktop
*   **Structure:** Create a wrapper for product items using `display: flex; flex-direction: row;`.
*   **Sizing:**
    *   **Image Container:** Width `55%`. Add `border-radius: 12px` to the main image.
    *   **Content Container:** Width `45%`. Add padding-left `40px`.
*   **Alignment:** Use `align-items: flex-start` or `center`.
*   **Thumbnails:** Ensure the small thumbnails below the main image have a fixed width (e.g., `60px`) and a gap of `10px`.

### Mobile
*   **Structure:** Change wrapper to `flex-direction: column`.
*   **Sizing:** Both Image and Content containers take `width: 100%`.
*   **Spacing:** Add `margin-bottom: 20px` between the image and the text.
*   **"Get Killer Deals" Section:**
    *   Implement a 2-column grid for the category cards ("TIKKA MASALAS", "GRAVY MASALAS").
    *   CSS: `display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 0 16px;`.

## 4. Components & Styling
**Goal:** Match specific UI elements (Buttons, Badges, Tabs).

*   **Tabs (New Flavor Everyday):**
    *   Center the tab container.
    *   **Active Tab:** Brown background (`#C05E2B`), White text, Pill shape.
    *   **Inactive Tab:** White background, Grey border, Grey text.
    *   **Images:** Ensure the tab pills include the small circle images (Tikka/Gravy bowl) on the right side of the text.

*   **Floating Cart Icon:**
    *   The orange circle button with the cart icon and '0' badge.
    *   **Fix:** Ensure it has `z-index: 100`. If it's a global FAB, use `position: fixed; bottom: 20px; right: 20px;`. If it's section-specific (as per desktop header overlap), check parent `position: relative` context.

*   **Add Button:**
    *   Style: `background-color: #C05E2B; color: white; width: 150px; padding: 10px; border-radius: 4px; text-transform: uppercase; font-weight: bold; border: none;`.

*   **Marquee Strip:**
    *   Ensure the pink running text strip ("LEAN LABEL | ALL-IN-ONE...") uses `white-space: nowrap` and an infinite scroll animation or standard marquee implementation. Padding: `12px 0`.

## 5. Testimonials & Footer
**Goal:** Fix grid alignment and spacing.

*   **Testimonials (Gang Members):**
    *   **Desktop:** 4-column grid. `grid-template-columns: repeat(4, 1fr);`.
    *   **Mobile:** Horizontal scroll (carousel) or 1-column stack.
    *   **Card Style:** White background, subtle shadow, `border-radius: 8px`, `padding: 16px`. Text alignment left.

*   **Slay The Mess Section:**
    *   **Desktop:** Flex row `width: 50%` each. Ensure images fill the height fully.
    *   **Mobile:** Stack vertically `width: 100%`.

*   **Accordion (Evidence):**
    *   Add `border-bottom: 1px solid #eee` to each item.
    *   Ensure the `+` icon is floated right or managed via Flexbox `justify-content: space-between`.

## 6. Implementation Checklist

1.  [ ] **Reset:** Apply `box-sizing: border-box` globally.
2.  [ ] **Font:** Import and apply correct font family.
3.  [ ] **Desktop Product Card:** Set `display: flex; flex-direction: row` for product containers.
4.  [ ] **Mobile Hero:** Fix aspect ratio and "AS SEEN ON" badge position.
5.  [ ] **Mobile Grid:** Apply `grid-template-columns: 1fr 1fr` to the "Killer Deals" category section.
6.  [ ] **Colors:** Standardize the primary brown (`#C05E2B`) and badge red (`#FF0000`).
7.  [ ] **Spacing:** Adjust margins to match the "clean" look of the Base screenshot, specifically adding breathing room around the "New Flavor Everyday" title.