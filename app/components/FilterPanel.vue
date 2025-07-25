<!-- app/components/FilterPanel.vue -->
<script setup lang="ts">
import type { FilterSpecification } from 'maplibre-gl'
import { storeToRefs } from 'pinia'
import { HISTORICAL_PLACENAMES_LABEL_LAYER_ID, HISTORICAL_PLACENAMES_LAYER_ID, useHistoryStore } from '~/stores/history'
import { useUiStore } from '~/stores/ui'
import { useViewerStore } from '~/stores/viewer'
import TypeFilter from './TypeFilter.vue'
// 导入新创建的组件
import YearSlider from './YearSlider.vue'

const historyStore = useHistoryStore()
const uiStore = useUiStore()
const viewerStore = useViewerStore()

const { isLoading, selectedYear, placenamesForYear } = storeToRefs(historyStore)
const { map } = storeToRefs(viewerStore)

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
  // 直接使用 store 中的 selectedYear 来显示，确保与数据源一致
  if (selectedYear.value < 0)
    return `公元前 ${-selectedYear.value} 年`
  return `${selectedYear.value} 年`
})

// --- 监听器 ---

watch(debouncedSearchQuery, (query) => {
  if (!map.value || !map.value.getLayer(HISTORICAL_PLACENAMES_LAYER_ID) || !map.value.getLayer(HISTORICAL_PLACENAMES_LABEL_LAYER_ID))
    return

  const trimmedQuery = query.trim().toLowerCase()
  let filter: FilterSpecification | null = null
  if (trimmedQuery) {
    const namesToShow = filteredPlacenames.value.map(p => p.name)
    filter = ['in', ['get', 'name'] as any, ...namesToShow]
  }

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
    <div v-if="uiStore.isFilterPanelOpen" class="card p-4 flex flex-col gap-4 h-[calc(100vh-10rem)] w-80 left-14 top-2 absolute z-10">
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
          <!-- 直接使用计算属性 displayYear -->
          <span class="text-brand-primary font-mono font-semibold">{{ displayYear }}</span>
        </div>
        <!-- 使用新的 YearSlider 组件 -->
        <YearSlider
          id="year-slider"
          v-model="selectedYear"
          :min="-221"
          :max="1911"
          :step="1"
          :disabled="isLoading"
        />
      </div>

      <!-- 类型筛选器 -->
      <div class="pt-2 border-t border-border-base">
        <TypeFilter />
      </div>

      <!-- 结果列表 (搜索功能现在不直接控制地图，而是筛选列表) -->
      <!-- 注意: 这部分的功能需要调整，现在它只用于筛选左侧的列表，而不是直接过滤地图 -->
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
</style>
