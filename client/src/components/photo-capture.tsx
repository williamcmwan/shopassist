import { useState, useRef, useCallback } from "react";
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
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" } // Use back camera on mobile
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCapturing(true);
    } catch (error) {
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to capture photos.",
        variant: "destructive"
      });
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
    
    let productName = "";
    let price = 0;
    
    // Look for price patterns (€XX.XX or €XX,XX)
    const pricePattern = /€\s*(\d+[.,]\d{2})/g;
    const priceMatches = Array.from(text.matchAll(pricePattern));
    
    if (priceMatches.length > 0) {
      // Take the first price match (usually the current price)
      const priceStr = priceMatches[0][1].replace(',', '.');
      price = parseFloat(priceStr);
    }
    
    // Look for product name patterns
    // Common patterns: "Product Name" followed by quantity or price
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip lines that are clearly prices or quantities
      if (pricePattern.test(line) || /^\d+[xX]\d+/.test(line) || /^\d+ml$/.test(line)) {
        continue;
      }
      
      // Look for lines that might be product names
      if (line.length > 3 && line.length < 50 && !/^\d+/.test(line)) {
        // Check if this line contains common product indicators
        if (line.toLowerCase().includes('cola') || 
            line.toLowerCase().includes('coca') ||
            line.toLowerCase().includes('original')) {
          productName = line;
          break;
        }
        
        // If no specific product found, take the first reasonable line
        if (!productName && line.length > 3) {
          productName = line;
        }
      }
    }
    
    // If no product name found, use a default
    if (!productName) {
      productName = "Product";
    }
    
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
                  disabled={isProcessing}
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
                  className="w-full rounded-lg"
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