import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { filterXSS } from 'xss';

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: unknown, _metadata: ArgumentMetadata) {
    return this.sanitize(value);
  }

  private sanitize(value: unknown): unknown {
    if (typeof value === 'string') {
      return filterXSS(value, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: ['script'] });
    }
    if (Array.isArray(value)) {
      return value.map((item) => this.sanitize(item));
    }
    if (value !== null && typeof value === 'object') {
      for (const key of Object.keys(value as Record<string, unknown>)) {
        (value as Record<string, unknown>)[key] = this.sanitize((value as Record<string, unknown>)[key]);
      }
    }
    return value;
  }
}
