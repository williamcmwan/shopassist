import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ocrSpace } from 'ocr-space-api-wrapper';

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // OCR endpoint
  app.post('/api/ocr', async (req, res) => {
    try {
      const { imageData } = req.body;
      
      if (!imageData) {
        return res.status(400).json({ error: 'Image data is required' });
      }

      console.log('Processing OCR request...');
      console.log('Image data length:', imageData.length);
      console.log('Image data starts with:', imageData.substring(0, 50));
      
      // Use OCR Space API - send the full data URL
      const API_KEY = 'K81634588988957'; // Demo key - replace with your actual API key
      
      console.log('Calling OCR Space API...');
      const result = await ocrSpace(imageData, {
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
