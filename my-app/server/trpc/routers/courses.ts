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

      // Simple approach: get courses first, then fetch profiles separately
      const { data: coursesData, error: coursesError } = await ctx.supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, from + input.pageSize - 1);

      if (coursesError) {
        throw coursesError;
      }

      // Get profiles for all users who created courses
      const userIds = [...new Set(coursesData?.map(c => c.user_id) || [])];
      const { data: profilesData, error: profilesError } = await ctx.supabase
        .from("profiles")
        .select("id,username")
        .in("id", userIds);

      if (profilesError) {
        throw profilesError;
      }

      // Combine data
      const itemsWithProfiles = coursesData?.map(course => ({
        ...course,
        profiles: profilesData?.find(p => p.id === course.user_id) || { username: 'Anonymous' }
      })) || [];

      // Get total count
      const { count, error: countError } = await ctx.supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw countError;
      }

      const totalCount = count ?? 0;
      const totalPages = Math.max(1, Math.ceil(totalCount / input.pageSize));

      return {
        items: itemsWithProfiles,
        totalCount,
        totalPages,
        page: input.page,
        pageSize: input.pageSize,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Use separate queries to avoid relationship issues
      const { data: course, error: courseError } = await ctx.supabase
        .from("courses")
        .select("*")
        .eq("id", input.id)
        .maybeSingle();

      if (courseError || !course) {
        if (courseError) throw courseError;
        return null;
      }

      // Get profile separately
      const { data: profile, error: profileError } = await ctx.supabase
        .from("profiles")
        .select("username")
        .eq("id", course.user_id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      return {
        ...course,
        profiles: profile
      };
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
        .eq("user_id", ctx.user.id)
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
      const { error } = await ctx.supabase
        .from("courses")
        .delete()
        .eq("id", input.id)
        .eq("user_id", ctx.user.id);

      if (error) {
        throw error;
      }

      return { ok: true };
    }),
});
