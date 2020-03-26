<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
    action="/FOI-report"
    method="post"
  >
    <v-container>
      <v-row>
        <v-col class="d-flex" cols="12" sm="6">
          <v-select
            :items="orgs"
            name="orgCode"
            label="Organization"
            multiple
            outlined
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="d-flex" cols="12" sm="6">
          <v-select
            :items="status"
            label="Status"
            name="status"
            v-model="defaultStatus"
            multiple
            outlined
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="d-flex" cols="12" sm="6">
          <v-select
            :items="applicantType"
            label="Applicant Type"
            name="applicantType"
            multiple
            outlined
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="d-flex" cols="7" md="4">
          <v-row>
            <v-col cols="12">Start Date From (inclusive)</v-col>
            <v-col cols="12"
              ><v-date-picker
                name="startDateFrom"
                v-model="startDateFrom"
              ></v-date-picker
            ></v-col>
            <input type="hidden" name="startDateFrom" :value="startDateFrom" />
          </v-row>
        </v-col>
        <v-col class="d-flex" cols="7" md="4">
          <v-row>
            <v-col cols="12">Start Date To (inclusive)</v-col>
            <v-col cols="12"
              ><v-date-picker
                name="startDateTo"
                v-model="startDateTo"
              ></v-date-picker
            ></v-col>
            <input type="hidden" name="startDateTo" :value="startDateTo" />
          </v-row>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="d-flex" cols="7" md="4">
          <v-row>
            <v-col cols="12">Due Date From (inclusive)</v-col>
            <v-col cols="12"
              ><v-date-picker
                name="dueDateFrom"
                v-model="dueDateFrom"
              ></v-date-picker
            ></v-col>
            <input type="hidden" name="dueDateFrom" :value="dueDateFrom" />
          </v-row>
        </v-col>
        <v-col class="d-flex" cols="7" md="4">
          <v-row>
            <v-col cols="12">Due Date To (inclusive)</v-col>
            <v-col cols="12"
              ><v-date-picker
                name="dueDateTo"
                v-model="dueDateTo"
              ></v-date-picker
            ></v-col>
            <input type="hidden" name="dueDateTo" :value="dueDateTo" />
          </v-row>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="d-flex" cols="12">
          <v-radio-group name="format" row label="File Format" mandatory>
            <v-radio label="PDF" value="PDF"></v-radio>
            <v-radio label="Excel" value="Excel"></v-radio>
          </v-radio-group>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="d-flex" cols="12">
          <v-alert type="warning">
            Report is limited to 5,000 records.
          </v-alert>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="d-flex" cols="12">
          <v-btn
            :disabled="!valid"
            color="success"
            class="mr-4"
            type="submit"
            @click="validate"
          >
            Submit
          </v-btn>
          <v-btn color="error" class="mr-4" @click="reset">
            Reset
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
export default {
  data: () => ({
    valid: true,
    startDateFrom: undefined,
    startDateTo: undefined,
    dueDateFrom: undefined,
    dueDateTo: undefined,
    defaultStatus: ['All Open'],
    status: [
      'All Open',
      'All Open excluding on-hold',
      'All On-Hold',
      'All Closed'
    ],
    applicantType: [
      'Business',
      'Individual',
      'Interest Group',
      'Law Firm',
      'Media',
      'Other Governments',
      'Other Public Body',
      'Political Party',
      'Researcher'
    ],
    orgs: [
      {
        value: 'AED',
        text: 'AED - Ministry of Advanced Education, Skills and Training'
      },
      { value: 'AGR', text: 'AGR - Ministry of Agriculture' },
      {
        value: 'CFD',
        text: 'CFD - Ministry of Children and Family Development'
      },
      { value: 'CTZ', text: "CTZ - Ministry of Citizens' Services" },
      { value: 'EAO', text: 'EAO - Environmental Assessment Office' },
      { value: 'EDU', text: 'EDU - Ministry of Education' },
      { value: 'EMB', text: 'EMB - Emergency Management BC' },
      {
        value: 'EMP',
        text: 'EMP - Ministry of Energy, Mines and Petroleum Resources'
      },
      { value: 'FIN', text: 'FIN - Ministry of Finance' },
      {
        value: 'FNR',
        text:
          'FNR - Ministry of Forests, Lands, Natural Resource Operations and Rural Development'
      },
      {
        value: 'GCP',
        text: 'GCP - Government Communications and Public Engagement'
      },
      { value: 'HTH', text: 'HTH - Ministry of Health' },
      {
        value: 'IRR',
        text: 'IRR - Ministry of Indigenous Relations and Reconciliation'
      },
      {
        value: 'JTT',
        text: 'JTT - Ministry of Jobs, Economic Development and Competitiveness'
      },
      { value: 'LBR', text: 'LBR - Ministry of Labour' },
      { value: 'LDB', text: 'LDB - Liquor Distribution Branch' },
      { value: 'MAG', text: 'MAG - Ministry of Attorney General' },
      { value: 'MAH', text: 'MAH - Ministry of Municipal Affairs and Housing' },
      { value: 'MHA', text: 'MHA - Ministry of Mental Health and Addictions' },
      {
        value: 'MOE',
        text: 'MOE - Ministry of Environment and Climate Change Strategy'
      },
      {
        value: 'MSD',
        text: 'MSD - Ministry of Social Development and Poverty Reduction'
      },
      { value: 'OCC', text: 'OCC - Office of the Chief Coroner' },
      { value: 'OOP', text: 'OOP - Office of the Premier' },
      { value: 'PSA', text: 'PSA - Public Service Agency' },
      {
        value: 'PSS',
        text: 'PSS - Ministry of Public Safety and Solicitor General'
      },
      { value: 'TAC', text: 'TAC - Ministry of Tourism, Arts and Culture' },
      {
        value: 'TRA',
        text: 'TRA - Ministry of Transportation and Infrastructure'
      }
    ]
  }),

  methods: {
    validate() {
      this.$refs.form.validate()
    },
    reset() {
      this.$refs.form.reset()
    }
  }
}
</script>
