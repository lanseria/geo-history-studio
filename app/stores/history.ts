import * as Cesium from 'cesium'
import { defineStore } from 'pinia'
import { useViewerStore } from './viewer'

export interface Placename {
  id: string
  name: string
  tName: string
  pName: string
  coord: [string, string]
  time: [string, string]
  type: string
}

export const useHistoryStore = defineStore('history', () => {
  // --- State ---
  const allPlacenames = ref<Placename[]>([])
  const isLoading = ref(false)
  const searchTerm = ref('')
  const selectedType = ref('全部')

  // --- 【核心修改 ①】: 将 state 的类型从 EntityCollection 改为 CustomDataSource ---
  // 我们需要保存对整个数据源的引用，而不是仅仅是实体的集合。
  const placenameDataSource = shallowRef<Cesium.CustomDataSource | null>(null)

  // --- Getters ---
  const uniqueTypes = computed(() => {
    const types = new Set(allPlacenames.value.map(p => p.type))
    return ['全部', ...Array.from(types)]
  })

  const filteredPlacenames = computed(() => {
    return allPlacenames.value.filter((placename) => {
      const nameMatch = placename.name.toLowerCase().includes(searchTerm.value.toLowerCase())
      const typeMatch = selectedType.value === '全部' || placename.type === selectedType.value
      return nameMatch && typeMatch
    })
  })
  // --- Actions ---
  async function fetchPlacenames() {
    if (allPlacenames.value.length > 0)
      return
    isLoading.value = true
    try {
      const response = await fetch('/json/data.json')
      if (!response.ok)
        throw new Error('Network response was not ok.')
      const data = await response.json()
      allPlacenames.value = data.data
    }
    catch (error) {
      console.error('Failed to fetch placenames:', error)
    }
    finally {
      isLoading.value = false
    }
  }

  function clearPlacenamesFromMap() {
    const viewerStore = useViewerStore()
    // 检查 placenameDataSource.value 是否存在，如果存在就移除它
    if (viewerStore.viewer && placenameDataSource.value) {
      // 正确的做法：移除整个 DataSource
      viewerStore.viewer.dataSources.remove(placenameDataSource.value)
    }
    placenameDataSource.value = null
  }

  function renderPlacenamesOnMap() {
    const viewerStore = useViewerStore()
    if (!viewerStore.isViewerInitialized)
      return

    clearPlacenamesFromMap()

    const newDataSource = new Cesium.CustomDataSource('historical-placenames')

    for (const placename of filteredPlacenames.value) {
      newDataSource.entities.add({
        id: placename.id,
        position: Cesium.Cartesian3.fromDegrees(
          Number(placename.coord[0]),
          Number(placename.coord[1]),
        ),
        point: {
          pixelSize: 8,
          color: Cesium.Color.ORANGE,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          // 【核心修复 ①】: 告诉点实体，要贴在地形上
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
        label: {
          text: placename.name,
          font: '16px "DM Sans"',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -20),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
      })
    }

    viewerStore.viewer!.dataSources.add(newDataSource)
    placenameDataSource.value = newDataSource
  }

  function flyToPlacename(placename: Placename) {
    const viewerStore = useViewerStore()
    if (!viewerStore.isViewerInitialized)
      return

    viewerStore.viewer!.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        Number(placename.coord[0]),
        Number(placename.coord[1]),
        50000,
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-90),
        roll: 0.0,
      },
      duration: 1.5,
    })
  }

  // watch
  watch(filteredPlacenames, renderPlacenamesOnMap, { deep: true })

  return {
    // State
    isLoading,
    searchTerm,
    selectedType,
    // Getters
    uniqueTypes,
    filteredPlacenames,
    // Actions
    fetchPlacenames,
    flyToPlacename,
  }
})
