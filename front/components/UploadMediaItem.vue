<template>
  <div v-if="progress > 0 && progress < 100" class="img-div">
    <UProgress :value="progress" indicator/>
  </div>
  <div class="img-div">
    <div class="mx-auto text-4xl text-[#555]">
      <IconMdiPlus/>
    </div>
    <div class="absolute w-full h-full overflow-hidden opacity-0 real-img-input">
      <UInput accept="image/*" type="file" size="sm" multiple @change="upload"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {toast} from "vue-sonner";
import {useUpload} from "~/utils";

const imgs = defineModel<string>('imgs')
const progress = ref(0)
const filename = ref('')
const total = ref(0)
const current = ref(0)

const upload = async (files: FileList) => {
  for (let i = 0; i < files.length; i++) {
    if (files[i].type.indexOf("image") < 0) {
      toast.error("只能上传图片");
      return
    }
  }
  const result = await useUpload(files, (totalSize: number, index: number, name: string, p: number) => {
    progress.value = Math.round(p * 100)
    filename.value = name
    total.value = totalSize
    current.value = index
  }) as string[]
  toast.success("上传成功")
  if (result) {
    imgs.value = (imgs.value ? imgs.value + ',' : '') + result.join(",")
  }
}
</script>

<style scoped lang="scss">
.img-div {
  @apply flex items-center justify-between relative w-20 h-20 border border-solid border-gray-300 rounded-2xl bg-[#ccc];
}

.real-img-input {
  div {
    width: 100%;
    height: 100%;

    :deep(input) {
      height: 100%;
    }
  }
}
</style>