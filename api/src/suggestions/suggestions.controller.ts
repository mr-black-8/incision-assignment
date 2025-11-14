import { Controller, Get, Query } from '@nestjs/common';
import { SuggestionsService } from './suggestions.service';


@Controller('suggestions')
export class SuggestionsController {
  constructor(private readonly suggestionsService: SuggestionsService) {}

  @Get()
  getSuggestions(@Query('title') title: string, @Query('description') description: string) {
    return this.suggestionsService.getSuggestions(title, description);
  }
}