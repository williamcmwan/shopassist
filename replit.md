# Shopping List Application

## Overview

This is a React-based shopping list application built with TypeScript that helps users create, manage, and organize their shopping lists with smart grouping capabilities. The app features a mobile-first design using shadcn/ui components and includes a bin-packing algorithm for intelligently distributing items across groups based on target amounts.

## User Preferences

Preferred communication style: Simple, everyday language.
Currency preference: Euro (€) instead of USD ($)

## Recent Changes (January 2025)

✓ Changed currency from USD ($) to Euro (€) across all components
✓ Added item editing functionality - users can now update price and quantity of existing items
✓ Enhanced bin-packing algorithm to split items with multiple quantities across different groups
✓ Improved drag and drop functionality with proper total recalculation
✓ Added visual indicators for split items showing quantity distribution (e.g., "2/3")
✓ Fixed unassigned items logic to properly handle split items with new ID patterns
✓ Created mobile-friendly quantity input component with +/- buttons for easier touch interaction
✓ Improved form layouts with larger touch targets and better spacing for mobile devices
✓ Enhanced add item form with stacked layout and clearer quantity controls
✓ Fixed drag and drop functionality between groups with proper event handling and total recalculation
✓ Updated default split amount from €50 to €25 for more practical group sizes
✓ Resolved quantity input visibility issues on desktop browsers by hiding browser spinners

## System Architecture

The application follows a full-stack architecture with a clear separation between client and server components:

- **Frontend**: React with TypeScript, using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: Configured for PostgreSQL with Drizzle ORM (currently using in-memory storage)
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state, local storage for persistence

## Key Components

### Frontend Architecture
- **Component Structure**: Organized into pages, components, and UI components
- **Routing**: Uses Wouter for client-side routing
- **State Management**: React hooks with TanStack Query for data fetching
- **UI Components**: Complete shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with dark mode support and CSS custom properties

### Backend Architecture
- **Server Framework**: Express.js with TypeScript
- **API Structure**: RESTful routes with `/api` prefix
- **Storage Interface**: Abstract storage interface with in-memory implementation
- **Development Setup**: Vite integration for development with HMR support

### Data Models
The application uses Zod schemas for type validation:
- **ShoppingItem**: Individual items with name, price, quantity, and total
- **ShoppingGroup**: Collections of items with target amounts for smart grouping
- **ShoppingList**: Main container with items, groups, and metadata

### Smart Grouping Algorithm
- **Bin Packing**: First Fit Decreasing algorithm for optimal item distribution
- **Target-Based**: Groups items based on configurable target amounts
- **Flexible**: Allows 20% overflow for better item placement

## Data Flow

1. **List Creation**: Users create shopping lists with names and dates
2. **Item Management**: Add/remove items with price and quantity tracking
3. **Smart Grouping**: Algorithm distributes items across groups based on target amounts
4. **Local Persistence**: All data stored in browser localStorage
5. **Real-time Updates**: Automatic total calculations and group rebalancing

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: React 18 with TypeScript support
- **UI Components**: Extensive shadcn/ui component library with Radix UI
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with class variance authority

### Backend Dependencies
- **Server**: Express.js with TypeScript
- **Database**: Drizzle ORM configured for PostgreSQL
- **Development**: tsx for TypeScript execution, esbuild for production builds
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

### Development Tools
- **Build System**: Vite with React plugin and Replit integrations
- **Type Checking**: TypeScript with strict configuration
- **Code Quality**: ESBuild for fast bundling

## Deployment Strategy

### Development
- **Local Development**: `npm run dev` starts both client and server with HMR
- **Database**: Uses in-memory storage for development, PostgreSQL for production
- **Asset Handling**: Vite handles client assets with path resolution

### Production
- **Build Process**: 
  1. Vite builds the client to `dist/public`
  2. ESBuild bundles the server to `dist/index.js`
- **Server**: Express serves static files and API routes
- **Database**: PostgreSQL with Drizzle migrations
- **Environment**: Configurable via DATABASE_URL environment variable

### File Structure
- `client/`: React frontend application
- `server/`: Express backend with API routes
- `shared/`: Common schemas and types shared between client and server
- `migrations/`: Database migration files generated by Drizzle

The application is designed to be easily deployable on platforms like Replit with minimal configuration, while maintaining the flexibility to scale to more complex deployment scenarios.