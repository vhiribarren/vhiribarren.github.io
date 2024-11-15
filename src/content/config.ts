import { defineCollection, z } from 'astro:content';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

const docCollection = defineCollection({
	type: "content",
	schema: docsSchema({
		extend: z.object({
			publishDate: z.date().optional(),
			updateDate: z.date().optional(),
		})
	  })
});

const i18nCollection = defineCollection({
	type: 'data',
	schema: i18nSchema({
		extend: z.object({
		  'page.publishDate': z.string().optional(),
		}),
	  })
});


export const collections = {
	docs: docCollection,
	i18n: i18nCollection,
};

