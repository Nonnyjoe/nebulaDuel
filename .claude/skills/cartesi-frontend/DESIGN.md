---
version: alpha
name: Cartesi Rollups Frontend Standard
description: Dark-first, design system for Cartesi rollups frontends.
colors:
  primary: "#15aabf"
  on-primary: "#ffffff"
  primary-hover: "#1098ad"
  primary-soft: "#e3fafc"
  surface: "#1a1b1e"
  surface-dim: "#141517"
  surface-bright: "#25262b"
  surface-container-lowest: "#101113"
  surface-container-low: "#141517"
  surface-container: "#1a1b1e"
  surface-container-high: "#25262b"
  surface-container-highest: "#2c2e33"
  background: "#141517"
  on-background: "#c1c2c5"
  on-surface: "#c1c2c5"
  on-surface-strong: "#ffffff"
  on-surface-muted: "#909296"
  border-subtle: "#2c2e33"
  border-strong: "#373a40"
  info: "#228be6"
  success: "#40c057"
  warning: "#fab005"
  danger: "#fa5252"
  on-accent-dark: "#111111"
  status-open: "#40c057"
  status-disputed: "#fd7e14"
  status-closed: "#228be6"
  status-finalized: "#adb5bd"
  logo-cyan: "#00f7ff"
typography:
  display-lg:
    fontFamily: Open Sans, sans-serif
    fontSize: 40px
    fontWeight: "700"
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Open Sans, sans-serif
    fontSize: 32px
    fontWeight: "700"
    lineHeight: 42px
  headline-md:
    fontFamily: Open Sans, sans-serif
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 34px
  title-md:
    fontFamily: Open Sans, sans-serif
    fontSize: 18px
    fontWeight: "600"
    lineHeight: 28px
  body-lg:
    fontFamily: Open Sans, sans-serif
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 26px
  body-md:
    fontFamily: Open Sans, sans-serif
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 22px
  label-md:
    fontFamily: Open Sans, sans-serif
    fontSize: 14px
    fontWeight: "600"
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Open Sans, sans-serif
    fontSize: 12px
    fontWeight: "600"
    lineHeight: 16px
    letterSpacing: 0.02em
  mono-sm:
    fontFamily: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace
    fontSize: 12px
    fontWeight: "400"
    lineHeight: 18px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  section-gap: 24px
  card-gap: 16px
  container-padding: 16px
  shell-padding: 16px
  navbar-width: 180px
  header-height: 60px
rounded:
  xs: 2px
  sm: 4px
  md: 8px
  lg: 16px
  xl: 32px
  full: 9999px
radii:
  interactive-sm: "{rounded.sm}"
  interactive-md: "{rounded.md}"
  card: "{rounded.md}"
  panel: "{rounded.lg}"
  pill: "{rounded.full}"
shadows:
  xs: 0 1px 3px rgba(0, 0, 0, 0.18)
  sm: 0 2px 6px rgba(0, 0, 0, 0.22)
  md: 0 6px 16px rgba(0, 0, 0, 0.28)
  lg: 0 10px 28px rgba(0, 0, 0, 0.34)
  xl: 0 16px 40px rgba(0, 0, 0, 0.4)
elevation:
  level-0:
    backgroundColor: "{colors.surface}"
    shadow: none
  level-1:
    backgroundColor: "{colors.surface-container-high}"
    shadow: "{shadows.xs}"
  level-2:
    backgroundColor: "{colors.surface-container-high}"
    shadow: "{shadows.sm}"
  level-3:
    backgroundColor: "{colors.surface-container-highest}"
    shadow: "{shadows.md}"
  modal-overlay:
    backdropColor: rgba(0, 0, 0, 0.55)
    backdropBlur: 3px
motion:
  duration-fast: 120ms
  duration-base: 180ms
  duration-slow: 260ms
  easing-standard: cubic-bezier(0.2, 0, 0, 1)
  easing-emphasized: cubic-bezier(0.2, 0.8, 0.2, 1)
