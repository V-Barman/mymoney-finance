---
name: Emerald Wealth
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#404942'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#707971'
  outline-variant: '#bfc9c0'
  surface-tint: '#226b47'
  primary: '#004328'
  on-primary: '#ffffff'
  primary-container: '#0d5c3a'
  on-primary-container: '#8ad2a7'
  inverse-primary: '#8ed6aa'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#533200'
  on-tertiary: '#ffffff'
  tertiary-container: '#724700'
  on-tertiary-container: '#ffb451'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a9f3c5'
  primary-fixed-dim: '#8ed6aa'
  on-primary-fixed: '#002111'
  on-primary-fixed-variant: '#005232'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
  currency-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  currency-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes an authoritative, precise, and secure environment tailored for modern Indian personal finance management. Rooted in the principles of institutional stability and contemporary mobile-first ergonomics, the visual identity balances wealth preservation with daily transactional fluidity.

### Brand Personality
- **Trustworthy & Institutional:** Projects the rigor and security of a tier-one private wealth institution while shedding bureaucratic friction.
- **Calm & Discerning:** Financial management produces cognitive fatigue; the UI delivers clarity through strict information density, calculated breathing room, and subdued background surfaces.
- **Fluid & Modern:** Micro-interactions, crisp tactile response, and smooth sheet transitions reflect a cutting-edge native application built for high-frequency daily usage.

### Design Movement: Modern FinTech & Tonal Depth
The interface employs a hybrid of **Clean Modern Fintech** and **Tonal Layering**:
- Backgrounds utilize cool neutral slates to mitigate visual glare, while elevated surfaces utilize crisp white cards.
- Primary accents draw inspiration from deep emerald tones associated with growth, balance, and prosperity in the Indian socioeconomic landscape.
- Layering relies on ultra-subtle borders combined with diffused, low-opacity ambient shadows rather than harsh divider lines, ensuring financial dashboards feel structured without visual clutter.

## Colors

The palette establishes an unmistakable semantic clarity where every hue conveys a distinct transactional meaning. Primary branding anchors the experience in deep verdant authority, supported by directional financial signifiers.

### Semantic & Functional Hierarchy
- **Primary Brand (`#0D5C3A` / Deep Emerald):** Used for navigation headers, key action triggers, primary account summaries, and authoritative badges. An inkier shade (`#0A482D`) provides depth for pressed and focused states.
- **Positive & Inflow (`#10B981` / Mint Green, active state `#059669`):** Exclusively applied to income entries, investment gains, completed goals, and affirmative statuses.
- **Negative & Outflow (`#EF4444` / Crimson Red, active state `#DC2626`):** Dedicated to expenditure metrics, debit notifications, over-budget warnings, and critical error alerts.
- **Warning & Pending (`#F59E0B` / Warm Amber, active state `#D97706`):** Signals upcoming bill due dates, approaching credit limits, and pending transaction reconciliations.
- **Surface Foundations:** Canvas backgrounds reside at `#F8FAFC` (Slate 50) and `#F1F5F9` (Slate 100), creating immediate separation against pure `#FFFFFF` interactive surface cards.
- **Text & Typography:** Core readability is enforced via `#0F172A` (Slate 900) for primary numerical metrics and headlines, `#1E293B` (Slate 800) for body elements, and `#64748B` (Slate 500) for secondary metadata, labels, and timestamps.

## Typography

The type hierarchy prioritizes scannability across dense numerical datasets while preserving an inviting, contemporary aesthetic. Plus Jakarta Sans provides clean geometric balance and clear numeral distinction.

### Indian Financial Formatting Rules
- **Tabular Figures:** All financial amounts, transaction lists, and balance displays must enforce tabular figures (`font-variant-numeric: tabular-nums`) to ensure vertical decimal and comma alignment across lists.
- **INR Locale Formatting:** Currency follows the Indian numbering system standard (e.g., `â‚¹1,25,000.00` instead of `â‚¹125,000.00`, grouping hundreds followed by recurring pairs of tens of thousands/lakhs/crores).
- **Symbol Scale:** The Rupee glyph (`â‚¹`) should render at the exact font-weight and baseline of the accompanying figure, never superscripted or artificially diminished.
- **Negative Quantities:** Expenses must display explicit negative indicators with leading minus signs (e.g., `-â‚¹4,850.00`) paired with crimson semantic color tokens.

## Layout & Spacing

The structural layout operates strictly on an **8pt Base Grid System** designed specifically for mobile portrait form factors across both iOS and Android viewports.

### Rhythm & Alignment
- **Screen Margins:** Fixed at `1rem` (16px) on compact mobile screens (< 380px) and auto-scaled up to `1.25rem` (20px) on standard devices (380pxâ€“430px) to balance thumb reach and card width.
- **Vertical Rhythm:**
  - `space-xs` (4px): Micro-gaps between badge icons and label text.
  - `space-sm` (8px): Internal element padding within compact list rows, pill tags, and secondary metric offsets.
  - `space-md` (16px): Standard gap separating content blocks within cards; spacing between transaction items.
  - `space-lg` (24px): Structural division between distinct card modules, dashboard sections, and chart blocks.
  - `space-xl` (32px): Primary separation preceding sticky interaction bars and section titles.
- **Edge Containment:** Content does not span full-bleed unless rendered inside transactional summary charts, bottom navigation elements, or modal background scims.

## Elevation & Depth

Visual hierarchy uses a refined layered stack to ensure information floats logically above background canvases without introducing heavy skeuomorphic noise.

