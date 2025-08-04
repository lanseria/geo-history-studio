// app/stores/ui.ts
import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  // --- State ---
  const isLayerPanelOpen = ref(false)
  const isFilterPanelOpen = ref(true)
  const isDataPanelOpen = ref(false)
  const isFlyToActionEditorOpen = ref(false)

  // --- Actions ---
  function toggleLayerPanel() {
    isLayerPanelOpen.value = !isLayerPanelOpen.value
    if (isLayerPanelOpen.value) {
      isFilterPanelOpen.value = false
      isDataPanelOpen.value = false
    }
  }

  function toggleFilterPanel() {
    isFilterPanelOpen.value = !isFilterPanelOpen.value
    if (isFilterPanelOpen.value) {
      isLayerPanelOpen.value = false
      isDataPanelOpen.value = false
    }
  }

  function toggleDataPanel() {
    isDataPanelOpen.value = !isDataPanelOpen.value
    if (isDataPanelOpen.value) {
      isLayerPanelOpen.value = false
      isFilterPanelOpen.value = false
    }
  }

  // 新增方法
  function toggleFlyToActionEditor() {
    isFlyToActionEditorOpen.value = !isFlyToActionEditorOpen.value
  }

  return {
    isLayerPanelOpen,
    isFilterPanelOpen,
    isDataPanelOpen,
    isFlyToActionEditorOpen, // 导出新状态
    toggleLayerPanel,
    toggleFilterPanel,
    toggleDataPanel,
    toggleFlyToActionEditor, // 导出新方法
  }
})
