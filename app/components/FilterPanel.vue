<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useHistoryStore } from '~/stores/history'
import { useUiStore } from '~/stores/ui'

const historyStore = useHistoryStore()
const uiStore = useUiStore()

// const {
//   isLoading,
//   selectedYear,
//   placenamesForYear,
// } = storeToRefs(historyStore)

const localYear = ref(selectedYear.value)

const debouncedYear = refDebounced(localYear, 100)

watch(debouncedYear, (newYear) => {
  historyStore.selectedYear = newYear
})

// 将公元前年份显示为 "公元前 XXX"
const displayYear = computed(() => {
  if (localYear.value < 0)
    return `公元前 ${-localYear.value} 年`
  return `${localYear.value} 年`
})
</script>

<template>
  <Transition name="slide-fade">
    <div
      v-if="uiStore.isFilterPanelOpen"
      class="card p-4 flex flex-col gap-4 h-[calc(100vh-3rem)] w-80 left-20 top-4 absolute z-10"
    >
      <h2 class="text-xl font-bold pb-2 border-b border-border-base">
        按年份检索
      </h2>

      <!-- Year Slider -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <label for="year-slider" class="text-prose-muted font-bold">选择年份</label>
          <span class="text-brand-primary font-mono font-semibold">{{ displayYear }}</span>
        </div>
        <input
          id="year-slider"
          v-model.number="localYear"
          type="range"
          min="-221"
          max="1911"
          step="1"
          class="appearance-none accent-brand-primary rounded-lg bg-surface-muted h-2 w-full cursor-pointer"
          :disabled="isLoading"
        >
      </div>

      <!-- Results List -->
      <div class="pr-2 flex-1 overflow-y-auto">
        <div v-if="isLoading" class="text-prose-muted p-4 text-center">
          <div class="i-carbon-circle-dash text-2xl mx-auto animate-spin" />
          <p class="mt-2">
            正在加载数据...
          </p>
        </div>
        <ul v-else-if="placenamesForYear.length > 0" class="flex flex-col gap-2">
          <li
            v-for="p in placenamesForYear"
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
          该年份无匹配地名数据。
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Custom scrollbar */
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

/* Slide transition */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

input[type='range']:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
