<script setup lang="ts">
import { useClipboard } from "@vueuse/core";
import { ref } from "#imports";

const code = ["npx tiged unjs/nitro#starter", "npx nitropack dev"];

const { copy: copyToClipboard } = useClipboard();

const state = ref("init");

const copy = (e: MouseEvent) => {
  copyToClipboard(code.join("\n"))
    .then(() => {
      state.value = "copied";

      setTimeout(() => {
        state.value = "init";
      }, 1000);
    })
    .catch(() => {
      console.warn("Couldn't copy to clipboard!");
    });
};
</script>

<template>
  <div
    class="group relative flex h-64 w-full cursor-pointer flex-col overflow-hidden rounded-lg bg-gray-900"
    @click="copy"
  >
    <div
      v-if="state === 'copied'"
      class="absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center"
    >
      <div class="absolute top-0 left-0 h-full w-full bg-black opacity-75" />
      <div class="z-10 text-lg font-semibold text-gray-100">Copied!</div>
    </div>
    <div
      class="relative flex h-12 w-full items-center border-b-2 border-gray-800"
    >
      <div class="ml-4 flex">
        <div class="h-3 w-3 rounded-full bg-red-400" />
        <div class="ml-2 h-3 w-3 rounded-full bg-yellow-400" />
        <div class="ml-2 h-3 w-3 rounded-full bg-green-400" />
      </div>
      <div
        class="absolute top-0 left-0 flex h-full w-full items-center justify-center font-semibold"
      >
        Terminal
      </div>
    </div>
    <div class="flex flex-1 p-4 font-mono">
      <span class="mr-2 inline-block select-none font-bold" />
      <span class="inline-block text-gray-200">
        <pre v-text="code.map((l) => ' $ ' + l).join('\n')"></pre>
      </span>
    </div>
    <div
      v-if="state !== 'copied'"
      class="py-2 text-center font-semibold opacity-0 transition-opacity group-hover:opacity-100"
    >
      Click to copy
    </div>
  </div>
</template>
