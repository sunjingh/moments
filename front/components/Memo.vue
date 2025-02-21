<template>
  <div class="header relative mb-14" v-if="$route.path === `/memo/${item.id}`">
    <div :class="{ 'bg-[#4c4c4c]/80 z-10': y > 100 }"
         class="flex fixed justify-between items-center p-4 w-full md:w-[567px] text-white top-0">
      <NuxtLink class="flex items-center" title="返回主页">
        <UIcon @click="navigateTo('/')" name="i-carbon-chevron-left" class="w-5 h-5 cursor-pointer mr-4"/>
        <span>详情</span>
      </NuxtLink>
      <UIcon v-if="global.userinfo.id === 1 || global.userinfo.id === item.userId" name="i-solar-menu-dots-bold"
             class="w-5 h-5 cursor-pointer" @click="moreToolbar = true"/>
    </div>
  </div>
  <div>
    <div class="relative flex gap-4 text-sm dark:bg-neutral-800 p-4"
         :class="[item.pinned ? 'bg-slate-100 dark:bg-neutral-700' : '']">
      <div class="avatar ">
        <NuxtLink :to="`/memo/${item.id}`">
          <UAvatar
              :src="item.user.avatarUrl"
              alt="Avatar"
          />
        </NuxtLink>
      </div>
      <div class="flex flex-col gap-1  flex-1">
        <div class="username text-[#576b95] mb-1 dark:text-white  flex justify-between">
          <NuxtLink class="cursor-pointer" :to="`/user/${item.user.id}`">{{ item.user.nickname }}</NuxtLink>
          <div>
            <IconMdiArrowTopBoldBoxOutline v-if="item.pinned"/>
            <IconMdiLockOutline v-if="item.showType === 0" class="text-red-500 ml-2 dark:text-white"/>
            <IconMdiDotsVertical
                v-if="($route.path === `/memo/${item.id}` && (global.userinfo.id === 1 || global.userinfo.id === item.userId))"
                class="text-red-500 ml-2 dark:text-white cursor-pointer" @click="moreToolbar = true"/>
          </div>
        </div>
        <div class="mb-2">
          <div :style="getMemoMaxHeightStyle()" class="overflow-hidden">
            <div class="markdown-content " ref="contentRef"
                 v-html="content"></div>
          </div>
          <div class="text-[#576b95] text-sm my-1 cursor-pointer"
               @click="doShowMore" v-if="showMore">{{ getMemoMaxHeightStyle() === '' ? '收起' : '全文' }}
          </div>
          <div class="flex gap-2 mt-2" v-if="tags.length > 0">

            <span v-for="(tag,index) in tags" :key="`tag-${index}`">
              <NuxtLink :to="`/tags/${item.user.username}/${tag}`">
                <UBadge size="xs" color="gray" variant="solid">#{{ tag }}</UBadge>
              </NuxtLink>
            </span>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <external-url-preview :favicon="item.externalFavicon" :title="item.externalTitle" :url="item.externalUrl"
                                v-if="item.externalFavicon&&item.externalTitle&&item.externalUrl"/>
          <music-preview v-if="extJSON.music && extJSON.music.id" v-bind="extJSON.music"/>
          <douban-book-preview v-if="extJSON.doubanBook && extJSON.doubanBook.title" :book="extJSON.doubanBook"/>
          <douban-movie-preview v-if="extJSON.doubanMovie && extJSON.doubanMovie.title" :movie="extJSON.doubanMovie"/>
          <youtube-preview v-if="extJSON.video && extJSON.video.type === 'youtube' && extJSON.video.value"
                           :url="extJSON.video.value"/>
          <bilibili-preview v-if="extJSON.video && extJSON.video.type === 'bilibili' && extJSON.video.value"
                            :url="extJSON.video.value"/>
          <video-preview v-if="extJSON.video && extJSON.video.type === 'online' && extJSON.video.value"
                         :url="extJSON.video.value"/>
          <upload-image-preview :imgs="item.imgs||''"/>
        </div>

        <div class="text-[#576b95] font-medium dark:text-white text-xs mt-2 mb-1 select-none flex items-center gap-0.5"
             v-if="location">
          <IconMdiLocationRadiusOutline/>
          <span>{{ location }}</span>
        </div>

        <div class="flex justify-between items-center relative">
          <div class="flex text-xs text-[#9DA4B0]">
            {{
              sysConfig.timeFormat === 'timeAgo' ? $dayjs(item.createdAt).fromNow() : $dayjs(item.createdAt).format("YYYY-MM-DD HH:mm:ss")
            }}
            <!--大于2天的显示时间-->
            {{
              sysConfig.timeFormat === 'timeAgo' && $dayjs(item.createdAt).isBefore($dayjs().add(-2, 'days')) ? $dayjs(item.createdAt).format("YYYY-MM-DD HH:mm:ss") : ''
            }}
          </div>
          <div @click="showToolbar = !showToolbar"
               class="toolbar-icon px-2 py-1 bg-[#f7f7f7] dark:bg-slate-700 hover:bg-[#dedede] cursor-pointer rounded flex items-center justify-center"
          >
            <img
                src="data:image/svg+xml,%3csvg%20t='1709204592505'%20class='icon'%20viewBox='0%200%201024%201024'%20version='1.1'%20xmlns='http://www.w3.org/2000/svg'%20p-id='16237'%20width='16'%20height='16'%3e%3cpath%20d='M229.2%20512m-140%200a140%20140%200%201%200%20280%200%20140%20140%200%201%200-280%200Z'%20p-id='16238'%20fill='%238a8a8a'%3e%3c/path%3e%3cpath%20d='M794.8%20512m-140%200a140%20140%200%201%200%20280%200%20140%20140%200%201%200-280%200Z'%20p-id='16239'%20fill='%238a8a8a'%3e%3c/path%3e%3c/svg%3e"
                class="w-3 h-3"/>
          </div>

          <div ref="toolbarRef" v-if="showToolbar"
               class="absolute top-[-8px] right-[32px] bg-[#4c4c4c] rounded text-white p-2">
            <div class="flex flex-row gap-2">
              <div class="flex flex-row gap-1 cursor-pointer items-center px-4" @click="likeMemo(item.id)">
                <IconMdiFavoriteBorder :class="[liked ? 'text-red-400' : '']"/>
                <div>赞</div>
              </div>
              <template v-if="sysConfig.enableComment">
                <span class="bg-[#6b7280] h-[20px] w-[1px]"></span>
                <div class="flex flex-row gap-1 cursor-pointer items-center px-4" @click="doComment">
                  <IconMdiCommentOutline/>
                  <div>评论</div>
                </div>
              </template>
            </div>
          </div>
          <template>
            <UModal v-model="moreToolbar" :ui="{container: 'sm:items-end'}">
              <div class="flex items-center justify-center gap-8 p-4 text-gray-500 dark:text-white">
                <template v-if="global.userinfo.id === 1">
                  <div class="flex flex-col gap-1 cursor-pointer items-center" @click="setPinned(item.id)">
                    <IconMdiArrowTopBoldBoxOutline class="text-[#9fc84a] w-5 h-5"/>
                    <div>{{ item.pinned ? '取消' : '' }}置顶</div>
                  </div>
                </template>
                <template v-if="global&&global.userinfo.id === item.userId">
                  <div class="flex flex-col gap-1 cursor-pointer items-center" @click="go2Edit(item.id)">
                    <IconMdiSquareEditOutline class="text-[#9fc84a] w-5 h-5"/>
                    <div>编辑</div>
                  </div>
                </template>
                <template v-if="(global.userinfo.id === 1 || global.userinfo.id === item.userId) ">
                  <Confirm @ok="removeMemo(item.id)" @cancel="moreToolbar = false">
                    <div class="flex flex-col gap-1 cursor-pointer items-center">
                      <IconMdiTrashCanOutline class="text-[#9fc84a] w-5 h-5"/>
                      <div>删除</div>
                    </div>
                  </Confirm>
                </template>
              </div>
            </UModal>
          </template>
        </div>

        <div class="rounded bottom-shadow bg-[#f7f7f7] dark:bg-[#202020] flex flex-col gap-1"
        >
          <div class="flex flex-row py-2 px-4 gap-2 items-center text-sm" v-if="item.favCount>0">
            <IconMdiFavoriteBorder class="text-red-500"/>
            <div class="text-[#576b95]"><span class="mx-1">{{ item.favCount }}</span>位访客</div>
          </div>
          <div class="flex flex-col gap-1" v-if="sysConfig.enableComment">
            <CommentBox :comment-id="0" :memo-id="item.id"/>
            <div class="space-y-1" :class="[item.comments && item.comments.length>0 ? 'py-2' : '']">
              <div class="px-4 relative flex-col text-sm " v-for="c in item.comments" :key="c.id"
                   v-if="item.comments && item.comments.length>0">
                <Comment :comment="c" :memo-id="item.id" :memo-user-id="item.user.id"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import type {ExtDTO, MemoVO, SysConfigVO} from "~/types";
