<template>
  <NuxtLayout>
    <NuxtPage/>
    <Toaster richColors position="top-center"/>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import {Toaster} from 'vue-sonner'
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import '~/assets/simple-markdown.scss'
// import eruda from 'eruda'

// eruda.init()
</script>

<style>
div.grecaptcha-badge {
  display: none !important;
}
</style>
