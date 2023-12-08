<template>
    <UContainer>
        <UPageHero v-bind="page?.landing" align="left" class="lg:my-8 xl:my-16">
            <template #title>
                <span v-html="page?.landing?.title" />
            </template>

            <template #description>
                <span v-html="page?.landing?.description" />
            </template>

            <div class="lg:mt-8 lg:ml-16">
                <MDC v-if="page?.landing?.code" :value="page.landing.code" tag="pre"
                    class="prose prose-primary dark:prose-invert max-w-none" :parser-options="{
                        highlight: {
                            theme: {
                                light: 'material-theme-lighter',
                                default: 'material-theme',
                                dark: 'material-theme-palenight'
                            }
                        }
                    }" />
            </div>
        </UPageHero>

        <ULandingSection title="Features" :ui="{ wrapper: 'py-0 sm:py-4 md:py-4 lg:py-16 xl:py-20' }">
            <UPageGrid v-if="page?.landing?.features">
                <ULandingCard v-for="(feature, index) in page.landing.features" :key="index" v-bind="feature">
                    <template #description>
                        <span v-html="feature.description" />
                    </template>

                    <template #icon>
                        {{ feature.icon }}
                    </template>
                </ULandingCard>
            </UPageGrid>
        </ULandingSection>
    </UContainer>
</template>

<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData(route.path, () => queryContent(route.path).findOne())

useSeoMeta({
    title: page.value?.title,
    ogTitle: page.value?.title,
    description: page.value?.description,
    ogDescription: page.value?.description,
    ogImage: 'https://nitro.unjs.io/social-card.png',
    twitterImage: 'https://nitro.unjs.io/social-card.png'
})
</script>
