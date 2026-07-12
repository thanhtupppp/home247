import { logger } from 'firebase-functions';

// Retrieve API key from environment config or process.env
const getApiKey = (): string => {
  const key = process.env.OPENROUTER_API_KEY || '';
  if (!key) {
    logger.warn('Warning: OPENROUTER_API_KEY is not configured in process.env.');
  }
  return key;
};

export const OpenRouterModels = {
  DEFAULT: 'google/gemini-2.0-flash-exp',
  VISION: 'google/gemini-1.5-flash',
  AGENT: 'openai/gpt-4o-mini',
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

  const requestBody: any = {
    model,
    messages,
    temperature: options.temperature !== undefined ? options.temperature : 0.2,
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
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.error('OpenRouter API returned error status:', response.status, errText);
      throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('Error calling OpenRouter API:', error);
    throw error;
  }
}
