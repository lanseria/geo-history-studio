// app/stores/ui.ts
import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  // --- State ---
  const isLayerPanelOpen = ref(false)
  const isFilterPanelOpen = ref(true) // 默认打开筛选面板

  // --- Actions ---
  function toggleLayerPanel() {
    isLayerPanelOpen.value = !isLayerPanelOpen.value
    // 确保两个面板不会同时打开
    if (isLayerPanelOpen.value)
      isFilterPanelOpen.value = false
  }

  function toggleFilterPanel() {
    isFilterPanelOpen.value = !isFilterPanelOpen.value
    // 确保两个面板不会同时打开
    if (isFilterPanelOpen.value)
      isLayerPanelOpen.value = false
  }

  return {
    isLayerPanelOpen,
    isFilterPanelOpen,
    toggleLayerPanel,
    toggleFilterPanel,
  }
})
