<!-- app/components/CesiumViewer.vue -->
<script setup lang="ts">
import { useViewerStore } from '~/stores/viewer'

const viewerStore = useViewerStore()
const cesiumContainer = ref<HTMLDivElement>()

onMounted(async () => {
  await nextTick()
  if (cesiumContainer.value) {
    viewerStore.initViewer(cesiumContainer.value!)
  }
})

onUnmounted(() => {
  // 调用 store action 来销毁 viewer
  viewerStore.destroyViewer()
})
</script>

<template>
  <div class="h-full w-full relative">
    <div id="cesium-container" ref="cesiumContainer" class="h-full w-full" />

    <!-- UI 控制面板直接绑定到 Store 的 state -->
    <div class="text-white p-3 rounded bg-gray-800/60 flex flex-col gap-4 left-2 top-2 absolute z-10 backdrop-blur-sm">
      <!-- 底图切换 -->
      <div class="flex flex-col gap-1">
        <label class="font-bold">底图选择</label>
        <select v-model="viewerStore.selectedLayerName" class="text-white p-1 rounded bg-gray-700">
          <option v-for="layer in viewerStore.baseLayers" :key="layer.name" :value="layer.name">
            {{ layer.name }}
          </option>
        </select>
      </div>

      <!-- 叠加层控制 -->
      <div class="flex flex-col gap-1">
        <label class="font-bold">叠加层</label>
        <div class="flex gap-2 items-center">
          <input id="labels-checkbox" v-model="viewerStore.showLabels" type="checkbox" class="h-4 w-4">
          <label for="labels-checkbox">天地图标注</label>
        </div>
      </div>

      <!-- 地形控制 -->
      <div class="flex flex-col gap-1">
        <label class="font-bold">地形</label>
        <select v-model="viewerStore.selectedTerrainName" class="text-white p-1 rounded bg-gray-700">
          <option v-for="terrain in viewerStore.terrainOptions" :key="terrain.name" :value="terrain.name">
            {{ terrain.name }}
          </option>
        </select>
      </div>

      <!-- 新增：地图核心功能 -->
      <div class="flex flex-col gap-1">
        <label class="font-bold">核心功能</label>
        <button class="btn" @click="viewerStore.takeScreenshot">
          地图截图
        </button>
      </div>
    </div>
  </div>
</template>

<style>
/* 移除 Cesium logo 左侧的 credit 显示 */
.cesium-viewer-bottom {
  display: none;
}
</style>
