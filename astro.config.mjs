// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkDirective from 'remark-directive';
import {mdZoomableImageDirectivePlugin} from './src/plugins/remark-zoomable-image.ts'
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://www.alea.net',
	prefetch: true,
	/*
	i18n: {
		defaultLocale: "en",
		locales: ["en", "fr"],
		routing: {
			prefixDefaultLocale: false
		}
	},
	*/
	markdown: {
		remarkPlugins: [remarkDirective, mdZoomableImageDirectivePlugin]
	},
	integrations: [
		sitemap({
			customPages: [
				'https://www.alea.net/game-of-life-rust-bevy/',
				'https://www.alea.net/raytracer-rust/',
				'https://www.alea.net/vector-field-effects-js/',
				'https://www.alea.net/sketch-book/'
			]
		}),
		starlight({
			title: 'alea.net workshop',
			plugins: [],
			logo: {src: './src/assets/hvct.svg'},
			pagination: false,
			social: {
				github: 'https://github.com/vhiribarren',
				linkedin: 'https://www.linkedin.com/in/vhiribarren/',
				stackOverflow: 'https://stackoverflow.com/users/757293/vincent-hiribarren',
				email: 'https://www.alea.net/contact',
			},
			sidebar: [
				{ label: 'Projects', link: '/projects/' },
				{ label: 'Articles', link: '/articles/' },
				/*
				{
					label: 'Featured topics',
					items: [
						{
							label: 'Programming',
							items: [
								{ slug: 'topics/programming', label: 'Overview' },
							  ],
						},
						{
							label: 'Computer Grahics',
							items: [
								'projects/vector-field',
							  ],
						},
						{
							label: 'Embedded & Electronics',
							items: [
								'projects/string-lights-ic',
								'projects/matrix-rgb-arm-rust',
								'projects/cheap-robot-kinect',
								'projects/traffic-lights-arduino',
							  ],
						},
					  ],
				},
				*/
				{ label: 'Sketches', link: '/sketches/' },
				{ slug: 'bookmarks' },
				{ label: 'French Corner 🇫🇷', collapsed: true, items: [
					{ label: 'Les Shadoks - Le Goulp', link: '/shadoks', attrs: { class: 'large' }, },
					{ label: 'Compositions', collapsed: true, autogenerate: { directory: 'compositions' } },
				]},
				//{ slug: 'curriculum' },
				{ slug: 'contact' },
			],
			customCss: [
				'./src/styles/custom.css',
			],
			components: {
				Footer: './src/layouts/CustomFooter.astro',
				MarkdownContent: './src/layouts/CustomMarkdownContent.astro',
			},
		}),
	],
});
