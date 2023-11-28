<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData<any>(`docs-${route.path}`, () => queryContent(route.path).findOne())
if (!page.value)
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })

const { data: surround } = await useAsyncData<any>(`docs-${route.path}-surround`, () => {
  return queryContent()
    .where({ _extension: 'md', navigation: { $ne: false } })
    .findSurround(route.path.endsWith('/') ? route.path.slice(0, -1) : route.path)
}, {
  transform(surround) {
    return surround.map((doc: any) => doc.navigation === false ? null : doc)
  },
})

definePageMeta({
  layout: 'docs'
})

useSeoMeta({
  titleTemplate: '%s - Nitro',
  title: page.value.title,
  ogTitle: `${page.value.title} - Nitro`,
  description: page.value.description,
  ogDescription: page.value.description,
})

defineOgImage({
  component: 'Docs',
  title: page.value.title,
  description: page.value.description,
})

const headline = computed(() => findPageHeadline(page.value))

const communityLinks = computed(() => [
  {
    icon: 'i-ph-pen-duotone',
    label: 'Edit this page',
    to: `https://github.com/unjs/nitro/edit/main/docs/content/${page?.value?._file}`,
    target: '_blank',
  },
  {
    icon: 'i-ph-shooting-star-duotone',
    label: 'Star on GitHub',
    to: 'https://github.com/unjs/nitro',
    target: '_blank',
  }
])
</script>

<template>
  <UPage>
    <UPageHeader :title="page.title" :description="page.description" :headline="headline" />

    <UPageBody prose class="pb-0">
      <ContentRenderer v-if="page.body" :value="page" />
      <hr v-if="surround?.length" class="my-8">
      <UDocsSurround :surround="surround" />
    </UPageBody>

    <template v-if="page.body?.toc?.links?.length" #right>
      <UDocsToc :links="page.body.toc.links">
        <template #bottom>
          <div class="hidden !mt-6 lg:block space-y-6">
            <UDivider v-if="page.body?.toc?.links?.length" dashed />
            <UPageLinks title="Community" :links="communityLinks" />
          </div>
        </template>
      </UDocsToc>
    </template>
  </UPage>
</template>
