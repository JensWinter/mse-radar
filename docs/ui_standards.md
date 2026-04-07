# UI Standards & Component Guidelines

> **Living Document** - This document defines the UI standards for MSE Radar to ensure consistency across all pages.
>
> Last Updated: 2026-03-04

## Overview

This document outlines the standardized patterns, components, and styling guidelines for MSE Radar. All pages should follow these standards to maintain visual and code consistency.

---

## Component Library

### Reusable Components

All reusable UI components are located in:
- **UI Components**: `astro/src/components/ui/`

### Icons (Iconify)

Icons are provided via the third-party Iconify Tailwind plugin with Lucide icons.

**Configuration:**
- Tailwind plugin: `@iconify/tailwind4`
- Icon set: `@iconify-json/lucide`
- Prefix: `lucide--`
- Project config: `astro/src/styles/global.css`

**Usage Pattern:**
```astro
<a href="/" class="btn btn-ghost btn-sm gap-2">
  <span class="iconify lucide--arrow-left h-4 w-4"></span>
  Back to Home
</a>
```

### Alert Component

The Alert component provides consistent styling for success, error, warning, and info messages.

**Props:**
- `type`: `'error' | 'success' | 'warning' | 'info'` (required)
- `class`: Additional CSS classes (optional)
- `messageClass`: CSS classes for the message span (optional)

**Built-in Icon Mapping:**
- `error` -> `lucide--circle-alert`
- `success` -> `lucide--circle-check`
- `warning` -> `lucide--triangle-alert`
- `info` -> `lucide--info`

**Usage Example:**
```astro
import Alert from '@components/ui/Alert.astro';

<!-- Error alert -->
<Alert type="error" class="mb-4" messageClass="error-message">
  {errorMessage}
</Alert>

<!-- Success alert -->
<Alert type="success">
  Operation completed successfully!
</Alert>
```

### EmptyState Component

The EmptyState component provides consistent empty state displays across the application.

**Props:**
- `icon`: `'team' | 'survey' | 'document'` (required)
- `title`: Main heading text (required)
- `message`: Optional description text
- `class`: Additional CSS classes (optional)

**Usage Example:**
```astro
import EmptyState from '@components/ui/EmptyState.astro';

<EmptyState
  icon="team"
  title="No teams yet"
  message="Create your first team to get started"
/>

<!-- With custom action button -->
<EmptyState icon="survey" title="No surveys available">
  <a href="/create" class="btn btn-primary mt-4">
    Create Survey
  </a>
</EmptyState>
```

---

## Layout Standards

### Container Width Strategy

Use consistent max-width values based on page complexity:

| Page Type | Max Width | Use Case | Examples |
|-----------|-----------|----------|----------|
| **Simple Auth** | `max-w-md` | Login, registration forms | `/login`, `/register` |
| **Form Pages** | `max-w-2xl` | Create/edit forms | `/teams/new`, `/teams/[id]/edit` |
| **Content Pages** | `max-w-4xl` | Dashboard, details, lists | `/`, `/teams/[id]`, `/account` |

**Standard Page Structure:**
```astro
<BaseLayout title="Page Title">
  <div class="flex-1 bg-base-200 py-8">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- Page content -->
      </div>
    </div>
  </div>
</BaseLayout>
```

---

## Typography Standards

### Heading Hierarchy

| Element | Classes | Use Case |
|---------|---------|----------|
| **Page Title** | `text-3xl font-bold` | Main page heading (H1) |
| **Card Title (Large)** | `card-title text-2xl` | Important section headers |
| **Card Title (Medium)** | `card-title text-xl` | Standard section headers |
| **Subsection** | `text-lg font-semibold` | Subsection headers |

**Example:**
```astro
<h1 class="text-3xl font-bold">Page Title</h1>

<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title text-xl">Section Title</h2>
    <p class="text-base-content/70">Description text</p>
  </div>
</div>
```

### Text Opacity Hierarchy

Use consistent opacity values for text hierarchy:

| Opacity | Classes | Use Case |
|---------|---------|----------|
| **Primary** | `text-base-content` (100%) | Main content, headings |
| **Secondary** | `text-base-content/70` | Descriptions, help text |
| **Tertiary** | `text-base-content/50` | Placeholders, disabled states, icons |

**Before (Inconsistent):**
```astro
<p class="text-base-content/80">Some text</p>
<p class="text-base-content/60">Other text</p>
<span class="text-base-content/50">Icon label</span>
```

**After (Consistent):**
```astro
<p class="text-base-content/70">Some text</p>
<p class="text-base-content/70">Other text</p>
<span class="text-base-content/50">Icon label</span>
```

