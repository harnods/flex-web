// ⚠ DT 2.4 — htmlAttrs 'data-panda-theme: next' is MANDATORY.
// Without it ALL semantic token CSS variables are undefined and every colour
// renders as transparent. tokenMode is omitted (DT 2.4 baseline).
export default defineNuxtConfig({
  compatibilityDate: '2025-05-26',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  // Bare component names (no folder prefix) for components/ subfolders.
  components: [{ path: '~/components', pathPrefix: false }],
  // Section parent routes redirect to their first child.
  routeRules: {
    '/settings': { redirect: '/settings/company' },
    '/insurance': { redirect: '/insurance/plans' },
  },
  postcss: {
    plugins: {
      '@mekari/pixel3-postcss': {
        include: [
          './pages/**/*.{js,ts,vue}',
          './components/**/*.{js,ts,vue}',
          './layouts/**/*.{js,ts,vue}',
          './app.vue',
        ],
      },
    },
  },
  app: {
    head: {
      title: 'mekari flex',
      htmlAttrs: {
        'data-panda-theme': 'next',
      },
      link: [
        // Favicon = Pixel `flex-brand` icon (sourced from cdn.mekari.design/icons/flex-brand.svg)
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap',
        },
      ],
    },
  },
})
