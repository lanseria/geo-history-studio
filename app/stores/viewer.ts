import type { Map, RasterSourceSpecification, StyleSpecification } from 'maplibre-gl'
import maplibregl from 'maplibre-gl'
// app/stores/viewer.ts
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
  ]

  const selectedStyleName = ref<string>(mapStyles[0]!.name)

  // --- Actions ---
  function initMap(container: HTMLDivElement) {
    if (!container || map.value)
      return

    const selectedOption = mapStyles.find(s => s.name === selectedStyleName.value)
    if (!selectedOption)
      return

    map.value = new maplibregl.Map({
      container,
      style: selectedOption.style,
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
    const selectedOption = mapStyles.find(s => s.name === selectedStyleName.value)
    if (selectedOption)
      map.value.setStyle(selectedOption.style)
  }

  // --- Watchers ---
  watch(selectedStyleName, updateMapStyle)

  return {
    map,
    isMapInitialized,
    mapStyles,
    selectedStyleName,
    initMap,
    destroyMap,
  }
})
