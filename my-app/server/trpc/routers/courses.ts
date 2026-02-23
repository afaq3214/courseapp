import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const coursesRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(50).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const from = (input.page - 1) * input.pageSize;
      const to = from + input.pageSize - 1;

      const { data, error, count } = await ctx.supabase
        .from("courses")
        .select(
          "id,title,description,duration_minutes,language,level,category,created_at,updated_at",
          { count: "exact" },
        )
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        throw error;
      }

      const totalCount = count ?? 0;
      const totalPages = Math.max(1, Math.ceil(totalCount / input.pageSize));

      return {
        items: data ?? [],
        totalCount,
        totalPages,
        page: input.page,
        pageSize: input.pageSize,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("courses")
        .select(
          "id,title,description,duration_minutes,language,level,category,created_at,updated_at",
        )
        .eq("id", input.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().max(5000).optional(),
        durationMinutes: z.number().int().min(1).max(10_000).optional(),
        language: z.string().max(100).optional(),
        level: z.string().max(100).optional(),
        category: z.string().max(100).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("courses")
        .insert({
          title: input.title,
          description: input.description ?? null,
          duration_minutes: input.durationMinutes ?? null,
          language: input.language ?? null,
          level: input.level ?? null,
          category: input.category ?? null,
          user_id: ctx.user.id,
        })
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      return data;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).max(200),
        description: z.string().max(5000).optional(),
        durationMinutes: z.number().int().min(1).max(10_000).optional(),
        language: z.string().max(100).optional(),
        level: z.string().max(100).optional(),
        category: z.string().max(100).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("courses")
        .update({
          title: input.title,
          description: input.description ?? null,
          duration_minutes: input.durationMinutes ?? null,
          language: input.language ?? null,
          level: input.level ?? null,
          category: input.category ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.id)
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      return data;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase.from("courses").delete().eq("id", input.id);

      if (error) {
        throw error;
      }

      return { ok: true };
    }),
});
