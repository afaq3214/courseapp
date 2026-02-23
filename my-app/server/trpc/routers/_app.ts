import { createTRPCRouter } from "../trpc";
import { coursesRouter } from "./courses";

export const appRouter = createTRPCRouter({
  courses: coursesRouter,
});

export type AppRouter = typeof appRouter;
