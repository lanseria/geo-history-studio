<!-- app/pages/index.vue -->
<script setup lang="ts">
</script>

<template>
  <div class="h-full w-full relative">
    <MapViewer />

    <Toolbar />
    <LayerPanel />
    <FilterPanel />
    <DataPanel />

    <div class="right-4 top-4 absolute z-10">
      <UserMenu />
    </div>

    <FlyToActionEditor />
  </div>
</template>
