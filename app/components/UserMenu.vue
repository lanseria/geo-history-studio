<script setup lang="ts">
import { onClickOutside, useToggle } from '@vueuse/core'

const authStore = useAuthStore()
const [isDropdownOpen, toggleDropdown] = useToggle(false)
const dropdownRef = ref(null)

// 点击菜单外部时，关闭下拉菜单
onClickOutside(dropdownRef, () => isDropdownOpen.value = false)

async function handleLogout() {
  isDropdownOpen.value = false
  await authStore.logout()
}
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

          <!-- 登出按钮 -->
          <li>
            <button
              class="text-red-500 p-2 rounded-md flex gap-3 w-full items-center dark:text-red-400 hover:bg-surface-base"
              @click="handleLogout"
            >
              <div class="i-carbon-logout" />
              <span>退出登录</span>
            </button>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
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
