<template>
  <div class="absolute left-0 top-0 w-full max-w-full h-full max-h-full overflow-hidden pointer-events-none">
    <div class="ellipsis" />
  </div>
</template>

<style lang="postcss" scoped>
.ellipsis {
  @apply h-[160px] md:w-[600px];
  background: linear-gradient(97.62deg, rgba(240,219,79,0.22) 2.27%, rgba(242,223,97,0.22) 50.88%, rgba(242,223,97,0.22) 98.48%);
  filter: blur(169px);
  transform: matrix(-0.95, -0.3, -0.3, 0.95, 200, 250);
  pointer-events: none;
}
</style>
