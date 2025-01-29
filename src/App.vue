<!-- # src/App.vue
<template>
  <router-view></router-view>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App'
})
</script> -->



<!-- App.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <NavBar />
    
    <!-- Main Content -->
    <main class="pt-16"> <!-- Add padding-top to account for fixed navbar -->
      <router-view v-slot="{ Component }">
        <transition
          name="page"
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import NavBar from './components/navigation/NavBar.vue'

const authStore = useAuthStore()

onMounted(() => {
  // Initialize auth state
  authStore.initialize()
})
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>