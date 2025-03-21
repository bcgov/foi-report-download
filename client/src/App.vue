<template>
  <v-app>
    <v-app-bar app color="#036" dark>
      <div class="d-flex align-center">
        <v-img
          alt="Government of British Columbia"
          class="shrink mr-2"
          contain
          :src="logo"
          transition="scale-transition"
          width="177"
        />
      </div>
      <v-toolbar-title>FOI Report Download</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container>       
        <v-row>
          <v-col cols="12">
            <h2>
              Welcome to the Information Access Operations one-stop shop for reporting on FOI requests.
            </h2>

            <v-expansion-panels>
              <v-expansion-panel>
                <v-expansion-panel-title><h2>Instructions for use:</h2></v-expansion-panel-title>
                <v-expansion-panel-text>
                  <ol>
                    <li>Select your organization from the dropdown menu.</li>
                    <li>Select the file status or leave it at "All Open."</li>
                    <li>Select applicant types or leave it at "All Applicants."</li>
                    <li>Enter start or due date ranges.</li>
                    <li>Select your preferred file format.</li>
                    <li>Click submit to run the report.</li>
                    <li>Wait for the report to download or open.</li>
                    <li>Save the report, then click back to run another.</li>
                  </ol>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

            <h2>FOI Performance and other statistics:</h2>
            <ul>
              <li>
                IAO’s <a href="https://bcgov.sharepoint.com/sites/CITZ-CIRMO_FOI_Intel">Dashboards</a> (Excel pivot tables and summaries).
              </li>
              <li>
                <a href="https://catalogue.data.gov.bc.ca/dataset/freedom-of-information-foi-statistics">DataBC Data Catalogue</a> (quarterly updates).
              </li>
              <li>
                FOI responses on <a href="https://www2.gov.bc.ca/gov/content/governments/about-the-bc-government/open-government/open-information">Open Information</a>.
              </li>
              <li>
                <a href="https://www2.gov.bc.ca/gov/content/governments/about-the-bc-government/open-government/open-information/completed-foi-requests#reporting">Annual Reports</a>.
              </li>
            </ul>

            <h2>IAO Contacts</h2>
            <p>Your IAO Manager is available for ad-hoc reporting and FOI-related issues.</p>
          </v-col>
        </v-row>
      </v-container>

      <Form />
    </v-main>

    <v-footer color="#036" padless>
      <v-row justify="center" no-gutters>
        <v-btn
          v-for="link in links"
          :key="link.href"
          color="white"
          variant="text"
          :href="link.href"
          class="my-2"
        >
          {{ link.text }}
        </v-btn>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import Form from './components/Form.vue'
import logo from './assets/logo.svg'

const links = ref([
  { href: 'https://www2.gov.bc.ca/gov/content/home/disclaimer', text: 'Disclaimer' },
  { href: 'https://www2.gov.bc.ca/gov/content/home/privacy', text: 'Privacy' },
  { href: 'https://www2.gov.bc.ca/gov/content/home/accessibility', text: 'Accessibility' },
  { href: 'https://www2.gov.bc.ca/gov/content/home/copyright', text: 'Copyright' },
  { href: 'https://www2.gov.bc.ca/gov/content/home/contact-us', text: 'Contact Us' }
])
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