import {memoChangedEvent, memoReloadEvent} from "~/event";
import Comment from "~/components/Comment.vue";
import {useGlobalState} from "~/store";
import {md} from "~/utils"

const showMore = ref(false)
const showMoreClicked = ref(false)
const isDetailPage = computed(() => {
  return route.path.startsWith("/memo/")
})
const contentRef = ref<HTMLDivElement | null>(null)
const sysConfig = useState<SysConfigVO>('sysConfig')
const route = useRoute()
const {y} = useWindowScroll()

const getMemoMaxHeightStyle = () => {
  if (isDetailPage.value || showMoreClicked.value) {
    return ""
  }
  if (sysConfig.value.memoMaxHeight) {
    return `max-height:${sysConfig.value.memoMaxHeight}px`
  }
  return ""
}
const currentCommentBox = useState('currentCommentBox')
const props = defineProps<{
  memo: MemoVO,
}>()
const extJSON = computed(() => {
  return JSON.parse(props.memo.ext || "{}") as ExtDTO
})
const item = computed(() => {
  return props.memo
})

const global = useGlobalState()

const moreToolbar = ref(false)

const showToolbar = ref(false)
const toolbarRef = ref(null)
const liked = ref(false)
onClickOutside(toolbarRef, () => {
  setTimeout(() => {
    if (showToolbar.value) showToolbar.value = false
  }, 0)
})

