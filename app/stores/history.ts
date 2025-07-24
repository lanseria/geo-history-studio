import type { placenames as Placename } from '~~/server/database/schemas'
// app/stores/history.ts
import * as Cesium from 'cesium'
import { defineStore } from 'pinia'
import { useViewerStore } from './viewer'

// 定义地名类型到样式的映射
// 这样我们就可以轻松地为不同类型的地标配置不同的颜色
const PLACENAME_TYPE_STYLES: Record<string, { color: Cesium.Color }> = {
  首都: { color: Cesium.Color.fromCssColorString('#F94144') }, // 红色
  省会: { color: Cesium.Color.fromCssColorString('#F3722C') }, // 橙色
  州: { color: Cesium.Color.fromCssColorString('#F9C74F') }, // 黄色
  县: { color: Cesium.Color.fromCssColorString('#90BE6D') }, // 绿色
  default: { color: Cesium.Color.fromCssColorString('#43AA8B') }, // 默认蓝绿色
}

export const useHistoryStore = defineStore('history', () => {
  // --- State ---
  const placenamesForYear = ref<Placename.$inferSelect[]>([])
  const isLoading = ref(false)
  const selectedYear = ref(-221)
  const placenameDataSource = shallowRef<Cesium.CustomDataSource | null>(null)

  // --- Actions ---
  async function fetchPlacenamesByYear(year: number) {
    isLoading.value = true
    try {
      const data = await $fetch('/api/placenames/by-year', {
        params: { year },
      })
      placenamesForYear.value = data
      // 数据获取后立即重新渲染
      renderPlacenamesOnMap()
    }
    catch (error) {
      console.error(`Failed to fetch placenames for year ${year}:`, error)
      placenamesForYear.value = []
    }
    finally {
      isLoading.value = false
    }
  }

  function clearPlacenamesFromMap() {
    const viewerStore = useViewerStore()
    if (viewerStore.viewer && placenameDataSource.value) {
      viewerStore.viewer.dataSources.remove(placenameDataSource.value, true) // true to destroy
    }
    placenameDataSource.value = null
  }

  function renderPlacenamesOnMap() {
    const viewerStore = useViewerStore()
    if (!viewerStore.isViewerInitialized)
      return

    clearPlacenamesFromMap()

    const newDataSource = new Cesium.CustomDataSource(`placenames-${selectedYear.value}`)

    for (const placename of placenamesForYear.value) {
      const style = PLACENAME_TYPE_STYLES[placename.type] || PLACENAME_TYPE_STYLES.default

      newDataSource.entities.add({
        id: `placename-${placename.id}`,
        position: Cesium.Cartesian3.fromDegrees(
          Number(placename.coordinates[0]),
          Number(placename.coordinates[1]),
        ),
        point: {
          pixelSize: 10,
          color: style.color,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
        label: {
          text: placename.name,
          font: '16px "DM Sans"',
          fillColor: style.color,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -24),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY, // 标签永不被遮挡
        },
        // 将地名数据附加到实体上，方便将来进行交互
        properties: placename,
      })
    }

    viewerStore.viewer!.dataSources.add(newDataSource)
    placenameDataSource.value = newDataSource
  }

  function flyToPlacename(placename: Placename.$inferSelect) {
    const viewerStore = useViewerStore()
    if (!viewerStore.isViewerInitialized)
      return

    viewerStore.viewer!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        Number(placename.coordinates[0]),
        Number(placename.coordinates[1]),
        50000,
      ),
      duration: 1.5,
    })
  }

  // --- Watchers ---
  // 当 selectedYear 变化时，自动获取新数据
  // 使用 { immediate: true } 确保组件加载时会立即执行一次
  watch(selectedYear, (newYear) => {
    fetchPlacenamesByYear(newYear)
  }, { immediate: true }) // 这里的 immediate: true 确保了应用加载后会立即获取 -221 年的数据

  // 监听 viewer 初始化，成功后渲染一次
  const viewerStore = useViewerStore()
  watch(() => viewerStore.isViewerInitialized, (isInitialized) => {
    if (isInitialized) {
      renderPlacenamesOnMap()
    }
  })

  return {
    // State
    isLoading,
    selectedYear,
    placenamesForYear,
    // Actions
    fetchPlacenamesByYear,
    flyToPlacename,
  }
})
