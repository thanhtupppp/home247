import { logger } from 'firebase-functions';

// Retrieve API key from environment config or process.env
const getApiKey = (): string => {
  const key = process.env.OPENROUTER_API_KEY || '';
  if (!key) {
    logger.error('OPENROUTER_API_KEY is not configured in process.env.');
    throw new Error('OPENROUTER_API_KEY_NOT_CONFIGURED');
  }
  return key;
};

// Dynamically load models from env with fallback to latest production-grade equivalents
export const OpenRouterModels = {
  DEFAULT: process.env.OPENROUTER_TEXT_MODEL || 'google/gemini-2.5-flash-lite',
  VISION: process.env.OPENROUTER_VISION_MODEL || 'google/gemini-2.5-flash-lite',
  AGENT: process.env.OPENROUTER_AGENT_MODEL || 'openai/gpt-4o-mini',
};

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | any[];
  name?: string;
  tool_call_id?: string;
  tool_calls?: any[];
}

export interface CallOpenRouterOptions {
  model?: string;
  temperature?: number;
  response_format?: { type: 'json_object'; schema?: any };
  tools?: any[];
  tool_choice?: any;
  max_tokens?: number;
  timeoutMs?: number;
}

/**
 * Call the OpenRouter completions API with the given parameters
 */
export async function callOpenRouter(
  messages: ChatMessage[],
  options: CallOpenRouterOptions = {}
): Promise<any> {
  const apiKey = getApiKey();
  const model = options.model || OpenRouterModels.DEFAULT;
  const maxTokens = options.max_tokens || 1500; // Save budget, limit generated tokens

  const requestBody: any = {
    model,
    messages,
    temperature: options.temperature !== undefined ? options.temperature : 0.2,
    max_tokens: maxTokens,
    // Enable privacy, zero data retention policies on provider
    provider: {
      data_collection: 'deny',
      zdr: true,
    }
  };

  if (options.response_format) {
    requestBody.response_format = options.response_format;
  }

  if (options.tools) {
    requestBody.tools = options.tools;
  }

  if (options.tool_choice) {
    requestBody.tool_choice = options.tool_choice;
  }

  const timeout = options.timeoutMs || 30000; // Default 30s timeout
  const controller = new AbortController();
  const timer = setTimeout(() => {
    logger.warn(`OpenRouter request to ${model} timed out after ${timeout}ms. Aborting.`);
    controller.abort();
  }, timeout);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/thanhtupppp/home247',
        'X-Title': 'Home247 Landlord Assistant',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.error('OpenRouter API returned error status:', response.status, errText);
      throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error(`Mô hình AI phản hồi quá chậm (vượt quá ${timeout / 1000} giây). Vui lòng thử lại.`);
    }
    logger.error('Error calling OpenRouter API:', error);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
