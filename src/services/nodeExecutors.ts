import { geminiService } from './geminiService';

export interface NodeExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Helper to get inputs from connected nodes
function getInputValue(inputs: Record<string, any>, key: string): any {
  return inputs[key];
}

export async function executeTextInput(nodeData: any): Promise<NodeExecutionResult> {
  return {
    success: true,
    data: {
      text: nodeData.text || '',
    },
  };
}

export async function executeSmartSearch(
  nodeData: any,
  inputs: Record<string, any>
): Promise<NodeExecutionResult> {
  try {
    const query = nodeData.query || getInputValue(inputs, 'text') || '';
    const threshold = nodeData.threshold || 0.8;
    const maxResults = nodeData.maxResults || 10;

    if (!query) {
      throw new Error('No query provided for search');
    }

    // Generate embedding for the query
    const embedding = await geminiService.generateEmbedding(query);

    // Simulate search results (in a real app, you'd query a vector database)
    const mockResults = [
      { text: 'AI trends in 2024: Focus on generative models', score: 0.95, source: 'Research Paper' },
      { text: 'Latest developments in image generation', score: 0.89, source: 'Tech Blog' },
      { text: 'Understanding transformer architectures', score: 0.82, source: 'Tutorial' },
    ].filter(r => r.score >= threshold).slice(0, maxResults);

    return {
      success: true,
      data: {
        query,
        results: mockResults,
        embedding,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
    };
  }
}

export async function executeHookGenerator(
  nodeData: any,
  inputs: Record<string, any>
): Promise<NodeExecutionResult> {
  try {
    const inputText = nodeData.inputText || getInputValue(inputs, 'text') || '';
    const frameworks = nodeData.frameworks || ['AIDA', 'PAS'];
    const count = nodeData.count || 5;

    if (!inputText) {
      throw new Error('No input text provided');
    }

    const frameworkDescriptions = {
      AIDA: 'Attention, Interest, Desire, Action',
      PAS: 'Problem, Agitate, Solution',
      Curiosity: 'Create curiosity gap',
      'Problem-Solution': 'State problem and offer solution',
    };

    const selectedFrameworks = frameworks.map((f: string) => `${f} (${frameworkDescriptions[f as keyof typeof frameworkDescriptions]})`).join(', ');

    const prompt = `Generate ${count} attention-grabbing hooks for the following content. Use these frameworks: ${selectedFrameworks}

Content: ${inputText}

Generate ${count} unique, compelling hooks that would work on social media. Format as a JSON array of objects with "hook" and "framework" properties.`;

    const response = await geminiService.generateText({ prompt });

    // Parse the response
    let hooks;
    try {
      hooks = JSON.parse(response);
    } catch {
      // Fallback: split by lines
      hooks = response.split('\n').filter(line => line.trim()).map((line, i) => ({
        hook: line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, ''),
        framework: frameworks[i % frameworks.length],
      }));
    }

    return {
      success: true,
      data: {
        hooks: Array.isArray(hooks) ? hooks : [hooks],
        inputText,
        frameworks,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Hook generation failed',
    };
  }
}

export async function executeImageInput(nodeData: any): Promise<NodeExecutionResult> {
  return {
    success: true,
    data: {
      imageUrl: nodeData.imageUrl || '',
      fileName: nodeData.imageFile?.name || 'uploaded-image',
    },
  };
}

export async function executeDeepAnalysis(
  nodeData: any,
  inputs: Record<string, any>
): Promise<NodeExecutionResult> {
  try {
    const imageUrl = nodeData.imageUrl || getInputValue(inputs, 'imageUrl');

    if (!imageUrl) {
      throw new Error('No image provided for analysis');
    }

    const prompt = `Analyze this image in detail and return ONLY a valid JSON object with this exact structure:
{
  "style": "description of visual style",
  "lighting": "lighting setup description",
  "composition": "composition analysis",
  "colorPalette": "dominant colors and mood",
  "mood": "overall atmosphere"
}`;

    const analysis = await geminiService.analyzeImage({ imageUrl, prompt });

    return {
      success: true,
      data: {
        imageUrl,
        analysis,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Image analysis failed',
    };
  }
}

export async function executeEffectApplier(
  nodeData: any,
  inputs: Record<string, any>
): Promise<NodeExecutionResult> {
  try {
    const imageUrl = nodeData.imageUrl || getInputValue(inputs, 'imageUrl');
    const effect = nodeData.effect || 'none';
    const intensity = nodeData.intensity || 50;

    if (!imageUrl) {
      throw new Error('No image provided for effect application');
    }

    // In a real implementation, this would apply actual image filters
    // For now, we'll return metadata about the effect
    const effectDescriptions: Record<string, string> = {
      cinematic: 'Widescreen aspect, color grading, vignette',
      vintage: 'Film grain, faded colors, light leaks',
      cyberpunk: 'Neon glow, chromatic aberration, digital glitch',
      horror: 'Desaturated, high contrast, grain',
      romantic: 'Soft focus, warm tones, bloom',
    };

    return {
      success: true,
      data: {
        imageUrl, // In reality, this would be the processed image
        effect,
        intensity,
        effectDescription: effectDescriptions[effect] || 'No effect applied',
        appliedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Effect application failed',
    };
  }
}

export async function executeText2Image(nodeData: any): Promise<NodeExecutionResult> {
  try {
    const prompt = nodeData.prompt || '';
    const negativePrompt = nodeData.negativePrompt || '';
    const width = nodeData.width || 1024;
    const height = nodeData.height || 1024;

    if (!prompt) {
      throw new Error('No prompt provided for image generation');
    }

    const result = await geminiService.generateImage({
      prompt,
      negativePrompt,
      numberOfImages: 1,
    });

    return {
      success: true,
      data: {
        generatedUrl: result.images[0].url,
        prompt,
        negativePrompt,
        width,
        height,
        model: 'imagen-3.0',
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Image generation failed',
    };
  }
}

export async function executeImage2Image(
  nodeData: any,
  inputs: Record<string, any>
): Promise<NodeExecutionResult> {
  try {
    const inputImage = nodeData.inputImage || getInputValue(inputs, 'imageUrl');
    const prompt = nodeData.prompt || '';
    const strength = nodeData.strength || 0.75;

    if (!inputImage) {
      throw new Error('No input image provided');
    }

    if (!prompt) {
      throw new Error('No transformation prompt provided');
    }

    // For image-to-image, we'd typically use a different API
    // For now, we'll use the vision model to understand the image and generate a new one
    const analysisPrompt = `Describe this image in detail for image generation purposes.`;
    const analysis = await geminiService.analyzeImage({ imageUrl: inputImage, prompt: analysisPrompt });

    const enhancedPrompt = `${prompt}. Style reference: ${analysis.analysis || analysis}. Strength: ${strength}`;

    const result = await geminiService.generateImage({
      prompt: enhancedPrompt,
      numberOfImages: 1,
    });

    return {
      success: true,
      data: {
        generatedUrl: result.images[0].url,
        inputImage,
        prompt,
        strength,
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Image transformation failed',
    };
  }
}
