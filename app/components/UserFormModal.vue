<script setup lang="ts">
defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const formData = reactive({
  username: '',
  password: '',
  role: 'user' as 'user' | 'admin',
})
const isLoading = ref(false)
const errorMessage = ref('')

async function handleSubmit() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/admin/users', {
      method: 'POST',
      body: formData,
    })
    emit('success')
  }
  catch (err: any) {
    errorMessage.value = err.data?.statusMessage || '创建用户失败'
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
      class="bg-black/50 flex items-center inset-0 justify-center fixed z-40"
      @click.self="emit('close')"
    >
      <div class="card p-6 max-w-md w-full" @click.stop>
        <h3 class="text-xl font-bold mb-4">
          新增用户
        </h3>
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div class="space-y-1">
            <label for="username">用户名</label>
            <input id="username" v-model="formData.username" type="text" class="input-base" required>
          </div>
          <div class="space-y-1">
            <label for="password">密码</label>
            <input id="password" v-model="formData.password" type="password" class="input-base" required>
          </div>
          <div class="space-y-1">
            <label for="role">角色</label>
            <select id="role" v-model="formData.role" class="input-base">
              <option value="user">
                User
              </option>
              <option value="admin">
                Admin
              </option>
            </select>
          </div>
          <div v-if="errorMessage" class="text-sm text-red-500">
            {{ errorMessage }}
          </div>
          <div class="pt-4 flex gap-4 justify-end">
            <button type="button" class="btn bg-gray-500 hover:bg-gray-600" @click="emit('close')">
              取消
            </button>
            <button type="submit" class="btn" :disabled="isLoading">
              <span v-if="!isLoading">创建</span>
              <span v-else>创建中...</span>
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
</style>
