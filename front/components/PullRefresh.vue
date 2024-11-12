<template>
  <div>
    <div class="refresh-indicator"
         :style="{ height: `${distance}px`, transition: isRefreshing ? 'height 0.3s ease' : 'none' }">
      <span v-if="distance > refreshThreshold && !isRefreshing">释放刷新</span>
      <span v-else-if="isRefreshing">正在刷新...</span>
      <span v-else>下拉刷新</span>
    </div>
    <div
        class="refresh-container"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
    >
      <!-- 主内容 -->
      <slot/>
    </div>
  </div>
</template>

<script setup lang="ts">
const isRefreshing = defineModel<boolean>('modelValue', {default: false})
const emits = defineEmits<{
  touchEnd: []
}>();

const distance = ref(0);         // 下拉距离
const isDragging = ref(false);   // 是否在拖动
let startY = 0;                  // 记录初始触摸位置
const refreshThreshold = 60;     // 触发刷新的距离阈值

// 触摸开始事件
const onTouchStart = (event: TouchEvent) => {
  if (isRefreshing.value) return; // 刷新时不触发下拉
  startY = event.touches[0].clientY;
  isDragging.value = true;
};

// 触摸移动事件
const onTouchMove = (event: TouchEvent) => {
  if (!isDragging.value || isRefreshing.value) return;
  const currentY = event.touches[0].clientY;
  distance.value = Math.max(0, currentY - startY); // 只允许向下拉
  if (distance.value > refreshThreshold) {
    distance.value = refreshThreshold;
  }
};

// 触摸结束事件
const onTouchEnd = () => {
  if (isRefreshing.value) return;
  if (distance.value >= refreshThreshold) {
    // 达到阈值，触发刷新
    isRefreshing.value = true;
    emits("touchEnd");
  }
  distance.value = 0;
  isDragging.value = false;
};
</script>

<style scoped>
.refresh-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: #888;
  height: 0;
  transition: height 0.3s ease;
}

.refresh-container {
  background-color: #fff;
  transition: transform 0.3s ease;
  will-change: transform;
}
</style>
