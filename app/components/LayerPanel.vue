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
        <label class="text-prose-muted font-bold">地图样式</label>
        <select v-model="viewerStore.selectedStyleName" class="text-sm input-base !py-1">
          <option v-for="style in viewerStore.mapStyles" :key="style.name" :value="style.name">
            {{ style.name }}
          </option>
        </select>
      </div>

      <!-- 这里可以为以后添加其他图层控制，如叠加层开关等 -->
    </div>
  </Transition>
</template>

<!-- style 部分保持不变 -->
