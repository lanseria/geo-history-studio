<!-- app/components/StyleEditorPopover.vue -->
<script setup lang="ts">
import { autoUpdate, offset, shift, useFloating } from '@floating-ui/vue'
import { onClickOutside } from '@vueuse/core'
import { AVAILABLE_COLORS, AVAILABLE_SIZES, useHistoryStore } from '~/stores/history'

const props = defineProps<{
  isOpen: boolean
  target: HTMLElement | null // 触发弹窗的元素
  type: string | null // 正在编辑的类型
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const historyStore = useHistoryStore()
const popoverRef = ref<HTMLElement | null>(null)

const targetRef = computed(() => props.target)

const { floatingStyles, isPositioned } = useFloating(
  targetRef,
  popoverRef,
  {
    placement: 'right-start',
    // 2. 监听 isPositioned 状态，只有在 isOpen 为 true 时才启用浮动计算
    open: computed(() => props.isOpen),
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      shift({ padding: 10 }),
    ],
  },
)

onClickOutside(popoverRef, () => emit('close'), {
  ignore: [targetRef],
})
</script>

<template>
  <Teleport to="body">
    <!-- 5. 将 Transition 的 name 绑定到一个动态计算的属性上 -->
    <Transition :name="isPositioned ? 'fade-scale' : ''">
      <div
        v-if="isOpen && target && type"
        ref="popoverRef"
        :style="floatingStyles"
        class="card p-4 border border-border-base w-64 z-50 space-y-3"
        @click.stop
      >
        <!-- 头部，包含类型名称和关闭按钮 -->
        <div class="pb-2 border-b border-border-base flex items-center justify-between">
          <p class="font-bold">
            编辑 "{{ type }}"
          </p>
          <button class="icon-btn !text-lg" title="关闭" @click="emit('close')">
            <div i-carbon-close />
          </button>
        </div>

        <!-- 样式编辑器主体 -->
        <div class="gap-x-4 gap-y-3 grid grid-cols-[auto,1fr] items-center">
          <!-- 颜色选择 -->
          <label class="text-sm font-medium">颜色</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="color in AVAILABLE_COLORS"
              :key="color"
              class="rounded-full h-5 w-5 transition-transform hover:scale-110"
              :style="{ backgroundColor: color }"
              :class="{ 'ring-2 ring-brand-primary ring-offset-2 ring-offset-surface-muted': historyStore.typeStyles[type]?.color === color }"
              @click="historyStore.typeStyles[type]!.color = color"
            />
          </div>

          <!-- 大小选择 -->
          <label class="text-sm font-medium">大小</label>
          <div class="flex gap-2">
            <button
              v-for="size in AVAILABLE_SIZES"
              :key="size"
              class="text-sm px-2.5 py-0.5 rounded-md bg-surface-base transition hover:bg-surface-base/80"
              :class="{ '!bg-brand-primary !text-white shadow-md': historyStore.typeStyles[type]?.size === size }"
              @click="historyStore.typeStyles[type]!.size = size"
            >
              {{ size }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 保持原有的动画效果，但现在它只会在正确时机被应用 */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
