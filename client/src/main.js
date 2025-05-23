import { createApp } from 'vue'
import App from './App.vue'
// Replace static import with dynamic factory
import { createKeycloak } from './auth/keycloak'

// Imports Vuetify's base styles for all components
import 'vuetify/styles'

// Loads the Material Design Icons CSS, used for icons in Vuetify components
import '@mdi/font/css/materialdesignicons.css'

// Vuetify core setup
import { createVuetify } from 'vuetify'

// Imports all Vuetify components (like v-select, v-btn, etc.)
import * as components from 'vuetify/components'

// Imports all Vuetify directives (like v-ripple, v-intersect, etc.)
import * as directives from 'vuetify/directives'

// Provides aliases and the mdi icon set definition for Vuetify to use
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
})

// Fetch runtime env and bootstrap app after Keycloak config is ready
fetch('/env')
  .then(res => res.json())
  .then(env => {
    const project = env.VITE_PROJECT || 'dev'
    const keycloak = createKeycloak(project)

    keycloak.init({
      onLoad: 'login-required',
      pkceMethod: 'S256',
      checkLoginIframe: false
    }).then(authenticated => {
      if (authenticated) {
        const app = createApp(App)
        app.config.globalProperties.$keycloak = keycloak
        app.use(vuetify)
        app.mount('#app')
      } else {
        console.warn('Not authenticated, redirecting...')
        keycloak.login()
      }
    }).catch(err => {
      console.error('Keycloak init failed:', err)
    })
  })
