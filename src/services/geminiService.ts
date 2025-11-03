const GEMINI_API_KEY = 'AIzaSyBDsIGkwRTV6566oB73S6Yd0niR_YQbows';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

export interface GenerateTextOptions {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GenerateImageOptions {
  prompt: string;
  negativePrompt?: string;
  numberOfImages?: number;
}

export interface AnalyzeImageOptions {
  imageUrl: string;
  prompt: string;
}

class GeminiService {
  async generateText(options: GenerateTextOptions): Promise<string> {
    const { prompt, systemPrompt, temperature = 0.7, maxTokens = 2048 } = options;
    
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'user', parts: [{ text: systemPrompt }] });
      messages.push({ role: 'model', parts: [{ text: 'Understood. I will follow these instructions.' }] });
    }
    messages.push({ role: 'user', parts: [{ text: prompt }] });

    const response = await fetch(
      `${BASE_URL}/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: messages,
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch(
      `${BASE_URL}/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
          content: { parts: [{ text }] },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini Embedding API error: ${error}`);
    }

    const data = await response.json();
    return data.embedding.values;
  }

  async analyzeImage(options: AnalyzeImageOptions): Promise<any> {
    const { imageUrl, prompt } = options;

    // Convert image to base64 if it's a data URL
    let imageData = imageUrl;
    if (imageUrl.startsWith('data:')) {
      imageData = imageUrl.split(',')[1];
    } else {
      // Fetch external image and convert to base64
      const imgResponse = await fetch(imageUrl);
      const blob = await imgResponse.blob();
      imageData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(blob);
      });
    }

    const response = await fetch(
      `${BASE_URL}/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: imageData,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini Vision API error: ${error}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    // Try to parse as JSON if possible
    try {
      return JSON.parse(text);
    } catch {
      return { analysis: text };
    }
  }

  async generateImage(options: GenerateImageOptions): Promise<{ images: Array<{ url: string }> }> {
    const { prompt, negativePrompt, numberOfImages = 1 } = options;

    const response = await fetch(
      `${BASE_URL}/models/imagen-3.0-generate-001:predict?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [
            {
              prompt,
              negativePrompt: negativePrompt || '',
              numberOfImages,
            },
          ],
          parameters: {
            sampleCount: numberOfImages,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini Imagen API error: ${error}`);
    }

    const data = await response.json();
    
    // Convert predictions to base64 data URLs
    return {
      images: data.predictions.map((pred: any) => ({
        url: `data:image/png;base64,${pred.bytesBase64Encoded}`,
      })),
    };
  }
}

export const geminiService = new GeminiService();
