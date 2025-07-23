<script setup lang="ts">
const authStore = useAuthStore()

const menuItems = [
  { name: '用户管理', to: '/admin/users', icon: 'i-carbon-user-multiple' },
  { name: '地名管理', to: '/admin/placenames', icon: 'i-carbon-map' },
  // 之后可以添加更多菜单项
]
</script>

<template>
  <div class="text-prose-base font-sans bg-surface-base flex h-screen">
    <!-- Left Sidebar -->
    <aside class="bg-surface-muted flex flex-shrink-0 flex-col w-60 shadow-lg">
      <div class="p-4 border-b border-border-base">
        <NuxtLink to="/" class="text-xl font-bold flex gap-2 items-center">
          <div i-carbon-arrow-left />
          <span>返回主站</span>
        </NuxtLink>
      </div>
      <nav class="p-2 flex-1">
        <ul>
          <li v-for="item in menuItems" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="px-3 py-2 rounded-md flex gap-3 transition-colors items-center hover:bg-brand-primary/10"
              active-class="!bg-brand-primary !text-white"
            >
              <div :class="item.icon" class="text-lg" />
              <span>{{ item.name }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Main Content Area -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Top Header -->
      <header class="p-4 border-b border-border-base bg-surface-muted flex flex-shrink-0 items-center justify-between">
        <h1 class="text-xl font-semibold">
          后台管理
        </h1>
        <div class="flex gap-4 items-center">
          <span class="text-sm">欢迎, {{ authStore.user?.username }}</span>
          <ThemeSwitcher />
          <button class="icon-btn" title="登出" @click="authStore.logout()">
            <div i-carbon-logout />
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-6 flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
