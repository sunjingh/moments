<template>
  <PullRefresh v-model="reloadLoading" @touchEnd="reload">
    <Header v-bind:user="currentUser"/>
    <div class="flex flex-col divide-y divide-[#C0BEBF]/20 dark:divide-[#000]/80">
      <Memo v-bind:memo="m" v-for="m in memos" :key="m.id"/>
    </div>
    <div ref="loadMoreEle" class="text-xs text-center text-gray-500 py-2 cursor-pointer" @click="loadMoreDebounce"
         v-if="hasNext">
      {{ loadMoreLoading ? '正在加载...' : '点击加载更多' }}
    </div>
    <div class="text-xs text-center text-gray-500 py-2" v-else>已经到底啦</div>
  </PullRefresh>
  <div class="w-10 h-10 absolute left-0 top-0" @click="handleDebugClick"/>
</template>

<script setup lang="ts">
import type {MemoVO, SysConfigVO, UserVO} from "~/types";
import Memo from "~/components/Memo.vue";
import {memoChangedEvent, memoReloadEvent} from "~/event";
import {useElementVisibility} from '@vueuse/core'
import eruda from "eruda";
import {debounce} from "lodash-es";

const currentUser = useState<UserVO>('userinfo')
const sysConfig = useState<SysConfigVO>('sysConfig')

const loadMoreEle = ref(null)
const targetIsVisible = useElementVisibility(loadMoreEle)
watch(targetIsVisible, async (visible) => {
  if (visible && sysConfig.value.enableAutoLoadNextPage) {
    await loadMore()
  }
})
const hasNext = ref(false)
const state = reactive({
  page: 1,
  size: 10,
})

const memos = ref<Array<MemoVO>>([])
onMounted(async () => {
  await reload()
})

const reloadLoading = ref(false)
const reload = async () => {
  state.page = 1
  reloadLoading.value = true
  const res = await useMyFetch<{
    list: Array<MemoVO>,
    total: number,
    hasNext: boolean
  }>('/memo/list', state)
  reloadLoading.value = false
  memos.value = res.list
  hasNext.value = res.hasNext
}

const loadMoreLoading = ref(false)
const loadMore = async () => {
  if (loadMoreLoading.value) return

  state.page = state.page + 1
  loadMoreLoading.value = true
  const res = await useMyFetch<{
    list: Array<MemoVO>,
    total: number,
    hasNext: boolean
  }>('/memo/list', state)
  loadMoreLoading.value = false
  memos.value = [...memos.value, ...res.list]
  hasNext.value = res.hasNext
}

const loadMoreDebounce = debounce(loadMore, 300)

memoReloadEvent.on(async () => {
  await reload()
})

memoChangedEvent.on(async (id: number) => {
  const res = await useMyFetch<MemoVO>('/memo/get?latest=1&id=' + id)
  const index = memos.value.findIndex(r => r.id === id)
  if (index >= 0) {
    memos.value[index] = res
  }
})

const debugClickTime = ref(0)

function handleDebugClick() {
  debugClickTime.value++
  if (debugClickTime.value > 6) {
    eruda.init()
  }
}
</script>

<style scoped>

</style>