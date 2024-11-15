// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

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
	integrations: [
		starlight({
			title: 'alea.net workshop',
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
				//{ slug: 'sketches' },
				{ slug: 'bookmarks' },
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
