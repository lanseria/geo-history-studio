<!-- app/components/FlyToActionEditor.vue -->
<script setup lang="ts">
import { useFlyToActionStore } from '~/stores/flyToAction'
import { useUiStore } from '~/stores/ui'

const uiStore = useUiStore()
const flyToActionStore = useFlyToActionStore()

// 模拟方法，实际应调用地图API
function flyToViewpoint(vp: any) {
  flyToActionStore.selectedViewpointId = vp.id
  console.log('飞向视点:', vp.name, vp.cameraOptions)
  // 在这里调用 viewerStore.map.flyTo(vp.cameraOptions)
}

function playRoute() {
  console.log('开始播放路线:', flyToActionStore.activeRoute?.name)
  // 在这里实现完整的播放逻辑
}
</script>

<template>
  <Transition name="slide-up">
    <div
      v-if="uiStore.isFlyToActionEditorOpen"
      class="card p-0 border-t-2 border-border-base flex flex-col h-80 w-full shadow-2xl bottom-0 left-0 absolute z-20 overflow-hidden"
    >
      <!-- 编辑器头部 -->
      <header class="p-3 border-b border-border-base flex flex-shrink-0 items-center justify-between">
        <div class="flex gap-4 items-center">
          <h2 class="text-lg font-bold">
            视点飞行编辑器
          </h2>
          <!-- 路线选择 -->
          <select v-model="flyToActionStore.activeRouteId" class="input-base w-48 !py-1">
            <option v-for="route in flyToActionStore.routes" :key="route.id" :value="route.id">
              {{ route.name }}
            </option>
          </select>
          <button class="text-sm btn flex items-center !py-1">
            <div i-carbon-add class="mr-1" /> 新建路线
          </button>
        </div>
        <button class="icon-btn" title="关闭编辑器" @click="uiStore.toggleFlyToActionEditor">
          <div i-carbon-close />
        </button>
      </header>

      <!-- 编辑器主体 -->
      <div v-if="flyToActionStore.activeRoute" class="p-3 flex-1 overflow-y-auto">
        <!-- 镜头列表 -->
        <div class="flex flex-col gap-2">
          <div
            v-for="(vp, index) in flyToActionStore.activeRoute.viewpoints"
            :key="vp.id"
            class="p-2 rounded-md flex gap-3 transition-colors items-center"
            :class="flyToActionStore.selectedViewpointId === vp.id ? 'bg-brand-primary/10' : 'bg-surface-muted'"
          >
            <span class="text-prose-muted font-mono text-center w-6">{{ index + 1 }}</span>
            <input v-model="vp.name" type="text" class="input-base flex-1 !py-1" placeholder="镜头名称">

            <label class="text-sm flex gap-1 items-center">飞行 <input v-model.number="vp.duration" type="number" min="1" class="input-base text-center w-16 !py-1"> 秒</label>
            <label class="text-sm flex gap-1 items-center">停留 <input v-model.number="vp.pause" type="number" min="0" class="input-base text-center w-16 !py-1"> 秒</label>

            <div class="ml-auto flex gap-1 items-center">
              <button class="text-base icon-btn" title="定位到此视点" @click="flyToViewpoint(vp)">
                <div i-carbon-location />
              </button>
              <button class="text-base icon-btn" title="使用当前地图视角更新此镜头">
                <div i-carbon-camera-action />
              </button>
              <button class="text-base icon-btn text-red-500" title="删除此镜头">
                <div i-carbon-trash-can />
              </button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="flyToActionStore.activeRoute.viewpoints.length === 0" class="text-prose-muted p-8 text-center">
          <p>当前路线没有镜头。</p>
          <p class="text-sm">
            请调整地图视角，然后点击下方 "添加当前视点为镜头" 按钮。
          </p>
        </div>
      </div>

      <!-- 编辑器底部操作栏 -->
      <footer class="p-3 border-t border-border-base bg-surface-muted flex flex-shrink-0 items-center justify-between">
        <button class="btn flex items-center">
          <div i-carbon-add-large class="mr-2" />
          添加当前视点为镜头
        </button>
        <div class="flex gap-2 items-center">
          <button class="btn bg-green-600 flex items-center hover:bg-green-700" @click="playRoute">
            <div i-carbon-play-filled-alt class="mr-2" />
            播放此路线
          </button>
          <button class="btn bg-gray-500 flex items-center hover:bg-gray-600">
            <div i-carbon-save class="mr-2" />
            保存
          </button>
        </div>
      </footer>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
