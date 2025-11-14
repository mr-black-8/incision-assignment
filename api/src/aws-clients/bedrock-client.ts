import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { ExpectedAIResponse } from './types';
import { cleanEnv, str } from 'envalid';

if (process.env.NODE_ENV === 'local') {
  process.loadEnvFile('../.env');
}
const { REGION } = cleanEnv(process.env, { REGION: str() });

export type Suggestions = {
  titles: string[];
  descriptions: string[];
};

const systemPrompt = [
  {
    text: `Provide improved alternatives for the given title and description of a catalog item.\
    Consider the following scoring system to guide the suggestions:\n\
    always start with 40 points. +20 if title length is between 12 and 50 characters.\
    +15 if description length is 60 characters or more.\nYour response should be 5 title suggestions\
    and 5 description suggestions. Output should be in JSON format of { title_suggestions: [], description_suggestions: [] }.`,
  },
];

export default class AiSuggestionClient {
  private bedrockClient: BedrockRuntimeClient;
  private modelId = 'eu.amazon.nova-micro-v1:0';
  constructor() {
    this.bedrockClient = new BedrockRuntimeClient({ region: REGION });
  }

  async getSuggestions(title: string, description: string): Promise<Suggestions> {
    const payload = JSON.stringify({
      messages: [
        {
          role: 'user',
          content: [
            {
              text: `Title: ${title}\nDescription: ${description}`,
            },
          ],
        },
      ],
      system: systemPrompt,
      inferenceConfig: { maxTokens: 512, topP: 0.9, temperature: 0.7 },
    });
    console.log(payload);

    const command = new InvokeModelCommand({
      modelId: this.modelId,
      contentType: 'application/json',
      body: payload,
    });

    const response = await this.bedrockClient.send(command);
    console.log(response);
    const decodedResponseBody = new TextDecoder().decode(response.body);
    console.log(decodedResponseBody);
    // TODO: Implement error handling and retry for invalid JSON response
    const responseBody = JSON.parse(decodedResponseBody) as { output: { message: { content: { text: string }[] } } };
    const result = JSON.parse(responseBody.output.message.content[0].text) as ExpectedAIResponse;

    return { titles: result.title_suggestions || [], descriptions: result.description_suggestions || [] };
  }
}
