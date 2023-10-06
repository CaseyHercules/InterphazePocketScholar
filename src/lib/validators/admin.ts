import {z} from 'zod';

export const TopicValidator = z.object({
    title: z.string().min(3).max(64),
    })

export type TopicValidatorPayload = z.infer<typeof TopicValidator>