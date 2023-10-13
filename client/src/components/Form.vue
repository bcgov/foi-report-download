<template>
  <v-form
    ref="form"
    autocomplete="off"
    v-model="valid"
    lazy-validation
    action="/FOI-report"
    method="post"
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
            outlined
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
            outlined
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
            outlined
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
            outlined
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="1">Start Date</v-col>
        <v-col cols="12" sm="3"
          ><date-input
            label="From (inclusive)"
            v-model="startDateFrom"
            name="startDateFrom"
          ></date-input
        ></v-col>
        <v-col cols="12" sm="3"
          ><date-input
            label="To (inclusive)"
            v-model="startDateTo"
            name="startDateTo"
          ></date-input
        ></v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="1">Due Date</v-col>
        <v-col cols="12" sm="3"
          ><date-input
            label="From (inclusive)"
            v-model="dueDateFrom"
            name="dueDateFrom"
          ></date-input
        ></v-col>
        <v-col cols="12" sm="3"
          ><date-input
            label="To (inclusive)"
            v-model="dueDateTo"
            name="dueDateTo"
          ></date-input
        ></v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-radio-group
            name="format"
            row
            label="File Format"
            v-model="fileFormat"
            mandatory
          >
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
          <v-btn
            :disabled="!valid || isSubmitting"
            color="success"
            class="mr-4"
            type="submit"
            @click="validate"
          >
            <span v-if="!isSubmitting">Submit</span>
            <v-progress-circular
              indeterminate
              color="white"
              class="mx-3"
              v-if="isSubmitting"
              >Submit</v-progress-circular
            >
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

