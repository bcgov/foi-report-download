<template>
  <v-form
    ref="form"
    autocomplete="off"
    v-model="valid"
    action="/FOI-report"
    method="post"
    @submit.prevent="validate"
  >
    <v-container>
      <v-row>
        <v-col cols="12" sm="6">
          <v-select
            :items="orgs"
            v-model="selectedOrgs"
            name="orgCode"
            label="Organization"
            multiple
            variant="outlined"
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="6">
          <v-select
            :items="status"
            label="Status"
            name="status"
            v-model="selectedStatus"
            multiple
            variant="outlined"
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="6">
          <v-select
            :items="applicantType"
            v-model="selectedApplicantType"
            label="Applicant Type"
            name="applicantType"
            multiple
            variant="outlined"
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="6">
          <v-select
            :items="isOverdue"
            v-model="selectedIsOverdue"
            label="Overdue"
            name="isOverdue"
            multiple
            variant="outlined"
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="1">Start Date</v-col>
        <v-col cols="12" sm="3">
          <date-input label="From (inclusive)" v-model="startDateFrom" name="startDateFrom"></date-input>
        </v-col>
        <v-col cols="12" sm="3">
          <date-input label="To (inclusive)" v-model="startDateTo" name="startDateTo"></date-input>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="1">Due Date</v-col>
        <v-col cols="12" sm="3">
          <date-input label="From (inclusive)" v-model="dueDateFrom" name="dueDateFrom"></date-input>
        </v-col>
        <v-col cols="12" sm="3">
          <date-input label="To (inclusive)" v-model="dueDateTo" name="dueDateTo"></date-input>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-radio-group name="format" row label="File Format" v-model="fileFormat" mandatory>
            <v-radio label="PDF" value="PDF"></v-radio>
            <v-radio label="Excel" value="Excel"></v-radio>
          </v-radio-group>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="d-flex" cols="12">
          <v-alert type="warning" icon="mdi-alert-circle">
            Report is limited to 5,000 results.
          </v-alert>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-btn :disabled="!valid || isSubmitting" color="success" class="mr-4" type="submit">
            <span v-if="!isSubmitting">Submit</span>
            <v-progress-circular indeterminate color="white" class="mx-3" v-if="isSubmitting" />
          </v-btn>
          <v-btn color="error" class="mr-4" @click="reset">
            Reset
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
    <input type="hidden" name="downloadToken" :value="downloadToken" />
  </v-form>
</template>

<script setup>
import { ref } from 'vue'
import DateInput from './date-input.vue'

const form = ref(null)
const valid = ref(true)
const isSubmitting = ref(false)
const downloadToken = ref('')

const startDateFrom = ref(null)
const startDateTo = ref(null)
const dueDateFrom = ref(null)
const dueDateTo = ref(null)
const fileFormat = ref('PDF')

const selectedStatus = ref(['All Open'])
const selectedApplicantType = ref([null])
const selectedIsOverdue = ref([true, false])
const selectedOrgs = ref([null])

const status = ['All Open', 'All Open excluding on-hold', 'All On-Hold', 'All Closed']

const applicantType = [
  { value: null, title: '(All Applicant Types)' },
  'Business', 'Individual', 'Interest Group', 'Law Firm', 'Media', 'Other Governments',
  'Other Public Body', 'Political Party', 'Researcher'
]

const isOverdue = [
  { value: true, title: 'Overdue requests' },
  { value: false, title: 'Non-overdue requests' }
]

const orgs = [
  { value: null, title: '(All Organizations)' },
  { value: 'AGR', title: 'AGR - Ministry of Agriculture and Food' },
  { value: 'CAS', title: 'CAS - Crown Agencies Secretariat' },
  { value: 'CFD', title: 'CFD - Ministry of Children and Family Development' },
  { value: 'COR', title: 'COR - BC Corrections' },
  { value: 'CTZ', title: "CTZ - Ministry of Citizens' Services" },
  { value: 'DAS', title: "DAS - Declaration Act Secretariat" },
  { value: 'EAO', title: 'EAO - Environmental Assessment Office' },
  { value: 'ECC', title: 'ECC - Ministry of Education and Child Care' },
  { value: 'EMC', title: 'EMC - Ministry of Emergency Management and Climate Readiness' },
  { value: 'EML', title: 'EML - Ministry of Energy, Mines and Low Carbon Innovation' },
  { value: 'FIN', title: 'FIN - Ministry of Finance' },
  { value: 'FOR', title: 'FOR - Ministry of Forests' },
  { value: 'GCP', title: 'GCP - Government Communications and Public Engagement' },
  { value: 'HSG', title: 'HSG - Ministry of Housing' },
  { value: 'HTH', title: 'HTH - Ministry of Health' },
  { value: 'IRR', title: 'IRR - Ministry of Indigenous Relations and Reconciliation' },
  { value: 'JED', title: 'JED - Ministry of Jobs, Economic Development and Innovation' },
  { value: 'LBR', title: 'LBR - Ministry of Labour' },
  { value: 'LDB', title: 'LDB - Liquor Distribution Branch' },
  { value: 'MAG', title: 'MAG - Ministry of Attorney General' },
  { value: 'MHA', title: 'MHA - Ministry of Mental Health and Addictions' },
  { value: 'MMA', title: 'MMA - Ministry of Municipal Affairs' },
  { value: 'MOE', title: 'MOE - Ministry of Environment and Climate Change Strategy' },
  { value: 'MSD', title: 'MSD - Ministry of Social Development and Poverty Reduction' },
  { value: 'OCC', title: 'OCC - Coroners Service of BC' },
  { value: 'OOP', title: 'OOP - Office of the Premier' },
  { value: 'PSA', title: 'PSA - Public Service Agency' },
  { value: 'PSE', title: 'PSE - Ministry of Post-Secondary Education and Future Skills' },
  { value: 'PSS', title: 'PSS - Ministry of Public Safety and Solicitor General' },
  { value: 'TAC', title: 'TAC - Ministry of Tourism, Arts, Culture and Sport' },
  { value: 'TRA', title: 'TRA - Ministry of Transportation and Infrastructure' },
  { value: 'WLR', title: 'WLR - Ministry of Water, Land and Resource Stewardship' }
]

const validate = () => {
  form.value.validate();
  if (!valid.value) return;

  isSubmitting.value = true;
  downloadToken.value = Date.now().toString();

  // window.snowplow('trackSelfDescribingEvent', { 
  //   schema: 'iglu:ca.bc.gov.foi/foi_report/jsonschema/2-0-0',
  //   data: { organization: selectedOrgs.value, file_format: fileFormat.value }
  // });

  form.value.$el.submit();
};

const reset = () => form.value.reset();
</script>
