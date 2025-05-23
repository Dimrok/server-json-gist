import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ServeRequestParams } from './types';
import { firstValueFrom } from 'rxjs';

const POSSIBLE_KEYS = ['data', 'results', 'items'];

type Response = Record<string, unknown[]> | unknown[];

@Injectable()
export class ServerService {
  public constructor(private readonly httpService: HttpService) {}

  public async serve(request: ServeRequestParams): Promise<unknown> {
    const { url, throttle, errorRate, pageSize = 10, page = 0 } = request;

    const response = await firstValueFrom(this.httpService.get<Response>(url));

    if (!response) {
      throw new ServiceUnavailableException('Data not found');
    }

    if (response.status === 404) {
      throw new ServiceUnavailableException('Data not found');
    }

    if (throttle) {
      await new Promise((resolve) => setTimeout(resolve, throttle));
    }

    if (errorRate) {
      if (Math.random() < errorRate) {
        throw new InternalServerErrorException('Error fetching data');
      }
    }

    const data: unknown[] = [];
    let key: string;

    if (Array.isArray(response.data)) {
      data.push(...response.data);
      key = 'data';
    } else {
      const keys = Object.keys(response.data);
      const possibleKey = keys.find((key) => POSSIBLE_KEYS.includes(key));

      if (possibleKey) {
        data.push(...response.data[possibleKey]);
        key = possibleKey;
      } else {
        throw new InternalServerErrorException('Invalid response format');
      }
    }

    return {
      [key]: data.slice(page * pageSize, (page + 1) * pageSize),
      total: data.length,
      page,
      pageSize,
    };
  }
}