<script>
import DateInput from './date-input'
export default {
  components: {
    DateInput
  },
  data: () => ({
    downloadTimer: null,
    downloadToken: '',
    isSubmitting: false,
    valid: true,
    startDateFrom: null,
    startDateTo: null,
    dueDateFrom: null,
    dueDateTo: null,
    fileFormat: 'PDF',
    selectedStatus: ['All Open'],
    status: [
      'All Open',
      'All Open excluding on-hold',
      'All On-Hold',
      'All Closed'
    ],
    selectedApplicantType: [null],
    applicantType: [
      { value: null, text: '(All Applicant Types)' },
      'Business',
      'Individual',
      'Interest Group',
      'Law Firm',
      'Media',
      'Other Governments',
      'Other Public Body',
      'Political Party',
      'Researcher'
    ],
    selectedIsOverdue: [true, false],
    isOverdue: [
      { value: true, text: 'Overdue requests' },
      { value: false, text: 'Non-overdue requests' }
    ],
    selectedOrgs: [null],
    orgs: [
      { value: null, text: '(All Organizations)' },
      
      { value: 'AGR', text: 'AGR - Ministry of Agriculture and Food' },
      { value: 'CAS', text: 'CAS - Crown Agencies Secretariat' },

      {
        value: 'CFD',
        text: 'CFD - Ministry of Children and Family Development'
      },
      { value: 'COR', text: "COR - BC Corrections" },
      { value: 'CTZ', text: "CTZ - Ministry of Citizens' Services" },
      { value: 'DAS', text: "DAS - Declaration Act Secretariat" },
      { value: 'EAO', text: 'EAO - Environmental Assessment Office' },
      { value: 'ECC', text: 'ECC - Ministry of Education and Child Care' },
      { value: 'EMC', text: 'EMC - Ministry of Emergency Management and Climate Readiness' },
      {
        value: 'EML',
        text: 'EML - Ministry of Energy, Mines and Low Carbon Innovation'
      },
      { value: 'FIN', text: 'FIN - Ministry of Finance' },
      {
        value: 'FOR',
        text:
          'FOR - Ministry of Forests'
      },
      {
        value: 'GCP',
        text: 'GCP - Government Communications and Public Engagement'
      },
      { value: 'HSG', text: 'HSG - Ministry of Housing' },
      { value: 'HTH', text: 'HTH - Ministry of Health' },
      {
        value: 'IRR',
        text: 'IRR - Ministry of Indigenous Relations and Reconciliation'
      },
      {
        value: 'JED',
        text: 'JED - Ministry of Jobs, Economic Development and Innovation'
      },
      { value: 'LBR', text: 'LBR - Ministry of Labour' },
      { value: 'LDB', text: 'LDB - Liquor Distribution Branch' },
      { value: 'MAG', text: 'MAG - Ministry of Attorney General' },
      { value: 'MMA', text: 'MMA - Ministry of Municipal Affairs' },
      { value: 'MHA', text: 'MHA - Ministry of Mental Health and Addictions' },
      {
        value: 'MOE',
        text: 'MOE - Ministry of Environment and Climate Change Strategy'
      },
      {
        value: 'MSD',
        text: 'MSD - Ministry of Social Development and Poverty Reduction'
      },
      { value: 'OCC', text: 'OCC - Coroners Service of BC' },
      { value: 'OOP', text: 'OOP - Office of the Premier' },
      { value: 'PSA', text: 'PSA - Public Service Agency' },
      {
        value: 'PSE',
        text: 'PSE - Ministry of Post-Secondary Education and Future Skills'
      },
      {
        value: 'PSS',
        text: 'PSS - Ministry of Public Safety and Solicitor General'
      },
      { value: 'TAC', text: 'TAC - Ministry of Tourism, Arts, Culture and Sport' },
      {
        value: 'TRA',
        text: 'TRA - Ministry of Transportation and Infrastructure'
      },
      {
        value: 'WLR',
        text: 'WLR - Ministry of Water, Land and Resource Stewardship'
      }
    ]
  }),
  watch: {
    selectedOrgs: function(newVal) {
      this.allItemToggler(newVal, 'selectedOrgs')
    },
    selectedApplicantType: function(newVal) {
      this.allItemToggler(newVal, 'selectedApplicantType')
    }
  },
  methods: {
    allItemToggler(newVal, dataField) {
      if (newVal.length === 0) {
        return this[dataField].push(null)
      }
      let nullIdx = newVal.indexOf(null)
      if (nullIdx < 0) return
      if (newVal.length === 1 && nullIdx === 0) return
      if (nullIdx === newVal.length - 1) {
        newVal.splice(0, newVal.length - 1)
      }
      this[dataField].splice(nullIdx, 1)
    },
    validate() {
      this.$refs.form.validate()
      let snowPlowIsOverdue = 'All'
      if (this.selectedIsOverdue.length === 1) {
        snowPlowIsOverdue = this.selectedIsOverdue[0] === true ? 'Yes' : 'No'
      }
      window.snowplow('trackSelfDescribingEvent', {
        schema: 'iglu:ca.bc.gov.foi/foi_report/jsonschema/2-0-0',
        data: {
          organization: this.selectedOrgs,
          status: this.selectedStatus,
          applicant_type: this.selectedApplicantType,
          is_overdue: snowPlowIsOverdue,
          start_date_start: this.startDateFrom,
          start_date_end: this.startDateTo,
          due_date_start: this.dueDateFrom,
          due_date_end: this.dueDateTo,
          file_format: this.fileFormat
        }
      })
      this.blockResubmit()
    },
    reset() {
      this.$refs.form.reset()
    },
    getCookie(name) {
      var parts = document.cookie.split(name + '=')
      if (parts.length == 2)
        return parts
          .pop()
          .split(';')
          .shift()
    },
    expireCookie(cName) {
      document.cookie =
        encodeURIComponent(cName) +
        '=deleted; expires=' +
        new Date(0).toUTCString()
    },
    setFormToken() {
      this.downloadToken = new Date().getTime()
    },
    // Prevents double-submits by waiting for a cookie from the server.
    blockResubmit() {
      window.setTimeout(
        function() {
          this.isSubmitting = true
        }.bind(this),
        0
      )
      document.body.style.cursor = 'wait'
      this.setFormToken()
      this.downloadTimer = window.setInterval(
        function() {
          var token = this.getCookie('downloadToken')
          if (token == this.downloadToken) {
            this.unblockSubmit()
          }
        }.bind(this),
        1000
      )
    },
    unblockSubmit() {
      this.isSubmitting = false
      document.body.style.cursor = 'unset'
      window.clearInterval(this.downloadTimer)
      this.expireCookie('downloadToken')
    }
  }
}
</script>
