<script setup lang="ts">
import type { ZXCVBNResult } from 'zxcvbn'
import zxcvbn from 'zxcvbn'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const formData = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const isLoading = ref(false)
const errorMessage = ref('')

// 计算密码强度
const passwordStrength = computed<ZXCVBNResult | null>(() => {
  if (!formData.newPassword)
    return null
  return zxcvbn(formData.newPassword)
})

// 创建一个计算属性来管理按钮的禁用状态
const isSubmitDisabled = computed(() => {
  if (isLoading.value)
    return true // 如果正在加载，则禁用

  // 如果用户还未输入密码，也禁用提交
  if (!passwordStrength.value)
    return true

  // 如果密码强度不足，则禁用
  return passwordStrength.value.score < 3
})

// 根据强度分数返回不同的样式
function strengthBarClass(score: number) {
  switch (score) {
    case 0: return 'bg-red-500'
    case 1: return 'bg-red-500'
    case 2: return 'bg-yellow-500'
    case 3: return 'bg-green-500'
    case 4: return 'bg-green-500'
    default: return 'bg-gray-300'
  }
}

watch(() => props.isOpen, (newValue) => {
  if (!newValue) {
    setTimeout(() => {
      Object.assign(formData, { oldPassword: '', newPassword: '', confirmPassword: '' })
      errorMessage.value = ''
    }, 200)
  }
})

async function handleSubmit() {
  // 前端预校验，提升体验
  if (passwordStrength.value && passwordStrength.value.score < 3) {
    errorMessage.value = '新密码强度不足，请根据提示进行增强。'
    return
  }
  if (formData.newPassword !== formData.confirmPassword) {
    errorMessage.value = '两次输入的新密码不一致。'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/auth/change-password', {
      method: 'PATCH',
      body: formData,
    })
    emit('success')
  }
  catch (err: any) {
    errorMessage.value = err.data?.statusMessage || '密码修改失败，请重试。'
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="p-4 bg-black/50 flex items-center inset-0 justify-center fixed z-40 overflow-y-auto"
    >
      <div class="card p-6 max-w-md w-full" @click.stop>
        <h3 class="text-xl font-bold mb-6">
          修改密码
        </h3>
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div class="space-y-1">
            <label for="old-password">旧密码</label>
            <input id="old-password" v-model="formData.oldPassword" type="password" class="input-base" required>
          </div>
          <div class="space-y-1">
            <label for="new-password">新密码</label>
            <input id="new-password" v-model="formData.newPassword" type="password" class="input-base" required>
          </div>

          <!-- 密码强度指示器 -->
          <div v-if="passwordStrength" class="space-y-2">
            <div class="rounded-full bg-gray-200 flex gap-1 h-2 w-full dark:bg-gray-700">
              <div
                v-for="i in 4" :key="i"
                class="rounded-full h-full w-1/4 transition-colors"
                :class="passwordStrength.score >= i ? strengthBarClass(passwordStrength.score) : ''"
              />
            </div>
            <div v-if="passwordStrength.feedback.warning || passwordStrength.feedback.suggestions.length > 0" class="text-xs text-prose-muted">
              <p v-if="passwordStrength.feedback.warning" class="text-yellow-600 dark:text-yellow-400">
                {{ passwordStrength.feedback.warning }}
              </p>
              <ul v-if="passwordStrength.feedback.suggestions.length > 0" class="list-disc list-inside">
                <li v-for="suggestion in passwordStrength.feedback.suggestions" :key="suggestion">
                  {{ suggestion }}
                </li>
              </ul>
            </div>
          </div>

          <div class="space-y-1">
            <label for="confirm-password">确认新密码</label>
            <input id="confirm-password" v-model="formData.confirmPassword" type="password" class="input-base" required>
          </div>

          <Transition name="fade-sm">
            <div v-if="errorMessage" class="text-sm text-red-500">
              {{ errorMessage }}
            </div>
          </Transition>

          <div class="pt-4 flex gap-4 justify-end">
            <button type="button" class="btn bg-gray-500 hover:bg-gray-600" @click="emit('close')">
              取消
            </button>
            <button type="submit" class="btn" :disabled="isSubmitDisabled">
              <span v-if="!isLoading">确认修改</span>
              <span v-else>处理中...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-sm-enter-active,
.fade-sm-leave-active {
  transition: opacity 0.2s ease;
}
.fade-sm-enter-from,
.fade-sm-leave-to {
  opacity: 0;
}
</style>
