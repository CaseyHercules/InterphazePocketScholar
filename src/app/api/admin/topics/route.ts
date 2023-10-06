import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { TopicValidator } from "@/lib/validators/admin";
import { z } from "zod";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
    try {
        const session = await getAuthSession()
        const user = await db.user.findFirst({
            where: {id: session?.user?.id}
        })

        if (!session?.user || user?.role === Role.USER || user?.role === Role.SPELLWRIGHT) {
            return new Response('Unauthorized', { status: 401 })
        }

        const body = await req.json()
        const {title} = TopicValidator.parse(body)

        const topic = await db.topic.create({
            data: {
                title,
            }})
            return new Response(topic.title)
    } catch (error) {
        if(error instanceof z.ZodError) {
            return new Response(error.message, { status: 422 })
        }

        return new Response('Could not process request', { status: 500 })

        
    }
}