components:
  app-shell:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-background}"
    height: "{spacing.header-height}"
    padding: "{spacing.shell-padding}"
  navbar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    width: "{spacing.navbar-width}"
    padding: "{spacing.container-padding}"
  card-default:
    backgroundColor: "{colors.surface-container-high}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  card-elevated:
    backgroundColor: "{colors.surface-container-highest}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-accent-dark}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    height: 36px
    padding: 0 14px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-accent-dark}"
  button-subtle:
    backgroundColor: transparent
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    height: 36px
    padding: 0 12px
  input-field:
    backgroundColor: "{colors.surface-container-low}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    height: 36px
    padding: 0 12px
  badge-status-open:
    backgroundColor: "{colors.status-open}"
    textColor: "{colors.on-accent-dark}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 2px 8px
  badge-status-warning:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.on-accent-dark}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 2px 8px
  badge-status-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.on-accent-dark}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 2px 8px
  table-sticky-cell:
    backgroundColor: "{colors.surface-container-high}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xs}"
---

## Overview

This design system is built for rollups inspection workflows where dense technical information must remain legible and scannable for long sessions. The visual identity is dark-first, pragmatic, and precise: neutral charcoal surfaces carry the UI, while cyan is reserved for action and wayfinding.

The tone should feel operational rather than ornamental. Components are compact, spacing is disciplined, and hierarchy is expressed through contrast and weight more than decorative effects.

## Colors

The palette is anchored in layered dark neutrals and a bright cyan interaction accent.

- **Core surfaces:** Use `surface`, `surface-container-*`, and `background` to establish depth without large hue shifts.
- **Interaction accent:** Use `primary` for active controls, key links, and focused states.
- **Semantic feedback:** Use `success`, `warning`, and `danger` for transactional outcomes and validation states.
- **Rollups status colors:** Use `status-open`, `status-disputed`, `status-closed`, and `status-finalized` consistently for epoch/game lifecycle labeling.
- **Text contrast:** Use `on-surface-strong` for high-priority labels and numbers, `on-surface` for default body copy, and `on-surface-muted` for metadata.

## Typography

Typography uses Open Sans throughout for consistent readability in dashboards and forms.

- **Headings:** Semi-bold to bold weights define structure and improve scan speed in data-heavy views.
- **Body text:** Keep body copy at 14-16px with relaxed line height for readability on dense tables and cards.
- **Labels and controls:** Use compact, semi-bold label styles for buttons, badges, and filter controls.
- **Monospace utility:** Use `mono-sm` for hashes, identifiers, and protocol-level values where character disambiguation matters.

## Layout & Spacing

Layout follows a compact 4px unit with 8px and 16px rhythms dominating component composition.

- **Shell pattern:** Fixed-height header with left navigation and padded content region.
- **Density target:** Prefer medium-density cards and tables that maximize visible blockchain data without visual crowding.
- **Responsive behavior:** Keep structure intact on small screens by collapsing navigation and preserving key actions in reachable zones.
- **Consistency rule:** Reuse the same spacing steps across forms, tables, and cards to avoid fragmented visual rhythm.

## Elevation & Depth

Depth is subtle and functional. Surfaces are primarily separated by tonal layering, with restrained shadows for emphasis.

- **Default cards:** Use level-1 or level-2 elevation for standard information grouping.
- **Feature focus:** Use level-3 or `shadows.md`+ for modal and high-priority overlays.
- **Overlays:** Modal backdrops should use dimming and blur to reduce context-switch friction while preserving orientation.
- **Sticky table columns:** Use strong directional shadow (`shadows.xl`) to clearly separate fixed and scrollable regions.

## Shapes

Shapes are mildly rounded and utilitarian.

- **Primary radius profile:** Small to medium radii for controls and inputs.
- **Panel/cards:** Larger radius reserved for prominent grouped containers.
- **Pills:** Fully rounded chips and badges for statuses and compact metadata.
- **Hard edges:** Use near-square corners only when needed for strict tabular alignment.

## Components

### App Shell

The shell should prioritize navigation clarity and transaction initiation. Header actions remain compact, with cyan reserved for active/primary interactions.

### Cards and Panels

Cards are the main composition primitive for pages, summaries, and forms. Keep internal spacing regular and avoid decorative gradients. Border and tone contrast should do most of the separation work.

### Forms and Inputs

Inputs are compact, high-contrast, and optimized for repetitive entry of addresses, ABI parameters, and numeric values. Validation messaging should be immediate and semantically colored.

### Tables and Data Views

Data tables should remain readable under horizontal overflow, with sticky regions using stronger elevation cues. Dense metadata should rely on text hierarchy and muted color tokens rather than extra ornamentation.

### Status and Feedback

Use explicit badge colors for protocol state and transaction outcomes. Favor simple, high-contrast badges with concise labels over rich illustrated indicators.
