import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Upload, X, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PhotoCaptureProps {
  onExtractData: (productName: string, price: number) => void;
  onClose: () => void;
}

export function PhotoCapture({ onExtractData, onClose }: PhotoCaptureProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<{
    productName: string;
    price: number;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ productName: "", price: 0 });
  const [showManualEntry, setShowManualEntry] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Auto-click the upload button when dialog opens
  useEffect(() => {
    // Auto-click the upload button after a short delay
    const timer = setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, 500); // 500ms delay to ensure the dialog is fully rendered
    
    return () => clearTimeout(timer);
  }, []);





  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setCapturedImage(imageData);
        processImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const processImage = useCallback(async (imageData: string) => {
    setIsProcessing(true);
    try {
      // For now, we'll skip OCR and go directly to manual entry
      // This provides a better user experience while we work on OCR
      console.log("Image captured, showing manual entry");
      
      // Set default values for manual entry
      setEditedData({ productName: "", price: 0 });
      setShowManualEntry(true);
      
      toast({
        title: "Image captured",
        description: "Please enter the product details manually.",
      });
    } catch (error) {
      console.error("Image processing error:", error);
      toast({
        title: "Image processing failed",
        description: "Please try again or enter details manually.",
        variant: "destructive"
      });
      setShowManualEntry(true);
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const preprocessText = (text: string): string => {
    // Clean up common OCR errors
    let cleaned = text
      // Fix common OCR misreadings
      .replace(/[|]/g, 'I') // Fix vertical bars as I
      .replace(/[0O]/g, 'O') // Fix 0 as O in certain contexts
      .replace(/[1l]/g, 'l') // Fix 1 as l in certain contexts
      .replace(/[5S]/g, 'S') // Fix 5 as S in certain contexts
      .replace(/[8B]/g, 'B') // Fix 8 as B in certain contexts
      // Fix price-related OCR errors
      .replace(/€\s*([0-9]+)[.,]\s*([0-9]{2})/g, '€$1.$2') // Fix price format
      .replace(/ONLY\s*€/g, 'ONLY €') // Fix ONLY price format
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      .trim();
    
    return cleaned;
  };

  const extractProductInfo = (text: string): { productName: string; price: number } => {
    // Split text into lines and clean up
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    console.log("OCR Lines:", lines); // Debug log
    console.log("Full text:", text); // Debug full text
    
    let productName = "";
    let price = 0;
    
    // More comprehensive price detection patterns
    const pricePatterns = [
      /ONLY\s*€\s*(\d+[.,]\d{2})/g,  // ONLY €XX.XX (highest priority)
      /€\s*(\d+[.,]\d{2})/g,         // €XX.XX or €XX,XX
      /(\d+[.,]\d{2})\s*€/g,         // XX.XX€ (reverse format)
      /ONLY\s*(\d+[.,]\d{2})/g,      // ONLY XX.XX (without € symbol)
      /(\d+[.,]\d{2})/g              // Any XX.XX format as fallback
    ];
    
    let allPriceMatches: Array<{price: number, line: string, index: number, pattern: string}> = [];
    
    // Collect all price matches with their context
    lines.forEach((line, index) => {
      pricePatterns.forEach((pattern, patternIndex) => {
        const matches = Array.from(line.matchAll(pattern));
        matches.forEach(match => {
          const priceStr = match[1].replace(',', '.');
          const priceValue = parseFloat(priceStr);
          
          // Only add reasonable prices (between 0.01 and 1000)
          if (priceValue > 0.01 && priceValue < 1000) {
            allPriceMatches.push({
              price: priceValue,
              line: line,
              index: index,
              pattern: patternIndex === 0 ? 'ONLY_EURO' : 
                      patternIndex === 1 ? 'EURO' : 
                      patternIndex === 2 ? 'REVERSE' :
                      patternIndex === 3 ? 'ONLY' : 'GENERAL'
            });
          }
        });
      });
    });
    
    console.log("All price matches:", allPriceMatches); // Debug log
    
    // Smart price selection with better logic
    if (allPriceMatches.length > 0) {
      // Prioritize "ONLY" prices as they're usually the current price
      const onlyPrice = allPriceMatches.find(match => 
        match.pattern === 'ONLY_EURO' || match.pattern === 'ONLY'
      );
      
      if (onlyPrice) {
        price = onlyPrice.price;
        console.log("Selected ONLY price:", onlyPrice);
      } else {
        // Look for the most likely current price (usually the largest reasonable price)
        const sortedPrices = allPriceMatches
          .filter(match => match.price > 1) // Filter out very small prices
          .sort((a, b) => b.price - a.price);
        
        if (sortedPrices.length > 0) {
          price = sortedPrices[0].price;
          console.log("Selected highest price:", sortedPrices[0]);
        } else {
          price = allPriceMatches[0].price;
          console.log("Selected first price:", allPriceMatches[0]);
        }
      }
    }
    
    // Enhanced product name detection with better logic
    const productCandidates: Array<{name: string, score: number, line: string, index: number}> = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip lines that are clearly not product names
      if (pricePatterns.some(pattern => pattern.test(line)) || 
          /^\d+[xX]\d+/.test(line) || 
          /^\d+ml$/.test(line) ||
          /^only$/i.test(line) ||
          /^save$/i.test(line) ||
          /^deposit$/i.test(line) ||
          /^total price$/i.test(line) ||
          /^per litre$/i.test(line) ||
          /^€\d+[.,]\d+ per litre$/i.test(line) ||
          /^\d+[.,]\d+$/.test(line) || // Just numbers
          /^€\d+[.,]\d+$/.test(line) || // Just prices
          /^\d+$/.test(line) || // Just digits
          line.length < 3 || // Too short
          line.length > 50) { // Too long
        continue;
      }
      
      // Score potential product names
      let score = 0;
      
      // Specific product indicators (high score)
      if (line.toLowerCase().includes('cola')) score += 15;
      if (line.toLowerCase().includes('coca')) score += 15;
      if (line.toLowerCase().includes('original')) score += 8;
      if (line.toLowerCase().includes('coke')) score += 10;
      
      // Good product name characteristics
      const words = line.split(' ').filter(word => word.length > 0);
      if (words.length >= 2 && words.length <= 4) score += 5;
      
      // Has letters but not all caps
      const hasLetters = /[a-zA-Z]/.test(line);
      const notAllCaps = line !== line.toUpperCase();
      const notAllNumbers = !/^\d+$/.test(line);
      
      if (hasLetters && notAllCaps && notAllNumbers) score += 3;
      
      // Bonus for mixed case (like "Coca Cola")
      if (/[a-z]/.test(line) && /[A-Z]/.test(line)) score += 2;
      
      // Bonus for proper capitalization patterns
      if (/^[A-Z][a-z]+/.test(line)) score += 1; // Starts with capital
      
      // Penalty for all caps
      if (line === line.toUpperCase() && line.length > 5) score -= 3;
      
      // Penalty for lines with too many numbers
      if ((line.match(/\d/g) || []).length > 2) score -= 5;
      
      // Bonus for being in the first few lines (product names are usually at the top)
      if (i < 3) score += 2;
      
      if (score > 0) {
        productCandidates.push({ name: line, score, line: line, index: i });
      }
    }
    
    // Sort candidates by score and select the best one
    productCandidates.sort((a, b) => b.score - a.score);
    console.log("Product candidates:", productCandidates);
    
    if (productCandidates.length > 0) {
      productName = productCandidates[0].name;
    } else {
      // Fallback: look for any reasonable text that might be a product name
      for (const line of lines) {
        if (line.length > 3 && line.length < 30 && 
            /[a-zA-Z]/.test(line) && 
            !/^\d+/.test(line) && 
            !pricePatterns.some(pattern => pattern.test(line))) {
          productName = line;
          break;
        }
      }
      
      if (!productName) {
        productName = "Product";
      }
    }
    
    console.log("Final extracted:", { productName, price }); // Debug log
    return { productName, price };
  };

  const handleSave = () => {
    if (editedData.productName.trim() && editedData.price > 0) {
      onExtractData(editedData.productName.trim(), editedData.price);
      onClose();
    } else {
      toast({
        title: "Invalid data",
        description: "Please enter a valid product name and price.",
        variant: "destructive"
      });
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setExtractedData(null);
    setIsEditing(false);
    setShowManualEntry(false);
    setEditedData({ productName: "", price: 0 });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Capture Price Tag</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 space-y-4">
          {!capturedImage && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Upload a photo or take a picture of a price tag
                </p>
              </div>
              
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
                disabled={isProcessing}
                size="lg"
              >
                <Camera className="h-5 w-5 mr-2" />
                Upload / Take Photo
              </Button>
              
              <div className="text-xs text-gray-500 text-center">
                <p>💡 This will open your camera or photo gallery</p>
                <p>Make sure to allow camera access when prompted</p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}
          

          
          {capturedImage && !isEditing && !showManualEntry && (
            <div className="space-y-4">
              <div className="text-center">
                <img 
                  src={capturedImage} 
                  alt="Captured price tag" 
                  className="max-w-full rounded-lg"
                />
              </div>
              
              {isProcessing && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-gray-600">Processing image...</p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={handleRetake} variant="outline" className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake Photo
                </Button>
                <Button 
                  onClick={() => setShowManualEntry(true)} 
                  variant="outline" 
                  className="flex-1"
                >
                  Manual Entry
                </Button>
              </div>
            </div>
          )}
          
          {showManualEntry && (
            <div className="space-y-4">
              <div className="text-center">
                <img 
                  src={capturedImage!} 
                  alt="Captured price tag" 
                  className="max-w-full rounded-lg mb-4"
                />
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <Input
                    value={editedData.productName}
                    onChange={(e) => setEditedData(prev => ({ ...prev, productName: e.target.value }))}
                    placeholder="e.g., Coca Cola Original"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (€)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editedData.price}
                    onChange={(e) => setEditedData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">
                  Add to List
                </Button>
                <Button onClick={handleRetake} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake
                </Button>
              </div>
            </div>
          )}
          
          {isEditing && extractedData && (
            <div className="space-y-4">
              <div className="text-center">
                <img 
                  src={capturedImage!} 
                  alt="Captured price tag" 
                  className="max-w-full rounded-lg mb-4"
                />
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <Input
                    value={editedData.productName}
                    onChange={(e) => setEditedData(prev => ({ ...prev, productName: e.target.value }))}
                    placeholder="Product name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (€)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editedData.price}
                    onChange={(e) => setEditedData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">
                  Add to List
                </Button>
                <Button onClick={handleRetake} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 