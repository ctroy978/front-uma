// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Import base components
import BaseButton from './components/base/BaseButton.vue'
import BaseAlert from './components/base/BaseAlert.vue'
import BaseInput from './components/base/BaseInput.vue'

// Import styles
import './style.css'

// Create Vue app instance
const app = createApp(App)

// Register Pinia
app.use(createPinia())

// Register router
app.use(router)

// Register base components globally
app.component('BaseButton', BaseButton)
app.component('BaseAlert', BaseAlert)
app.component('BaseInput', BaseInput)

// Mount the app
app.mount('#app')