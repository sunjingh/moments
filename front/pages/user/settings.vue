<template>
  <Header :user="currentUser"/>

  <div class="space-y-4  flex flex-col p-4 my-4 dark:bg-neutral-800">
    <!--    <div class="flex justify-end gap-2 my-2">-->
    <!--      <UButton @click="navigateTo('/')" icon="i-carbon-arrow-left" size="xs" color="gray" variant="solid">返回</UButton>-->
    <!--      <UButton @click="logout" icon="i-carbon-logout" size="xs" color="white" variant="solid">登出</UButton>-->
    <!--    </div>-->
    <UFormGroup label="头像" name="avatarUrl" :ui="{label:{base:'font-bold'}}">
      <UInput type="file" size="sm" @change="uploadAvatarUrl">
        <template #leading>
          <IconMdiFolderOpenOutline/>
        </template>
      </UInput>
      <div class="text-gray-500 text-sm my-2">或者输入在线地址</div>
      <UInput v-model="state.avatarUrl" class="mb-2"/>
      <UAvatar :src="state.avatarUrl" size="lg"/>
    </UFormGroup>
    <UFormGroup label="顶部图片" name="coverUrl" :ui="{label:{base:'font-bold'}}">
      <UInput type="file" size="sm" @change="uploadCoverUrl">
        <template #leading>
          <IconMdiFolderOpenOutline/>
        </template>
      </UInput>
      <div class="text-gray-500 text-sm my-2">或者输入在线地址</div>
      <UInput v-model="state.coverUrl" class="mb-2"/>
      <img :src="state.coverUrl" class="w-full rounded object-cover" alt=""/>
    </UFormGroup>
    <UFormGroup label="登录名" name="username" :ui="{label:{base:'font-bold'}}">
      <UInput v-model="state.username" disabled/>
    </UFormGroup>
    <UFormGroup label="昵称" name="nickname" :ui="{label:{base:'font-bold'}}">
      <UInput v-model="state.nickname"/>
    </UFormGroup>
    <UFormGroup label="心情状态" name="slogan" :ui="{label:{base:'font-bold'}}">
      <UInput v-model="state.slogan"/>
    </UFormGroup>
    <UFormGroup label="密码" name="slogan" :ui="{label:{base:'font-bold'}}">
      <UInput v-model="state.password" type="password" placeholder="留空则不修改密码"/>
    </UFormGroup>
    <div class="flex gap-2">
      <UButton class="justify-center grow" @click="logout" size="md" color="white" variant="solid">
        <template #leading>
          <IconMdiLogout/>
        </template>
        登出
      </UButton>
      <UButton class="justify-center grow" @click="save" size="md">
        <template #leading>
          <IconMdiVerified/>
        </template>
        保存
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {SysConfigVO, UserVO} from "~/types";
import {toast} from "vue-sonner";
import {uGetThumbnailImgPath, useUpload} from "~/utils";
import {useGlobalState} from "~/store";

const sysConfig = useState<SysConfigVO>('sysConfig')
const global = useGlobalState()
const currentUser = useState<UserVO>('userinfo')
const state = reactive({
  password: "",
  username: "",
  nickname: "",
  slogan: "",
  avatarUrl: "",
  coverUrl: "",
  css: "",
  js: "",
})
const logout = async () => {
  global.value.userinfo = {}
  await navigateTo('/')
}
const reload = async () => {
  const res = await useMyFetch<UserVO>('/user/profile')
  if (res) {
    Object.assign(state, res)
    currentUser.value = res
  }
}

const save = async () => {
  await useMyFetch('/user/saveProfile', state)
  toast.success("保存成功")
  await reload()
}

const uploadAvatarUrl = async (files: FileList) => {
  for (let i = 0; i < files.length; i++) {
    if (files[i].type.indexOf("image") < 0) {
      toast.error("只能上传图片");
      return
    }
  }
  const result = await useUpload(files)
  toast.success("上传成功")
  if (result) {
    state.avatarUrl = uGetThumbnailImgPath(result[0], sysConfig.value.s3.thumbnailSuffix)
  }
}

const uploadCoverUrl = async (files: FileList) => {
  for (let i = 0; i < files.length; i++) {
    if (files[i].type.indexOf("image") < 0) {
      toast.error("只能上传图片");
      return
    }
  }
  const result = await useUpload(files)
  toast.success("上传成功")
  if (result) {
    state.coverUrl = uGetThumbnailImgPath(result[0], sysConfig.value.s3.thumbnailSuffix)
  }
}

onMounted(async () => {
  Object.assign(state, currentUser.value)
})

</script>

<style scoped>

</style>