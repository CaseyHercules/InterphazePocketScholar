import {z} from 'zod';

export const RequestValidator = z.object({
    title: z.string().min(3).max(64),
    description: z.string().min(3).max(1024),
    type: z.number()
    })

export type RequestValidatorPayload = z.infer<typeof RequestValidator>