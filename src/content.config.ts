import { defineCollection, z } from 'astro:content';
import { docsLoader, i18nLoader } from "@astrojs/starlight/loaders";
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

const docCollection = defineCollection({
	loader: docsLoader(),
	schema: docsSchema({
		extend: z.object({
			publishDate: z.date().optional(),
			updateDate: z.date().optional(),
			displayPublishDate: z.boolean().default(true).optional(),
		})
	  })
});

const i18nCollection = defineCollection({
	loader: i18nLoader(),
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

