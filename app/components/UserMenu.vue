<!-- app/components/UserMenu.vue -->
<script setup lang="ts">
import { onClickOutside, useToggle } from '@vueuse/core'
import ChangePasswordModal from './ChangePasswordModal.vue'

// --- 认证相关逻辑---
const authStore = useAuthStore()
const [isDropdownOpen, toggleDropdown] = useToggle(false)
const dropdownRef = ref(null)
const isChangePasswordModalOpen = ref(false)

onClickOutside(dropdownRef, () => isDropdownOpen.value = false)

async function handleLogout() {
  isDropdownOpen.value = false
  await authStore.logout()
}

function openChangePasswordModal() {
  isDropdownOpen.value = false
  isChangePasswordModalOpen.value = true
}

async function handleChangePasswordSuccess() {
  isChangePasswordModalOpen.value = false
  // eslint-disable-next-line no-alert
  alert('密码修改成功！您需要重新登录。')
  await authStore.logout()
}

// --- 主题切换逻辑 ---
const colorMode = useColorMode()

// 定义主题及其图标
const themes = [
  { name: 'light', icon: 'i-carbon-sun', text: '浅色' },
  { name: 'dark', icon: 'i-carbon-moon', text: '深色' },
  { name: 'sepia', icon: 'i-carbon-cafe', text: '复古' },
  { name: 'system', icon: 'i-carbon-laptop', text: '跟随系统' },
]

// 设置主题的函数
function setTheme(themeName: string) {
  colorMode.preference = themeName
}

// 获取当前主题对应的显示文本
const currentThemeText = computed(() => {
  return themes.find(t => t.name === colorMode.preference)?.text || '切换主题'
})
</script>

<template>
  <div v-if="authStore.isAuthenticated" ref="dropdownRef" class="relative">
    <!-- 头像按钮 -->
    <button
      class="rounded-full h-10 w-10 overflow-hidden focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-surface-base"
      title="用户菜单"
      @click="toggleDropdown()"
    >
      <img
        :src="authStore.userAvatar"
        alt="用户头像"
        class="h-full w-full object-cover"
      >
    </button>

    <!-- 下拉菜单 -->
    <Transition name="fade-scale">
      <div
        v-if="isDropdownOpen"
        class="mt-2 card p-2 border border-border-base w-56 right-0 top-full absolute z-20"
      >
        <!-- 将原有 ul 拆分为多个部分，用 div 分隔 -->
        <ul class="flex flex-col gap-1">
          <!-- 用户信息 -->
          <li class="px-2 py-2 border-b border-border-base">
            <p class="font-semibold truncate">
              {{ authStore.user?.username }}
            </p>
            <p class="text-sm text-prose-muted truncate">
              {{ authStore.isAdmin ? '管理员' : '普通用户' }}
            </p>
          </li>
        </ul>

        <!-- 主题切换部分 -->
        <div class="my-1 py-2 border-b border-border-base">
          <div class="text-sm text-prose-muted px-2 flex items-center justify-between">
            <span>主题模式</span>
            <span class="text-prose-base font-semibold">{{ currentThemeText }}</span>
          </div>
          <div class="mt-2 px-2 gap-2 grid grid-cols-4">
            <button
              v-for="theme in themes"
              :key="theme.name"
              class="p-2 rounded-md flex items-center justify-center hover:bg-surface-base"
              :class="{ 'text-brand-primary bg-brand-primary/10': colorMode.preference === theme.name }"
              :title="`切换到${theme.text}模式`"
              @click="setTheme(theme.name)"
            >
              <div :class="theme.icon" class="text-xl" />
            </button>
          </div>
        </div>

        <ul class="flex flex-col gap-1">
          <!-- 修改密码按钮 -->
          <li>
            <button
              class="p-2 rounded-md flex gap-3 w-full items-center hover:bg-surface-base"
              @click="openChangePasswordModal"
            >
              <div class="i-carbon-password" />
              <span>修改密码</span>
            </button>
          </li>

          <!-- 管理员入口 -->
          <li v-if="authStore.isAdmin">
            <NuxtLink
              to="/admin/users"
              class="p-2 rounded-md flex gap-3 w-full items-center hover:bg-surface-base"
              @click="isDropdownOpen = false"
            >
              <div class="i-carbon-settings-adjust" />
              <span>后台管理</span>
            </NuxtLink>
          </li>
        </ul>

        <!-- 登出按钮 (用分隔线隔开) -->
        <div class="mt-1 pt-1 border-t border-border-base">
          <ul>
            <li>
              <button
                class="text-red-500 p-2 rounded-md flex gap-3 w-full items-center dark:text-red-400 hover:bg-red-500/10"
                @click="handleLogout"
              >
                <div class="i-carbon-logout" />
                <span>退出登录</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </Transition>
  </div>

  <!-- 模态框 -->
  <ChangePasswordModal
    :is-open="isChangePasswordModalOpen"
    @close="isChangePasswordModalOpen = false"
    @success="handleChangePasswordSuccess"
  />
</template>

<style scoped>
/* 样式保持不变 */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.95);
}
</style>
