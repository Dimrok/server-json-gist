import { Controller, Get, Query } from '@nestjs/common';
import { ServerService } from './app.service';
import { IsUrl, IsNumber, IsOptional } from 'class-validator';
import { ServeRequestParams } from './types';

class ServeRequestParamsDto implements ServeRequestParams {
  @IsUrl()
  url: string;

  @IsOptional()
  @IsNumber()
  throttle?: number = 0;

  @IsOptional()
  @IsNumber()
  errorRate?: number = 0;

  @IsOptional()
  @IsNumber()
  pageSize?: number = 10;

  @IsOptional()
  @IsNumber()
  page?: number = 0;
}

@Controller()
export class AppController {
  constructor(private readonly serverService: ServerService) {}

  @Get()
  serve(@Query() params: ServeRequestParamsDto): unknown {
    return this.serverService.serve(params);
  }
}
