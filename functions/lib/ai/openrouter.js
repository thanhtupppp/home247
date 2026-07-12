"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenRouterModels = void 0;
exports.callOpenRouter = callOpenRouter;
const firebase_functions_1 = require("firebase-functions");
// Retrieve API key from environment config or process.env
const getApiKey = () => {
    const key = process.env.OPENROUTER_API_KEY || '';
    if (!key) {
        firebase_functions_1.logger.error('OPENROUTER_API_KEY is not configured in process.env.');
        throw new Error('OPENROUTER_API_KEY_NOT_CONFIGURED');
    }
    return key;
};
// Dynamically load models from env with fallback to latest production-grade equivalents
exports.OpenRouterModels = {
    DEFAULT: process.env.OPENROUTER_TEXT_MODEL || 'google/gemini-2.5-flash-lite',
    VISION: process.env.OPENROUTER_VISION_MODEL || 'google/gemini-2.5-flash-lite',
    AGENT: process.env.OPENROUTER_AGENT_MODEL || 'openai/gpt-4o-mini',
};
/**
 * Call the OpenRouter completions API with the given parameters
 */
async function callOpenRouter(messages, options = {}) {
    const apiKey = getApiKey();
    const model = options.model || exports.OpenRouterModels.DEFAULT;
    const requestBody = {
        model,
        messages,
        temperature: options.temperature !== undefined ? options.temperature : 0.2,
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
            firebase_functions_1.logger.error('OpenRouter API returned error status:', response.status, errText);
            throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        firebase_functions_1.logger.error('Error calling OpenRouter API:', error);
        throw error;
    }
}
//# sourceMappingURL=openrouter.js.map