---

## Icon Sizing Standards

Use consistent icon sizes based on context:

| Size | Classes | Use Case | Examples |
|------|---------|----------|----------|
| **Extra Small** | `h-4 w-4` | Button icons, navigation | Back arrows, action icons |
| **Small** | `h-5 w-5` | Medium contexts | List item icons |
| **Medium** | `h-6 w-6` | Alerts, notifications | Alert icons |
| **Large** | `h-8 w-8` | Stats, prominent features | Stat icons |
| **Extra Large** | `h-12 w-12` | Empty states, placeholders | Empty state icons |
| **Hero** | `h-16 w-16` | Special states | Feature highlights, splash icons |

**Usage Example:**
```astro
<!-- Button icon -->
<button class="btn btn-sm gap-2">
  <span class="iconify lucide--plus h-4 w-4"></span>
  Add Item
</button>

<!-- Alert icon (default sizing) -->
<Alert type="success">Success message</Alert>

<!-- Empty state icon (default sizing) -->
<EmptyState icon="team" title="No teams" />
```

---

## DaisyUI Component Usage

### Cards

**Standard Pattern:**
```astro
<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title text-xl">Card Title</h2>
    <p class="text-base-content/70">Card description</p>
    <div class="card-actions justify-end gap-2">
      <button class="btn btn-ghost">Cancel</button>
      <button class="btn btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

### Buttons

**Button Hierarchy:**
- `btn-primary` - Primary actions (submit, create, save)
- `btn-secondary` - Secondary actions
- `btn-ghost` - Tertiary actions (cancel, back)
- `btn-error` - Destructive actions (delete, remove)

**Button Sizing:**
- `btn-lg` - Large, prominent actions
- `btn` (default) - Standard actions
- `btn-sm` - Compact contexts
- `btn-xs` - Inline actions

**Standard Button Groups:**
```astro
<div class="card-actions justify-end gap-2 pt-4">
  <a href="/cancel" class="btn btn-ghost">Cancel</a>
  <button type="submit" class="btn btn-primary">Save</button>
</div>
```

### Forms

**Standard Form Control:**
```astro
<div class="form-control w-full">
  <label class="label" for="fieldId">
    <span class="label-text font-medium">Field Label</span>
  </label>
  <input
    type="text"
    id="fieldId"
    name="fieldName"
    class="input input-bordered w-full"
    placeholder="Enter value"
  />
  <label class="label">
    <span class="label-text-alt">Optional help text</span>
  </label>
</div>
```

**Form Spacing:**
- Use `space-y-4` for form field spacing
- Use `pt-4` for button group separation

### Badges

**Status Badges:**
```astro
<!-- Success -->
<span class="badge badge-success">Active</span>

<!-- Warning -->
<span class="badge badge-warning">Pending</span>

<!-- Error -->
<span class="badge badge-error">Failed</span>

<!-- Neutral -->
<span class="badge badge-neutral">Closed</span>

<!-- Ghost (subtle) -->
<span class="badge badge-ghost">Member</span>

<!-- Primary (emphasis) -->
<span class="badge badge-primary">Team Lead</span>
```

---

## Spacing Standards

### Card Spacing

- Card body padding: Handled by `card-body` (default DaisyUI)
- Space between elements: `space-y-6` for major sections, `space-y-4` for form fields
- Margin between cards: `space-y-6` in container

### Button Groups

Always use consistent gap spacing:
```astro
<!-- Preferred pattern -->
<div class="card-actions justify-end gap-2">
  <button class="btn btn-ghost">Cancel</button>
  <button class="btn btn-primary">Confirm</button>
</div>

<!-- Alternative for inline buttons -->
<div class="flex gap-2">
  <button class="btn">Action 1</button>
  <button class="btn">Action 2</button>
</div>
```

---

## Responsive Design

### Grid Layouts

Use consistent responsive grid patterns:

**Two-column responsive:**
```astro
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  <!-- Items -->
</div>
```

**Three-column responsive:**
```astro
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Items -->
</div>
```

### Stats Component

Always use responsive stats:
```astro
<div class="stats stats-vertical md:stats-horizontal shadow w-full">
  <div class="stat">
    <div class="stat-title">Title</div>
    <div class="stat-value">Value</div>
    <div class="stat-desc">Description</div>
  </div>
