<!-- app/components/DataPanel.vue -->
<script setup lang="ts">
import { useUiStore } from '~/stores/ui'

const uiStore = useUiStore()

// --- 模拟数据，用于UI展示 ---
const dummyLayers = ref([
  { id: 1, name: '司令部', type: 'Point', visible: true },
  { id: 2, name: '进攻路线A', type: 'LineString', visible: true },
  { id: 3, name: '集结区', type: 'Polygon', visible: false },
  { id: 4, name: '攻击箭头1', type: 'Military', visible: true },
  { id: 5, name: '导入的边界', type: 'KML', visible: true },
  { id: 6, name: '航拍影像图', type: 'GeoTIFF', visible: true },
  { id: 7, name: '作战会议室模型', type: '3DModel', visible: true },
])

// 将模拟数据分组，以便在UI中分类显示
const groupedLayers = computed(() => {
  const groups: Record<string, any[]> = {
    '标绘 - 点': [],
    '标绘 - 线': [],
    '标绘 - 面': [],
    '标绘 - 军事符号': [],
    '导入数据': [],
    '3D模型': [],
  }
  dummyLayers.value.forEach((layer) => {
    if (layer.type === 'Point')
      groups['标绘 - 点'].push(layer)
    else if (layer.type === 'LineString')
      groups['标绘 - 线'].push(layer)
    else if (layer.type === 'Polygon')
      groups['标绘 - 面'].push(layer)
    else if (layer.type === 'Military')
      groups['标绘 - 军事符号'].push(layer)
    else if (layer.type === 'KML' || layer.type === 'GeoTIFF')
      groups['导入数据'].push(layer)
    else if (layer.type === '3DModel')
      groups['3D模型'].push(layer)
  })
  return groups
})

// 模拟的切换可见性方法
function toggleVisibility(layer: { visible: boolean }) {
  layer.visible = !layer.visible
}
</script>

<template>
  <Transition name="slide-fade">
    <div v-if="uiStore.isDataPanelOpen" class="card p-4 flex flex-col gap-4 h-[calc(100vh-5rem)] w-96 left-14 top-2 absolute z-10">
      <!-- 面板头部 -->
      <div class="pb-3 border-b border-border-base flex items-center justify-between">
        <h2 class="text-lg font-bold">
          数据与标绘
        </h2>
        <button class="icon-btn" title="关闭面板" @click="uiStore.toggleDataPanel">
          <div i-carbon-close />
        </button>
      </div>

      <!-- 工具区 -->
      <div class="flex flex-col gap-4">
        <!-- 基础标绘 -->
        <div>
          <label class="text-sm text-prose-muted font-semibold">基础标绘</label>
          <div class="mt-2 gap-2 grid grid-cols-4">
            <button class="btn flex flex-col gap-1 items-center !p-2" title="绘制点">
              <div i-gis-point class="text-lg" />点
            </button>
            <button class="btn flex flex-col gap-1 items-center !p-2" title="绘制线">
              <div i-gis-polyline-pt class="text-lg" />线
            </button>
            <button class="btn flex flex-col gap-1 items-center !p-2" title="绘制面">
              <div i-gis-polygon-pt class="text-lg" />面
            </button>
            <button class="btn flex flex-col gap-1 items-center !p-2" title="绘制圆">
              <div i-gis-circle-o class="text-lg" />圆
            </button>
          </div>
        </div>
        <!-- 专业符号 -->
        <div>
          <label class="text-sm text-prose-muted font-semibold">专业符号</label>
          <div class="mt-2 gap-2 grid grid-cols-4">
            <button class="btn flex flex-col gap-1 items-center !p-2" title="进攻箭头">
              <div i-carbon-arrow-shift-down class="text-lg" />进攻
            </button>
            <button class="btn flex flex-col gap-1 items-center !p-2" title="钳击箭头">
              <div i-carbon-connect-source class="text-lg" />钳击
            </button>
          </div>
        </div>

        <!-- 数据导入 -->
        <div>
          <label class="text-sm text-prose-muted font-semibold">数据导入</label>
          <div class="mt-2 gap-2 grid grid-cols-4">
            <button class="btn flex flex-col gap-1 items-center !p-2" title="导入 KML/SHP">
              <div i-carbon-document-import class="text-lg" />矢量
            </button>
            <button class="btn flex flex-col gap-1 items-center !p-2" title="导入 GeoTIFF">
              <div i-carbon-image-search class="text-lg" />栅格
            </button>
            <button class="btn flex flex-col gap-1 items-center !p-2" title="导入图片">
              <div i-carbon-image class="text-lg" />图片
            </button>
            <button class="btn flex flex-col gap-1 items-center !p-2" title="导入 GLB/GLTF">
              <div i-carbon-cube-view class="text-lg" />模型
            </button>
          </div>
        </div>
      </div>

      <!-- 图层管理 -->
      <div class="pt-4 border-t border-border-base flex flex-1 flex-col overflow-hidden">
        <label class="text-sm text-prose-muted font-semibold mb-2">图层管理</label>
        <div class="pr-2 flex-1 overflow-y-auto">
          <div v-for="(layers, groupName) in groupedLayers" :key="groupName">
            <div v-if="layers.length > 0" class="mb-3">
              <p class="text-xs text-prose-muted font-bold mb-1 uppercase">
                {{ groupName }}
              </p>
              <ul class="flex flex-col gap-1">
                <li
                  v-for="layer in layers"
                  :key="layer.id"
                  class="p-2 rounded-md flex gap-2 items-center hover:bg-surface-muted"
                >
                  <span class="flex-1 truncate">{{ layer.name }}</span>
                  <div class="flex gap-1 items-center">
                    <button class="text-base icon-btn" title="编辑样式" @click.stop>
                      <div i-carbon-edit />
                    </button>
                    <button class="text-base icon-btn" :title="layer.visible ? '隐藏' : '显示'" @click.stop="toggleVisibility(layer)">
                      <div :class="layer.visible ? 'i-carbon-view' : 'i-carbon-view-off'" />
                    </button>
                    <button class="text-base icon-btn text-red-500" title="删除" @click.stop>
                      <div i-carbon-trash-can />
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* 样式与 FilterPanel/LayerPanel 保持一致 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: var(--color-border-base);
  border-radius: 10px;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
</style>
