// import { Queue } from "bullmq";
// import { reddisConnection } from "../../config/reddisConnection";
// import { Article } from "@prisma/client";

// export const articleQueue = new Queue("create-article", {
//   connection: reddisConnection,
// });

// export const addJobArticleQueue = async (articleData: Omit<Article, "id" | "createdAt">) => {
//   return await articleQueue.add("create-article", articleData);
// };
