<!-- app/components/Toolbar.vue -->
<script setup lang="ts">
import { useUiStore } from '~/stores/ui'

const uiStore = useUiStore()
</script>

<template>
  <div class="card p-2 flex flex-col gap-2 left-2 top-2 absolute z-10">
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
    <button
      class="text-xl icon-btn"
      title="数据与标绘"
      :class="{ '!text-brand-primary': uiStore.isDataPanelOpen }"
      @click="uiStore.toggleDataPanel"
    >
      <div i-carbon-edit />
    </button>
    <button
      class="text-xl icon-btn"
      title="视点飞行"
      :class="{ '!text-brand-primary': uiStore.isFlyToActionEditorOpen }"
      @click="uiStore.toggleFlyToActionEditor"
    >
      <div i-carbon-plane />
    </button>
  </div>
</template>
