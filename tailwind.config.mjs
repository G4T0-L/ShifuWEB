//import animations from '@midudev/tailwind-animations'
/** @type {import('tailwindcss').Config} */


export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				roboto: ["Roboto Condensed", "sans-serif"],
				lilita: ['Lilita One', 'sans-serif'],
			  },
			colors:{
				'primary': '#ECA8B0',
				'secondary': '#D9D7F1',
				'primary-dark': '#E0488F',
				'secondary-dark': '#3B3742'
			}
		},
	},
	plugins: [],
}
