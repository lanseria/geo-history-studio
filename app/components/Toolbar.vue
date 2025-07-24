<script setup lang="ts">
import { useUiStore } from '~/stores/ui'

const uiStore = useUiStore()
</script>

<template>
  <div class="card p-2 flex flex-col gap-2 left-4 top-4 absolute z-10">
    <button
      class="text-xl icon-btn"
      title="图层控制"
      :class="{ '!text-brand-primary': uiStore.isLayerPanelOpen }"
      @click="uiStore.toggleLayerPanel"
    >
      <div i-carbon-layers />
    </button>
    <button
      class="text-xl icon-btn"
      title="筛选地名"
      :class="{ '!text-brand-primary': uiStore.isFilterPanelOpen }"
      @click="uiStore.toggleFilterPanel"
    >
      <div i-carbon-filter />
    </button>
  </div>
</template>
