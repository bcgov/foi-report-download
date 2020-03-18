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
          <v-row>
            <v-col cols="12">Start Date</v-col>
            <v-col cols="12"
              ><v-date-picker name="dateFrom" v-model="dateFrom"></v-date-picker
            ></v-col>
            <input type="hidden" name="dateFrom" :value="dateFrom" />
          </v-row>
        </v-col>
        <v-col class="d-flex" cols="12" sm="6">
          <v-row>
            <v-col cols="12">End Date</v-col>
            <v-col cols="12"
              ><v-date-picker name="dateTo" v-model="dateTo"></v-date-picker
            ></v-col>
            <input type="hidden" name="dateTo" :value="dateTo" />
          </v-row>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="d-flex" cols="12" sm="6">
          <v-select
            :items="applicantType"
            label="Applicant Type"
            name="applicantType"
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
            outlined
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-radio-group name="format" row label="File Format" mandatory>
          <v-radio label="PDF" value="PDF"></v-radio>
          <v-radio label="Excel" value="Excel"></v-radio>
        </v-radio-group>
      </v-row>
      <v-row>
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
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
export default {
  data: () => ({
    valid: true,
    dateFrom: undefined,
    dateTo: undefined,
    status: [
      'Assigned',
      'Disposition Accepted',
      'Documents Added',
      'On Hold-Other',
      'On Hold-Need Info/Clarification',
      'Documents Delivered',
      'Amended',
      'Request for Docs Sent',
      'DAddRvwLog',
      'Perfected',
      'Closed',
      'On Hold-Fee Related',
      'Received'
    ],
    applicantType: [
      'Individual',
      'Interest Group',
      'Law Firm',
      'Researcher',
      'Business',
      'Other Public Body',
      'Other Governments',
      'Media',
      'Political Party'
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
