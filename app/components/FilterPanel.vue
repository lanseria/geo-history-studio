<script setup lang="ts">
import type { FilterSpecification } from 'maplibre-gl'
import { storeToRefs } from 'pinia'
import { HISTORICAL_PLACENAMES_LAYER_ID, useHistoryStore } from '~/stores/history'
import { useUiStore } from '~/stores/ui'
import { useViewerStore } from '~/stores/viewer'

const historyStore = useHistoryStore()
const uiStore = useUiStore()
const viewerStore = useViewerStore()

const { isLoading, selectedYear, placenamesForYear } = storeToRefs(historyStore)
const { map } = storeToRefs(viewerStore)

// --- 本地状态 ---
const localYear = ref(selectedYear.value)
const debouncedYear = refDebounced(localYear, 300)

const searchQuery = ref('')
const debouncedSearchQuery = refDebounced(searchQuery, 300)

// --- 计算属性 ---
const filteredPlacenames = computed(() => {
  const query = debouncedSearchQuery.value.trim().toLowerCase()
  if (!query)
    return placenamesForYear.value

  return placenamesForYear.value.filter(p => p.name.toLowerCase().includes(query))
})

const displayYear = computed(() => {
  if (localYear.value < 0)
    return `公元前 ${-localYear.value} 年`
  return `${localYear.value} 年`
})

// --- 监听器 ---
watch(debouncedYear, (newYear) => {
  historyStore.selectedYear = newYear
  searchQuery.value = ''
})

watch(debouncedSearchQuery, (query) => {
  // [修改] 检查两个图层是否存在
  if (!map.value || !map.value.getLayer(HISTORICAL_PLACENAMES_LAYER_ID) || !map.value.getLayer(HISTORICAL_PLACENAMES_LABEL_LAYER_ID))
    return

  const trimmedQuery = query.trim().toLowerCase()
  let filter: FilterSpecification | null = null // 默认为 null (无过滤器)
  if (trimmedQuery) {
    const namesToShow = filteredPlacenames.value.map(p => p.name)
    filter = ['in', ['get', 'name'] as any, ...namesToShow]
  }

  // [修改] 为两个图层同时设置过滤器
  map.value.setFilter(HISTORICAL_PLACENAMES_LAYER_ID, filter)
  map.value.setFilter(HISTORICAL_PLACENAMES_LABEL_LAYER_ID, filter)
})

// --- 生命周期钩子 ---
onUnmounted(() => {
  historyStore.cleanupMapLayers()
})
</script>

<template>
  <Transition name="slide-fade">
    <div v-if="uiStore.isFilterPanelOpen" class="card p-4 flex flex-col gap-4 h-[calc(100vh-40rem)] w-80 left-14 top-2 absolute z-10">
      <!-- 搜索框 -->
      <div class="relative">
        <div class="i-carbon-search text-lg op-50 pointer-events-none left-3 top-1/2 absolute -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="按中文名筛选..."
          class="input-base pl-10"
        >
      </div>

      <!-- 年份滑块 -->
      <div class="pt-2 border-t border-border-base flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label for="year-slider" class="text-prose-muted font-bold">选择年份</label>
          <span class="text-brand-primary font-mono font-semibold">{{ displayYear }}</span>
        </div>
        <!-- [修改] 简化 input 的 class，将样式移至 <style> 块中 -->
        <input
          id="year-slider"
          v-model.number="localYear"
          type="range"
          min="-221"
          max="1911"
          step="1"
          class="year-slider w-full cursor-pointer"
          :disabled="isLoading"
        >
      </div>

      <!-- 结果列表 (这部分代码保持不变) -->
      <div class="pr-2 flex-1 overflow-y-auto">
        <div v-if="isLoading" class="text-prose-muted p-4 text-center">
          <div class="i-carbon-circle-dash text-2xl mx-auto animate-spin" />
          <p class="mt-2">
            正在加载数据...
          </p>
        </div>
        <ul v-else-if="filteredPlacenames.length > 0" class="flex flex-col gap-2">
          <li
            v-for="p in filteredPlacenames"
            :key="p.id"
            class="p-3 rounded-md bg-surface-base cursor-pointer transition-colors hover:bg-brand-primary/10"
            @click="historyStore.flyToPlacename(p)"
          >
            <p class="font-bold flex gap-2 items-center">
              <span
                class="rounded-full h-3 w-3 inline-block"
                :style="{ backgroundColor: p.type === '首都' ? '#F94144' : p.type === '省会' ? '#F3722C' : p.type === '州' ? '#F9C74F' : p.type === '县' ? '#90BE6D' : '#43AA8B' }"
              />
              <span>{{ p.name }}</span>
              <span class="text-xs font-normal ml-auto opacity-70">({{ p.type }})</span>
            </p>
            <p v-if="p.traditionalName" class="text-sm pl-5 opacity-80">
              繁: {{ p.traditionalName }}
            </p>
          </li>
        </ul>
        <div v-else class="text-prose-muted p-4 text-center">
          <template v-if="placenamesForYear.length > 0">
            无匹配的筛选结果。
          </template>
          <template v-else>
            该年份无匹配地名数据。
          </template>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* 原有样式保持不变 */
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

/* [新增] 自定义 range input 样式 */
.year-slider {
  -webkit-appearance: none; /* 移除 webkit 的默认样式 */
  appearance: none;
  width: 100%;
  height: 8px; /* 轨道高度 */
  background: transparent; /* input 自身背景透明 */
  outline: none;
}

/* 轨道样式 - Webkit (Chrome, Safari) */
.year-slider::-webkit-slider-runnable-track {
  width: 100%;
  height: 8px;
  cursor: pointer;
  background-color: var(--color-surface-muted);
  border-radius: 9999px; /* 圆角轨道 */
}

/* 滑块按钮样式 - Webkit */
.year-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: var(--color-brand-primary);
  cursor: pointer;
  margin-top: -4px; /* 垂直居中滑块按钮 */
}

/* 轨道样式 - Firefox */
.year-slider::-moz-range-track {
  width: 100%;
  height: 8px;
  cursor: pointer;
  background: var(--color-surface-muted);
  border-radius: 9999px;
  border: none;
}

/* 滑块按钮样式 - Firefox */
.year-slider::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: var(--color-brand-primary);
  cursor: pointer;
  border: none;
}

.year-slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
/* 禁用时，滑块按钮和轨道样式也需要调整 */
.year-slider:disabled::-webkit-slider-thumb {
  background: var(--color-prose-muted);
}
.year-slider:disabled::-moz-range-thumb {
  background: var(--color-prose-muted);
}
</style>
