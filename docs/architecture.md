# Ethereum Developer Toolkit Architecture

## High-Level Structure

```
/app
  /[tool]             # Dynamic routes for each tool
    /page.tsx         # Tool-specific page
  /api                # API routes
/components         # Shared components
  /ui               # shadcn/ui components
  /layout           # Layout components
  /tools            # Tool-specific components
/hooks              # Custom React hooks
/lib                # Utility functions
  /actions          # React Server Actions
  /db               # IndexedDB interactions
  /utils            # Helper functions
  /viem-utils       # Viem-specific utilities
/providers          # Context providers
/types              # TypeScript types
```

## Component Hierarchy

1. **Root Layout** (`app/layout.tsx`)

   - Theme Provider (next-themes)
   - Font Provider
   - Navigation Structure

2. **Page Layout**

   - Header
     - Logo
     - Navigation
     - Theme Toggle
   - Main Content Area
     - Tool Cards (Home Page)
     - Tool-specific UI (Tool Pages)
   - Footer
     - Links
     - Version Info

3. **Tool Cards** (on Home Page)

   - Card Container
   - Icon
   - Title
   - Description
   - Quick Access Button

4. **Tool-Specific Components**
   - Calldata Decoder
     - Input Form
     - Decoded Output
     - Save Button
   - Calldata Encoder
     - ABI Input
     - Function Selector
     - Parameter Form
     - Encoded Output
     - Save Button
   - Saved Items
     - Item List
     - Search/Filter
     - Item Actions (Edit, Delete, Copy)

## Data Flow

1. User Input → React State (jotai atoms)
2. Process Data → viem utilities
3. Display Results → React Components
4. Save Data → IndexedDB via idb library

## Theme System

- Light/Dark mode toggle using next-themes
- System preference detection
- Persistence across sessions
- Theme transition animations

## Micro-Interactions

1. Card hover effects
2. Tool transitions
3. Form validation feedback
4. Copy-to-clipboard confirmations
5. Save/Load animations
6. Theme switch transition
7. Appropriate other micro-interactions
