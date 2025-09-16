# Cashier System Design Guidelines

## Design Approach: Utility-Focused Design System
**Selected Approach**: Fluent Design System adaptation
**Justification**: This is a productivity-focused POS system requiring efficiency, clarity, and ease of use in high-pressure retail environments.

## Core Design Elements

### A. Color Palette
**Light Mode Primary**: 142 71% 45% (professional green to match business logo)
**Dark Mode Primary**: 142 71% 55% (lighter green for contrast)
**Success**: 142 71% 45% (transaction completion)
**Warning**: 38 92% 50% (alerts, low inventory)
**Error**: 0 84% 60% (validation errors)
**Neutral Grays**: 220 14% 96% to 220 13% 9% (backgrounds, borders)

### B. Typography
**Primary**: Inter (via Google Fonts CDN)
**Display**: Poppins for headers (via Google Fonts CDN)
**Sizes**: Large UI text (text-lg to text-2xl) for cashier readability
**Weights**: Regular (400), Medium (500), Semibold (600)

### C. Layout System
**Spacing Units**: Tailwind 4, 6, 8, 12 units primarily
**Grid**: Two-panel layout - product selection (left) and transaction summary (right)
**Touch Targets**: Minimum 44px height for all interactive elements

### D. Component Library

**Navigation**: Top bar with business name, current user, and settings access

**Product Grid**: 
- Large product cards (minimum 120px × 80px)
- Clear product names and prices per unit
- Visual weight indicators
- Quick-add buttons

**Scale Integration Panel**:
- Large weight display (text-4xl or larger)
- Connect/disconnect status indicator
- Manual weight override input
- Tare/zero scale controls

**Transaction Cart**:
- Line items with product, weight, unit price, subtotal
- Running total prominently displayed
- Remove/edit line item controls
- Clear cart functionality

**Payment Interface**:
- Large numeric keypad for amount entry
- Total amount display
- Payment received input
- Change calculation display
- Process transaction button

**Product Management Modal**:
- Add/edit product forms
- Price per unit inputs
- Product category organization
- Bulk import/export options

**Transaction Log**:
- Searchable transaction history
- Date range filtering
- Export functionality
- Receipt reprinting

### E. Responsive Considerations
**Primary Target**: Desktop/tablet use (1024px+)
**Secondary**: Large tablets (768px+)
**Mobile**: Basic functionality only for emergency use

### F. Accessibility Features
- High contrast ratios (4.5:1 minimum)
- Large touch targets for easy interaction
- Clear focus indicators
- Screen reader friendly labels
- Keyboard navigation support

## Key UX Principles

**Speed First**: Minimize clicks between product selection and transaction completion
**Error Prevention**: Clear visual feedback for all actions, confirmation dialogs for destructive actions
**Cashier Efficiency**: Large buttons, clear hierarchy, minimal scrolling required
**Customer Visibility**: Transaction totals clearly visible to both cashier and customer

## Critical Interactions

**Weight Scale Flow**: Connect → Tare → Select Product → Capture Weight → Add to Cart
**Transaction Flow**: Build cart → Enter payment → Calculate change → Complete transaction
**Product Management**: Quick access to add new products during busy periods

This design prioritizes operational efficiency and clarity, essential for a fast-paced retail environment while maintaining professional appearance and reliability.