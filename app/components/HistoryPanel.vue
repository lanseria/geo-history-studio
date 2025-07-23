<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useHistoryStore } from '~/stores/history'

const historyStore = useHistoryStore()

// Use storeToRefs to make state and getters reactive in the template
const {
  isLoading,
  searchTerm,
  selectedType,
  uniqueTypes,
  filteredPlacenames,
} = storeToRefs(historyStore)

// Fetch data when the component is mounted
onMounted(() => {
  historyStore.fetchPlacenames()
})
</script>

<template>
  <div class="text-white p-3 rounded bg-gray-800/70 flex flex-col gap-4 h-[calc(100%-1rem)] w-80 right-2 top-2 absolute z-10 backdrop-blur-sm">
    <h2 class="text-xl font-bold pb-2 border-b border-gray-600">
      历史地名检索
    </h2>

    <!-- Search and Filter Controls -->
    <div class="flex flex-col gap-3">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="按名称搜索 (如: 长安)"
        class="text-white p-2 border border-gray-600 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
      <select
        v-model="selectedType"
        class="text-white p-2 border border-gray-600 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <option v-for="type in uniqueTypes" :key="type" :value="type">
          {{ type === '全部' ? '按类型筛选' : type }}
        </option>
      </select>
    </div>

    <!-- Results List -->
    <div class="pr-1 flex-1 overflow-y-auto">
      <div v-if="isLoading" class="p-4 text-center">
        正在加载数据...
      </div>
      <ul v-else-if="filteredPlacenames.length > 0" class="flex flex-col gap-2">
        <li
          v-for="placename in filteredPlacenames"
          :key="placename.id"
          class="p-2 rounded bg-gray-900/50 cursor-pointer transition-colors hover:bg-teal-700/70"
          @click="historyStore.flyToPlacename(placename)"
        >
          <p class="font-bold">
            {{ placename.name }} <span class="text-xs font-normal opacity-70">({{ placename.type }})</span>
          </p>
          <p class="text-sm opacity-80">
            今: {{ placename.tName }}
          </p>
        </li>
      </ul>
      <div v-else class="text-gray-400 p-4 text-center">
        无匹配结果。
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for Webkit browsers */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(128, 128, 128, 0.5);
  border-radius: 10px;
}
</style>
