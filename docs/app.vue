<script setup>
useServerSeoMeta({
  ogSiteName: 'Nitro',
  twitterCard: 'summary_large_image',
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

const headerLinks = computed(() => {
    const route = useRoute()
    return [
      {
        label: 'Guide',
        icon: 'i-ph-rocket-launch-duotone',
        to: '/guide/getting-started',
        active: route.path.startsWith('/guide')
      }, {
        label: 'Deployment',
        icon: 'i-ph-book-open-duotone',
        to: '/deploy',
        active: route.path.startsWith('/deploy')
      }, {
        label: 'Configuration',
        icon: 'i-ph-code',
        to: '/config',
        active: route.path.startsWith('/config')
      }
    ]
  })
</script>

<template>
  <UHeader :links="headerLinks">
    <template #logo>
      <Logo />
    </template>

    <template #right>
      <UColorModeButton v-if="!$colorMode.forced" />
      <UButton
        aria-label="Unjs on X" icon="i-simple-icons-x"
        to="https://twitter.com/unjsio"
        target="_blank" color="gray" variant="ghost"
      />
      <UButton
        aria-label="Nitro on GitHub" icon="i-simple-icons-github"
        to="https://github.com/unjs/nitro"
        target="_blank" color="gray" variant="ghost"
      />
    </template>

    <template #panel>
      <LazyUDocsSearchButton size="md" class="mb-4 w-full" />
      <LazyUNavigationTree :links="mapContentNavigation(navigation)" />
    </template>
  </UHeader>

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <UFooter>
    <template #left>
        Made with 💛
    </template>
    <template #right>
      <UColorModeButton v-if="!$colorMode.forced" />
      <UButton
        aria-label="Unjs Website"
        to="https://unjs.io/"
        target="_blank" color="gray" variant="ghost"
      >
      <IconUnJs class="w-5 h-5" />
      </UButton>
      <UButton
        aria-label="Unjs on X" icon="i-simple-icons-x"
        to="https://twitter.com/unjsio"
        target="_blank" color="gray" variant="ghost"
      />
      <UButton
        aria-label="Unstorage on GitHub" icon="i-simple-icons-github"
        to="https://github.com/unjs/unstorage"
        target="_blank" color="gray" variant="ghost"
      />
    </template>
  </UFooter>
  <ClientOnly>
    <LazyUDocsSearch :files="files" :navigation="navigation" />
  </ClientOnly>
</template>
