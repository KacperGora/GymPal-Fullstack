import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodError, z } from 'zod';

@Injectable()
export class ZodValidationPipe<
  T extends z.ZodTypeAny,
> implements PipeTransform {
  constructor(private schema: T) {}

  transform(value: unknown): z.infer<T> {
    try {
      return this.schema.parse(value);
    } catch (err) {
      if (err instanceof ZodError) {
        throw new BadRequestException(err.issues);
      }
      throw new BadRequestException('Invalid request');
    }
  }
}