const location = computed(() => {
  return (item.value.location || "").replaceAll(" ", " · ")
})

const tags = computed(() => {
  const tagsStr = item.value.tags
  if (!tagsStr) {
    return []
  }
  const len = tagsStr.length
  if (tagsStr[len - 1] === ',') {
    return tagsStr.substring(0, len - 1).split(",")
  }
  return tagsStr.split(",")
})

const doComment = () => {
  const value = item.value.id + '#0'
  if (currentCommentBox.value === value) {
    currentCommentBox.value = ''
  } else {
    currentCommentBox.value = value
  }
  showToolbar.value = false
}

const doShowMore = () => {
  showMoreClicked.value = !showMoreClicked.value
}

const go2Edit = async (id: number) => {
  await navigateTo('/edit/' + id)
}

const removeMemo = async (id: number) => {
  await useMyFetch('/memo/remove?id=' + id)
  showSuccessToast('删除成功')
  if (isDetailPage.value) {
    await navigateTo('/')
  } else {
    memoReloadEvent.emit()
  }
  moreToolbar.value = false
}
const setPinned = async (id: number) => {
  await useMyFetch('/memo/setPinned?id=' + id)
  showSuccessToast('操作成功')
  if (isDetailPage.value) {
    await navigateTo('/')
  } else {
    memoReloadEvent.emit()
  }
  moreToolbar.value = false
}

const doLike = async (id: number, token: string = '') => {
  const likes = JSON.parse(localStorage.getItem('likeMemos') || '[]') as Array<number>
  await useMyFetch(`/memo/like?id=${id}&token=${token}`)
  showSuccessToast('点赞成功')
  likes.push(id)
  localStorage.setItem('likeMemos', JSON.stringify(likes))
  memoChangedEvent.emit(id)
  liked.value = true
}


const likeMemo = async (id: number) => {
  showToolbar.value = false
  const likes = JSON.parse(localStorage.getItem('likeMemos') || '[]') as Array<number>
  if (likes.includes(id)) {
    showToast('您已经点赞过了')
    return
  }

  if (sysConfig.value.enableGoogleRecaptcha) {
    grecaptcha.ready(() => {
      grecaptcha.execute(sysConfig.value.googleSiteKey, {action: 'newComment'}).then(async (token) => {
        await doLike(id, token)
      })
    })
  } else {
    await doLike(id)
  }


}


onMounted(() => {
  const likes = JSON.parse(localStorage.getItem('likeMemos') || '[]') as Array<number>
  liked.value = likes.findIndex(r => r === item.value.id) >= 0
  if (!isDetailPage.value) {
    setTimeout(() => {
      const {height} = useElementSize(contentRef.value);
      if (height.value > sysConfig.value.memoMaxHeight) {
        showMore.value = true
      }
    }, 20)
  }
})


const content = computed(() => {
  if (item.value.content && item.value.content.length > 0) {
    try {
      return md.render(item.value.content)
    } catch (e) {
      console.log('内容渲染错误,请重新编辑', e)
      return "内容渲染错误,请重新编辑"
    }
  }
  return ""
})

</script>

<style lang="scss" scoped>

</style>