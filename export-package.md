# Shopping List Application - Complete Export Package

## Essential Files for Deployment

### Root Directory Files
- `package.json` - Dependencies and scripts
- `package-lock.json` - Locked dependency versions
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Build configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `components.json` - shadcn/ui component configuration
- `drizzle.config.ts` - Database configuration
- `DEPLOYMENT_GUIDE.md` - Deployment instructions

### Client Directory (Frontend)
```
client/
├── index.html
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── components/
    │   ├── group-container.tsx
    │   ├── quantity-input.tsx
    │   ├── shopping-item.tsx
    │   └── ui/ (47 shadcn/ui components)
    ├── hooks/
    │   ├── use-local-storage.ts
    │   ├── use-mobile.tsx
    │   └── use-toast.ts
    ├── lib/
    │   ├── bin-packing.ts
    │   ├── queryClient.ts
    │   ├── storage.ts
    │   └── utils.ts
    └── pages/
        ├── create-list.tsx
        ├── main.tsx
        ├── not-found.tsx
        └── shopping-list.tsx
```

### Server Directory (Backend)
```
server/
├── index.ts
├── routes.ts
├── storage.ts
└── vite.ts
```

### Shared Directory
```
shared/
└── schema.ts
```

## Key Features Implemented

### ✅ Core Functionality
- Create and manage shopping lists
- Add/edit/remove items with prices and quantities
- Smart bin-packing algorithm for optimal grouping
- Drag and drop items between groups
- Local storage persistence

### ✅ Mobile-First Design
- Touch-friendly quantity controls with +/- buttons
- Responsive layout optimized for mobile devices
- Large touch targets (44px minimum)
- Smooth drag and drop interactions

### ✅ Advanced Features
- Item splitting across multiple groups
- Visual indicators for split items (e.g., "2/3")
- Target amount customization (default €25)
- Real-time total calculations
- Currency formatting in euros (€)

## Dependencies Summary

### Production Dependencies (77 packages)
Key dependencies include:
- React 18.3.1 & React DOM
- Express 4.21.2 with session management
- TypeScript 5.6.3
- Vite 5.4.19 for build tooling
- TanStack Query for state management
- shadcn/ui component library
- Tailwind CSS for styling
- Drizzle ORM for database
- Zod for validation

### Development Dependencies (20 packages)
- Vite plugins and TypeScript types
- Build tools (esbuild, autoprefixer)
- Database toolkit (drizzle-kit)

## Deployment Instructions

### 1. Copy All Files
Copy the entire project structure to your server, excluding:
- `node_modules/` (will be installed)
- `.cache/` (Replit specific)
- `.local/` (Replit specific)
- `.upm/` (Replit specific)

### 2. Install Dependencies
```bash
npm install
```

### 3. Build for Production
```bash
npm run build
```

### 4. Start Application
```bash
npm start
```

### 5. Environment Configuration
Create `.env` file:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://... (optional)
```

## File Modifications for Your Server

### Remove Replit-Specific Code
In `vite.config.ts`, you may want to remove Replit plugins:
```typescript
// Remove these lines for non-Replit deployment
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
// And the cartographer plugin import/usage
```

### Simplified vite.config.ts for your server:
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
});
```

## Testing Your Deployment

1. Create a shopping list
2. Add items with different prices and quantities
3. Split the list into groups (test bin-packing)
4. Drag items between groups
5. Edit item prices/quantities
6. Verify data persists in browser storage

## Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

The application is production-ready and includes all the features you requested with mobile-first design, intelligent grouping, and persistent storage.