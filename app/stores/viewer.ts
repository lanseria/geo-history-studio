// app/stores/viewer.ts
import type { Map, StyleSpecification } from 'maplibre-gl'
import maplibregl from 'maplibre-gl'
import { defineStore } from 'pinia'

// ... (接口定义和常量保持不变)
interface MapStyleOption {
  name: string
  style: string | StyleSpecification
}
const ANNOTATION_LAYER_IDS = [
  'tdt-cva-layer',
  'tdt-cia-layer',
  'tdt-cta-layer',
]

// 定义一个公共的字体源 URL
const GLYPHS_URL = 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'

export const useViewerStore = defineStore('viewer', () => {
  // --- State ---
  const map = shallowRef<Map | null>(null)
  const isMapInitialized = computed(() => !!map.value)
  const areAnnotationsVisible = ref(false)

  const tdtKey = '8c1768e11fec4006319e69e4a2a58793'

  const mapStyles: MapStyleOption[] = [
    {
      name: '天地图矢量',
      style: {
        version: 8,
        glyphs: GLYPHS_URL, // 添加字体源
        sources: {
          'tdt-vec': { type: 'raster', tiles: [`https://t0.tianditu.gov.cn/vec_w/wmts?tk=${tdtKey}&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`], tileSize: 256 },
          'tdt-cva': { type: 'raster', tiles: [`https://t0.tianditu.gov.cn/cva_w/wmts?tk=${tdtKey}&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`], tileSize: 256 },
        },
        layers: [
          { id: 'tdt-vec-layer', type: 'raster', source: 'tdt-vec' },
          { id: 'tdt-cva-layer', type: 'raster', source: 'tdt-cva' },
        ],
      },
    },
    {
      name: '天地图影像',
      style: {
        version: 8,
        glyphs: GLYPHS_URL, // 添加字体源
        sources: {
          'tdt-img': { type: 'raster', tiles: [`https://t0.tianditu.gov.cn/img_w/wmts?tk=${tdtKey}&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`], tileSize: 256 },
          'tdt-cia': { type: 'raster', tiles: [`https://t0.tianditu.gov.cn/cia_w/wmts?tk=${tdtKey}&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`], tileSize: 256 },
        },
        layers: [
          { id: 'tdt-img-layer', type: 'raster', source: 'tdt-img' },
          { id: 'tdt-cia-layer', type: 'raster', source: 'tdt-cia' },
        ],
      },
    },
    {
      name: '天地图地形',
      style: {
        version: 8,
        glyphs: GLYPHS_URL, // 添加字体源
        sources: {
          'tdt-ter': { type: 'raster', tiles: [`https://t0.tianditu.gov.cn/ter_w/wmts?tk=${tdtKey}&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ter&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`], tileSize: 256 },
          'tdt-cta': { type: 'raster', tiles: [`https://t0.tianditu.gov.cn/cta_w/wmts?tk=${tdtKey}&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cta&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`], tileSize: 256 },
        },
        layers: [
          { id: 'tdt-ter-layer', type: 'raster', source: 'tdt-ter' },
          { id: 'tdt-cta-layer', type: 'raster', source: 'tdt-cta' },
        ],
      },
    },
  ]

  const selectedStyleName = ref<string>(mapStyles[0]!.name)

  // ... (其余代码保持不变)
  function _applyAnnotationVisibility() {
    if (!map.value || !map.value.isStyleLoaded())
      return

    const visibility = areAnnotationsVisible.value ? 'visible' : 'none'
    ANNOTATION_LAYER_IDS.forEach((layerId) => {
      if (map.value!.getLayer(layerId))
        map.value!.setLayoutProperty(layerId, 'visibility', visibility)
    })
  }

  function initMap(container: HTMLDivElement) {
    if (!container || map.value)
      return

    const selectedOption = mapStyles.find(s => s.name === selectedStyleName.value)
    if (!selectedOption)
      return

    map.value = new maplibregl.Map({
      container,
      style: selectedOption.style,
      center: [104.195397, 35.86166],
      zoom: 3.5,
      pitch: 0,
      bearing: 0,
    })

    // map.value.addControl(new maplibregl.NavigationControl({}), 'top-right')

    map.value.on('load', () => {
      _applyAnnotationVisibility()
    })
  }

  function destroyMap() {
    if (map.value) {
      map.value.remove()
      map.value = null
    }
  }

  function updateMapStyle() {
    if (!map.value)
      return
    const selectedOption = mapStyles.find(s => s.name === selectedStyleName.value)
    if (selectedOption) {
      map.value.setStyle(selectedOption.style)
      map.value.once('styledata', () => {
        _applyAnnotationVisibility()
      })
    }
  }

  function toggleAnnotations() {
    areAnnotationsVisible.value = !areAnnotationsVisible.value
    _applyAnnotationVisibility()
  }

  watch(selectedStyleName, updateMapStyle)

  return {
    map,
    isMapInitialized,
    areAnnotationsVisible,
    mapStyles,
    selectedStyleName,
    initMap,
    destroyMap,
    toggleAnnotations,
  }
})
