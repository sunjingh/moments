<template>
  <div
      class="will-change-transform"
      :style="{ transform: `translateY(${distance}px)`, transition: isDragging ? 'none' : 'transform 0.5s ease' }"
      @touchstart="handleTouchstart"
      @touchmove="handleTouchmove"
      @touchend="handleTouchend"
  >
    <div class="text-center py-12px text-[#ccc]">
      <span v-if="distance > 0">释放即可刷新...</span>
      <span v-if="modelValue">加载中...</span>
    </div>
    <slot></slot>
  </div>
</template>
<script setup lang="ts">
const modelValue = defineModel<boolean>('modelValue', {default: false})

const distance = ref(0);
const startY = ref(0);
const isDragging = ref(false);  // 标识是否正在拖动
const dragThreshold = 5;  // 触发拖动的阈值
const MaxDistance = 60; // 最大拖动的阈值

const emits = defineEmits<{
  touchEnd: []
}>();

const handleTouchstart = (e: TouchEvent) => {
  isDragging.value = false; // 初始化为非拖动状态
  startY.value = e.touches[0].clientY;
};

const handleTouchmove = (e: TouchEvent) => {
  const currentY = e.touches[0].clientY;
  const moveDistance = currentY - startY.value;
  if (Math.abs(moveDistance) > dragThreshold) {
    isDragging.value = true;  // 达到阈值，认为是拖动
    distance.value = moveDistance;  // 更新距离
  }
  if (distance.value > MaxDistance) {
    distance.value = MaxDistance;
  }
};

const handleTouchend = (_e: TouchEvent) => {
  if (!isDragging.value) {
    // 未拖动
    return
  }
  distance.value = 0;
  startY.value = 0;
  isDragging.value = false;
  modelValue.value = true;
  emits("touchEnd");
};
</script>