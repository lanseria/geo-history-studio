<!-- app/components/CesiumViewer.vue -->
<script setup lang="ts">
import { useViewerStore } from '~/stores/viewer'

const viewerStore = useViewerStore()
const cesiumContainer = ref<HTMLDivElement>()

onMounted(async () => {
  await nextTick()
  if (cesiumContainer.value)
    viewerStore.initViewer(cesiumContainer.value!)
})

onUnmounted(() => {
  viewerStore.destroyViewer()
})
</script>

<template>
  <div id="cesium-container" ref="cesiumContainer" class="h-full w-full" />
</template>

<style>
/* 移除 Cesium logo 左侧的 credit 显示 */
.cesium-viewer-bottom {
  display: none;
}
</style>
