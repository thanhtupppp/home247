// Retrieve API key from environment variables (set in Vercel Dashboard)
const getApiKey = (): string => {
  const key = process.env.OPENROUTER_API_KEY || '';
  if (!key) {
    throw new Error('OPENROUTER_API_KEY_NOT_CONFIGURED');
  }
  return key;
};

// Model names loaded from env with sensible defaults
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
  zdr?: boolean;
}

/**
 * Call the OpenRouter completions API with the given parameters.
 * Replaces firebase-functions logger with console.
 */
export async function callOpenRouter(
  messages: ChatMessage[],
  options: CallOpenRouterOptions = {}
): Promise<any> {
  const apiKey = getApiKey();
  const model = options.model || OpenRouterModels.DEFAULT;
  const maxTokens = options.max_tokens || 1500;

  const requestBody: any = {
    model,
    messages,
    temperature: options.temperature !== undefined ? options.temperature : 0.2,
    max_tokens: maxTokens,
    provider: {
      data_collection: 'deny',
      ...(options.zdr ? { zdr: true } : {}),
    },
  };

  if (options.response_format) requestBody.response_format = options.response_format;
  if (options.tools) requestBody.tools = options.tools;
  if (options.tool_choice) requestBody.tool_choice = options.tool_choice;

  const timeout = options.timeoutMs || 30000;
  const controller = new AbortController();
  const timer = setTimeout(() => {
    console.warn(`[openrouter] Request to ${model} timed out after ${timeout}ms`);
    controller.abort();
  }, timeout);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/thanhtupppp/home247',
        'X-Title': 'Home247 Landlord Assistant',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[openrouter] API error:', response.status, errText);
      throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
    }

    return response.json();
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error(
        `Mô hình AI phản hồi quá chậm (vượt quá ${timeout / 1000} giây). Vui lòng thử lại.`
      );
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
