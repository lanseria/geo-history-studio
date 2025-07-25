<!-- app/components/YearSlider.vue -->
<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

const props = withDefaults(defineProps<{
  modelValue: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}>(), {
  min: -221,
  max: 1911,
  step: 1,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

// 使用一个本地 ref 来驱动 UI，避免直接修改 props
const localValue = ref(props.modelValue)
const isInputFocused = ref(false)

// 使用 v-model 双向绑定时，当外部值变化，需要同步更新内部值
watch(() => props.modelValue, (newValue) => {
  // 只有在输入框没有焦点时才同步，避免干扰用户输入
  if (!isInputFocused.value)
    localValue.value = newValue
})

// 防抖函数，当 localValue 变化时（无论是滑动还是输入），延迟更新父组件
// 这可以防止在快速滑动或输入时频繁触发事件
const debouncedEmit = useDebounceFn((value: number) => {
  // 确保值在范围内
  const validValue = Math.max(props.min, Math.min(props.max, value))
  if (props.modelValue !== validValue)
    emit('update:modelValue', validValue)
}, 200) // 200ms 延迟

watch(localValue, (newValue) => {
  debouncedEmit(newValue)
})

// 当用户在输入框中完成输入（失焦）时，立即验证并更新
function handleInputBlur() {
  isInputFocused.value = false
  const validValue = Math.max(props.min, Math.min(props.max, Number(localValue.value)))
  localValue.value = validValue
  emit('update:modelValue', validValue)
}
</script>

<template>
  <div
    class="year-slider-container w-full"
    :class="{ 'opacity-50 pointer-events-none': disabled }"
  >
    <div class="flex gap-3 items-center">
      <!-- 重新美化的滑块 -->
      <input
        v-model.number="localValue"
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        class="year-slider flex-1"
      >
      <!-- 数字输入框 -->
      <div class="w-28 relative">
        <input
          v-model.number="localValue"
          type="number"
          :min="min"
          :max="max"
          :step="step"
          :disabled="disabled"
          class="year-input input-base text-center !px-2 !py-1"
          @focus="isInputFocused = true"
          @blur="handleInputBlur"
        >
        <span class="text-sm font-mono pointer-events-none right-2 top-1/2 absolute -translate-y-1/2">年</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 容器样式 */
.year-slider-container {
  transition: opacity 0.2s ease;
}

/* === 滑块样式 === */
.year-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 10px; /* 轨道和滑块的接触区域高度 */
  background: transparent;
  outline: none;
  cursor: pointer;
}

/* 轨道 - Webkit (Chrome, Safari) */
.year-slider::-webkit-slider-runnable-track {
  width: 100%;
  height: 6px;
  background-color: var(--color-surface-muted);
  border-radius: 9999px;
  transition: background-color 0.2s;
}

.year-slider:hover::-webkit-slider-runnable-track {
  background-color: var(--color-border-base);
}

/* 滑块按钮 - Webkit */
.year-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 18px;
  width: 18px;
  border-radius: 50%;
  background: var(--color-brand-primary);
  border: 3px solid var(--color-surface-base);
  box-shadow: 0 0 0 1px var(--color-border-base);
  cursor: grab;
  margin-top: -6px; /* 垂直居中滑块按钮 */
  transition: transform 0.2s ease;
}

.year-slider:active::-webkit-slider-thumb {
  cursor: grabbing;
  transform: scale(1.1);
}

/* 轨道 - Firefox */
.year-slider::-moz-range-track {
  width: 100%;
  height: 6px;
  background: var(--color-surface-muted);
  border-radius: 9999px;
  border: none;
  transition: background-color 0.2s;
}
.year-slider:hover::-moz-range-track {
  background-color: var(--color-border-base);
}

/* 滑块按钮 - Firefox */
.year-slider::-moz-range-thumb {
  height: 18px;
  width: 18px;
  border-radius: 50%;
  background: var(--color-brand-primary);
  border: 3px solid var(--color-surface-base);
  box-shadow: 0 0 0 1px var(--color-border-base);
  cursor: grab;
  transition: transform 0.2s ease;
}
.year-slider:active::-moz-range-thumb {
  cursor: grabbing;
  transform: scale(1.1);
}

/* === 数字输入框样式 === */
.year-input {
  /* 移除 number input 的上下箭头 (在一些浏览器中) */
  -moz-appearance: textfield;
}
.year-input::-webkit-outer-spin-button,
.year-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
