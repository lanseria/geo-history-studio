<!-- app/components/TypeFilter.vue -->
<script setup lang="ts">
import { useHistoryStore } from '~/stores/history'
import StyleEditorPopover from './StyleEditorPopover.vue'

const historyStore = useHistoryStore()

// --- State for the style editor popover ---
const editorTarget = ref<HTMLElement | null>(null)
const activeEditorType = ref<string | null>(null)

// --- Methods ---

// 点击标签时，切换其选中状态
function toggleSelection(type: string) {
  const selected = new Set(historyStore.selectedTypes)
  if (selected.has(type))
    selected.delete(type)
  else
    selected.add(type)

  historyStore.selectedTypes = Array.from(selected)
}

// 点击编辑图标时，打开样式编辑器
function openStyleEditor(type: string, event: MouseEvent) {
  activeEditorType.value = type
  // 将触发事件的按钮作为 popover 的定位目标
  editorTarget.value = event.currentTarget as HTMLElement
}

// 关闭样式编辑器
function closeStyleEditor() {
  activeEditorType.value = null
  editorTarget.value = null
}
</script>

<template>
  <div v-if="historyStore.availableTypes.length > 0" class="flex flex-col gap-3">
    <!-- 顶部标题 -->
    <div class="flex items-center justify-between">
      <p class="text-prose-muted font-bold">
        按类型筛选
      </p>
      <!-- "全选" 功能可以作为一个独立的按钮存在，如果需要的话 -->
    </div>

    <!-- 标签云容器 -->
    <div class="flex flex-wrap gap-2">
      <!-- 循环渲染每个类型标签 -->
      <div
        v-for="type in historyStore.availableTypes"
        :key="type"
        class="group relative"
      >
        <!-- 标签主体 -->
        <button
          class="text-sm font-medium px-3 py-1 rounded-full flex gap-2 transition-colors duration-200 items-center"
          :class="historyStore.selectedTypes.includes(type)
            ? 'bg-brand-primary text-white'
            : 'bg-surface-muted hover:bg-surface-base'"
          @click="toggleSelection(type)"
        >
          <!-- 标签前的小圆点，颜色与地图上一致 -->
          <span
            class="rounded-full h-2.5 w-2.5 block"
            :style="{ backgroundColor: historyStore.typeStyles[type]?.color }"
          />
          <span>{{ type }}</span>
        </button>

        <!-- 编辑按钮：悬停时显示，绝对定位于标签右侧 -->
        <button
          class="text-base icon-btn p-1 rounded-full bg-surface-muted/70 opacity-0 transition-opacity duration-200 left-0 top-1/2 group-hover:opacity-100 -translate-y-1/2 !absolute"
          title="编辑样式"
          @click.stop="openStyleEditor(type, $event)"
        >
          <div i-carbon-settings-adjust />
        </button>
      </div>
    </div>
  </div>

  <!-- 样式编辑器 Popover -->
  <StyleEditorPopover
    :is-open="!!activeEditorType"
    :target="editorTarget"
    :type="activeEditorType"
    @close="closeStyleEditor"
  />
</template>
