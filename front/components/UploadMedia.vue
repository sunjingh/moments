<template>
  <div class="flex gap-2">
    <upload-image-preview :imgs="imgs" @remove-image="handleRemoveImage" @drag-image="handleDragImage"/>
    <UploadMediaItem v-if="imgs.split(',')?.length < 9" v-model:imgs="imgs"/>
  </div>
</template>

<script setup lang="ts">
const imgs = defineModel<string>('imgs', {default: ""})

const emit = defineEmits(['removeImage', 'dragImage'])

function handleRemoveImage() {
  emit('removeImage')
}

function handleDragImage(imgs: string[]) {
  emit('dragImage', imgs)
}
</script>

<style scoped>

</style>