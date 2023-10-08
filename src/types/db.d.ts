import type { Post, Topic, User } from "@prisma/client";

export type ExtenededPost = Post & {
  Topic: Topic;
  User: User;
};
