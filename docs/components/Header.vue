
<script setup lang="ts">
import type { NavItem } from "@nuxt/content/dist/runtime/types"

const navigation = inject<NavItem[]>("navigation", [])

const { header } = useAppConfig()

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
      <template v-if="header?.logo?.dark || header?.logo?.light">
        <UColorModeImage v-bind="{ class: 'h-6 w-auto', ...header?.logo }" />
      </template>
      <template v-else>
        ⚡️ Nitro
      </template>
    </template>

    <template #right>
      <UDocsSearchButton
        v-if="header?.search"
        :label="null"
        class="lg:hidden"
      />

      <UColorModeButton v-if="header?.colorMode" />

      <template v-if="header?.links">
        <UButton
          v-for="(link, index) of header.links"
          :key="index"
          v-bind="{ color: 'gray', variant: 'ghost', ...link }"
        />
      </template>
    </template>

    <template #panel>
      <UNavigationTree :links="mapContentNavigation(navigation)" />
    </template>
  </UHeader>
</template>
