import { defineStore } from 'pinia'

// 先临时清空，为后续基于 MapLibre 的实现做准备
export const useHistoryStore = defineStore('history', () => {
  // 以后这里会添加与 MapLibre 交互的逻辑
  // 例如：
  // const placenamesSource = ref(null)
  // function updatePlacenamesOnMap(data) { ... }

  return {}
})
