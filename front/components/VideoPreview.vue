<template>
  <video class="rounded object-scale-down w-11/12" controls :src="url" preload="metadata">
  </video>
</template>

<script setup lang="ts">
const props = defineProps<{url:string}>()
</script>

<style scoped>

</style>