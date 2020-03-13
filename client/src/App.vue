<template>
  <v-app>
    <v-app-bar app color="#036" dark>
      <div class="d-flex align-center">
        <v-img
          alt="Government of British Columbia"
          class="shrink mr-2"
          contain
          :src="require('./assets/logo.svg')"
          transition="scale-transition"
          width="177"
        />
      </div>
      <v-toolbar-title>FOI Report Download</v-toolbar-title>
    </v-app-bar>
    <v-content>
      <Form />
    </v-content>
    <v-footer color="#036" padless>
      <v-row justify="center" no-gutters>
        <v-btn
          v-for="link in links"
          :key="link.href"
          color="white"
          text
          :href="link.href"
          class="my-2"
        >
          {{ link.text }}
        </v-btn>
      </v-row>
    </v-footer>
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
    links: [
      {
        href: 'https://www2.gov.bc.ca/gov/content/home/disclaimer',
        text: 'Disclaimer'
      },
      {
        href: 'https://www2.gov.bc.ca/gov/content/home/privacy',
        text: 'Privacy'
      },
      {
        href: 'https://www2.gov.bc.ca/gov/content/home/accessibility',
        text: 'Accessibility'
      },
      {
        href: 'https://www2.gov.bc.ca/gov/content/home/copyright',
        text: 'Copyright'
      },
      {
        href: 'https://www2.gov.bc.ca/gov/content/home/contact-us',
        text: 'Contact Us'
      }
    ]
  })
}
</script>

<style scoped lang="scss">
.v-app-bar {
  border-bottom: 2px solid #fcba19 !important;
}
footer {
  border-top: 2px solid #fcba19 !important;

  .v-btn {
    border-radius: unset;
  }
  .v-btn + .v-btn {
    border-left: 1px solid #4b5e73;
  }
}
</style>
