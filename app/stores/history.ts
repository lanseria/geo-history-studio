// app/stores/history.ts
import type { Feature, FeatureCollection, Point } from 'geojson'
import type { GeoJSONSource } from 'maplibre-gl'
import type { placenames } from '~~/server/database/schemas'
import { defineStore, storeToRefs } from 'pinia'

// 定义前端使用的地名类型
type Placename = typeof placenames.$inferSelect

// 将 ID 定义为模块级别的导出常量，供其他组件或 store 使用
export const HISTORICAL_PLACENAMES_SOURCE_ID = 'historical-placenames-by-year'
export const HISTORICAL_PLACENAMES_LAYER_ID = 'placenames-by-year-layer'
export const HISTORICAL_PLACENAMES_LABEL_LAYER_ID = 'placenames-by-year-label-layer'

export const useHistoryStore = defineStore('history', () => {
  const viewerStore = useViewerStore()
  const { map } = storeToRefs(viewerStore)

  // --- State ---
  const placenamesForYear = ref<Placename[]>([])
  const isLoading = ref(false)
  const selectedYear = ref(-221) // 默认年份为-221

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

    const source = map.value.getSource(HISTORICAL_PLACENAMES_SOURCE_ID) as GeoJSONSource | undefined
    const geojsonData = _toGeoJSON(placenamesForYear.value)

    if (source) {
      source.setData(geojsonData)
    }
    else {
      // 1. 添加数据源
      map.value.addSource(HISTORICAL_PLACENAMES_SOURCE_ID, {
        type: 'geojson',
        data: geojsonData,
        // 开启 cluster 以便处理大量数据点（可选但推荐）
        // cluster: true,
        // clusterMaxZoom: 14,
        // clusterRadius: 50,
      })

      // 2. 添加圆点图层 (circle)
      map.value.addLayer({
        id: HISTORICAL_PLACENAMES_LAYER_ID,
        source: HISTORICAL_PLACENAMES_SOURCE_ID,
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

      // 3. 添加文本标签图层 (symbol)
      map.value.addLayer({
        id: HISTORICAL_PLACENAMES_LABEL_LAYER_ID,
        source: HISTORICAL_PLACENAMES_SOURCE_ID,
        type: 'symbol',
        // 设置最小缩放级别，当地图缩放级别大于等于 7 时才显示标签
        minzoom: 7,
        layout: {
          // 从 GeoJSON 的 properties.name 字段获取文本内容
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Regular'],
          // 字体大小
          'text-size': 12,
          // 文本相对于锚点（圆点中心）的偏移量，[x, y]
          // 这里我们将文本向上偏移，避免遮挡圆点
          'text-offset': [0, -1.5],
          // 防止标签重叠
          'text-allow-overlap': false,
          'text-ignore-placement': false,
        },
        paint: {
          // 文本颜色
          'text-color': '#000000',
          // 为文本添加白色描边（光晕），使其在复杂背景下更易读
          'text-halo-color': '#FFFFFF',
          'text-halo-width': 1,
          'text-halo-blur': 1,
        },
      })
    }

    // 每次数据更新后，清除两个图层上可能存在的旧过滤器
    if (map.value.getLayer(HISTORICAL_PLACENAMES_LAYER_ID))
      map.value.setFilter(HISTORICAL_PLACENAMES_LAYER_ID, null)
    if (map.value.getLayer(HISTORICAL_PLACENAMES_LABEL_LAYER_ID))
      map.value.setFilter(HISTORICAL_PLACENAMES_LABEL_LAYER_ID, null)
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

    // 确保两个图层都被移除
    if (map.value.getLayer(HISTORICAL_PLACENAMES_LABEL_LAYER_ID))
      map.value.removeLayer(HISTORICAL_PLACENAMES_LABEL_LAYER_ID)
    if (map.value.getLayer(HISTORICAL_PLACENAMES_LAYER_ID))
      map.value.removeLayer(HISTORICAL_PLACENAMES_LAYER_ID)

    if (map.value.getSource(HISTORICAL_PLACENAMES_SOURCE_ID))
      map.value.removeSource(HISTORICAL_PLACENAMES_SOURCE_ID)
  }

  // --- Watchers ---

  watch(selectedYear, (newYear) => {
    fetchPlacenamesForYear(newYear)
  }, { immediate: true })

  return {
    isLoading,
    selectedYear,
    placenamesForYear,
    fetchPlacenamesForYear,
    flyToPlacename,
    cleanupMapLayers,
  }
})
