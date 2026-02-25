import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z
    .string()
    .max(200)
    .optional()
    .transform((v) => v?.trim() || undefined),
  content_json: z
    .string()
    .min(1, 'Content is required')
    .max(500_000, 'Content is too large')
    .refine(
      (val) => {
        try {
          const parsed = JSON.parse(val);
          return parsed?.type === 'doc';
        } catch {
          return false;
        }
      },
      { message: 'Invalid content format' },
    ),
});
