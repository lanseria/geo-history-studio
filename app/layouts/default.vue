<script setup lang="ts">
const authStore = useAuthStore()
</script>

<template>
  <!-- [核心修复] 使用 flex 布局，并确保 main 占满整个屏幕高度 -->
  <main class="text-prose-base bg-surface-base font-sans flex flex-col h-screen">
    <!-- Header 部分保持不变 -->
    <header class="bg-surface-muted p-4 flex shadow-sm items-center justify-between">
      <NuxtLink to="/" class="text-xl font-bold">
        历史地理信息平台
      </NuxtLink>
      <div v-if="authStore.isAuthenticated" class="flex gap-4 items-center">
        <NuxtLink v-if="authStore.isAdmin" to="/admin/users" class="hover:text-brand-primary">
          用户管理
        </NuxtLink>
        <span>欢迎, {{ authStore.user?.username }}</span>
        <ThemeSwitcher />
        <button class="icon-btn" title="登出" @click="authStore.logout()">
          <div i-carbon-logout />
        </button>
      </div>
    </header>
    <!-- [核心修复] 使用 flex-1 让该区域填充所有剩余空间，并设置 relative 和 overflow-hidden 避免内容溢出 -->
    <div class="flex-1 w-full relative overflow-hidden">
      <slot />
    </div>
  </main>
</template>