</div>
```

---

## Color Scheme

### Base Colors

Use DaisyUI semantic colors:
- `bg-base-100` - Card backgrounds, primary surfaces
- `bg-base-200` - Page backgrounds, subtle backgrounds
- `bg-base-300` - Borders, dividers

### Semantic Colors

- `text-primary` - Primary brand color
- `text-secondary` - Secondary brand color
- `text-accent` - Accent highlights
- `text-error` - Error states
- `text-success` - Success states
- `text-warning` - Warning states
- `text-info` - Informational states

---

## Best Practices

### DO ✅

1. **Use reusable components** for alerts and empty states, and Iconify classes for icons
2. **Follow container width standards** for page types
3. **Use consistent text opacity** for hierarchy (100%, 70%, 50%)
4. **Use semantic DaisyUI classes** (`btn-primary`, `alert-error`, etc.)
5. **Preserve test selectors** (`data-testid`, required CSS classes)
6. **Use `gap-2`** for button groups and inline elements
7. **Use `space-y-6`** for major sections, `space-y-4` for forms

### DON'T ❌

1. **Don't create local icon components** - use Iconify (`iconify lucide--...`) instead
2. **Don't create custom alerts** - use the Alert component
3. **Don't use arbitrary opacity values** - stick to 50%, 70%, 100%
4. **Don't mix spacing patterns** - be consistent with `gap` vs `space-y`
5. **Don't create new icon sizes** - use standard sizes
6. **Don't skip responsive classes** - use `md:` and `lg:` breakpoints
7. **Don't use `text-base-content/80` or `/60`** - use 70% or 50%

---

## Migration Checklist

When creating or updating a page:

- [ ] Use Iconify classes (`iconify lucide--...`) for icons
- [ ] Use Alert component for all success/error/warning/info messages
- [ ] Use EmptyState component for empty state displays
- [ ] Follow container width standards (`max-w-md`, `max-w-2xl`, or `max-w-4xl`)
- [ ] Use consistent text opacity (100%, 70%, 50%)
- [ ] Use consistent icon sizing (h-4, h-6, h-12, h-16)
- [ ] Use `gap-2` for button groups
- [ ] Use `space-y-6` for major sections
- [ ] Preserve all test selectors (data-testid, CSS classes, ARIA roles)
- [ ] Test responsive design at mobile, tablet, and desktop sizes

---

## Examples

### Complete Page Example

```astro
---
import BaseLayout from '@layouts/BaseLayout.astro';
import Alert from '@components/ui/Alert.astro';
import EmptyState from '@components/ui/EmptyState.astro';
---

<BaseLayout title="Example Page">
  <div class="flex-1 bg-base-200 py-8">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- Page header -->
        <div class="flex items-center justify-between">
          <h1 class="text-3xl font-bold">Page Title</h1>
          <a href="/back" class="btn btn-ghost btn-sm gap-2">
            <span class="iconify lucide--arrow-left h-4 w-4"></span>
            Back
          </a>
        </div>

        <!-- Alert example -->
        {error && (
          <Alert type="error" class="mb-4">
            {error.message}
          </Alert>
        )}

        <!-- Content card -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title text-xl">Section Title</h2>
            <p class="text-base-content/70">
              Description text with proper opacity
            </p>

            <!-- Empty state -->
            {items.length === 0 ? (
              <EmptyState
                icon="document"
                title="No items found"
                message="Get started by adding your first item"
              >
                <a href="/create" class="btn btn-primary gap-2 mt-4">
                  <span class="iconify lucide--plus h-4 w-4"></span>
                  Add Item
                </a>
              </EmptyState>
            ) : (
              <!-- Item list -->
              <div class="space-y-2">
                {items.map(item => (
                  <div class="p-4 bg-base-200 rounded-lg">
                    <h3 class="font-medium">{item.name}</h3>
                    <p class="text-sm text-base-content/70">{item.description}</p>
                  </div>
                ))}
              </div>
            )}

            <!-- Card actions -->
            <div class="card-actions justify-end gap-2 pt-4 border-t border-base-300">
              <a href="/cancel" class="btn btn-ghost">Cancel</a>
              <button type="submit" class="btn btn-primary">Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</BaseLayout>
```

---

## Component File Paths Reference

### Icon Configuration
```
astro/src/styles/global.css
astro/package.json
```

### UI Components
```
astro/src/components/ui/
├── Alert.astro
└── EmptyState.astro
```

---

## Further Reading

- [DaisyUI Documentation](https://daisyui.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Astro Component Documentation](https://docs.astro.build/en/core-concepts/astro-components/)

---

## Changelog

| Date | Changes |
|------|---------|
| 2026-03-04 | Replaced icon component documentation with Iconify/Lucide usage and updated Alert/EmptyState references |
| 2026-01-22 | Initial UI standards documentation created after component extraction and refactoring |
