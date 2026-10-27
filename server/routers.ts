import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { automationRouter } from "./routers/automation";
import { channelsRouter } from "./routers/channels";
import { contentRouter } from "./routers/content";
import { jobsRouter } from "./routers/jobs";
import { analyticsRouter } from "./routers/analytics";
import { commentsRouter } from "./routers/comments";
import { creditsRouter } from "./routers/credits";

export const appRouter = router({
  system: systemRouter,
  automation: automationRouter,
  channels: channelsRouter,
  content: contentRouter,
  jobs: jobsRouter,
  analytics: analyticsRouter,
  comments: commentsRouter,
  credits: creditsRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
