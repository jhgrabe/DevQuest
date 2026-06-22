---
name: Cyber-Terminal Aesthetic
colors:
  surface: '#111319'
  surface-dim: '#111319'
  surface-bright: '#373940'
  surface-container-lowest: '#0c0e14'
  surface-container-low: '#191b22'
  surface-container: '#1e1f26'
  surface-container-high: '#282a30'
  surface-container-highest: '#33343b'
  on-surface: '#e2e2eb'
  on-surface-variant: '#bbc9cd'
  inverse-surface: '#e2e2eb'
  inverse-on-surface: '#2e3037'
  outline: '#859397'
  outline-variant: '#3c494c'
  surface-tint: '#2fd9f4'
  primary: '#8aebff'
  on-primary: '#00363e'
  primary-container: '#22d3ee'
  on-primary-container: '#005763'
  inverse-primary: '#006877'
  secondary: '#bdc2ff'
  on-secondary: '#131e8c'
  secondary-container: '#2f3aa3'
  on-secondary-container: '#a8afff'
  tertiary: '#ffd6a7'
  on-tertiary: '#472a00'
  tertiary-container: '#ffb147'
  on-tertiary-container: '#704500'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#a2eeff'
  primary-fixed-dim: '#2fd9f4'
  on-primary-fixed: '#001f25'
  on-primary-fixed-variant: '#004e5a'
  secondary-fixed: '#e0e0ff'
  secondary-fixed-dim: '#bdc2ff'
  on-secondary-fixed: '#000767'
  on-secondary-fixed-variant: '#2f3aa3'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#111319'
  on-background: '#e2e2eb'
  surface-variant: '#33343b'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  max-width: 1440px
---

## Brand & Style
The design system is built on a "Pro-Developer RPG" narrative, merging the precision of high-end IDEs with the immersive atmosphere of a technical dungeon crawler. The aesthetic is rooted in **Minimalism** and **Modern Corporate** styles, but injected with **High-Contrast** accents to evoke a high-fidelity, mission-critical interface. 

The target audience consists of developers who value data density and "no-fluff" layouts. The emotional response should be one of focused competence, clarity, and digital mastery. All interfaces must feel like a specialized tool—precise, functional, and authoritative.

## Colors
The system utilizes a deep, "obsidian" dark mode foundation.
- **Background**: Use `#0f1117` as the base canvas. Surface layers should use subtle increments of lightness to create hierarchy.
- **Primary (Electric Teal)**: Reserved strictly for primary actions, progress indicators (XP), and active states. 
- **Secondary (Indigo)**: Used for secondary technical information and quest-related metadata.
- **Accents**: 
  - **Adept/Warning**: `#f59e0b` (Amber)
  - **Master/Error/Failed**: `#ef4444` (Red)
  - **Passed**: `#10b981` (Green)
- **Contrast**: Text should maintain a minimum 7:1 ratio against the dark background to ensure readability in a data-dense environment.

## Typography
This design system employs a dual-typeface strategy to balance readability and technical identity.
- **Inter (Sans-serif)**: Used for all primary UI copy, headings, and descriptions to ensure maximum legibility at high densities.
- **JetBrains Mono (Monospace)**: Used for "Technical Accents"—Quest IDs, difficulty tags, XP values, and any code-related labels. This creates a clear visual distinction between "System UI" and "Technical Data."
- **Scale**: Keep line heights generous for body text (1.5+) to prevent eye fatigue during long coding sessions.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a hard 4px baseline rhythm. 
- **Density**: The design is "data-dense," meaning margins are kept compact (16px to 24px) to allow more information on screen at once.
- **Grid**: Use a 12-column grid for desktop. For the Code Editor view, use a split-pane layout where the editor occupies 60-70% of the horizontal space, and the quest requirements/docs occupy the sidebar.
- **Breakpoints**: 
  - Mobile (<768px): Single column, 16px margins.
  - Tablet (768px - 1024px): 8 columns, 24px margins.
  - Desktop (>1024px): 12 columns, 32px margins, max-width 1440px.

## Elevation & Depth
Depth is created through **Tonal Layers** and **Low-Contrast Outlines** rather than traditional shadows.
- **Level 0 (Base)**: `#0f1117` (The void).
- **Level 1 (Cards/Sidebar)**: `#1e293b` with a 1px solid border of `#334155`.
- **Level 2 (Modals/Popovers)**: `#1e293b` with a primary-tinted glow (10% opacity primary color).
- **Separators**: Use subtle 1px lines (`#334155`) to define zones instead of whitespace alone, reinforcing the structured, "tooled" look.

## Shapes
The design system utilizes **Soft** geometry. Small corner radii (4px to 8px) ensure the UI feels modern and polished without losing the "industrial" edge of a developer tool. 
- **Standard Radius**: 4px for buttons, inputs, and chips.
- **Large Radius**: 8px for cards and containers.
- **Hard Edges**: Use 0px radius for the Code Editor viewport and split-pane dividers to emphasize the technical "workspace" feel.

## Components
- **Buttons**: Primary buttons are solid Electric Teal with black text. Secondary buttons are ghost-style with Electric Teal borders and monospace labels.
- **Difficulty Chips**: 
  - *Novice*: Background `#334155`, Text White.
  - *Apprentice*: Background `#1e40af`, Text White.
  - *Adept*: Background `#92400e`, Text White.
  - *Master*: Background `#991b1b`, Text White.
  - All chips use `label-mono` typography.
- **XP Bars**: 2px or 4px height. Track is `#1e293b`, Fill is `#22d3ee`. Fill should have a subtle outer glow (`0 0 8px`) of the same color.
- **Quest Cards**: Must feature a Monospace ID in the top right corner (e.g., `Q-104`). Borders should subtly brighten on hover.
- **Code Editor**: Integrated environment using the theme's colors. Syntax highlighting should prioritize Teal (`#22d3ee`) for keywords and Indigo (`#818cf8`) for functions.
- **Status Chips**: Use "dot" indicators alongside text (e.g., a green dot for "Passed") to maintain a clean, status-board look.