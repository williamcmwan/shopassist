# Shopping List Application - Deployment Guide

## Overview
This is a mobile-first supermarket shopping assistant built with React, TypeScript, and Express.js. The application features intelligent bin-packing algorithms for grouping items, drag-and-drop functionality, and local storage persistence.

## System Requirements
- Node.js 18+ (recommended: 20.x)
- npm or yarn package manager
- PostgreSQL database (optional - uses in-memory storage by default)

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Mode
```bash
npm run dev
```
This starts both the frontend (Vite) and backend (Express) servers simultaneously.

### 3. Production Build
```bash
npm run build
npm start
```

## Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── index.css      # Global styles
│   └── index.html
├── server/                # Express backend
│   ├── index.ts          # Main server file
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Storage interface
│   └── vite.ts           # Vite development integration
├── shared/               # Shared types and schemas
│   └── schema.ts
└── package.json
```

## Configuration Files

### Environment Variables
Create a `.env` file in the root directory:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://username:password@host:port/database_name
```

### For Production Deployment
The application is configured to:
- Build frontend assets to `dist/public/`
- Bundle backend to `dist/index.js`
- Serve frontend assets from Express
- Use PostgreSQL for production (in-memory for development)

## Database Setup (Optional)
The app uses local storage by default. For PostgreSQL:

1. Set `DATABASE_URL` in environment variables
2. Run database migrations:
```bash
npm run db:push
```

## Features
- ✅ Mobile-responsive design with touch-friendly controls
- ✅ Smart bin-packing algorithm for optimal item grouping
- ✅ Drag and drop functionality between groups
- ✅ Item editing (price and quantity updates)
- ✅ Local storage persistence
- ✅ Euro (€) currency formatting
- ✅ Split items across multiple groups
- ✅ Target amount customization (default: €25)

## API Endpoints
- `GET /api/lists` - Get all shopping lists
- `POST /api/lists` - Create new shopping list
- `PUT /api/lists/:id` - Update shopping list
- `DELETE /api/lists/:id` - Delete shopping list

## Deployment Options

### 1. Traditional Server
- Upload files to server
- Run `npm install` and `npm run build`
- Start with `npm start`
- Ensure port 5000 is accessible

### 2. Docker (Dockerfile example)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### 3. Cloud Platforms
The app is ready for deployment on:
- Heroku
- Vercel
- Railway
- DigitalOcean App Platform
- AWS/GCP/Azure

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Port Already in Use
If port 5000 is busy, set the PORT environment variable:
```bash
PORT=3000 npm start
```

### Build Issues
Ensure all dependencies are installed:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Database Connection
For PostgreSQL issues, verify:
- Database server is running
- CONNECTION_URL is correctly formatted
- Database exists and user has permissions

## Support
This application uses modern web technologies:
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js, TypeScript
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: TanStack Query
- **Database**: Drizzle ORM (PostgreSQL compatible)

All dependencies are listed in `package.json` and will be installed automatically.