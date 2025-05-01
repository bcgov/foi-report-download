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
              Welcome to the Information Access Operations one stop shop for
              reporting on FOI requests.
            </h2>

            <v-expansion-panels v-model="instructionsPanel" class="mb-4" multiple>
              <v-expansion-panel>
                <v-expansion-panel-title class="text-h6 font-weight-bold">
                  Instructions for use:
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <ol>
                    <li>Select your organization from the drop down menu.</li>
                    <li>Select the file status you would like to report on or leave it at the default All Open setting.</li>
                    <li>Select the applicant types you would like to report on or leave it at the default All Applicants setting.</li>
                    <li>Enter the applicable start or due date ranges.</li>
                    <li>Select your preferred file format.</li>
                    <li>Click submit to run the report.</li>
                    <li>Wait for a download notification or for your report to open in a new tab. This may take a minute.</li>
                    <li>If you would like to run another report, please save this copy and then hit the back button to return to the home page to run another report.</li>
                  </ol>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>



            <h2>FOI Performance and other statistics:</h2>
            <ul>
              <li>
                IAO’s
                <a
                  href="https://bcgov.sharepoint.com/sites/CITZ-CIRMO_FOI_Intel"
                  >Dashboards</a
                >
                will take you to three Excel spreadsheets that have pivot tables
                to aid in your filtering and already filtered sheets that
                summarize FOI data. Just click on your ministry to filter out
                the rest.
              </li>
              <li>
                FOI related information in the
                <a
                  href="https://catalogue.data.gov.bc.ca/dataset/freedom-of-information-foi-statistics"
                  >DataBC Data Catalogue</a
                >
                is updated quarterly.
              </li>
              <li>
                New FOI response packages that are suitable for publication are
                published on the
                <a
                  href="https://www2.gov.bc.ca/gov/content/governments/about-the-bc-government/open-government/open-information"
                  >Open Information</a
                >
                website daily and a number of other proactive disclosure
                products are also published on regularly recurring schedule.
              </li>
              <li>
                <a
                  href="https://www2.gov.bc.ca/gov/content/governments/about-the-bc-government/open-government/open-information/completed-foi-requests#reporting"
                  >Annual Reports</a
                >
                on the Administration of FOIPPA are published on the IAO
                website.
              </li>
            </ul>

            <h2>IAO Contacts</h2>
            <p>
            Your IAO Manager is available to discuss ad hoc reporting requests and any other
            issues relating to FOI requests.
            </p>
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
const instructionsPanel = ref([0]) // Open first panel by default
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
.v-expansion-panel-title__icon {
  color: #003366; // gov blue
}

.v-checkbox {
  display: flex !important;
  align-items: center !important;
}

.v-select .v-checkbox {
  display: flex !important;
  align-items: center !important;
  margin: 0 !important;
  padding: 0 !important;
  opacity: 1 !important; // Ensure checkboxes are fully visible
}

.v-select .v-checkbox .v-label {
  margin-left: 8px !important;
}

.v-selection-control__input input {
  opacity: 1 !important; // Ensure the input is visible for debugging
  position: static !important; // Reset position for visibility
  width: auto !important; // Adjust width for visibility
  height: auto !important; // Adjust height for visibility
}

</style>
