<template>
  <div class="px-4 space-y-2">
    <div class="flex justify-between items-center pt-4 text-gray-600">
      <NuxtLink class="flex items-center" title="返回主页">
        <UIcon @click="navigateTo('/')" name="i-carbon-chevron-left" class="w-5 h-5 cursor-pointer mr-4"/>
        <span v-if="$route.path==='/new'">新增内容</span>
        <span v-else>修改内容</span>
      </NuxtLink>
      <UButton label="发表" :disabled="saveLoading" @click="saveMemo">
        <template #leading v-if="saveLoading">
          <IconMdiRefresh class="animate-spin"/>
        </template>
      </UButton>
    </div>
    <div class="flex items-center gap-2 text-lg text-gray-600 ">
      <ExternalUrl v-model:favicon="state.externalFavicon" v-model:title="state.externalTitle"
                   v-model:url="state.externalUrl"/>

      <upload-image v-model:imgs="state.imgs"/>
      <!--<music v-bind="state.music" @confirm="updateMusic"/>-->
      <upload-video @confirm="handleVideo" v-bind="state.video"/>
      <!--<douban-edit v-model:type="doubanType" v-model:data="doubanData"/>-->
      <IconMdiDeleteForeverOutline @click="reset" class="w-6 h-6 cursor-pointer" title="清空"/>
      <USelectMenu v-model="selectedLabel" :options="existTags" show-create-option-when="always"
                   multiple searchable creatable placeholder="选择标签" class="grow">
        <template #label>
          <span v-if="selectedLabel.length" class="truncate">{{ selectedLabel.join(',') }}</span>
          <span v-else>选择标签</span>
        </template>
      </USelectMenu>
    </div>

    <div class="w-full" @contextmenu.prevent="onContextMenu">
      <div class="relative">
        <UTextarea ref="contentRef" v-model="state.content" :rows="8" autoresize padded autofocus/>
        <div class="animate-bounce absolute right-2 bottom-1 cursor-pointer text-xl select-none" @click="toggleEmoji">
          😊
        </div>
      </div>

      <Emoji v-if="emojiShow" @selected="emojiSelected" @close="emojiShow=false"/>


      <UContextMenu v-model="isOpen" :virtual-element="virtualElement">
        <div class="px-2 py-1 flex flex-col gap-2 text-xs">
          <div class="mb-2 text-gray-300">点击标签插入</div>
          <div v-for="(tag,index) in existTags" :key="index" class="cursor-pointer">
            <UBadge size="xs" color="gray" variant="solid" @click="clickTag(tag)">{{ tag }}</UBadge>
          </div>
        </div>
      </UContextMenu>
    </div>

    <div class="flex justify-between items-center">
      <div class="flex flex-row gap-1 items-center text-[#576b95] text-sm cursor-pointer">
        <UPopover :popper="{ arrow: true }">
          <div class="flex items-center gap-1">
            <IconMdiLocationRadiusOutline/>
            <span>{{ state.location ? locationLabel : '自定义' }}</span>
          </div>
          <template #panel="{close}">
            <div class="p-4">
              <UButtonGroup>
                <UInput v-model="state.location" placeholder="自定义位置,空格分隔"/>
                <UButton @click="close" color="white" variant="solid">关闭</UButton>
              </UButtonGroup>
            </div>
          </template>
        </UPopover>
      </div>

      <div class="flex gap-2 text-gray-500">
        <div class="flex gap-1 items-center">
          <UTabs v-model="state.showType" :items="[{label: '私密'}, {label: '公开'}, {label: '内部'}]"
                 :ui="{wrapper: 'space-y-0', list: {height: 'h-8', tab: {height: 'h-6', padding: 'px-2'}}}"/>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <external-url-preview :favicon="state.externalFavicon" :title="state.externalTitle" :url="state.externalUrl"/>
      <music-preview v-if="state.music && state.music.id && state.music.type && state.music.server"
                     v-bind="state.music"/>
      <douban-book-preview :book="doubanData" v-if="doubanType === 'book' && doubanData&& doubanData.title"/>
      <douban-movie-preview :movie="doubanData" v-if="doubanType === 'movie' && doubanData&& doubanData.title"/>
      <youtube-preview v-if="state.video.type === 'youtube' && state.video.value" :url="state.video.value"/>
      <bilibili-preview v-if="state.video.type === 'bilibili' && state.video.value" :url="state.video.value"/>
      <video-preview v-if="state.video.type === 'online' && state.video.value" :url="state.video.value"/>
      <upload-image-preview :imgs="state.imgs" @remove-image="handleRemoveImage" @drag-image="handleDragImage">
        <template #add>
          <UploadMediaItem v-if="state.imgs.split(',')?.length < 9" v-model:imgs="state.imgs"/>
        </template>
      </upload-image-preview>
    </div>
  </div>


</template>

<script setup lang="ts">
import {useMouse, useWindowScroll} from '@vueuse/core'
import type {
  DoubanBook,
  DoubanMovie,
  ExtDTO,
  MemoVO,
  MetingMusicServer,
  MetingMusicType,
  MusicDTO, UserVO,
  Video,
  VideoType
} from "~/types";
import {toast} from "vue-sonner";
import UploadImage from "~/components/UploadImage.vue";
import Emoji from "~/components/Emoji.vue";
import {sendGotifyMessage} from "~/utils";

