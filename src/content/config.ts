import { defineCollection, z } from 'astro:content';

const writing = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    series: z.number(),
    date: z.string().optional(),
    linkedin: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    status: z.enum(['shipped', 'lab']),
    order: z.number().default(99),
    description: z.string(),
  }),
});

export const collections = { writing, projects };
