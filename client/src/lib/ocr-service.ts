// OCR Service with Server-Side OCR and Smart Suggestions

export interface ProductInfo {
  productName: string;
  price: number;
  confidence: number;
}

export interface ProductSuggestion {
  name: string;
  category: string;
  commonPrices: number[];
}



// Common product suggestions for better UX
const PRODUCT_SUGGESTIONS: ProductSuggestion[] = [
  {
    name: "Coca Cola Original",
    category: "Beverages",
    commonPrices: [1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 3.00, 3.50, 4.00, 5.00, 6.00, 7.00, 8.00, 9.00, 10.00, 11.25]
  },
  {
    name: "Coca Cola Zero",
    category: "Beverages", 
    commonPrices: [1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 3.00, 3.50, 4.00, 5.00, 6.00, 7.00, 8.00, 9.00, 10.00, 11.25]
  },
  {
    name: "Pepsi Cola",
    category: "Beverages",
    commonPrices: [1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 3.00, 3.50, 4.00, 5.00, 6.00, 7.00, 8.00, 9.00, 10.00, 11.25]
  },
  {
    name: "Sprite",
    category: "Beverages",
    commonPrices: [1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 3.00, 3.50, 4.00, 5.00, 6.00, 7.00, 8.00, 9.00, 10.00, 11.25]
  },
  {
    name: "Fanta",
    category: "Beverages",
    commonPrices: [1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 3.00, 3.50, 4.00, 5.00, 6.00, 7.00, 8.00, 9.00, 10.00, 11.25]
  },
  {
    name: "Milk",
    category: "Dairy",
    commonPrices: [1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 3.25, 3.50, 3.75, 4.00, 4.25, 4.50, 4.75, 5.00]
  },
  {
    name: "Bread",
    category: "Bakery",
    commonPrices: [1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 3.25, 3.50, 3.75, 4.00, 4.25, 4.50, 4.75, 5.00]
  },
  {
    name: "Bananas",
    category: "Fruits",
    commonPrices: [1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 3.25, 3.50, 3.75, 4.00, 4.25, 4.50, 4.75, 5.00]
  },
  {
    name: "Apples",
    category: "Fruits",
    commonPrices: [1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 3.25, 3.50, 3.75, 4.00, 4.25, 4.50, 4.75, 5.00]
  },
  {
    name: "Chicken Breast",
    category: "Meat",
    commonPrices: [5.00, 5.50, 6.00, 6.50, 7.00, 7.50, 8.00, 8.50, 9.00, 9.50, 10.00, 10.50, 11.00, 11.50, 12.00]
  },
  {
    name: "Ground Beef",
    category: "Meat",
    commonPrices: [4.00, 4.50, 5.00, 5.50, 6.00, 6.50, 7.00, 7.50, 8.00, 8.50, 9.00, 9.50, 10.00, 10.50, 11.00, 11.50, 12.00]
  },
  {
    name: "Rice",
    category: "Grains",
    commonPrices: [1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 3.25, 3.50, 3.75, 4.00, 4.25, 4.50, 4.75, 5.00]
  },
  {
    name: "Pasta",
    category: "Grains",
    commonPrices: [0.75, 1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 3.25, 3.50, 3.75, 4.00, 4.25, 4.50, 4.75, 5.00]
  },
  {
    name: "Tomatoes",
    category: "Vegetables",
    commonPrices: [1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 3.25, 3.50, 3.75, 4.00, 4.25, 4.50, 4.75, 5.00]
  },
  {
    name: "Onions",
    category: "Vegetables",
    commonPrices: [0.75, 1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 3.25, 3.50, 3.75, 4.00, 4.25, 4.50, 4.75, 5.00]
  }
];

// Get product suggestions based on partial input
export const getProductSuggestions = (input: string): ProductSuggestion[] => {
  if (!input.trim()) return PRODUCT_SUGGESTIONS.slice(0, 5); // Return top 5 if no input
  
  const lowerInput = input.toLowerCase();
  return PRODUCT_SUGGESTIONS
    .filter(product => 
      product.name.toLowerCase().includes(lowerInput) ||
      product.category.toLowerCase().includes(lowerInput)
    )
    .slice(0, 8); // Limit to 8 suggestions
};

