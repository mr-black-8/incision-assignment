import { Injectable } from '@nestjs/common';
import AiSuggestionClient, { Suggestions } from '../aws-clients/bedrock-client';

@Injectable()
export class SuggestionsService {
  async getSuggestions(title: string, description: string): Promise<Suggestions> {
    const aiClient = new AiSuggestionClient();
    return aiClient.getSuggestions(title, description);
  }
}
