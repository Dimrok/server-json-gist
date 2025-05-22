import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ServerService } from './app.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [ServerService],
})
export class AppModule {}
