# ShopAssist v2.3.0 🛒

A modern shopping assistant application with OCR price tag scanning capabilities.

## ✨ Features

- **📸 OCR Price Tag Scanning** - Take photos of price tags and automatically extract product information
- **📝 Shopping List Management** - Create and manage multiple shopping lists
- **🎯 Product Suggestions** - Smart suggestions for product names and prices
- **📱 Mobile-First Design** - Optimized for mobile devices
- **⚡ Fast & Lightweight** - Clean, optimized codebase with minimal dependencies
- **🖼️ Image Processing** - Automatic image resizing for optimal OCR performance

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd shopassist

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Deployment
```bash
# Run the deployment script
./deploy.sh

# The script will:
# 1. Clean up dependencies
# 2. Build the client
# 3. Create a deployment package
# 4. Generate start scripts
```

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: Wouter (lightweight router)
- **State Management**: React Query for server state
- **UI Components**: Custom components built with Radix UI primitives

### Backend (Express + TypeScript)
- **Framework**: Express.js with TypeScript
- **OCR Service**: OCR Space API integration
- **Image Processing**: Sharp library for image optimization
- **Validation**: Zod schemas

### Key Components
```
client/src/
├── components/
│   ├── photo-capture.tsx    # OCR photo capture interface
│   ├── shopping-item.tsx    # Individual shopping item
│   ├── group-container.tsx  # Shopping list container
│   ├── quantity-input.tsx   # Quantity input component
│   └── ui/                  # Minimal UI components
│       ├── button.tsx       # Button component
│       ├── input.tsx        # Input component
│       ├── card.tsx         # Card component
│       ├── label.tsx        # Label component
│       ├── alert-dialog.tsx # Alert dialog
│       ├── toaster.tsx      # Toast notifications
│       └── tooltip.tsx      # Tooltip component
├── lib/
│   ├── ocr-service.ts       # OCR text processing logic
│   ├── storage.ts           # Local storage utilities
│   └── utils.ts             # Utility functions
└── pages/
    ├── main.tsx             # Home page
    ├── create-list.tsx      # Create shopping list
    └── shopping-list.tsx    # Shopping list view
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# OCR Space API Configuration
OCR_API_KEY=your_ocr_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=production
```

### OCR Space API
The application uses OCR Space API for text extraction. You'll need to:
1. Sign up at [OCR Space](https://ocr.space/ocrapi)
2. Get your API key
3. Add it to your environment variables

## 📦 Deployment

### Automated Deployment
```bash
# Run the deployment script
./deploy.sh

# This will:
# ✅ Clean up dependencies
# ✅ Remove unused components
# ✅ Build the application
# ✅ Create deployment package
# ✅ Generate start scripts
```

### Manual Deployment
```bash
# Build the client
cd client && npm run build

# Start the server
NODE_ENV=production PORT=3000 npx tsx server/index.ts
```

## 🧹 Code Cleanup (v2.3.0)

### Removed Components
- **35+ unused UI components** removed from `client/src/components/ui/`
- **Unused dependencies** cleaned up from `package.json`
- **Reduced bundle size** significantly

### Kept Components
Only essential UI components remain:
- `button.tsx` - Button component
- `input.tsx` - Input component  
- `card.tsx` - Card component
- `label.tsx` - Label component
- `alert-dialog.tsx` - Alert dialogs
- `toaster.tsx` - Toast notifications
- `toast.tsx` - Toast component
- `tooltip.tsx` - Tooltip component

### Dependencies Cleanup
**Removed:**
- All unused Radix UI components
- Unused animation libraries
- Database dependencies (not used)
- Authentication libraries (not used)
- Chart libraries (not used)
- Form libraries (not used)

**Kept:**
- Core React dependencies
- Essential Radix UI primitives
- OCR and image processing libraries
- Styling utilities

## 🎯 OCR Features

### Image Processing
- **Automatic resizing** to stay within OCR API limits
- **Quality optimization** for better text recognition
- **Format conversion** to JPEG for optimal results

### Text Parsing
- **Smart product name detection** with keyword scoring
- **Price extraction** with multiple pattern matching
- **"ONLY" price prioritization** for promotional prices
- **Multi-line text processing** for complex price tags

### Supported Price Formats
- `€ 11.25` - Standard Euro format
- `€ 11 25` - Spaced format
- `ONLY € 11.25` - Promotional format
- `11.25 €` - Reverse format

## 📱 Mobile Optimization

- **Touch-friendly interface** with large touch targets
- **Camera integration** for photo capture
- **Responsive design** for all screen sizes
- **Offline capability** with local storage

## 🔍 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Project Structure
```
shopassist/
├── client/              # React frontend
├── server/              # Express backend
├── shared/              # Shared schemas
├── deploy.sh            # Deployment script
├── package.json         # Dependencies
└── README.md           # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆕 Version History

### v2.3.0 (Current)
- 🧹 **Major code cleanup** - Removed 35+ unused UI components
- 📦 **Dependency optimization** - Removed unused packages
- 🚀 **Deployment script** - Automated deployment process
- ⚡ **Performance improvements** - Reduced bundle size
- 📚 **Documentation updates** - Comprehensive README

### v2.2.10
- 🖼️ **Image resizing** - Automatic image optimization for OCR
- 💰 **Price parsing** - Improved "ONLY" price detection
- 🔧 **Server optimization** - Increased payload limits

### v2.2.8
- 📸 **OCR integration** - OCR Space API integration
- 🎯 **Text parsing** - Smart product and price extraction
- 📱 **Mobile UI** - Touch-friendly interface

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS** 