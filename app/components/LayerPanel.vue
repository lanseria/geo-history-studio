<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUiStore } from '~/stores/ui'
import { useViewerStore } from '~/stores/viewer'

const viewerStore = useViewerStore()
const uiStore = useUiStore()

// 使用 storeToRefs 来保持响应性
const { areAnnotationsVisible } = storeToRefs(viewerStore)
</script>

<template>
  <Transition name="slide-fade">
    <div
      v-if="uiStore.isLayerPanelOpen"
      class="card p-4 flex flex-col gap-4 w-64 left-20 top-4 absolute z-10"
    >
      <!-- 底图切换 -->
      <div class="flex flex-col gap-2">
        <label class="text-prose-muted font-bold">地图样式</label>
        <select v-model="viewerStore.selectedStyleName" class="text-sm input-base !py-1">
          <option v-for="style in viewerStore.mapStyles" :key="style.name" :value="style.name">
            {{ style.name }}
          </option>
        </select>
      </div>

      <!-- [新增] 叠加层控制 -->
      <div class="pt-3 border-t border-border-base flex flex-col gap-3">
        <label class="text-prose-muted font-bold">叠加层</label>
        <!-- 注记开关 -->
        <div class="flex items-center justify-between">
          <span>显示注记</span>
          <button
            class="p-1 rounded-full flex h-6 w-12 transition-colors duration-300 ease-in-out items-center"
            :class="areAnnotationsVisible ? 'bg-brand-primary' : 'bg-surface-base'"
            @click="viewerStore.toggleAnnotations"
          >
            <span
              class="rounded-full bg-white h-4 w-4 block shadow-md transform transition-transform duration-300 ease-in-out"
              :class="{ 'translate-x-6': areAnnotationsVisible }"
            />
          </button>
        </div>
      </div>

      <!-- 这里可以为以后添加其他图层控制，如叠加层开关等 -->
    </div>
  </Transition>
</template>

<style scoped>
/* Slide transition (保持不变) */
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
