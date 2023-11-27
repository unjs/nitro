<script setup lang="ts">
import type { NavItem } from '@nuxt/content/dist/runtime/types'

const navigation = inject<Ref<NavItem[]>>('navigation')

const route = useRoute()
const { navPageFromPath } = useContentHelpers()

const navigationLinks = computed(() => {
  const path = `/${route.params.slug?.[0]}`

  return mapContentNavigation(navPageFromPath(path, navigation.value)?.children || [])
})
</script>

<template>
  <div>
    <UMain>
      <UContainer>
        <UPage>
          <template #left>
            <UAside>
              <template #top>
                <UDocsSearchButton size="md" />
              </template>
              <UNavigationTree :links="navigationLinks" :multiple="false" :default-open="false"  />
            </UAside>
          </template>
          <slot />
        </UPage>
      </UContainer>
    </UMain>
  </div>
</template>
