<script setup>
useServerSeoMeta({
  ogSiteName: 'Nitro',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterSite: 'unjsio'
})

useHead({
  htmlAttrs: {
    lang: 'en',
  },
})

const { data: files } = useLazyFetch('/api/search.json', {
  default: () => [],
  server: false,
})

const { data: navigation } = await useAsyncData('navigation', () => fetchContentNavigation())

provide('navigation', navigation)
</script>

<template>
  <Header />

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <Footer />

  <ClientOnly>
    <LazyUDocsSearch :files="files" :navigation="navigation" />
  </ClientOnly>
</template>
