<template>
  <div :id="galleryID">
    <a
        v-for="(image, key) in imagesData"
        :key="key"
        :href="image.largeURL"
        :data-pswp-width="image.width"
        :data-pswp-height="image.height"
        target="_blank"
        rel="noreferrer"
    >
      <img :src="image.thumbnailURL" alt="" :class="images.length === 1 ? 'full-cover-image-single' : 'full-cover-image-mult'"/>
    </a>
  </div>
</template>

<script setup lang="ts">
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

export interface IPhotoSwipeImageData {
  thumbnailURL: string
  largeURL: string
  width?: number
  height?: number
}

const props = defineProps<{
  galleryID: string
  images: IPhotoSwipeImageData[]
}>()

const imagesData = ref<IPhotoSwipeImageData[]>(props.images)

const lightbox = ref<PhotoSwipeLightbox | null>(null)

onMounted(() => {
  if (!lightbox.value) {
    lightbox.value = new PhotoSwipeLightbox({
      gallery: `#${props.galleryID}`,
      children: 'a',
      pswpModule: () => import('photoswipe'),
    });
    lightbox.value.init();
  }
})

onUnmounted(() => {
  if (lightbox.value) {
    lightbox.value.destroy();
    lightbox.value = null;
  }
})
</script>

<style scoped>
.full-cover-image-mult {
  object-fit: cover;
  object-position: center;
  max-height: 300px;
  width: 100%;
  aspect-ratio: 1 / 1;
  border: transparent 1px solid;
}

.full-cover-image-single {
  object-fit: cover;
  object-position: center;
  max-height: 300px;
  height: auto;
  width: auto;
  border: transparent 1px solid;
}
</style>
