import { z } from "zod"

export const PostValidator = z.object({
    title: z.string()
    .min(3, {message: 'Title must be longer than 3 characters'})
    .max(64, {message: 'Title must be at most 64 characters'}),
    topicId: z.string(),
    content: z.any(),
    })


    export type PostRequest = z.infer<typeof PostValidator>