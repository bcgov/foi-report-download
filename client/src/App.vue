<template>
  <v-app>
    <v-app-bar app color="#036" dark>
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          :src="require('./assets/logo.svg')"
          transition="scale-transition"
          width="177"
        />
      </div>

      <v-spacer></v-spacer>

      <v-btn
        href="https://github.com/vuetifyjs/vuetify/releases/latest"
        target="_blank"
        text
      >
        <span class="mr-2">Latest Release</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-content>
      <Form />
    </v-content>
  </v-app>
</template>

<script>
import Form from './components/Form'

export default {
  name: 'App',

  components: {
    Form
  },

  data: () => ({
    //
  })
}
</script>
