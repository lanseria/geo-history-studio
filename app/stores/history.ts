import type { Feature, FeatureCollection, Point } from 'geojson'
import type { ExpressionSpecification, FilterSpecification, GeoJSONSource } from 'maplibre-gl'
import type { placenames } from '~~/server/database/schemas'
import { defineStore, storeToRefs } from 'pinia'
import { toRaw } from 'vue'

type Placename = typeof placenames.$inferSelect

// --- 类型定义---
export interface PlacenameTypeStyle {
  size: 4 | 5 | 6
  color: string
}

export const DEFAULT_STYLE: PlacenameTypeStyle = { size: 4, color: '#43AA8B' }
export const AVAILABLE_COLORS = ['#F94144', '#F3722C', '#F9C74F', '#90BE6D', '#43AA8B']
export const AVAILABLE_SIZES = [6, 5, 4] as const

// --- 常量---
export const HISTORICAL_PLACENAMES_SOURCE_ID = 'historical-placenames-by-year'
export const HISTORICAL_PLACENAMES_LAYER_ID = 'placenames-by-year-layer'
export const HISTORICAL_PLACENAMES_LABEL_LAYER_ID = 'placenames-by-year-label-layer'

export const useHistoryStore = defineStore('history', () => {
  const viewerStore = useViewerStore()
  const { map } = storeToRefs(viewerStore)

  const placenamesForYear = ref<Placename[]>([])
  const isLoading = ref(false)
  const selectedYear = ref(-221)
  const selectedTypes = ref<string[]>([])
  const typeStyles = ref<Record<string, PlacenameTypeStyle>>({})

  const availableTypes = computed(() => {
    const types = new Set(placenamesForYear.value.map(p => p.type))
    return Array.from(types).sort()
  })

  // --- 内部函数 ---
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

  // [修改] 函数返回 ExpressionSpecification，内部使用 any[] 构建
  function _buildPaintExpression(property: 'circle-radius' | 'circle-color'): ExpressionSpecification {
    const styleKey = property === 'circle-radius' ? 'size' : 'color'
    const expressionParts: any[] = ['match', ['get', 'type']]

    for (const [type, style] of Object.entries(typeStyles.value))
      expressionParts.push(type, style[styleKey])

    expressionParts.push(DEFAULT_STYLE[styleKey])

    return expressionParts as ExpressionSpecification
  }

  function _updateMapDataSource() {
    if (!map.value)
      return
    const source = map.value.getSource(HISTORICAL_PLACENAMES_SOURCE_ID) as GeoJSONSource | undefined
    const geojsonData = _toGeoJSON(placenamesForYear.value)
    if (source) {
      source.setData(geojsonData)
    }
    else {
      map.value.addSource(HISTORICAL_PLACENAMES_SOURCE_ID, { type: 'geojson', data: geojsonData })
      map.value.addLayer({
        id: HISTORICAL_PLACENAMES_LAYER_ID,
        source: HISTORICAL_PLACENAMES_SOURCE_ID,
        type: 'circle',
        paint: {
          'circle-radius': _buildPaintExpression('circle-radius'),
          'circle-color': _buildPaintExpression('circle-color'),
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF',
        },
      })
      map.value.addLayer({
        id: HISTORICAL_PLACENAMES_LABEL_LAYER_ID,
        source: HISTORICAL_PLACENAMES_SOURCE_ID,
        type: 'symbol',
        minzoom: 7,
        layout: { 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Regular'], 'text-size': 12, 'text-offset': [0, -1.5], 'text-allow-overlap': false, 'text-ignore-placement': false },
        paint: { 'text-color': '#000000', 'text-halo-color': '#FFFFFF', 'text-halo-width': 1, 'text-halo-blur': 1 },
      })
    }
    _applyFiltersAndStyles()
  }

  function _applyFiltersAndStyles() {
    if (!map.value)
      return

    const circleLayerExists = map.value.getLayer(HISTORICAL_PLACENAMES_LAYER_ID)
    const labelLayerExists = map.value.getLayer(HISTORICAL_PLACENAMES_LABEL_LAYER_ID)
    if (!circleLayerExists && !labelLayerExists)
      return

    const types = toRaw(selectedTypes.value)

    let filter: FilterSpecification
    if (types.length > 0) {
      const conditions = types.map(type => ['==', ['get', 'type'], type])
      filter = ['any', ...conditions] as FilterSpecification
    }
    else {
      filter = ['any'] as FilterSpecification
    }

    try {
      const radiusPaint = _buildPaintExpression('circle-radius')
      const colorPaint = _buildPaintExpression('circle-color')

      if (circleLayerExists) {
        map.value.setFilter(HISTORICAL_PLACENAMES_LAYER_ID, filter)
        map.value.setPaintProperty(HISTORICAL_PLACENAMES_LAYER_ID, 'circle-radius', radiusPaint)
        map.value.setPaintProperty(HISTORICAL_PLACENAMES_LAYER_ID, 'circle-color', colorPaint)
      }
      if (labelLayerExists) {
        map.value.setFilter(HISTORICAL_PLACENAMES_LABEL_LAYER_ID, filter)
      }
    }
    catch (error) {
      console.error('Error applying filters or styles:', error)
      console.error('Filter that failed:', JSON.stringify(filter, null, 2))
    }
  }

  // --- Public Actions---
  async function fetchPlacenamesForYear(year: number) {
    isLoading.value = true
    try {
      const data = await $fetch<Placename[]>('/api/placenames/by-year', { params: { year } })
      placenamesForYear.value = data
      const newTypes = Array.from(new Set(data.map(p => p.type))).sort()
      selectedTypes.value = [...newTypes]
      newTypes.forEach((type) => {
        if (!typeStyles.value[type])
          typeStyles.value[type] = { ...DEFAULT_STYLE }
      })
      _updateMapDataSource()
    }
    catch (e) {
      console.error(`Failed to fetch placenames for year ${year}:`, e)
      placenamesForYear.value = []
    }
    finally {
      isLoading.value = false
    }
  }

  function flyToPlacename(placename: Placename) {
    if (!map.value)
      return
    map.value.flyTo({ center: [Number(placename.coordinates[0]), Number(placename.coordinates[1])], zoom: 9, speed: 1.5 })
  }

  function cleanupMapLayers() {
    if (!map.value)
      return
    if (map.value.getLayer(HISTORICAL_PLACENAMES_LABEL_LAYER_ID))
      map.value.removeLayer(HISTORICAL_PLACENAMES_LABEL_LAYER_ID)
    if (map.value.getLayer(HISTORICAL_PLACENAMES_LAYER_ID))
      map.value.removeLayer(HISTORICAL_PLACENAMES_LAYER_ID)
    if (map.value.getSource(HISTORICAL_PLACENAMES_SOURCE_ID))
      map.value.removeSource(HISTORICAL_PLACENAMES_SOURCE_ID)
  }

  // --- Watchers---
  watch(selectedYear, (newYear) => {
    fetchPlacenamesForYear(newYear)
  }, { immediate: true })

  watch([selectedTypes, typeStyles], () => {
    _applyFiltersAndStyles()
  }, { deep: true })

  return { isLoading, selectedYear, placenamesForYear, availableTypes, selectedTypes, typeStyles, fetchPlacenamesForYear, flyToPlacename, cleanupMapLayers }
})
