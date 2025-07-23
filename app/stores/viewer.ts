// app/stores/viewer.ts
import * as Cesium from 'cesium'
import { defineStore } from 'pinia'
import { computed, ref, shallowRef, watch } from 'vue'

// ----- 接口定义 (为了代码清晰和类型安全) -----

// 图层选项接口
interface ImageryLayerOption {
  name: string
  type: 'UrlTemplate' | 'Tianditu'
  url: string
  layer?: string // 天地图专用: vec, img, ter
}

// 地形选项接口
interface TerrainOption {
  name: string
  type: 'None' | 'CesiumWorldTerrain'
}

// ----- Store 定义 -----

export const useViewerStore = defineStore('viewer', () => {
  // --- State ---

  /**
   * Cesium Viewer 实例。
   * 使用 shallowRef 来存储，因为 Viewer 对象非常复杂，
   * 深度代理它会带来不必要的性能开销，且我们只需要它的顶层引用。
   */
  const viewer = shallowRef<Cesium.Viewer | null>(null)

  // 内部状态，用于追踪当前加载的图层，方便管理
  const currentBaseLayer = shallowRef<Cesium.ImageryLayer | null>(null)
  const currentLabelLayer = shallowRef<Cesium.ImageryLayer | null>(null)

  // --- 静态配置数据 ---
  const tdtKey = '8c1768e11fec4006319e69e4a2a58793'
  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkMDc3MzE1MC1lZWMwLTQzNWEtYTVhZS0yZTllNDA4M2U2YjciLCJpZCI6MTE2MDc4LCJpYXQiOjE2NjkzNjU5NDN9.Wo46xHPOIeZR6EQLJ7bstGKVHeTUyzYi2cPapU8-tOs'

  const baseLayers: ImageryLayerOption[] = [
    { name: '天地图影像', type: 'Tianditu', url: `https://t0.tianditu.gov.cn/img_w/wmts?tk=${tdtKey}`, layer: 'img' },
    { name: '天地图矢量', type: 'Tianditu', url: `https://t0.tianditu.gov.cn/vec_w/wmts?tk=${tdtKey}`, layer: 'vec' },
    { name: '天地图地形', type: 'Tianditu', url: `https://t0.tianditu.gov.cn/ter_w/wmts?tk=${tdtKey}`, layer: 'ter' },
    { name: 'ArcGIS 影像', type: 'UrlTemplate', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
    { name: 'ArcGIS 海洋', type: 'UrlTemplate', url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}' },
    { name: 'ArcGIS 地貌', type: 'UrlTemplate', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}' },
  ]

  const tiandituLabelLayer: ImageryLayerOption = {
    name: '天地图矢量注记',
    type: 'Tianditu',
    url: `https://t0.tianditu.gov.cn/cva_w/wmts?tk=${tdtKey}`,
    layer: 'cva',
  }

  const terrainOptions: TerrainOption[] = [
    { name: '无地形', type: 'None' },
    { name: 'Cesium 全球地形', type: 'CesiumWorldTerrain' },
  ]

  // --- 响应式状态 (UI交互) ---

  const selectedLayerName = ref<string>(baseLayers[0]!.name)
  const showLabels = ref<boolean>(true)
  const selectedTerrainName = ref<TerrainOption['name']>(terrainOptions[1]!.name)

  // --- Getters (Computed) ---

  const isViewerInitialized = computed(() => !!viewer.value)

  // --- 私有辅助函数 (不导出) ---

  function createImageryProvider(option: ImageryLayerOption): Cesium.ImageryProvider {
    if (option.type === 'Tianditu') {
      return new Cesium.WebMapTileServiceImageryProvider({
        url: option.url,
        layer: option.layer!,
        style: 'default',
        tileMatrixSetID: 'w',
        format: 'tiles',
        maximumLevel: 18,
      })
    }
    else { // 'UrlTemplate'
      return new Cesium.UrlTemplateImageryProvider({ url: option.url, maximumLevel: 18 })
    }
  }

  // --- Actions ---

  /**
   * 初始化 Viewer
   * @param container - 挂载 Viewer 的 HTMLDivElement
   */
  function initViewer(container: HTMLDivElement) {
    if (!container)
      return

    viewer.value = new Cesium.Viewer(container, {
      baseLayer: false,
      terrainShadows: Cesium.ShadowMode.ENABLED,
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
      scene3DOnly: true,
    })

    viewer.value.scene.globe.depthTestAgainstTerrain = false

    // 初始加载
    updateBaseLayer()
    updateLabelLayer()
    updateTerrain() // 初始调用
  }

  /**
   * 销毁 Viewer 实例，释放资源
   */
  function destroyViewer() {
    if (viewer.value && !viewer.value.isDestroyed()) {
      viewer.value.destroy()
    }
    viewer.value = null
    currentBaseLayer.value = null
    currentLabelLayer.value = null
  }

  function updateBaseLayer() {
    if (!viewer.value)
      return
    if (currentBaseLayer.value) {
      viewer.value.imageryLayers.remove(currentBaseLayer.value, false)
      currentBaseLayer.value = null
    }
    const selectedOption = baseLayers.find(l => l.name === selectedLayerName.value)
    if (selectedOption) {
      const provider = createImageryProvider(selectedOption)
      currentBaseLayer.value = viewer.value.imageryLayers.addImageryProvider(provider, 0)
    }
  }

  function updateLabelLayer() {
    if (!viewer.value)
      return
    if (currentLabelLayer.value) {
      viewer.value.imageryLayers.remove(currentLabelLayer.value, false)
      currentLabelLayer.value = null
    }
    if (showLabels.value) {
      const provider = createImageryProvider(tiandituLabelLayer)
      currentLabelLayer.value = viewer.value.imageryLayers.addImageryProvider(provider)
    }
  }

  async function updateTerrain() {
    if (!viewer.value)
      return
    const selectedOption = terrainOptions.find(t => t.name === selectedTerrainName.value)
    if (selectedOption) {
      if (selectedOption.type === 'None') {
        viewer.value.terrainProvider = new Cesium.EllipsoidTerrainProvider()
      }
      else if (selectedOption.type === 'CesiumWorldTerrain') {
        try {
          const terrainProvider = await Cesium.createWorldTerrainAsync({
            requestVertexNormals: true,
            requestWaterMask: true,
          })
          viewer.value.terrainProvider = terrainProvider
        }
        catch (error) {
          console.error('加载 Cesium 全球地形失败:', error)
          viewer.value.terrainProvider = new Cesium.EllipsoidTerrainProvider()
        }
      }
    }
  }

  /**
   * 截图功能
   */
  async function takeScreenshot() {
    if (!viewer.value)
      return

    // 强制先渲染一帧，确保获取到最新画面
    viewer.value.scene.render()

    const canvas = viewer.value.canvas
    const dataUrl = canvas.toDataURL('image/png')

    // 创建一个临时的 a 标签来触发下载
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `map-screenshot-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // --- Watchers ---
  // 在 Store 内部监听状态变化，自动执行更新地图的 Action
  watch(selectedLayerName, updateBaseLayer)
  watch(showLabels, updateLabelLayer)
  watch(selectedTerrainName, updateTerrain)

  return {
    // State
    viewer,
    baseLayers,
    terrainOptions,
    selectedLayerName,
    showLabels,
    selectedTerrainName,
    // Getters
    isViewerInitialized,
    // Actions
    initViewer,
    destroyViewer,
    takeScreenshot, // 暴露截图方法
  }
})
