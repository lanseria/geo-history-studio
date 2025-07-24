// app/stores/viewer.ts
import type { Map, StyleSpecification } from 'maplibre-gl'
import maplibregl from 'maplibre-gl'
import { defineStore } from 'pinia'

// 定义图层样式接口
interface MapStyleOption {
  name: string
  style: string | StyleSpecification
}

export const useViewerStore = defineStore('viewer', () => {
  // --- State ---
  const map = shallowRef<Map | null>(null)
  const isMapInitialized = computed(() => !!map.value)
  const areAnnotationsVisible = ref(false)

  const config = useRuntimeConfig()
  const tdtKey = config.public.tdtKey

  // MapLibre 的样式可以是 URL 或一个完整的 Style Object
  const mapStyles: MapStyleOption[] = [
    {
      name: '天地图矢量',
      style: {
        version: 8,
        sources: {
          'tdt-vec': {
            type: 'raster',
            tiles: [`https://t0.tianditu.gov.cn/vec_w/wmts?tk=${tdtKey}&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`],
            tileSize: 256,
          },
          'tdt-cva': { // 注记
            type: 'raster',
            tiles: [`https://t0.tianditu.gov.cn/cva_w/wmts?tk=${tdtKey}&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`],
            tileSize: 256,
          },
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
        sources: {
          'tdt-img': {
            type: 'raster',
            tiles: [`https://t0.tianditu.gov.cn/img_w/wmts?tk=${tdtKey}&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`],
            tileSize: 256,
          },
          'tdt-cia': { // 影像注记
            type: 'raster',
            tiles: [`https://t0.tianditu.gov.cn/cia_w/wmts?tk=${tdtKey}&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`],
            tileSize: 256,
          },
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
        sources: {
          'tdt-ter': { // 地形晕渲
            type: 'raster',
            tiles: [`https://t0.tianditu.gov.cn/ter_w/wmts?tk=${tdtKey}&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ter&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`],
            tileSize: 256,
          },
          'tdt-cta': { // 地形注记
            type: 'raster',
            tiles: [`https://t0.tianditu.gov.cn/cta_w/wmts?tk=${tdtKey}&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cta&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`],
            tileSize: 256,
          },
        },
        layers: [
          { id: 'tdt-ter-layer', type: 'raster', source: 'tdt-ter' },
          { id: 'tdt-cta-layer', type: 'raster', source: 'tdt-cta' },
        ],
      },
    },
  ]

  const selectedStyleName = ref<string>(mapStyles[0]!.name)

  // --- Private Helper ---
  /**
   * 根据当前注记可见性状态，准备要应用的地图样式
   * @returns 修改了注记图层可见性的样式对象副本
   */
  function getStyleWithAppliedAnnotationVisibility() {
    const styleOption = mapStyles.find(s => s.name === selectedStyleName.value)
    if (!styleOption || typeof styleOption.style === 'string')
      return null

    // 深拷贝样式对象，避免修改原始定义
    const styleCopy: StyleSpecification = JSON.parse(JSON.stringify(styleOption.style))

    // 查找所有注记图层 (约定以 a-layer 结尾, 如 tdt-cva-layer)
    styleCopy.layers.forEach((layer) => {
      if (layer.id.endsWith('a-layer')) {
        // 确保 layout 属性存在
        if (!layer.layout)
          layer.layout = {}
        // 根据状态设置可见性
        layer.layout.visibility = areAnnotationsVisible.value ? 'visible' : 'none'
      }
    })
    return styleCopy
  }

  // --- Actions ---
  function initMap(container: HTMLDivElement) {
    if (!container || map.value)
      return

    const initialStyle = getStyleWithAppliedAnnotationVisibility()
    if (!initialStyle)
      return

    map.value = new maplibregl.Map({
      container,
      style: initialStyle,
      center: [104.195397, 35.86166], // 中国中心点
      zoom: 3.5,
      pitch: 0,
      bearing: 0,
    })

    // 添加控制器 (缩放、旋转)
    map.value.addControl(new maplibregl.NavigationControl({}), 'top-right')
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
    const newStyle = getStyleWithAppliedAnnotationVisibility()
    if (newStyle)
      map.value.setStyle(newStyle)
  }

  function toggleAnnotations() {
    areAnnotationsVisible.value = !areAnnotationsVisible.value
    // 切换后，立即更新地图样式以应用更改
    updateMapStyle()
  }

  // --- Watchers ---
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
