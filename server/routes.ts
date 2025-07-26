import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ocrSpace } from 'ocr-space-api-wrapper';
import sharp from 'sharp';

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Function to resize image to stay within 1MB limit
  const resizeImageForOCR = async (base64Data: string): Promise<string> => {
    try {
      // Remove data URL prefix if present
      let imageBuffer: Buffer;
      if (base64Data.includes(',')) {
        const base64Image = base64Data.split(',')[1];
        imageBuffer = Buffer.from(base64Image, 'base64');
      } else {
        imageBuffer = Buffer.from(base64Data, 'base64');
      }

      // Get original image info
      const originalInfo = await sharp(imageBuffer).metadata();
      console.log('Original image size:', originalInfo.width, 'x', originalInfo.height);

      // Start with original size and progressively resize if needed
      let resizedBuffer = imageBuffer;
      let quality = 90;
      let width = originalInfo.width;
      let height = originalInfo.height;

      // Try to get under 1MB while maintaining quality
      while (resizedBuffer.length > 900000 && quality > 30) { // 900KB limit to be safe
        console.log(`Resizing image: ${width}x${height}, quality: ${quality}, size: ${resizedBuffer.length} bytes`);
        
        // Reduce dimensions by 20% each iteration
        width = Math.floor(width * 0.8);
        height = Math.floor(height * 0.8);
        
        // Ensure minimum size for OCR readability
        if (width < 800 || height < 600) {
          // If dimensions are too small, reduce quality instead
          quality -= 10;
          width = Math.max(800, originalInfo.width || 800);
          height = Math.max(600, originalInfo.height || 600);
        }

        resizedBuffer = await sharp(imageBuffer)
          .resize(width, height, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .jpeg({ 
            quality: quality,
            progressive: true,
            mozjpeg: true
          })
          .toBuffer();

        console.log(`Resized to: ${width}x${height}, quality: ${quality}, new size: ${resizedBuffer.length} bytes`);
      }

      // Convert back to base64
      const resizedBase64 = resizedBuffer.toString('base64');
      const dataUrl = `data:image/jpeg;base64,${resizedBase64}`;
      
      console.log(`Final image size: ${resizedBuffer.length} bytes (${(resizedBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
      
      return dataUrl;
    } catch (error) {
      console.error('Error resizing image:', error);
      // Return original if resizing fails
      return base64Data;
    }
  };

  // OCR endpoint
  app.post('/api/ocr', async (req, res) => {
    try {
      const { imageData } = req.body;
      
      if (!imageData) {
        return res.status(400).json({ error: 'Image data is required' });
      }

      console.log('Processing OCR request...');
      console.log('Original image data length:', imageData.length);
      console.log('Image data starts with:', imageData.substring(0, 50));
      
      // Resize image to stay within 1MB limit
      console.log('Resizing image for OCR...');
      const resizedImageData = await resizeImageForOCR(imageData);
      console.log('Resized image data length:', resizedImageData.length);
      
      // Use OCR Space API - send the resized data URL
      const API_KEY = 'K81634588988957'; // Demo key - replace with your actual API key
      
      console.log('Calling OCR Space API with resized image...');
      const result = await ocrSpace(resizedImageData, {
        apiKey: API_KEY,
        language: 'eng',
        isOverlayRequired: false,
        filetype: 'jpg',
        detectOrientation: true,
        scale: true,
        OCREngine: "2"
      });

      console.log('OCR result:', JSON.stringify(result, null, 2));

      if (result && result.ParsedResults && result.ParsedResults.length > 0) {
        const extractedText = result.ParsedResults[0].ParsedText;
        const confidence = result.ParsedResults[0].TextOverlay?.Lines?.[0]?.Words?.[0]?.Confidence || 0.5;
        
        res.json({
          success: true,
          text: extractedText,
          confidence: confidence,
          rawResult: result
        });
      } else {
        res.json({
          success: false,
          text: '',
          confidence: 0,
          error: 'No text extracted'
        });
      }
      
    } catch (error) {
      console.error('OCR processing error:', error);
      res.status(500).json({
        success: false,
        error: 'OCR processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
