import { OpenAI, AzureOpenAI } from 'openai';

export function createOpenAIClient(): OpenAI | undefined {
    if (!process.env['CONNECTION_AI_APIKEY']) {
        console.log('CONNECTION_AI_APIKEY is not set, skipping AI functionality.');
        return undefined;
    }

    return new AzureOpenAI({
        apiKey: process.env['CONNECTION_AI_APIKEY'],
        apiVersion: process.env['CONNECTION_AI_APIVERSION'],
        deployment: process.env['CONNECTION_AI_DEPLOYMENT'],
        endpoint: process.env['CONNECTION_AI_ENDPOINT'],
    });
}