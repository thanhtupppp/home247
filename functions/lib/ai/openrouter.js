"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenRouterModels = void 0;
exports.callOpenRouter = callOpenRouter;
const firebase_functions_1 = require("firebase-functions");
// Retrieve API key from environment config or process.env
const getApiKey = () => {
    const key = process.env.OPENROUTER_API_KEY || '';
    if (!key) {
        firebase_functions_1.logger.warn('Warning: OPENROUTER_API_KEY is not configured in process.env.');
    }
    return key;
};
exports.OpenRouterModels = {
    DEFAULT: 'google/gemini-2.0-flash-exp',
    VISION: 'google/gemini-1.5-flash',
    AGENT: 'openai/gpt-4o-mini',
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