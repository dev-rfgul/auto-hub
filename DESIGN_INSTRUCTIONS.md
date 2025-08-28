📌 DESIGN-INSTRUCTION.md
🎨 Design Overview – AutoPartsHub

The design philosophy of AutoPartsHub is user-friendly, clean, and intuitive.
The system is meant for layman users who may not know much about automobiles, so the UI must emphasize:

Simplicity → Easy navigation with clear labels.

Consistency → Common layout patterns across pages.

Responsiveness → Works on desktop, tablet, and mobile.

Accessibility → Fonts, colors, and interactions accessible for all users.

We follow a Mobile-First Responsive Design with Tailwind CSS (or Bootstrap as fallback).

📐 Layout Principles

Navigation

Sticky Navbar with:

Logo (top-left).

Search bar (center).

Cart & Profile (top-right).

Collapsible menu on mobile.

Grid System

Use Tailwind’s grid/flexbox system.

Desktop → 3–4 product cards per row.

Mobile → Single column layout.

Color Palette

Primary: Blue (#1565C0) → Buttons, highlights.

Secondary: Light gray/white → Backgrounds.

Success: Green (#4CAF50) → Success states.

Error: Red (#F44336) → Error states.

Typography

Headings → Bold, modern (e.g., Inter / Roboto).

Body → Readable, medium weight.

Font sizes responsive (text-sm on mobile, text-lg on desktop).

Icons

Use Lucide Icons or FontAwesome for cart, filters, user profile, chatbot.

🖥️ Screen Designs (Pages)
🔎 Home Page

Hero Section → Search bar in center (“Search Spare Parts...”).

Quick Filters → Categories: Tyres, Batteries, Filters, Lights, etc.

Featured Products → Carousel of top-rated parts.

Chatbot Widget → Bottom-right corner (floating button).

🛒 Product Listing Page

Filters Sidebar → By brand, category, price, compatibility.

Product Grid → Cards with:

Image

Title

Price

Rating

“View Details” button.

📑 Product Details Page

Large product image.

Title, brand, price, availability.

Specifications (table format).

Dealer info (store name, rating).

“Add to Cart” button.

Reviews & ratings section.

🛒 Cart & Checkout

Cart shows list of products, quantities, total price.

Checkout flow:

Shipping details

Payment method

Order confirmation

🏪 Dealer Dashboard

Store status (Pending / Verified / Active).

Upload new products form.

Manage inventory (edit/update parts).

View orders from users.

🔑 Admin Dashboard

Verify dealer requests.

Approve/reject uploaded parts.

Manage users & feedback.

System analytics (orders, reviews, dealer performance).

🤖 Chatbot UI

Floating button → Opens chat window.

Simple chat-like interface.

Bot responses include:

Possible issues

Recommended parts

Budget-friendly options

🎨 Component Design
🧩 Core Components

Navbar → Logo, Search, Cart, Profile, Chatbot icon.

SearchBar → With autocomplete.

FilterPanel → Checkboxes, sliders for price range.

ProductCard → Image, title, price, rating, dealer info.

ComparisonTable → Two+ parts compared side by side.

ChatbotWidget → Floating assistant.

CartDrawer → Slide-in cart with items + checkout button.

🧾 Form Components

Login/Register Form

Dealer Registration Form

Product Upload Form (Dealer)

Feedback Form (User)

📱 Responsiveness Guidelines

Mobile-first: Single column, collapsible menus.

Tablet: 2-column layouts, reduced spacing.

Desktop: Full-width layout with multiple grids.

Use Tailwind breakpoints:

sm: → Mobile

md: → Tablets

lg: → Desktop

xl: → Large screens

🔒 UX Best Practices

Clear CTAs: “Add to Cart”, “Buy Now”, “Chat with AI Assistant”.

Error handling: Red text for validation issues.

Loading states: Skeleton loaders while fetching products.

Empty states: Show messages like “No results found.”

Confirmation modals: Before purchases/updates.

📊 Example Wireframe (ASCII Representation)
+---------------------------------------------------------+
| Logo | [ Search Bar              ] | Cart | Profile | 🤖|
+---------------------------------------------------------+
| Categories: Tyres | Batteries | Filters | Lights       |
+---------------------------------------------------------+
| [Product Card] [Product Card] [Product Card] [Product] |
| [Image]        [Image]        [Image]        [Image]   |
| Title | Price  Title | Price  Title | Price  Title     |
+---------------------------------------------------------+
| Footer with Links                                       |
+---------------------------------------------------------+

🧪 Design Testing

Run usability tests with sample users.

Test across different screen sizes.

Check color contrast for accessibility (WCAG AA standard).

Ensure chatbot is non-intrusive but accessible.

📈 Future Design Enhancements

Dark mode toggle.

Multi-language support in UI.

Personalized recommendations on home page.

Animated transitions for smoother UX.