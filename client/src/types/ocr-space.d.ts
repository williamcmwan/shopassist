declare module 'ocr-space-api' {
  interface OCRSpaceOptions {
    apikey?: string;
    language?: string;
    isOverlayRequired?: boolean;
    filetype?: string;
    detectOrientation?: boolean;
    scale?: boolean;
    OCREngine?: number;
  }

  interface OCRSpaceResult {
    ParsedResults: Array<{
      TextOverlay: {
        Lines: Array<{
          Words: Array<{
            WordText: string;
            Left: number;
            Top: number;
            Height: number;
            Width: number;
          }>;
        }>;
      };
      TextOrientation: string;
      FileParseExitCode: number;
      ParsedText: string;
      ErrorMessage: string;
      ErrorDetails: string;
    }>;
    OCRExitCode: number;
    IsErroredOnProcessing: boolean;
    ProcessingTimeInMilliseconds: string;
    SearchablePDFURL: string;
    ErrorMessage?: string;
  }

  function OCRSpace(
    imageUrl: string,
    options?: OCRSpaceOptions
  ): Promise<OCRSpaceResult>;

  export = OCRSpace;
} 