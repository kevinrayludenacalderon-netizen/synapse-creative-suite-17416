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
    const count = nodeData.count || 5;
    const hookType = nodeData.hookType || 'desire';
    
    // Get brand config if available
    const brandConfig = getInputValue(inputs, 'brandConfig');

    if (!inputText) {
      throw new Error('No input text provided');
    }

    // Hook type descriptions based on Alex Hormozi's framework
    const hookTypeLogic = {
      desire: 'Promise a fast or desired transformation. Focus on the end result they want. Example: "I created a brand in 24 hours using only AI."',
      frustration: 'Expose a common mistake or problem. Make them feel understood. Example: "Your brand doesn\'t need more colors. It needs this."',
      discovery: 'Reveal something new or counterintuitive. Create curiosity. Example: "AI doesn\'t replace creatives, it replaces processes."',
      story: 'Use a brief narrative or real case. Make it relatable. Example: "Two years ago my client couldn\'t sell a single brownie..."',
      result: 'Show evidence or before/after. Use specific numbers. Example: "This video was 100% AI-generated."'
    };

    let prompt = `You are a world-class copywriter inspired by Alex Hormozi's framework.

INPUTS:
1. BRIEF: ${inputText}`;

    if (brandConfig) {
      prompt += `
2. INDUSTRY: ${brandConfig.industria}
3. TARGET AUDIENCE: ${brandConfig.audiencia_objetivo}
4. FORBIDDEN WORDS (NEVER USE): ${brandConfig.palabras_prohibidas.join(', ')}
5. WORD LIMIT PER HOOK: ${brandConfig.limites.hook} words
6. KEY CONCEPTS: ${brandConfig.conceptos_clave.join(', ')}`;
    }

    prompt += `
7. SELECTED HOOK TYPE: ${hookType}

TASK:
Generate ${count} hooks for the BRIEF above.
Follow STRICTLY the logic of the SELECTED HOOK TYPE.

HOOK TYPE LOGIC:
${hookTypeLogic[hookType as keyof typeof hookTypeLogic]}

Apply this logic to the BRIEF${brandConfig ? ` and INDUSTRY` : ''}.`;

    if (brandConfig) {
      prompt += `

STRICT RULES:
1. NEVER use forbidden words: ${brandConfig.palabras_prohibidas.join(', ')}
2. Keep each hook under ${brandConfig.limites.hook} words
3. Speak directly to: ${brandConfig.audiencia_objetivo}
4. Incorporate concepts from: ${brandConfig.conceptos_clave.join(', ')}
5. Make it specific and compelling for ${brandConfig.industria} industry`;
    }

    prompt += `\n\nGenerate ${count} unique, compelling hooks. Format as a JSON array of objects with "hook", "hookType", and "wordCount" properties.`;

    const response = await geminiService.generateText({ prompt });

    // Parse the response
    let hooks;
    try {
      hooks = JSON.parse(response);
    } catch {
      // Fallback: split by lines
      hooks = response.split('\n').filter(line => line.trim()).map((line) => ({
        hook: line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, ''),
        hookType,
        wordCount: line.split(' ').length,
      }));
    }

    return {
      success: true,
      data: {
        hooks: Array.isArray(hooks) ? hooks : [hooks],
        inputText,
        hookType,
        brandConfig,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Hook generation failed',
    };
  }
}

export async function executeBrandConfig(nodeData: any): Promise<NodeExecutionResult> {
  return {
    success: true,
    data: {
      brandConfig: {
        industria: nodeData.industria || 'General',
        audiencia_objetivo: nodeData.audiencia_objetivo || '',
        palabras_prohibidas: nodeData.palabras_prohibidas || [],
        limites: nodeData.limites || { hook: 12, script: 250 },
        conceptos_clave: nodeData.conceptos_clave || [],
      },
    },
  };
}

