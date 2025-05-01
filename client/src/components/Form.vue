<template>
  <div>
    <iframe name="hiddenDownloader" style="display: none;"></iframe>

    <v-form
      ref="form"
      autocomplete="off"
      v-model="valid"
      action="/FOI-report"
      method="post"
      target="hiddenDownloader"
      @submit.prevent="validate"
    >
      <v-container>
        <!-- Organization -->
        <v-row>
          <v-col cols="12" sm="6">
            <v-select
              :items="orgs"
              v-model="selectedOrgs"
              name="orgCode"
              label="Organization"
              multiple
              variant="outlined"
            >
              <template #item="{ item, index }">
                <v-checkbox
                  :value="item.value"
                  :label="item.title || item"
                  v-model="selectedOrgs"
                  :key="index"
                />
              </template>
            </v-select>
          </v-col>
        </v-row>

        <!-- Status -->
        <v-row>
          <v-col cols="12" sm="6">
            <v-select
              :items="status"
              v-model="selectedStatus"
              label="Status"
              name="status"
              multiple
              variant="outlined"
            />
          </v-col>
        </v-row>

        <!-- Applicant Type -->
        <v-row>
          <v-col cols="12" sm="6">
            <v-select
              :items="applicantType"
              v-model="selectedApplicantType"
              label="Applicant Type"
              name="applicantType"
              multiple
              variant="outlined"
            />
          </v-col>
        </v-row>

        <!-- Overdue -->
        <v-row>
          <v-col cols="12" sm="6">
            <v-select
              :items="isOverdue"
              v-model="selectedIsOverdue"
              label="Overdue"
              name="isOverdue"
              multiple
              variant="outlined"
            />
          </v-col>
        </v-row>

        <!-- Start Date -->
        <v-row>
          <v-col cols="12" sm="1">Start Date</v-col>
          <v-col cols="12" sm="3">
            <date-input
              label="From (inclusive)"
              v-model="startDateFrom"
              name="startDateFrom"
            />
          </v-col>
          <v-col cols="12" sm="3">
            <date-input
              label="To (inclusive)"
              v-model="startDateTo"
              name="startDateTo"
            />
          </v-col>
        </v-row>

        <!-- Due Date -->
        <v-row>
          <v-col cols="12" sm="1">Due Date</v-col>
          <v-col cols="12" sm="3">
            <date-input
              label="From (inclusive)"
              v-model="dueDateFrom"
              name="dueDateFrom"
            />
          </v-col>
          <v-col cols="12" sm="3">
            <date-input
              label="To (inclusive)"
              v-model="dueDateTo"
              name="dueDateTo"
            />
          </v-col>
        </v-row>

        <!-- File Format -->
        <v-row>
          <v-col cols="12">
            <v-radio-group
              name="format"
              row
              label="File Format"
              v-model="fileFormat"
              mandatory
            >
              <v-radio label="PDF" value="PDF" />
              <v-radio label="Excel" value="Excel" />
            </v-radio-group>
          </v-col>
        </v-row>

        <!-- Info Alert -->
        <v-row>
          <v-col class="d-flex" cols="12">
            <v-alert type="warning" icon="mdi-alert-circle">
              Report is limited to 5,000 results.
            </v-alert>
          </v-col>
        </v-row>

        <!-- Submit Buttons -->
        <v-row>
          <v-col cols="12">
            <v-btn
              :disabled="!valid || isSubmitting"
              color="success"
              class="mr-4"
              type="submit"
            >
              <span v-if="!isSubmitting">Submit</span>
              <v-progress-circular
                v-else
                indeterminate
                color="white"
                class="mx-3"
              />
            </v-btn>
            <v-btn color="error" class="mr-4" @click="reset">Reset</v-btn>
          </v-col>
        </v-row>
      </v-container>

      <input type="hidden" name="downloadToken" :value="downloadToken" />
    </v-form>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'
import DateInput from './date-input.vue'

const form = ref(null)
const valid = ref(true)
const isSubmitting = ref(false)
const downloadToken = ref('')
let downloadTimer = null

const startDateFrom = ref(null)
const startDateTo = ref(null)
const dueDateFrom = ref(null)
const dueDateTo = ref(null)
const fileFormat = ref('PDF')

// Multi-selects initialized as empty arrays
const selectedStatus = ref(['All Open'])
const selectedApplicantType = ref([null])
const selectedIsOverdue = ref([true, false])
const selectedOrgs = ref([null])

const status = ['All Open', 'All Open excluding on-hold', 'All On-Hold', 'All Closed']
const applicantType = [
  { value: null, title: '(All Applicant Types)' },
  'Business',
  'Individual',
  'Interest Group',
  'Law Firm',
  'Media',
  'Other Governments',
  'Other Public Body',
  'Political Party',
  'Researcher'
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
  { value: 'DAS', title: 'DAS - Declaration Act Secretariat' },
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
  form.value.validate()
  if (!valid.value) return

  downloadToken.value = Date.now().toString()
  isSubmitting.value = true
  document.body.style.cursor = 'wait'

  const isOverdueValue = selectedIsOverdue.value.length === 1
    ? (selectedIsOverdue.value[0] === true ? 'Yes' : 'No')
    : 'All'

  window.snowplow?.('trackSelfDescribingEvent', {
    schema: 'iglu:ca.bc.gov.foi/foi_report/jsonschema/2-0-0',
    data: {
      organization: selectedOrgs.value,
      status: selectedStatus.value,
      applicant_type: selectedApplicantType.value,
      is_overdue: isOverdueValue,
      start_date_start: startDateFrom.value,
      start_date_end: startDateTo.value,
      due_date_start: dueDateFrom.value,
      due_date_end: dueDateTo.value,
      file_format: fileFormat.value
    }
  })

  downloadTimer = setInterval(() => {
    const cookie = getCookie('downloadToken')
    if (cookie === downloadToken.value) {
      unblockSubmit()
    }
  }, 1000)

  form.value.$el.submit()
}

const unblockSubmit = () => {
  isSubmitting.value = false
  document.body.style.cursor = 'unset'
  clearInterval(downloadTimer)
  expireCookie('downloadToken')
}

const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}

const expireCookie = (name) => {
  document.cookie = `${encodeURIComponent(name)}=deleted; expires=${new Date(0).toUTCString()}`
}

const reset = () => {
  form.value.reset()
}

onBeforeUnmount(() => {
  if (downloadTimer) clearInterval(downloadTimer)
})
</script>
