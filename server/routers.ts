import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getNewsList,
  getNewsById,
  getUserCoins,
  addUserCoin,
  removeUserCoin,
} from "./db";
import { fetchAndStoreNews } from "./newsFetcher";
import { runAnalysisBatch } from "./aiAnalyzer";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── News ────────────────────────────────────────────────────────────────
  news: router({
    list: publicProcedure
      .input(
        z.object({
          coinSymbols: z.array(z.string()).optional(),
          sentiment: z.enum(["bullish", "bearish", "neutral"]).optional(),
          limit: z.number().min(1).max(50).default(20),
          offset: z.number().min(0).default(0),
        })
      )
      .query(async ({ input }) => {
        return getNewsList(input);
      }),

    detail: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const item = await getNewsById(input.id);
        if (!item) throw new Error("News not found");
        return item;
      }),

    // Manual refresh: fetch new articles + run AI analysis
    refresh: publicProcedure.mutation(async () => {
      const fetched = await fetchAndStoreNews();
      const analyzed = await runAnalysisBatch(10);
      return { fetched, analyzed };
    }),
  }),

  // ─── User Coins ──────────────────────────────────────────────────────────
  coins: router({
    list: publicProcedure
      .input(z.object({ sessionId: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        const userId = ctx.user?.id ?? null;
        const sessionId = input.sessionId ?? null;
        return getUserCoins(userId, sessionId);
      }),

    add: publicProcedure
      .input(
        z.object({
          coinSymbol: z.string().min(1).max(20),
          coinName: z.string().min(1).max(100),
          isCustom: z.boolean().default(false),
          sessionId: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user?.id ?? null;
        const sessionId = input.sessionId ?? null;
        await addUserCoin({
          userId,
          sessionId,
          coinSymbol: input.coinSymbol.toUpperCase(),
          coinName: input.coinName,
          isCustom: input.isCustom,
        });
        return { success: true };
      }),

    remove: publicProcedure
      .input(
        z.object({
          coinSymbol: z.string(),
          sessionId: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user?.id ?? null;
        const sessionId = input.sessionId ?? null;
        await removeUserCoin({ userId, sessionId, coinSymbol: input.coinSymbol.toUpperCase() });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
