import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Upload, X, RotateCcw, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { processImageForManualEntry, getProductSuggestions, getPriceSuggestions } from "@/lib/ocr-service";

interface PhotoCaptureProps {
  onExtractData: (productName: string, price: number) => void;
  onClose: () => void;
}

export function PhotoCapture({ onExtractData, onClose }: PhotoCaptureProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [editedData, setEditedData] = useState({ productName: "", price: 0 });
  const [productSuggestions, setProductSuggestions] = useState<Array<{name: string, category: string, commonPrices: number[]}>>([]);
  const [priceSuggestions, setPriceSuggestions] = useState<number[]>([]);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [showPriceSuggestions, setShowPriceSuggestions] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Auto-click file input when dialog opens
  useEffect(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
      console.log("Processing image with OCR Space API...");
      
      // Process image with OCR Space API
      const productInfo = await processImageForManualEntry(imageData);
      console.log("Product info from OCR:", productInfo);
      
      if (productInfo.productName && productInfo.price > 0) {
        // OCR found product info
        setEditedData({ 
          productName: productInfo.productName, 
          price: productInfo.price 
        });
        
        toast({
          title: "Product information detected",
          description: `Found "${productInfo.productName}" with price €${productInfo.price.toFixed(2)} (confidence: ${Math.round(productInfo.confidence * 100)}%)`,
        });
      } else {
        // OCR didn't find useful info, show manual entry
        setEditedData({ productName: "", price: 0 });
        
        toast({
          title: "No product information detected",
          description: "Please enter product information manually or select from suggestions.",
        });
      }
      
      setShowManualEntry(true);
      
      // Load initial product suggestions
      setProductSuggestions(getProductSuggestions(""));
      
    } catch (error) {
      console.error("OCR processing error:", error);
      toast({
        title: "OCR processing failed",
        description: "Please enter product information manually.",
        variant: "destructive"
      });
      setEditedData({ productName: "", price: 0 });
      setShowManualEntry(true);
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const handleProductNameChange = (value: string) => {
    setEditedData(prev => ({ ...prev, productName: value }));
    
    // Update product suggestions
    const suggestions = getProductSuggestions(value);
    setProductSuggestions(suggestions);
    setShowProductSuggestions(suggestions.length > 0);
  };

  const handleProductSuggestionClick = (productName: string) => {
    setEditedData(prev => ({ ...prev, productName }));
    setShowProductSuggestions(false);
    
    // Update price suggestions for selected product
    const prices = getPriceSuggestions(productName);
    setPriceSuggestions(prices);
    setShowPriceSuggestions(prices.length > 0);
  };

  const handlePriceChange = (value: number) => {
    setEditedData(prev => ({ ...prev, price: value }));
    setShowPriceSuggestions(false);
  };

  const handlePriceSuggestionClick = (price: number) => {
    setEditedData(prev => ({ ...prev, price }));
    setShowPriceSuggestions(false);
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
    setIsProcessing(false);
    setShowManualEntry(false);
    setEditedData({ productName: "", price: 0 });
    setProductSuggestions([]);
    setPriceSuggestions([]);
    setShowProductSuggestions(false);
    setShowPriceSuggestions(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
          
          {capturedImage && !showManualEntry && (
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
              
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={editedData.productName}
                      onChange={(e) => handleProductNameChange(e.target.value)}
                      placeholder="Enter product name..."
                      className="pr-10"
                      onFocus={() => setShowProductSuggestions(productSuggestions.length > 0)}
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  
                  {showProductSuggestions && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {productSuggestions.map((product, index) => (
                        <button
                          key={index}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                          onClick={() => handleProductSuggestionClick(product.name)}
                        >
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (€)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editedData.price || ""}
                      onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                      placeholder="Enter price..."
                      className="pr-10"
                      onFocus={() => setShowPriceSuggestions(priceSuggestions.length > 0)}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                  </div>
                  
                  {showPriceSuggestions && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {priceSuggestions.map((price, index) => (
                        <button
                          key={index}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                          onClick={() => handlePriceSuggestionClick(price)}
                        >
                          €{price.toFixed(2)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleRetake} variant="outline" className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retake
                  </Button>
                  <Button onClick={handleSave} className="flex-1">
                    Save Product
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 