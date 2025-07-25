<!-- eslint-disable no-alert -->
<script setup lang="ts">
import { appName } from '~/constants'

useHead({
  title: `登录 - ${appName}`,
})

const authStore = useAuthStore()
const credentials = reactive({ username: '', password: '' })
const isLoading = ref(false)
const errorMessage = ref('') // 用于存储错误信息

async function handleLogin() {
  isLoading.value = true
  errorMessage.value = '' // 开始登录前清空错误信息
  try {
    await authStore.login(credentials)
    // 成功后，全局中间件会自动处理跳转
  }
  catch (error: any) {
    // 将 alert 替换为设置错误信息
    errorMessage.value = error.data?.statusMessage || '登录时发生未知错误，请重试。'
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="p-4 flex min-h-screen items-center justify-center">
    <div class="card p-8 max-w-sm w-full space-y-8">
      <!-- 头部：Logo 和标题 -->
      <div class="text-center">
        <h1 class="text-2xl font-bold mt-2">
          欢迎回来
        </h1>
        <p class="text-gray-500 dark:text-gray-400">
          登录您的 {{ appName }} 账户
        </p>
      </div>

      <!-- 登录表单 -->
      <form class="space-y-6" @submit.prevent="handleLogin">
        <!-- 用户名输入 -->
        <div class="space-y-1">
          <label for="username" class="text-sm font-medium">用户名</label>
          <div class="relative">
            <div class="i-carbon-user text-lg op-50 left-3 top-1/2 absolute -translate-y-1/2" />
            <input
              id="username"
              v-model="credentials.username"
              type="text"
              class="input-base pl-10"
              placeholder="请输入用户名"
              required
            >
          </div>
        </div>

        <!-- 密码输入 -->
        <div class="space-y-1">
          <label for="password" class="text-sm font-medium">密码</label>
          <div class="relative">
            <div class="i-carbon-locked text-lg op-50 left-3 top-1/2 absolute -translate-y-1/2" />
            <input
              id="password"
              v-model="credentials.password"
              type="password"
              class="input-base pl-10"
              placeholder="请输入密码"
              required
            >
          </div>
        </div>

        <!-- 错误信息提示 -->
        <Transition name="fade">
          <div v-if="errorMessage" class="text-sm text-red-500 text-center dark:text-red-400">
            {{ errorMessage }}
          </div>
        </Transition>

        <!-- 登录按钮 -->
        <button type="submit" class="btn flex w-full items-center justify-center !py-3" :disabled="isLoading">
          <span v-if="!isLoading">登录</span>
          <span v-else class="flex gap-2 items-center">
            <div class="i-carbon-circle-dash animate-spin" />
            登录中...
          </span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* 定义 Vue Transition 的过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
