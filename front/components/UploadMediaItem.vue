<template>
  <div class="flex items-center justify-between relative w-24 h-24 rounded-[3px] bg-[#eee] dark:bg-neutral-800">
    <div class="mx-auto text-4xl text-[#888] dark:text-[#555]">
      <IconMdiPlus/>
    </div>
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden opacity-0 real-img-input">
      <!-- <UInput accept="image/*" type="file" multiple @change="upload"/>-->
      <UInput accept="image/*" type="file" multiple @change="upload"/>
    </div>
    <div v-if="progress > 0 && progress < 100" class="absolute bottom-0 left-0 w-full">
      <UProgress size="sm" :value="progress"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useUpload} from "~/utils";

const imgs = defineModel<string>('imgs')
const progress = ref(0)
const filename = ref('')
const total = ref(0)
const current = ref(0)

const upload = async (files: FileList) => {
  for (let i = 0; i < files.length; i++) {
    if (files[i].type.indexOf("image") < 0) {
      showFailToast("只能上传图片")
      return
    }
    const result = await useUpload([files[i]] as unknown as FileList, (totalSize: number, index: number, name: string, p: number) => {
      progress.value = Math.round(p * 100)
      filename.value = name
      total.value = totalSize
      current.value = index
    }) as string[]
    showSuccessToast('上传成功')
    if (result) {
      imgs.value = (imgs.value ? imgs.value + ',' : '') + result.join(",")
    }
  }
}
</script>

<style scoped lang="scss">
.real-img-input {
  div {
    width: 100%;
    height: 100%;

    :deep(input) {
      height: 100%;
      cursor: pointer;
    }
  }
}
</style>