---
name: KruPayKru System
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbed'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fc'
  surface-container-highest: '#d9e3f6'
  on-surface: '#121c2a'
  on-surface-variant: '#3e4947'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#6e7977'
  outline-variant: '#bdc9c6'
  surface-tint: '#006a63'
  primary: '#005c55'
  on-primary: '#ffffff'
  primary-container: '#0f766e'
  on-primary-container: '#a3faef'
  inverse-primary: '#80d5cb'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#0047bf'
  on-tertiary: '#ffffff'
  tertiary-container: '#1e5fe7'
  on-tertiary-container: '#e6e9ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9cf2e8'
  primary-fixed-dim: '#80d5cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#00504a'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#003ea8'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f6'
  background-warm: '#FAFAF8'
  success: '#16A34A'
  danger: '#DC2626'
  muted-gray: '#6B7280'
  seller-gold: '#D97706'
  krupass-emerald: '#10B981'
typography:
  headline-lg:
    fontFamily: IBM Plex Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: IBM Plex Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: IBM Plex Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: IBM Plex Sans
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Noto Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  price-display:
    fontFamily: IBM Plex Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1280px
---

## Brand & Style
The design system embodies the spirit of a specialized educational marketplace. It balances the professional authority of the teaching profession with the community-driven warmth of a creative craft marketplace. The aesthetic is "Modern Educational Boutique"—refined, trustworthy, and approachable.

We employ a **Corporate / Modern** style influenced by **Minimalism**. The interface prioritizes clarity and ease of navigation for educators, utilizing ample white space, purposeful color accents, and soft tactile elements to create a sense of organized inspiration.

## Colors
The palette is anchored by **Deep Teal**, signaling stability and academic professionalism. **Marigold** is used sparingly for promotional highlights and "Sale" states to draw attention without causing visual fatigue. 

The background uses a slightly off-white **Warm White** to reduce eye strain during long browsing sessions. Functional colors (Success/Danger) are standard but slightly desaturated to maintain the professional tone. Gradient applications (Teal to Emerald) are reserved exclusively for "KruPass" premium features to denote value and growth.

## Typography
Typography is optimized for Thai language legibility. Headlines use a structured, modern sans-serif to convey authority. Body text uses a highly readable humanist sans-serif with generous line height to accommodate complex Thai glyphs.

Prices are treated as a distinct visual tier—always bold, always preceded by the ฿ symbol, and sized slightly larger than surrounding body text to facilitate quick scanning of the marketplace.

## Layout & Spacing
The layout follows a **Fluid Grid** system with specific structural constraints. 
- **Desktop:** 12-column grid with a 1280px max-width container. Product grids default to 4 columns.
- **Mobile:** Single column for content, transitioning to a 2-column "masonry-lite" grid for product listings to maximize vertical space.

Spacing follows a 4px baseline. Components use 16px (base x 4) for internal padding to maintain a breathable, open feel. Sidebars in the seller dashboard are fixed at 280px to ensure consistent tool access.

## Elevation & Depth
Depth is communicated through **Tonal Layers** and **Ambient Shadows**. 
- The primary canvas is #FAFAF8. 
- Interactive cards and containers use #FFFFFF with a soft, 12% opacity shadow (8px blur, 4px Y-offset) tinted with the primary teal to create a "lifted" effect.
- Modals and dropdowns use a higher elevation (16px blur) to clearly separate them from the workspace.
- Seller sidebars use a flat, deep tonal fill (#0B4F4A) to denote a "utility mode" separate from the buyer marketplace.

## Shapes
The shape language is defined by **Soft Geometric** forms. Standard UI elements (Cards, Input Fields) use a consistent 12px (0.75rem) corner radius. This "intermediate" roundedness strikes a balance between professional rigor and friendly accessibility. 

Buttons and filter chips are the exception, utilizing a **Pill-shaped (999px)** radius to maximize their "tappable" appearance and differentiate them from layout containers.

## Components

### Buttons & Inputs
- **Primary Action:** Pill-shaped, Solid Deep Teal with white text.
- **Secondary Action:** Pill-shaped, Deep Teal outline with 1.5px stroke.
- **Inputs:** 12px radius, light gray border, transitions to Deep Teal on focus.

### Cards
- **Product Cards:** 12px radius. Features a 4:3 aspect ratio image container at the top. Content includes 2-line title clamping, a store name line with badge, and a bold price display. Hover states should include a subtle scale-up (1.02x) and increased shadow depth.

### Badges & Tagging
- **Verification Badges:** Use specific icon/color pairings (🏅 Gold for Verified Teacher, 🟦 Blue for Identity Verified).
- **Price Badges:** Solid Marigold for "Sale" tags to create high contrast against the teal primary color.
- **KruPass:** Uses a teal-to-emerald gradient with white text to signify premium status.

### Navigation
- **Top Nav (Buyer):** Centered search bar with a high-contrast search button.
- **Bottom Tab Bar (Mobile):** 5-item fixed navigation with clear iconography for Home, Search, Cart, Library, and Profile.
- **Sidebar (Seller/Admin):** High-contrast dark teal background with collapsed/expanded states for efficiency.