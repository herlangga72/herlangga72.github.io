/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				bg: 'var(--bg)',
				elev: 'var(--bg-elev)',
				surface: 'var(--surface)',
				'surface-2': 'var(--surface-2)',
				line: 'var(--border)',
				'line-strong': 'var(--border-strong)',
				ink: 'var(--text)',
				muted: 'var(--muted)',
				faint: 'var(--faint)',
				accent: 'var(--accent)',
				warn: 'var(--warn)',
				blue: 'var(--blue)'
			},
			fontFamily: {
				sans: 'var(--font-sans)',
				mono: 'var(--font-mono)'
			},
			maxWidth: {
				shell: '1080px'
			}
		}
	},
	plugins: []
};
