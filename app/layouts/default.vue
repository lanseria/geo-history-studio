<script setup lang="ts">
const authStore = useAuthStore()
</script>

<template>
  <!-- [修改] 使用新的语义化类名 -->
  <main class="text-prose-base bg-surface-base font-sans min-h-screen">
    <!-- [修改] 使用新的语义化类名 -->
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
    <div class="mx-auto p-4 max-w-5xl">
      <slot />
    </div>
  </main>
</template>
