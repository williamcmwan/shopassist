import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Upload, X, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Tesseract from "tesseract.js";

interface PhotoCaptureProps {
  onExtractData: (productName: string, price: number) => void;
  onClose: () => void;
}

export function PhotoCapture({ onExtractData, onClose }: PhotoCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<{
    productName: string;
    price: number;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ productName: "", price: 0 });
  const [cameraSupported, setCameraSupported] = useState<boolean | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  // Check camera support on mount
  useEffect(() => {
    const checkCameraSupport = async () => {
      try {
        const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        setCameraSupported(hasGetUserMedia);
      } catch (error) {
        console.error("Camera support check failed:", error);
        setCameraSupported(false);
      }
    };
    
    checkCameraSupport();
  }, []);

  const startCamera = useCallback(async () => {
    try {
      // iOS Safari requires more specific constraints
      const constraints = {
        video: {
          facingMode: "environment", // Use back camera
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          aspectRatio: { ideal: 4/3 }
        },
        audio: false
      };

      // Try to get camera access
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          setIsCapturing(true);
        };
      }
    } catch (error) {
      console.error("Camera error:", error);
      
      // Try fallback constraints for iOS
      try {
        const fallbackConstraints = {
          video: {
            facingMode: "environment"
          },
          audio: false
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setIsCapturing(true);
          };
        }
      } catch (fallbackError) {
        console.error("Fallback camera error:", fallbackError);
        toast({
          title: "Camera access denied",
          description: "Please allow camera access in your browser settings and try again.",
          variant: "destructive"
        });
      }
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageData);
        stopCamera();
        processImage(imageData);
      }
    }
  }, [stopCamera]);

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
      const result = await Tesseract.recognize(imageData, "eng", {
        logger: m => console.log(m)
      });
      
      const text = result.data.text;
      console.log("OCR Result:", text);
      console.log("OCR Raw Text:", JSON.stringify(text, null, 2));
      
      // Extract product name and price from OCR text
      const extracted = extractProductInfo(text);
      setExtractedData(extracted);
      setEditedData(extracted);
      setIsEditing(true);
      
      toast({
        title: "Text extracted successfully",
        description: "Please review and edit the extracted information.",
      });
    } catch (error) {
      console.error("OCR Error:", error);
      toast({
        title: "OCR failed",
        description: "Could not extract text from the image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const extractProductInfo = (text: string): { productName: string; price: number } => {
    // Split text into lines and clean up
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    console.log("OCR Lines:", lines); // Debug log
    
    let productName = "";
    let price = 0;
    
    // Look for price patterns - multiple patterns to catch different formats
    const pricePatterns = [
      /€\s*(\d+[.,]\d{2})/g,  // €XX.XX or €XX,XX
      /ONLY\s*€\s*(\d+[.,]\d{2})/g,  // ONLY €XX.XX
      /€\s*(\d+[.,]\d{2})/g   // General €XX.XX
    ];
    
    let allPriceMatches: Array<{price: number, line: string, index: number}> = [];
    
    // Collect all price matches with their context
    lines.forEach((line, index) => {
      pricePatterns.forEach(pattern => {
        const matches = Array.from(line.matchAll(pattern));
        matches.forEach(match => {
          const priceStr = match[1].replace(',', '.');
          const priceValue = parseFloat(priceStr);
          allPriceMatches.push({
            price: priceValue,
            line: line,
            index: index
          });
        });
      });
    });
    
    console.log("All price matches:", allPriceMatches); // Debug log
    
    // Prioritize "ONLY" prices as they're usually the current price
    const onlyPrice = allPriceMatches.find(match => match.line.toLowerCase().includes('only'));
    if (onlyPrice) {
      price = onlyPrice.price;
    } else if (allPriceMatches.length > 0) {
      // Take the first price if no "ONLY" found
      price = allPriceMatches[0].price;
    }
    
    // Look for product name - improved logic
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip lines that are clearly prices, quantities, or other non-product text
      if (pricePatterns.some(pattern => pattern.test(line)) || 
          /^\d+[xX]\d+/.test(line) || 
          /^\d+ml$/.test(line) ||
          /^only$/i.test(line) ||
          /^save$/i.test(line) ||
          /^deposit$/i.test(line) ||
          /^total price$/i.test(line) ||
          /^per litre$/i.test(line) ||
          /^€\d+[.,]\d+ per litre$/i.test(line)) {
        continue;
      }
      
      // Look for lines that might be product names
      if (line.length > 3 && line.length < 50 && !/^\d+/.test(line)) {
        // Check for specific product indicators
        if (line.toLowerCase().includes('cola') || 
            line.toLowerCase().includes('coca') ||
            line.toLowerCase().includes('original')) {
          productName = line;
          break;
        }
        
        // Look for lines that contain multiple words (likely product names)
        const words = line.split(' ').filter(word => word.length > 0);
        if (words.length >= 2 && words.length <= 4) {
          // Check if this looks like a product name (not all caps, not all numbers)
          const hasLetters = /[a-zA-Z]/.test(line);
          const notAllCaps = line !== line.toUpperCase();
          const notAllNumbers = !/^\d+$/.test(line);
          
          if (hasLetters && notAllCaps && notAllNumbers) {
            productName = line;
            break;
          }
        }
        
        // Fallback: take the first reasonable line that's not a price
        if (!productName && line.length > 3 && !pricePatterns.some(pattern => pattern.test(line))) {
          productName = line;
        }
      }
    }
    
    // If no product name found, use a default
    if (!productName) {
      productName = "Product";
    }
    
    console.log("Extracted:", { productName, price }); // Debug log
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
          {!capturedImage && !isCapturing && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Take a photo of a price tag to automatically extract product information
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={startCamera}
                  className="flex-1"
                  disabled={isProcessing || cameraSupported === false}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              
              <div className="text-xs text-gray-500 text-center">
                <p>💡 Tip: If camera doesn't work, try uploading a photo instead</p>
                <p>Make sure to allow camera access when prompted</p>
                {cameraSupported === false && (
                  <p className="text-red-500 mt-2">⚠️ Camera not supported in this browser</p>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}
          
          {isCapturing && (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-lg"
                  style={{ 
                    transform: 'scaleX(-1)', // Mirror the video for better UX
                    maxHeight: '400px',
                    objectFit: 'cover'
                  }}
                />
                <div className="absolute inset-0 border-2 border-blue-500 border-dashed rounded-lg pointer-events-none" />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={capturePhoto} className="flex-1">
                  Capture
                </Button>
                <Button variant="outline" onClick={stopCamera}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {capturedImage && !isEditing && (
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
              
              <Button onClick={handleRetake} variant="outline" className="w-full">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Photo
              </Button>
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
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
} 