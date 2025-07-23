<!-- app/pages/index.vue -->
<script setup lang="ts">
definePageMeta({
  layout: 'blank', // 使用一个空白布局
})

const authStore = useAuthStore()
</script>

<template>
  <div class="h-full w-full relative">
    <CesiumViewer />
    <!-- 将用户菜单放置在右上角，z-10 确保它在 Cesium Viewer 之上 -->
    <div class="right-4 top-4 absolute z-10">
      <UserMenu />
    </div>
    <!-- <HistoryPanel /> -->
  </div>
</template>
