// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'


// Rest of your imports
import App from './App.vue'
import router from './router'
import './style.css'

import BaseButton from './components/base/BaseButton.vue'
import BaseAlert from './components/base/BaseAlert.vue'
import BaseInput from './components/base/BaseInput.vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Register base components
app.component('BaseButton', BaseButton)
app.component('BaseAlert', BaseAlert)
app.component('BaseInput', BaseInput)

app.mount('#app')