export async function executeHookValidator(
  nodeData: any,
  inputs: Record<string, any>
): Promise<NodeExecutionResult> {
  try {
    const hooks = getInputValue(inputs, 'hooks') || nodeData.hooks || [];
    const brandConfig = getInputValue(inputs, 'brandConfig') || nodeData.config;

    if (!hooks || hooks.length === 0) {
      throw new Error('No hooks provided for validation');
    }

    if (!brandConfig) {
      throw new Error('No brand configuration provided');
    }

    const validatedHooks = [];
    
    for (const hookObj of hooks) {
      const hook = typeof hookObj === 'string' ? hookObj : hookObj.hook;
      
      // Validation checks
      const wordCount = hook.split(' ').length;
      const exceedsLimit = wordCount > brandConfig.limites.hook;
      
      // Check for forbidden words
      const hasForbiddenWords = brandConfig.palabras_prohibidas.some((word: string) => 
        hook.toLowerCase().includes(word.toLowerCase())
      );
      
      // Check for generic CTAs
      const hasGenericCTA = /\b(clic aquí|click here|más info|more info)\b/i.test(hook);
      
      // Calculate score (0-100)
      let score = 100;
      if (exceedsLimit) score -= 30;
      if (hasForbiddenWords) score -= 40;
      if (hasGenericCTA) score -= 20;
      
      // Auto-correct if needed
      let correctedHook = hook;
      if (score < 70) {
        const correctionPrompt = `Fix this hook according to brand guidelines:

Hook: "${hook}"

Issues:
${exceedsLimit ? `- Exceeds ${brandConfig.limites.hook} word limit (currently ${wordCount} words)` : ''}
${hasForbiddenWords ? `- Contains forbidden words: ${brandConfig.palabras_prohibidas.join(', ')}` : ''}
${hasGenericCTA ? '- Has generic CTA (replace with something specific)' : ''}

Brand Config:
- Industry: ${brandConfig.industria}
- Target: ${brandConfig.audiencia_objetivo}
- Max words: ${brandConfig.limites.hook}

Return ONLY the corrected hook text, no explanations.`;

        correctedHook = await geminiService.generateText({ prompt: correctionPrompt });
        correctedHook = correctedHook.trim().replace(/^["']|["']$/g, '');
        
        // Recalculate score for corrected hook
        const newWordCount = correctedHook.split(' ').length;
        score = 100;
        if (newWordCount > brandConfig.limites.hook) score -= 15;
      }
      
      validatedHooks.push({
        original: hook,
        corrected: correctedHook,
        score,
        wordCount,
        issues: {
          exceedsLimit,
          hasForbiddenWords,
          hasGenericCTA,
        },
        passed: score >= 70,
      });
    }

    return {
      success: true,
      data: {
        validatedHooks,
        totalHooks: hooks.length,
        passedHooks: validatedHooks.filter(h => h.passed).length,
        brandConfig,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Hook validation failed',
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

export async function executeBodyGenerator(
  nodeData: any,
  inputs: Record<string, any>
): Promise<NodeExecutionResult> {
  try {
    // Get the hook from either validated hooks or regular hooks
    const hook = getInputValue(inputs, 'validatedHooks')?.[0]?.corrected || 
                 getInputValue(inputs, 'hooks')?.[0]?.hook || 
                 nodeData.hook || '';
    
    // CRITICAL: Get the brief from the Text Input node
    // The brief should come from the original text input that was connected to Hook Generator
    const brief = getInputValue(inputs, 'text') || nodeData.brief || '';
    
    const maxWords = nodeData.maxWords || 250;
    const brandConfig = getInputValue(inputs, 'brandConfig');

    if (!hook) {
      throw new Error('No hook provided. Connect Hook Generator or Hook Validator to this node.');
    }

    if (!brief) {
      throw new Error('No brief/task provided. Connect the Text Input node to this Body Generator to provide the brief.');
    }

    let prompt = `You are an expert copywriter following Alex Hormozi's framework.

TASK: Write the body content (Development + Key Insight) for a post.

ORIGINAL BRIEF: ${brief}
OPENING HOOK: ${hook}

STRUCTURE:
1. Brief Development (2-3 sentences expanding on the hook)
2. Key Insight or Lesson (the "aha" moment or valuable takeaway)

WORD COUNT: Keep total between 200-${maxWords} words.
Be concise, valuable, and maintain the energy from the hook.`;

    if (brandConfig) {
      prompt += `

BRAND CONTEXT:
- Industry: ${brandConfig.industria}
- Target Audience: ${brandConfig.audiencia_objetivo}
- Key Concepts to incorporate: ${brandConfig.conceptos_clave.join(', ')}
- FORBIDDEN WORDS (avoid): ${brandConfig.palabras_prohibidas.join(', ')}

Write in a way that resonates with ${brandConfig.audiencia_objetivo} in the ${brandConfig.industria} industry.`;
    }

    const generatedBody = await geminiService.generateText({ prompt });

    const wordCount = generatedBody.split(/\s+/).length;

    return {
      success: true,
      data: {
        generatedBody: generatedBody.trim(),
        hook,
        brief,
        wordCount,
        maxWords,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Body generation failed',
    };
  }
}

export async function executeCTAGenerator(
  nodeData: any,
  inputs: Record<string, any>
): Promise<NodeExecutionResult> {
  try {
    const body = getInputValue(inputs, 'generatedBody') || nodeData.body || '';
    const brandConfig = getInputValue(inputs, 'brandConfig');

    if (!body) {
      throw new Error('No body content provided for CTA generation');
    }

    let prompt = `Based on this copy body:

"${body}"

Generate a soft, non-pushy Call-To-Action (CTA) that:
1. Feels natural and conversational
2. Invites engagement without being aggressive
3. Is specific and actionable (NOT generic like "click here" or "más info")
4. Maintains the tone and energy of the content

Keep it to 1-2 sentences maximum.`;

    if (brandConfig) {
      prompt += `

BRAND RULES:
- Target Audience: ${brandConfig.audiencia_objetivo}
- FORBIDDEN: Generic CTAs, phrases like "clic aquí", "click here", "más info"
- Industry: ${brandConfig.industria}

The CTA must feel authentic to ${brandConfig.audiencia_objetivo}.`;
    }

    const generatedCTA = await geminiService.generateText({ prompt });

    return {
      success: true,
      data: {
        generatedCTA: generatedCTA.trim(),
        body,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'CTA generation failed',
    };
  }
}

export async function executeCopyAssembler(
  nodeData: any,
  inputs: Record<string, any>
): Promise<NodeExecutionResult> {
  try {
    const hook = getInputValue(inputs, 'validatedHooks')?.[0]?.corrected || 
                 getInputValue(inputs, 'hooks')?.[0]?.hook || 
                 nodeData.hook || '';
    const body = getInputValue(inputs, 'generatedBody') || nodeData.body || '';
    const cta = getInputValue(inputs, 'generatedCTA') || nodeData.cta || '';

    if (!hook && !body && !cta) {
      throw new Error('No content provided to assemble');
    }

    const parts = [];
    if (hook) parts.push(hook);
    if (body) parts.push(body);
    if (cta) parts.push(cta);

    const finalCopy = parts.join('\n\n');
    const totalWords = finalCopy.split(/\s+/).length;

    return {
      success: true,
      data: {
        finalCopy,
        hook,
        body,
        cta,
        totalWords,
        structure: {
          hasHook: !!hook,
          hasBody: !!body,
          hasCTA: !!cta,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Copy assembly failed',
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
