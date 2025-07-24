<script setup lang="ts">
import { useUiStore } from '~/stores/ui'
import { useViewerStore } from '~/stores/viewer'

const viewerStore = useViewerStore()
const uiStore = useUiStore()
</script>

<template>
  <Transition name="slide-fade">
    <div
      v-if="uiStore.isLayerPanelOpen"
      class="card p-4 flex flex-col gap-4 w-64 left-20 top-4 absolute z-10"
    >
      <!-- 底图切换 -->
      <div class="flex flex-col gap-2">
        <label class="text-prose-muted font-bold">底图选择</label>
        <select v-model="viewerStore.selectedLayerName" class="text-sm input-base !py-1">
          <option v-for="layer in viewerStore.baseLayers" :key="layer.name" :value="layer.name">
            {{ layer.name }}
          </option>
        </select>
      </div>

      <!-- 叠加层控制 -->
      <div class="flex flex-col gap-2">
        <label class="text-prose-muted font-bold">叠加层</label>
        <div class="flex gap-2 items-center">
          <input id="labels-checkbox" v-model="viewerStore.showLabels" type="checkbox" class="accent-brand-primary h-4 w-4">
          <label for="labels-checkbox">天地图标注</label>
        </div>
      </div>

      <!-- 地形控制 -->
      <div class="flex flex-col gap-2">
        <label class="text-prose-muted font-bold">地形</label>
        <select v-model="viewerStore.selectedTerrainName" class="text-sm input-base !py-1">
          <option v-for="terrain in viewerStore.terrainOptions" :key="terrain.name" :value="terrain.name">
            {{ terrain.name }}
          </option>
        </select>
      </div>

      <!-- 地图核心功能 -->
      <div class="flex flex-col gap-2">
        <label class="text-prose-muted font-bold">核心功能</label>
        <button class="text-sm btn !py-2" @click="viewerStore.takeScreenshot">
          地图截图
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>
