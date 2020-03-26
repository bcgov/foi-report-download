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
            label="Organization Code"
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
      'AED',
      'AGR',
      'BRD',
      'CFD',
      'CLB',
      'CTZ',
      'EAO',
      'EDU',
      'EMB',
      'EMP',
      'FIN',
      'FNR',
      'GCP',
      'HOU',
      'HSA',
      'HTH',
      'IIO',
      'IRR',
      'JTT',
      'LBR',
      'LDB',
      'MAG',
      'MAH',
      'MGC',
      'MHA',
      'MIT',
      'MOE',
      'MSB',
      'MSD',
      'NGD',
      'OBC',
      'OCC',
      'OOP',
      'PSA',
      'PSS',
      'TAC',
      'TRA'
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