### Layer Stack Architecture
1. **Canvas Level (0dp):** Rendered in `#F8FAFC`. Houses static background regions, header gradients, and off-canvas page contexts.
2. **Resting Card Surface (1dp):** `#FFFFFF` paired with an ultra-thin border (`1px solid #E2E8F0`) and subtle ambient dispersion:
   - `box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
3. **Elevated Card / Active Dropdown (2dp):** Used for highlighted stats, swipeable carousels, and filter popovers:
   - `box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`.
4. **Primary Quick-Action Button (+) (3dp):** Elevated above the bottom navigation bar to signal persistent actionability:
   - Background: `#0D5C3A`.
   - Shadow: `0 10px 15px -3px rgba(13, 92, 58, 0.25), 0 4px 6px -4px rgba(13, 92, 58, 0.15)`.
5. **Modals & Action Sheets (4dp):** Interactive bottom sheets emerge with dynamic background backdrop filters (`backdrop-filter: blur(12px)`) and high-elevation top drop shadows:
   - `box-shadow: 0 -10px 25px -5px rgba(15, 23, 42, 0.08)`.

## Shapes

The design system embraces a calibrated rounded geometry that bridges tactile modern software with enterprise discipline.

### Geometry Specifications
- **Cards & Data Modules (`rounded-2xl` / 16px):** Dashboard summary blocks, bank integration cards, category spend groupings, and analytical chart containers feature a 16px corner radius.
- **Action Buttons & Form Inputs (`rounded-xl` / 12px):** Primary transactional triggers, input fields, dropdown trigger targets, and modal confirm buttons adhere to a 12px radius.
- **Pills, Badges & Micro-tags (Full / 9999px):** Category badges, recurring status indicators, segmented filter switches, and quick-add pills employ full pill geometry to distinctly differentiate them from actionable cards.
- **Quick-Action Floating Action:** The central bottom navigation trigger is a strict circle (`border-radius: 50%`) engineered with an inset 2px border matching the navigation background to create seamless cutout framing.

## Components

### Buttons & Interactive Controls
- **Primary Buttons:** High-density emerald background (`#0D5C3A`), white label text (`label-lg`), height: 48px, radius: 12px. Active press state triggers a scale reduction (`transform: scale(0.98)`) and shifts to `#0A482D`.
- **Secondary / Ghost Buttons:** Transparent or neutral tinted background (`#F1F5F9`), slate text (`#1E293B`), 1px subtle stroke (`#CBD5E1`).
- **Floating Quick-Action (+):** Fixed centrally in bottom navigation; 56px circle in `#0D5C3A` with centered white icon; opens the transaction creation sheet.

### Segmented Pill Tabs
- Enclosed inside a container with `#F1F5F9` background and 6px padding.
- Active pill transitions with smooth layout spring to `#FFFFFF` with `0 2px 4px rgba(15, 23, 42, 0.06)` elevation and `#0D5C3A` active label weight.

### Stat Summary Cards
- White background (`#FFFFFF`), 16px radius, 16px internal padding.
- Structure: Micro-label in `label-md` Slate 500, main balance in `currency-display`, followed by a sub-metric row displaying delta indicators with semantic icons (arrow-up-right in `#10B981` or arrow-down-right in `#EF4444`).

### Transaction List Items
- Structured row pattern: 40px rounded-full icon container with 10% semantic color tint (e.g., `#EF44441A` for dining expense), title in `body-md` bold, secondary date/category in `body-sm` Slate 500.
- Trailing column displays numeric value in `currency-md`, right-aligned, with semantic coloring and tabular figures.

### Category Badge Chips
- Pill-shaped (`border-radius: 9999px`), internal padding `4px 10px`.
- Composed of an 8px micro-dot or 12px vector icon followed by `label-sm` text. Tinted background at 8% opacity of the category color.

### Budget Progress Bars
- 6px height track with `#E2E8F0` neutral fill, full border radius.
- Dynamic fill bar transition with semantic threshold shift: Mint (`#10B981`) for <75%, Amber (`#F59E0B`) for 75%â€“90%, Crimson (`#EF4444`) for L	HÜˆYÙ]Ý™\œ[‹‚‚ˆÈÈÈÝXÚÞH›ÝÛH˜]šYØ][Û‚‹Hš^YZYÚˆ
ÈØY™H\™XH[œÙ]ˆ˜XÚÙÜ›Ý[™ˆÑ‘‘‘‘‘˜Ú]HÜ\›Ü™\ˆ
ÑL‘NŒ
K‚‹HKXÛÛ[[ˆ^[Ý]ˆÛYK[˜[]XÜËÙ[\ˆ

ÊH]ZXÚÈXÝ[Û‹YÙ]Ë›Ùš[Kˆ[˜XÝ]™HXÛÛœÎˆÍÍ˜ÈXÝ]™HXÛÛŽˆÌPÌÐX‚‚ˆÈÈÈ[Ù[	ˆ[\˜XÝ]™HÚY]Â‹H\Ø\™ÛYHÚ]Ü[[™XØ]Üˆ
ÌœÚYKZYÚÐÐ‘QLXX\™Ú[‹]Ü
K‚‹HÝ\™˜XÙH˜Y]\ÎˆÛˆÜ[Y[™Ü\šYÚÛÜ›™\œÎÈ˜XÚÙ›ÜØœØÝ\™YÚ]ÍIH›XÚÈÝ™\›^H[™Lœ›\‹