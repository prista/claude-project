import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().max(200).optional(),
  content_json: z.string().min(1, "Content is required"),
});
