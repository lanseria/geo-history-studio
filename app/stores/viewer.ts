// app/stores/viewer.ts
import type { Map, StyleSpecification } from 'maplibre-gl'
import maplibregl from 'maplibre-gl'
import { defineStore } from 'pinia'

// --- 重构: 定义常量，使代码更清晰和可维护 ---

const TDT_KEY = '8c1768e11fec4006319e69e4a2a58793'
const GLYPHS_URL = 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'

// 定义基础地图的类型，用于循环和查找
const BASE_MAP_TYPES = {
  VEC: 'vec', // 矢量
  IMG: 'img', // 影像
  TER: 'ter', // 地形
} as const

type BaseMapType = typeof BASE_MAP_TYPES[keyof typeof BASE_MAP_TYPES]

// UI层使用的地图样式选项
export const MAP_STYLE_OPTIONS = [
  { name: '天地图矢量', id: BASE_MAP_TYPES.VEC },
  { name: '天地图影像', id: BASE_MAP_TYPES.IMG },
  { name: '天地图地形', id: BASE_MAP_TYPES.TER },
]

// --- 重构: 创建一个包含所有图层和源的统一地图样式 ---

const unifiedStyle: StyleSpecification = {
  version: 8,
  glyphs: GLYPHS_URL,
  sources: {
    // 矢量底图及注记
    'tdt-vec': { type: 'raster', tiles: [`https://t0.tianditu.gov.cn/vec_w/wmts?tk=${TDT_KEY}&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`], tileSize: 256 },
    'tdt-cva': { type: 'raster', tiles: [`https://t0.tianditu.gov.cn/cva_w/wmts?tk=${TDT_KEY}&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`], tileSize: 256 },
    // 影像底图及注记
    'tdt-img': { type: 'raster', tiles: [`https://t0.tianditu.gov.cn/img_w/wmts?tk=${TDT_KEY}&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`], tileSize: 256 },
    'tdt-cia': { type: 'raster', tiles: [`https://t0.tianditu.gov.cn/cia_w/wmts?tk=${TDT_KEY}&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`], tileSize: 256 },
    // 地形底图及注记
    'tdt-ter': { type: 'raster', tiles: [`https://t0.tianditu.gov.cn/ter_w/wmts?tk=${TDT_KEY}&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ter&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`], tileSize: 256 },
    'tdt-cta': { type: 'raster', tiles: [`https://t0.tianditu.gov.cn/cta_w/wmts?tk=${TDT_KEY}&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cta&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`], tileSize: 256 },
  },
  layers: [
    // 矢量图层组
    { id: 'tdt-vec-layer', type: 'raster', source: 'tdt-vec', layout: { visibility: 'none' } },
    { id: 'tdt-cva-layer', type: 'raster', source: 'tdt-cva', layout: { visibility: 'none' } },
    // 影像图层组
    { id: 'tdt-img-layer', type: 'raster', source: 'tdt-img', layout: { visibility: 'none' } },
    { id: 'tdt-cia-layer', type: 'raster', source: 'tdt-cia', layout: { visibility: 'none' } },
    // 地形图层组
    { id: 'tdt-ter-layer', type: 'raster', source: 'tdt-ter', layout: { visibility: 'none' } },
    { id: 'tdt-cta-layer', type: 'raster', source: 'tdt-cta', layout: { visibility: 'none' } },
  ],
}

// 将图层ID与类型进行映射，方便程序化控制
const layerIdMap: Record<BaseMapType, { base: string, annotation: string }> = {
  [BASE_MAP_TYPES.VEC]: { base: 'tdt-vec-layer', annotation: 'tdt-cva-layer' },
  [BASE_MAP_TYPES.IMG]: { base: 'tdt-img-layer', annotation: 'tdt-cia-layer' },
  [BASE_MAP_TYPES.TER]: { base: 'tdt-ter-layer', annotation: 'tdt-cta-layer' },
}

export const useViewerStore = defineStore('viewer', () => {
  // --- State ---
  const map = shallowRef<Map | null>(null)
  const isMapInitialized = computed(() => !!map.value)

  // 默认选中的底图类型ID
  const selectedStyleId = ref<BaseMapType>(MAP_STYLE_OPTIONS[0]!.id)
  // 控制所有注记图层的总开关
  const areAnnotationsVisible = ref(false)

  // --- Private Helper Actions ---

  /**
   * 核心重构: 更新所有图层的可见性
   * 此函数会在选中的底图或注记开关状态改变时被调用
   */
  function _updateLayerVisibility() {
    if (!map.value || !map.value.isStyleLoaded())
      return

    // 遍历所有定义的底图类型
    for (const type of Object.values(BASE_MAP_TYPES)) {
      const isSelected = type === selectedStyleId.value
      const { base: baseLayerId, annotation: annotationLayerId } = layerIdMap[type]

      // 设置底图图层的可见性
      map.value.setLayoutProperty(
        baseLayerId,
        'visibility',
        isSelected ? 'visible' : 'none',
      )

      // 根据总开关和当前是否选中，来决定注记图层的可见性
      map.value.setLayoutProperty(
        annotationLayerId,
        'visibility',
        isSelected && areAnnotationsVisible.value ? 'visible' : 'none',
      )
    }
  }

  // --- Public Actions ---

  function initMap(container: HTMLDivElement) {
    if (!container || map.value)
      return

    map.value = new maplibregl.Map({
      container,
      // 重构: 始终使用统一的样式对象
      style: unifiedStyle,
      center: [104.195397, 35.86166],
      zoom: 3.5,
      pitch: 0,
      bearing: 0,
    })

    map.value.on('load', () => {
      // 地图加载完成后，立即根据默认状态设置图层可见性
      _updateLayerVisibility()
    })
  }

  function destroyMap() {
    if (map.value) {
      map.value.remove()
      map.value = null
    }
  }

  function toggleAnnotations() {
    areAnnotationsVisible.value = !areAnnotationsVisible.value
  }

  // --- Watchers ---

  // 监听选择的样式ID和注记开关的变化，自动更新图层可见性
  watch([selectedStyleId, areAnnotationsVisible], () => {
    _updateLayerVisibility()
  })

  // --- Exports ---
  return {
    map,
    isMapInitialized,
    areAnnotationsVisible,
    // 将 mapStyleOptions 提供给UI组件（如 LayerPanel.vue）
    // 注意：它的结构变化了，组件中 v-model 需要绑定到 selectedStyleId
    mapStyleOptions: MAP_STYLE_OPTIONS,
    selectedStyleId,
    initMap,
    destroyMap,
    toggleAnnotations,
  }
})
