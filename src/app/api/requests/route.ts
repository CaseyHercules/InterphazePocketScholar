import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { RequestValidator } from "@/lib/validators/requests";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const session = await getAuthSession()
        if (!session?.user) {
            return new Response('Unauthorized', { status: 401 })
        }

        const body = await req.json()
        const {title, description} = RequestValidator.parse(body)

        const request = await db.request.create({
            data: {
                title,
                description,
                userId: session.user.id
            }})
            return new Response(request.title)
    } catch (error) {
        if(error instanceof z.ZodError) {
            return new Response(error.message, { status: 422 })
        }

        return new Response('Could not process request', { status: 500 })

        
    }
}