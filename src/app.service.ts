import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ServeRequestParams } from './types';
import { firstValueFrom } from 'rxjs';

type Response = { data: unknown[] } | { results: unknown[] };

@Injectable()
export class ServerService {
  public constructor(private readonly httpService: HttpService) {}

  public async serve(request: ServeRequestParams): Promise<unknown> {
    const { url, throttle, errorRate, pageSize = 10, page = 0 } = request;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
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

    const key = 'data' in response.data ? 'data' : 'results';

    if (key in response.data) {
      data.push(...response.data[key]);
    }

    return {
      [key]: data.slice(page * pageSize, (page + 1) * pageSize),
    };
  }
}
