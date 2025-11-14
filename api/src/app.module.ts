import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ItemsModule } from './items/items.module';
import { AuthGuard } from './auth/auth.guard';
import { SuggestionsModule } from './suggestions/suggestions.module';

@Module({
  imports: [ItemsModule, SuggestionsModule],
  controllers: [AppController],
  providers: [AppService, { provide: 'APP_GUARD', useClass: AuthGuard }],
})
export class AppModule {}
