import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormProps, type FieldValues } from 'react-hook-form';

import type { z } from 'zod';

export function useZodForm<TFormValues extends FieldValues>(
  schema: z.ZodType<TFormValues>,
  props?: Omit<UseFormProps<TFormValues>, 'resolver'>,
) {
  return useForm<TFormValues>({
    resolver: zodResolver(schema as never),
    ...props,
  });
}
