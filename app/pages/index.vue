<!-- app/pages/index.vue -->
<script setup lang="ts">
</script>

<template>
  <div class="h-full w-full relative">
    <!-- [修改] 引用新的 MapViewer 组件 -->
    <MapViewer />

    <Toolbar />
    <LayerPanel />
    <FilterPanel />

    <div class="right-4 top-4 absolute z-10">
      <UserMenu />
    </div>
  </div>
</template>
