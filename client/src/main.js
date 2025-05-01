import { createApp } from 'vue'
import App from './App.vue'

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
    defaultSet: 'mdi', // Sets Material Design Icons as the default icon set
    aliases,           // Icon name aliases like 'close', 'menu', etc.
    sets: { mdi },     // The actual icon set configuration object
  },
})

const app = createApp(App)
app.use(vuetify)
app.mount('#app')