// Get price suggestions for a product
export const getPriceSuggestions = (productName: string): number[] => {
  const product = PRODUCT_SUGGESTIONS.find(p => 
    p.name.toLowerCase() === productName.toLowerCase()
  );
  
  if (product) {
    return product.commonPrices;
  }
  
  // Return common price ranges if no specific product found
  return [1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 3.25, 3.50, 3.75, 4.00, 4.25, 4.50, 4.75, 5.00, 5.25, 5.50, 5.75, 6.00, 6.25, 6.50, 6.75, 7.00, 7.25, 7.50, 7.75, 8.00, 8.25, 8.50, 8.75, 9.00, 9.25, 9.50, 9.75, 10.00, 11.25];
};

// Enhanced parsing with multiple strategies
const parseProductInfo = (text: string): { productName: string; price: number } => {
  console.log("=== Starting OCR Text Parsing ===");
  console.log("Original text:", text);
  
  const cleanedText = preprocessText(text);
  console.log("Cleaned text:", cleanedText);
  
  const lines = cleanedText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log("Lines after splitting:", lines);
  
  let productName = "";
  let price = 0;
  
  // Enhanced price detection patterns
  const pricePatterns = [
    /ONLY\s*€\s*(\d+[.,]\d{2})/g,
    /€\s*(\d+[.,]\d{2})/g,
    /(\d+[.,]\d{2})\s*€/g,
    /ONLY\s*(\d+[.,]\d{2})/g,
    /(\d+[.,]\d{2})/g,
    /€\s*(\d+)\s*(\d{2})/g  // Handle cases like "€ 11 25"
  ];
  
  let allPriceMatches: Array<{price: number, line: string, index: number, pattern: string}> = [];
  
  // Collect all price matches
  lines.forEach((line, index) => {
    pricePatterns.forEach((pattern, patternIndex) => {
      const matches = Array.from(line.matchAll(pattern));
      matches.forEach(match => {
        let priceStr;
        if (patternIndex === 5) {
          // Handle "€ 11 25" format
          priceStr = `${match[1]}.${match[2]}`;
        } else {
          priceStr = match[1].replace(',', '.');
        }
        const priceValue = parseFloat(priceStr);
        
        if (priceValue > 0.01 && priceValue < 1000) {
          allPriceMatches.push({
            price: priceValue,
            line: line,
            index: index,
            pattern: patternIndex === 0 ? 'ONLY_EURO' : 
                    patternIndex === 1 ? 'EURO' : 
                    patternIndex === 2 ? 'REVERSE' :
                    patternIndex === 3 ? 'ONLY' : 
                    patternIndex === 4 ? 'GENERAL' : 'SPACED_EURO'
          });
        }
      });
    });
  });
  
  console.log("All price matches found:", allPriceMatches);
  
  // Smart price selection
  if (allPriceMatches.length > 0) {
    // First, try to find a price that's directly associated with "ONLY"
    const onlyPrice = allPriceMatches.find(match => 
      match.pattern === 'ONLY_EURO' || match.pattern === 'ONLY'
    );
    
    if (onlyPrice) {
      price = onlyPrice.price;
      console.log("Selected ONLY price:", onlyPrice);
    } else {
      // Look for the first price after "ONLY" in the text
      const onlyIndex = lines.findIndex(line => /^only$/i.test(line));
      if (onlyIndex !== -1) {
        // Find the first price after the "ONLY" line
        const priceAfterOnly = allPriceMatches
          .filter(match => match.index > onlyIndex)
          .sort((a, b) => a.index - b.index)[0];
        
        if (priceAfterOnly) {
          price = priceAfterOnly.price;
          console.log("Selected first price after ONLY:", priceAfterOnly);
        } else {
          // Fallback to the first price in the text
          const firstPrice = allPriceMatches.sort((a, b) => a.index - b.index)[0];
          price = firstPrice.price;
          console.log("Selected first price in text:", firstPrice);
        }
      } else {
        // No "ONLY" found, use the first price
        const firstPrice = allPriceMatches.sort((a, b) => a.index - b.index)[0];
        price = firstPrice.price;
        console.log("Selected first price:", firstPrice);
      }
    }
  } else {
    console.log("No price matches found");
  }
  
  // Enhanced product name detection
  const productCandidates: Array<{name: string, score: number, line: string, index: number}> = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (pricePatterns.some(pattern => pattern.test(line)) || 
        /^\d+[xX]\d+/.test(line) || 
        /^\d+ml$/.test(line) ||
        /^only$/i.test(line) ||
        /^save$/i.test(line) ||
        /^deposit$/i.test(line) ||
        /^total price$/i.test(line) ||
        /^per litre$/i.test(line) ||
        /^€\d+[.,]\d+ per litre$/i.test(line) ||
        /^\d+[.,]\d+$/.test(line) ||
        /^€\d+[.,]\d+$/.test(line) ||
        /^\d+$/.test(line) ||
        line.length < 3 ||
        line.length > 50) {
      continue;
    }
    
    let score = 0;
    
    // Product indicators
    if (line.toLowerCase().includes('cola')) score += 15;
    if (line.toLowerCase().includes('coca')) score += 15;
    if (line.toLowerCase().includes('original')) score += 8;
    if (line.toLowerCase().includes('coke')) score += 10;
    if (line.toLowerCase().includes('coca cola')) score += 20;
    if (line.toLowerCase().includes('pepsi')) score += 15;
    if (line.toLowerCase().includes('sprite')) score += 15;
    if (line.toLowerCase().includes('fanta')) score += 15;
    
    // Text characteristics
    const words = line.split(' ').filter(word => word.length > 0);
    if (words.length >= 2 && words.length <= 4) score += 5;
    
    const hasLetters = /[a-zA-Z]/.test(line);
    const notAllCaps = line !== line.toUpperCase();
    const notAllNumbers = !/^\d+$/.test(line);
    
    if (hasLetters && notAllCaps && notAllNumbers) score += 3;
    if (/[a-z]/.test(line) && /[A-Z]/.test(line)) score += 2;
    if (/^[A-Z][a-z]+/.test(line)) score += 1;
    
    if (line === line.toUpperCase() && line.length > 5) score -= 3;
    if ((line.match(/\d/g) || []).length > 2) score -= 5;
    if (i < 3) score += 2;
    
    if (score > 0) {
      productCandidates.push({ name: line, score, line: line, index: i });
    }
  }
  
  console.log("Product candidates found:", productCandidates);
  
  productCandidates.sort((a, b) => b.score - a.score);
  
  if (productCandidates.length > 0) {
    productName = productCandidates[0].name;
    console.log("Selected product name:", productCandidates[0]);
  } else {
    console.log("No product candidates found, trying fallback...");
    for (const line of lines) {
      if (line.length > 3 && line.length < 30 && 
          /[a-zA-Z]/.test(line) && 
          !/^\d+/.test(line) && 
          !pricePatterns.some(pattern => pattern.test(line))) {
        productName = line;
        console.log("Fallback product name:", line);
        break;
      }
    }
    
    if (!productName) {
      productName = "Product";
      console.log("Using default product name");
    }
  }
  
  console.log("=== Final Result ===");
  console.log("Product Name:", productName);
  console.log("Price:", price);
  console.log("===================");
  
  return { productName, price };
};

// Text preprocessing
const preprocessText = (text: string): string => {
  return text
    .replace(/€\s*([0-9]+)[.,]\s*([0-9]{2})/g, '€$1.$2')
    .replace(/ONLY\s*€/g, 'ONLY €')
    .trim();
};

// Process image using server-side OCR
export const processImageForManualEntry = async (imageData: string): Promise<ProductInfo> => {
  try {
    console.log("Processing image with server-side OCR...");
    
    // Call server-side OCR endpoint
    const response = await fetch('/api/ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageData })
    });
    
    if (!response.ok) {
      throw new Error(`OCR request failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log("Server OCR result:", result);
    
    if (result.success && result.text) {
      console.log("Extracted text from server:", result.text);
      
      // Parse the extracted text
      const parsed = parseProductInfo(result.text);
      
      return {
        productName: parsed.productName,
        price: parsed.price,
        confidence: result.confidence || 0.5
      };
    } else {
      console.log("No text extracted from image");
      return {
        productName: "",
        price: 0,
        confidence: 0.1
      };
    }
    
  } catch (error) {
    console.error("Server OCR error:", error);
    console.log("Falling back to manual entry due to OCR failure");
    return {
      productName: "",
      price: 0,
      confidence: 0.1
    };
  }
}; 