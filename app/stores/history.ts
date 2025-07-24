// app/stores/history.ts
import type { Feature, FeatureCollection, Point } from 'geojson'
import type { GeoJSONSource, Map } from 'maplibre-gl'
import type { placenames } from '~~/server/database/schemas'
import { defineStore, storeToRefs } from 'pinia'

// 定义前端使用的地名类型
type Placename = typeof placenames.$inferSelect

export const useHistoryStore = defineStore('history', () => {
  const viewerStore = useViewerStore()
  const { map } = storeToRefs(viewerStore)

  // --- State ---
  const placenamesForYear = ref<Placename[]>([])
  const isLoading = ref(false)
  const selectedYear = ref(-221) // 默认年份为-221

  const mapSourceId = 'historical-placenames-by-year'
  const mapLayerId = 'placenames-by-year-layer'

  // --- Private Helper Actions ---

  /**
   * 将地名数组转换为 MapLibre 需要的 GeoJSON 格式
   */
  function _toGeoJSON(placenames: Placename[]): FeatureCollection<Point> {
    const features: Feature<Point>[] = placenames.map(p => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [Number(p.coordinates[0]), Number(p.coordinates[1])],
      },
      properties: { ...p },
    }))
    return { type: 'FeatureCollection', features }
  }

  /**
   * 初始化或更新地图上的数据源和图层
   */
  function _updateMapDataSource() {
    if (!map.value)
      return
    const source = map.value.getSource(mapSourceId) as GeoJSONSource | undefined
    const geojsonData = _toGeoJSON(placenamesForYear.value)

    if (source) {
      // 如果数据源已存在，仅更新数据
      source.setData(geojsonData)
    }
    else {
      // 否则，添加新的数据源和图层
      map.value.addSource(mapSourceId, {
        type: 'geojson',
        data: geojsonData,
      })
      map.value.addLayer({
        id: mapLayerId,
        source: mapSourceId,
        type: 'circle',
        paint: {
          'circle-radius': [
            'case',
            ['==', ['get', 'type'], '首都'],
            6,
            ['==', ['get', 'type'], '省会'],
            5,
            4,
          ],
          'circle-color': [
            'match',
            ['get', 'type'],
            '首都',
            '#F94144',
            '省会',
            '#F3722C',
            '州',
            '#F9C74F',
            '县',
            '#90BE6D',
            /* other */ '#43AA8B',
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF',
        },
      })
    }
  }

  // --- Public Actions ---

  /**
   * 根据指定年份从 API 获取地名数据
   */
  async function fetchPlacenamesForYear(year: number) {
    isLoading.value = true
    try {
      const data = await $fetch<Placename[]>('/api/placenames/by-year', {
        params: { year },
      })
      placenamesForYear.value = data
      _updateMapDataSource()
    }
    catch (e) {
      console.error(`Failed to fetch placenames for year ${year}:`, e)
      placenamesForYear.value = [] // 出错时清空列表
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * 飞至指定地名在地图上的位置
   */
  function flyToPlacename(placename: Placename) {
    if (!map.value)
      return
    map.value.flyTo({
      center: [Number(placename.coordinates[0]), Number(placename.coordinates[1])],
      zoom: 9,
      speed: 1.5,
    })
  }

  /**
   * 清理地图上添加的图层和数据源
   */
  function cleanupMapLayers() {
    if (!map.value)
      return
    if (map.value.getLayer(mapLayerId))
      map.value.removeLayer(mapLayerId)
    if (map.value.getSource(mapSourceId))
      map.value.removeSource(mapSourceId)
  }

  // --- Watchers ---

  // 监听年份变化，并自动获取新数据
  watch(selectedYear, (newYear) => {
    fetchPlacenamesForYear(newYear)
  }, { immediate: true }) // immediate: true 确保在初始化时就用默认年份获取数据

  return {
    isLoading,
    selectedYear,
    placenamesForYear,
    fetchPlacenamesForYear,
    flyToPlacename,
    cleanupMapLayers,
  }
})
