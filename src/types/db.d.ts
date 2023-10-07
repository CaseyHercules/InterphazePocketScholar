import { Topic } from "@prisma/client";

export type ExtenededPost = Post & {
    topic: Topic
    author: User
}