import type { CameraOptions } from 'maplibre-gl'
// app/stores/flyToAction.ts
import { defineStore } from 'pinia'

// 定义单个镜头的类型
export interface Viewpoint {
  id: string
  name: string
  cameraOptions: CameraOptions // MapLibre的相机参数
  duration: number // 飞到此镜头所需时间 (秒)
  pause: number // 在此镜头停留时间 (秒)
}

// 定义单条飞行路线的类型
export interface FlyToRoute {
  id: string
  name: string
  viewpoints: Viewpoint[]
}

export const useFlyToActionStore = defineStore('flyToAction', () => {
  // --- State ---
  // 所有保存的飞行路线
  const routes = ref<FlyToRoute[]>([
    // 添加一些模拟数据用于UI展示
    {
      id: 'route-1',
      name: '城市巡览',
      viewpoints: [
        { id: 'vp-1-1', name: '全景', cameraOptions: { center: [116.39, 39.9], zoom: 10, pitch: 0 }, duration: 5, pause: 2 },
        { id: 'vp-1-2', name: '故宫', cameraOptions: { center: [116.397, 39.915], zoom: 15, pitch: 45 }, duration: 8, pause: 3 },
        { id: 'vp-1-3', name: '鸟巢', cameraOptions: { center: [116.391, 39.993], zoom: 16, pitch: 60 }, duration: 8, pause: 3 },
      ],
    },
    {
      id: 'route-2',
      name: '演示路线二',
      viewpoints: [],
    },
  ])

  // 当前正在编辑或预览的路线ID
  const activeRouteId = ref<string | null>(routes.value[0]?.id || null)

  // 当前选中的镜头ID，用于高亮显示
  const selectedViewpointId = ref<string | null>(null)

  // --- Getters ---
  const activeRoute = computed(() => routes.value.find(r => r.id === activeRouteId.value) || null)

  // --- Actions ---
  // (后续将在这里添加增删改查路线和镜头的逻辑)
  function addRoute(name: string) {
    const newRoute: FlyToRoute = {
      id: `route-${Date.now()}`,
      name,
      viewpoints: [],
    }
    routes.value.push(newRoute)
    activeRouteId.value = newRoute.id
  }

  function addViewpointFromCurrentMap(name: string, map: any) {
    if (!activeRoute.value || !map)
      return

    const newViewpoint: Viewpoint = {
      id: `vp-${Date.now()}`,
      name,
      cameraOptions: {
        center: map.getCenter(),
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing(),
      },
      duration: 5,
      pause: 2,
    }
    activeRoute.value.viewpoints.push(newViewpoint)
  }

  return {
    routes,
    activeRouteId,
    selectedViewpointId,
    activeRoute,
    addRoute,
    addViewpointFromCurrentMap,
  }
})
