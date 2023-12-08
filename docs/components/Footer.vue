<script setup lang="ts">
const { footer } = useAppConfig();
</script>

<template>
  <UFooter>
    <template #left>
      {{ footer.credits }}
    </template>

    <template #right>
      <template v-if="footer?.links">
        <UButton
          v-for="(link, index) of footer?.links"
          :key="index"
          v-bind="{ color: 'gray', variant: 'ghost', ...link }"
        >
            <IconUnJS v-if="link.slot === 'unjs'" class="w-5 h-5" />
        </UButton>
      </template>
    </template>
  </UFooter>
</template>
