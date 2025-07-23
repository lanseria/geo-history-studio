<!-- app/pages/index.vue -->
<script setup lang="ts">
definePageMeta({
  layout: 'blank', // 使用一个空白布局
})

const authStore = useAuthStore()
</script>

<template>
  <div class="h-full w-full">
    <CesiumViewer />
    <!-- <HistoryPanel /> -->
  </div>
</template>
