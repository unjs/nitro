<script lang="ts" setup>
defineOptions({
  inheritAttrs: false,
})

defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
    default: '',
  },
})
</script>

<template>
  <div class="h-full w-full flex flex-col items-start justify-between bg-[#020420] p-20 pb-16 pt-32">
    <div
      style="position: absolute;width: 1156px;height: 1000px;left: -215px;top: -337px;background: radial-gradient(50% 50% at 50% 50%, #00DC82 0%, rgba(0, 220, 130, 0) 100%);filter: blur(180.5px);opacity: 0.5;"
    />
    <div>
      <h1 class="mb-4 flex items-center text-8xl text-white">
        <span>{{ title }}</span>
        <img v-if="image" :src="image" class="ml-8 h-20 w-20 rounded">
      </h1>
      <p class="pr-10 text-5xl leading-tight text-gray-200">
        {{ description }}
      </p>
    </div>
    <Logo class="h-[60px] w-[492px] text-white" />
  </div>
</template>
