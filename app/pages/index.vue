<!-- app/pages/index.vue -->
<script setup lang="ts">
// 这里不需要脚本逻辑了，因为我们把状态都移到了 store 中
</script>

<template>
  <div class="h-full w-full relative">
    <CesiumViewer />

    <!-- 新的 UI 组件 -->
    <Toolbar />
    <LayerPanel />
    <FilterPanel />

    <!-- 用户菜单保持不变 -->
    <div class="right-4 top-4 absolute z-10">
      <UserMenu />
    </div>
  </div>
</template>
