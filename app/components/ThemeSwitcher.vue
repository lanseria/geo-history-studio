<script setup lang="ts">
import { onClickOutside, useToggle } from '@vueuse/core'

const colorMode = useColorMode()
const [isDropdownOpen, toggleDropdown] = useToggle(false)
const dropdownRef = ref(null)

onClickOutside(dropdownRef, () => isDropdownOpen.value = false)

const themes = [
  { name: 'light', icon: 'i-carbon-sun' },
  { name: 'dark', icon: 'i-carbon-moon' },
  { name: 'sepia', icon: 'i-carbon-cafe' },
  { name: 'system', icon: 'i-carbon-laptop' },
]

function setTheme(themeName: string) {
  colorMode.preference = themeName
  isDropdownOpen.value = false
}

const currentIcon = computed(() => {
  const currentTheme = colorMode.preference === 'system' ? colorMode.value : colorMode.preference
  return themes.find(t => t.name === currentTheme)?.icon || 'i-carbon-contrast'
})
</script>

<template>
  <div ref="dropdownRef" class="flex relative">
    <!-- 主题切换按钮 -->
    <button
      class="icon-btn"
      title="切换主题"
      @click="toggleDropdown()"
    >
      <div :class="currentIcon" />
    </button>

    <!-- 下拉菜单 -->
    <Transition name="fade">
      <div
        v-if="isDropdownOpen"
        class="mt-2 card p-2 border border-border-base w-36 right-0 top-full absolute z-10"
      >
        <ul>
          <li v-for="theme in themes" :key="theme.name">
            <button
              class="text-sm p-2 text-left rounded-md flex gap-2 w-full items-center hover:bg-surface-base"
              :class="{ 'text-brand-primary': colorMode.preference === theme.name }"
              @click="setTheme(theme.name)"
            >
              <div :class="theme.icon" />
              <span class="capitalize">{{ theme.name }}</span>
            </button>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