const doubanType = ref<'book' | 'movie'>('book')
const doubanData = ref<DoubanBook | DoubanMovie>({})
const contentRef = ref(null)
const props = defineProps<{ id?: number }>()
const defaultState = {
  id: props.id || 0,
  content: "",
  ext: "",
  pinned: false,
  showType: 2,
  location: "",
  externalFavicon: "",
  externalTitle: "",
  externalUrl: "",
  imgs: "",
  music: {
    id: '',
    api: 'https://api.i-meto.com/meting/api?server=:server&type=:type&id=:id&r=:r',
    server: 'netease' as MetingMusicServer,
    type: 'song' as MetingMusicType
  },
  video: {
    type: 'youtube' as VideoType,
    value: ""
  },
  doubanBook: {} as DoubanBook,
  doubanMovie: {} as DoubanMovie,
  tags: Array<string>(),
}
const selectedTags = ref<Array<string>>([])
const selectedLabel = computed({
  get: () => selectedTags.value,
  set: (labels: Array<string>) => {
    const tempLabels = Array<string>()
    labels.map(label => {
      // @ts-ignore
      if (typeof label !== 'string') {
        // @ts-ignore
        label = label.label
      }
      tempLabels.push(label)
      if (!existTags.value.includes(label)) {
        existTags.value.push(label)
      }
    })
    selectedTags.value = [...tempLabels]
    console.log('selectedTags', selectedTags.value)
  }
})
const state = reactive({
  ...defaultState
})
const existTags = ref<string[]>([])
const reset = () => {
  Object.assign(state, defaultState)
}

const locationLabel = computed(() => {
  return state.location.split(" ").join(" · ")
})

const handleDragImage = (imgs: string[]) => {
  state.imgs = imgs.join(",")
}

const updateMusic = (music: MusicDTO) => {
  state.music.id = ""
  setTimeout(() => {
    Object.assign(state.music, music)
  }, 500)
}

const handleVideo = (video: Video) => {
  state.video = video
}

const {x, y} = useMouse()
const {y: windowY} = useWindowScroll()
const isOpen = ref(false)
const virtualElement = ref({getBoundingClientRect: () => ({})})
const handleRemoveImage = (img: string) => {
  const imgs = state.imgs.split(",")
  const index = imgs.findIndex(r => r === img)
  if (index < 0) {
    return
  }
  imgs.splice(index, 1)
  state.imgs = imgs.join(",")
}

function onContextMenu() {
  if (existTags.value.length <= 0) {
    return
  }
  const top = unref(y) - unref(windowY)
  const left = unref(x)

  virtualElement.value.getBoundingClientRect = () => ({
    width: 0,
    height: 0,
    top,
    left
  })

  isOpen.value = true
}

const loadTags = async () => {
  const res = await useMyFetch<{
    tags: string[]
  }>("/tag/list")
  existTags.value = res.tags || []
}


const clickTag = (tag: string) => {
  isOpen.value = false;
  if (!selectedLabel.value.includes(tag)) {
    if (selectedLabel.value) {
      selectedLabel.value = [...selectedLabel.value, tag]
    } else {
      selectedLabel.value = [tag]
    }
  }

  //@ts-ignore
  (contentRef.value?.textarea as HTMLTextAreaElement).focus()
}

const emojiShow = ref(false)

const toggleEmoji = () => {
  emojiShow.value = !emojiShow.value
}
const emojiSelected = (emoji: string) => {
  state.content = state.content + emoji
}

onMounted(async () => {
  if (state.id > 0) {
    const res = await useMyFetch<MemoVO>('/memo/get?id=' + state.id)
    Object.assign(state, res)
    state.showType = res.showType
    const ext = JSON.parse(res.ext) as ExtDTO
    Object.assign(state.music, ext.music)
    Object.assign(state.video, ext.video)
    doubanType.value = ext.doubanBook && ext.doubanBook.title ? 'book' : 'movie'
    doubanData.value = doubanType.value === 'book' ? ext.doubanBook : ext.doubanMovie
    selectedLabel.value = res.tags ? res.tags.substring(0, res.tags.length - 1).split(',') : []
  }
  await loadTags()
})

// const keydown=(event:KeyboardEvent)=>{
//   if(event.key === '#'){
//     tagPopoverOpen.value = true
//   }
// }

const saveLoading = ref(false)

const currentUser = useState<UserVO>('userinfo')

const saveMemo = async () => {
  if (state.content === '') {
    toast.error("请输入内容!")
    return
  }
  saveLoading.value = true
  const doubanKey = doubanType.value === 'book' ? 'doubanBook' : 'doubanMovie'
  await useMyFetch('/memo/save', {
    id: state.id,
    content: state.content,
    ext: {
      music: state.music.id ? state.music : {},
      [doubanKey]: doubanData.value,
      video: state.video.value ? state.video : {},
    },
    pinned: state.pinned,
    showType: state.showType,
    externalFavicon: state.externalUrl ? state.externalFavicon : "",
    externalTitle: state.externalTitle,
    externalUrl: state.externalUrl,
    imgs: state.imgs.split(','),
    location: state.location,
    tags: selectedLabel.value
  })
  saveLoading.value = false
  toast.success("保存成功!")
  navigateTo('/')
  sendGotifyMessage({
    title: `${currentUser.value.nickname}发布新动态了~~~`,
    message: `${state.content}\n\n [点击这里](https://mom.tianjunli.top:666) 访问链接`
  })
}

</script>

<style scoped>

</style>