const express = require('express')
const app = express()
const port = process.env.port || 8080
let session = require('express-session')
const moment = require('moment')
const FileStore = require('session-file-store')(session)
const Keycloak = require('keycloak-connect')
const storeOptions = { logFn: () => {} }
const pgParametrize = require('pg-parameterize')
const _ = require('lodash')
const pastDueMsg = 'Past due open records are displayed in red'
const orgMap = {
  AED: 'Ministry of Advanced Education, Skills and Training',
  AGR: 'Ministry of Agriculture',
  BRD: 'Board Resourcing and Development Office',
  CFD: 'Ministry of Children and Family Development',
  CSC: 'Ministry of Community, Sport and Cultural Development',
  CTZ: "Ministry of Citizens' Services",
  EAO: 'Environmental Assessment Office',
  EDU: 'Ministry of Education',
  EGM: 'Ministry of Energy and Mines',
  EMB: 'Emergency Management BC',
  EMP: 'Ministry of Energy, Mines and Petroleum Resources',
  FIN: 'Ministry of Finance',
  FNR:
    'Ministry of Forests, Lands, Natural Resource Operations and Rural Development',
  GCP: 'Government Communications and Public Engagement',
  HOU: 'Office of Housing and Construction Standards',
  HTH: 'Ministry of Health',
  IRR: 'Ministry of Indigenous Relations and Reconciliation',
  JAG: 'Ministry of Justice and Attorney General',
  JTI: 'Ministry of Jobs, Tourism, and Innovation',
  JTT: 'Ministry of Jobs, Economic Development and Competitiveness',
  LBR: 'Ministry of Labour',
  LDB: 'Liquor Distribution Branch',
  MAG: 'Ministry of Attorney General',
  MAH: 'Ministry of Municipal Affairs and Housing',
  MHA: 'Ministry of Mental Health and Addictions',
  MIT: 'Ministry of International Trade',
  MOE: 'Ministry of Environment and Climate Change Strategy',
  MSB: 'Ministry of Small Business and Red Tape Reduction',
  MSD: 'Ministry of Social Development and Poverty Reduction',
  NGD: 'Ministry of Natural Gas Development',
  OCC: 'Office of the Chief Coroner',
  OOP: 'Office of the Premier',
  PSA: 'Public Service Agency',
  PSS: 'Ministry of Public Safety and Solicitor General',
  TAC: 'Ministry of Tourism, Arts and Culture',
  TRA: 'Ministry of Transportation and Infrastructure'
}

const commonOrgGroup = {
  ...Object.keys(orgMap).reduce((a, e) => ((a[e] = [e]), a), {}),
  EMP: ['EMP', 'EGM'],
  MAH: ['MAH', 'CSC'],
  MOE: ['MOE', 'EAO'],
  EMP: ['EMP', 'EGM', 'NGD'],
  PSS: ['PSS', 'EMB'],
  MAG: ['MAG', 'JAG'],
  JTT: ['JTT', 'JTI', 'MIT', 'MSB'],
  FIN: ['FIN', 'PSA']
}

const orgGroupByDate = [
  {
    date: moment('2012-01-01'),
    orgGroup: {
      ...commonOrgGroup,
      CTZ: [...commonOrgGroup.CTZ, 'BRD'],
      FIN: [...commonOrgGroup.FIN, 'GCP'],
      EMP: [...commonOrgGroup.EMP, 'HOU'],
      JTT: [...commonOrgGroup.JTT, 'LDB'],
      MAG: [...commonOrgGroup.MAG, 'OCC']
    }
  },
  {
    date: moment('2015-07-01'),
    orgGroup: {
      ...commonOrgGroup,
      FIN: [...commonOrgGroup.FIN, 'BRD'],
      CTZ: [...commonOrgGroup.CTZ, 'GCP'],
      MAH: [...commonOrgGroup.MAH, 'HOU'],
      PSS: [...commonOrgGroup.PSS, 'LDB', 'OCC']
    }
  }
]
const statusMap = {
  'All Open': [
    'Amended',
    'Assigned',
    'DAddRvwLog',
    'Disposition Accepted',
    'Documents Added',
    'Documents Delivered',
    'On Hold-Fee Related',
    'On Hold-Need Info/Clarification',
    'On Hold-Other',
    'Perfected',
    'Received',
    'Request for Docs Sent'
  ],
  'All On-Hold': [
    'On Hold-Fee Related',
    'On Hold-Need Info/Clarification',
    'On Hold-Other'
  ],
  'All Open excluding on-hold': [
    'Amended',
    'Assigned',
    'DAddRvwLog',
    'Disposition Accepted',
    'Documents Added',
    'Documents Delivered',
    'Perfected',
    'Received',
    'Request for Docs Sent'
  ],
  'All Closed': ['Closed']
}
if (process.env.file_store_path) {
  storeOptions.path = process.env.file_store_path
}
const store = new FileStore(storeOptions)
const keycloak = new Keycloak({ store: store, idpHint: 'idir' })
if (process.env.trust_proxy) {
  app.set('trust proxy', process.env.trust_proxy)
}
app.use(
  session({
    name: 'foiRequestDownload',
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    store: store
  })
)
app.use(keycloak.middleware())
const PdfPrinter = require('pdfmake')
const { Pool } = require('pg')
const pool = new Pool({
  port: process.env.PGPORT || 5439,
  ssl: {
    rejectUnauthorized: false
  }
})
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))
// Define font files
const pdfFonts = {
  Roboto: {
    normal: 'fonts/Roboto-Regular.ttf',
    bold: 'fonts/Roboto-Medium.ttf',
    italics: 'fonts/Roboto-Italic.ttf',
    bolditalics: 'fonts/Roboto-MediumItalic.ttf'
  }
}

app.get('/ping', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT $1::text as message', ['OK!'])
    res.end(rows[0].message)
  } catch (ex) {
    res.status(500).end()
  }
})

app.post('/FOI-report', async (req, res) => {
  if (!req.body || !req.body.format) {
    res.status(403).end('missing format')
  }

  const selectStmt =
    'select request_id, start_date, duedate, status, applicant_type, ' +
    'analyst, description, current_activity from foi.foi'
  let qryTxt = ''
  let parameters = []
  let filterMessages = []
  let pdfOnlyMessages = ['Report is sorted by start date in descending order']
  for (const [i, e] of orgGroupByDate.entries()) {
    qryTxt += i === 0 ? '' : ' union '
    qryTxt += selectStmt
    let whereClauses = []
    parameters.push(e.date.format('YYYY-MM-DD'))
    whereClauses.push(`start_date >= ?`)
    if (i < orgGroupByDate.length - 1) {
      parameters.push(orgGroupByDate[i + 1].date.format('YYYY-MM-DD'))
      whereClauses.push(`start_date < ?`)
    }
    if (req.body.orgCode) {
      const orgCodes = req.body.orgCode.split(',')
      const qryOrgCodes = _.uniq(
        orgCodes.reduce((a, c) => a.concat(orgGroupByDate[i].orgGroup[c]), [])
      )
      parameters.push(qryOrgCodes)
      whereClauses.push(`proc_org in ${pgParametrize.toTuple([qryOrgCodes])}`)
      i === 0 &&
        filterMessages.push(
          `organization code in (${orgCodes.map(e => orgMap[e]).join(', ')})`
        )
    }
    if (req.body.startDateFrom) {
      parameters.push(req.body.startDateFrom)
      whereClauses.push('start_date >= ?')
      i === 0 && filterMessages.push(`start date ≥ ${req.body.startDateFrom}`)
    }
    if (req.body.startDateTo) {
      parameters.push(req.body.startDateTo)
      whereClauses.push('start_date <= ?')
      i === 0 && filterMessages.push(`start date ≤ ${req.body.startDateTo}`)
    }
    if (req.body.dueDateFrom) {
      parameters.push(req.body.dueDateFrom)
      whereClauses.push('duedate >= ?')
      i === 0 && filterMessages.push(`due date ≥ ${req.body.dueDateFrom}`)
    }
    if (req.body.dueDateTo) {
      parameters.push(req.body.dueDateTo)
      whereClauses.push('duedate <= ?')
      i === 0 && filterMessages.push(`due date ≤ ${req.body.dueDateTo}`)
    }
    if (req.body.applicantType) {
      const applicantTypes = req.body.applicantType.split(',')
      parameters.push(applicantTypes)
      whereClauses.push(
        `applicant_type in ${pgParametrize.toTuple([applicantTypes])}`
      )
      i === 0 &&
        filterMessages.push(`applicant type in (${req.body.applicantType})`)
    }
    if (req.body.status) {
      const statuses = req.body.status.split(',')
      const qryStatuses = _.uniq(
        statuses.reduce((a, e) => a.concat(statusMap[e]), [])
      )
      parameters.push(qryStatuses)
      whereClauses.push(`status in ${pgParametrize.toTuple([qryStatuses])}`)
      i === 0 && filterMessages.push(`status in (${req.body.status})`)
    }
    if (whereClauses.length > 0) {
      qryTxt += ` WHERE ${whereClauses.join(' AND ')}`
    }
  }

  qryTxt += ' order by start_date desc limit 5000'
  try {
    const { rows } = await pool.query(
      pgParametrize.toOrdinal(qryTxt),
      _.flatten(parameters)
    )
    switch (req.body.format) {
      case 'Excel':
        // Require library
        const xl = require('excel4node')

        // Create a new instance of a Workbook class
        const wb = new xl.Workbook()

        // Add Worksheets to the workbook
        const ws = wb.addWorksheet(
          `FOI Report ${moment().format('YYYY-MM-DD')}`
        )

        // Create a reusable style
        const headerStyle = wb.createStyle({
          font: {
            bold: true
          }
        })
        const dataRowStyle = wb.createStyle({
          alignment: { wrapText: true, vertical: 'top' }
        })

        ws.column(1).setWidth(18)
        ws.column(4).setWidth(16)
        ws.column(5).setWidth(16)
        ws.column(6).setWidth(50)

        let currRow = 1
        if (filterMessages.length > 0) {
          ws.cell(currRow, 1, currRow + filterMessages.length - 1, 1, true)
            .string('Report is filtered by')
            .style({ alignment: { vertical: 'center' } })
          for (const item of filterMessages) {
            ws.cell(currRow++, 2).string(item)
          }
        }
        if (rows.some(e => e.duedate < new Date() && e.status !== 'Closed')) {
          ws.cell(currRow++, 1).string(pastDueMsg)
        }
        ws.cell(currRow, 1)
          .string('request_id')
          .style(headerStyle)
        ws.cell(currRow, 2)
          .string('start_date')
          .style(headerStyle)
          .style({ alignment: { horizontal: 'right' } })
        ws.cell(currRow, 3)
          .string('duedate')
          .style(headerStyle)
          .style({ alignment: { horizontal: 'right' } })
        ws.cell(currRow, 4)
          .string('status')
          .style(headerStyle)
        ws.cell(currRow, 5)
          .string('applicant_type')
          .style(headerStyle)
        ws.cell(currRow, 6)
          .string('description')
          .style(headerStyle)
        ws.cell(currRow, 7)
          .string('analyst')
          .style(headerStyle)
        ws.cell(currRow, 8)
          .string('current_activity')
          .style(headerStyle)
        currRow++

        for (const [i, row] of rows.entries()) {
          let color = 'black'
          if (row.duedate < new Date() && rows.status !== 'Closed') {
            color = 'red'
          }
          ws.cell(i + currRow, 1)
            .string(row.request_id)
            .style(dataRowStyle)
            .style({ font: { color: color } })
          ws.cell(i + currRow, 2)
            .date(row.start_date)
            .style(dataRowStyle)
            .style({ font: { color: color } })
          ws.cell(i + currRow, 3)
            .date(row.duedate)
            .style(dataRowStyle)
            .style({ font: { color: color } })
          ws.cell(i + currRow, 4)
            .string(row.status)
            .style(dataRowStyle)
            .style({ font: { color: color } })
          ws.cell(i + currRow, 5)
            .string(row.applicant_type)
            .style(dataRowStyle)
            .style({ font: { color: color } })
          ws.cell(i + currRow, 6)
            .string(row.description)
            .style(dataRowStyle)
            .style({ font: { color: color } })
          ws.cell(i + currRow, 7)
            .string(row.analyst)
            .style(dataRowStyle)
            .style({ font: { color: color } })
          ws.cell(i + currRow, 8)
            .string(row.current_activity)
            .style(dataRowStyle)
            .style({ font: { color: color } })
        }
        wb.write('FOI-report.xlsx', res)
        break
      case 'PDF':
        const printer = new PdfPrinter(pdfFonts)
        let hasOverdueOpenRows = false
        const tableBody = rows.map(v => {
          let color = 'black'
          if (v.duedate < new Date() && v.status !== 'Closed') {
            color = 'red'
            if (!hasOverdueOpenRows) {
              hasOverdueOpenRows = true
              pdfOnlyMessages.push(pastDueMsg)
            }
          }
          return [
            { text: v.request_id, color: color },
            { text: moment(v.start_date).format('YYYY-MM-DD'), color: color },
            { text: moment(v.duedate).format('YYYY-MM-DD'), color: color },
            { text: v.status, color: color },
            { text: v.applicant_type, color: color },
            { text: v.description, color: color },
            { text: v.analyst, color: color },
            { text: v.current_activity, color: color }
          ]
        })
        tableBody.unshift([
          'request id',
          'start date',
          'due date',
          'status',
          'applicant type',
          'description',
          'analyst',
          'current activity'
        ])
        const dd = {
          content: [
            {
              image: 'citz.jpg',
              width: 150
            },
            {
              columns: [
                {
                  width: 'auto',
                  stack: pdfOnlyMessages.concat(
                    !filterMessages
                      ? []
                      : ['Report is filtered by', { ul: filterMessages }]
                  )
                },
                {
                  stack: [
                    `Report generated on: ${moment().format('YYYY-MM-DD')}`,
                    `Total records: ${rows.length}`
                  ],
                  width: '*',
                  alignment: 'right'
                }
              ]
            },
            {
              layout: 'lightHorizontalLines', // optional
              table: {
                headerRows: 1,
                widths: [40, 46, 46, 40, 60, '*', 30, 40],
                body: tableBody
              }
            }
          ],
          defaultStyle: {
            fontSize: 9
          },
          pageOrientation: 'landscape',
          pageSize: 'LETTER',
          pageMargins: 20
        }
        const options = {}
        const pdfDoc = printer.createPdfKitDocument(dd, options)
        res.setHeader('content-disposition', 'filename="FOI-report.pdf"')
        pdfDoc.pipe(res)
        pdfDoc.end()
        break
      default:
        res.status(403).end('unsupported format')
    }
  } catch (ex) {
    console.log(ex)
    if (!res.headersSent) {
      res.status(500)
    }
    res.end()
  }
})
app.use(keycloak.protect(), express.static('client/dist'))
app.listen(port, function() {
  // don't timeout in 2min for node<13
  this.setTimeout(0)
  console.log(`launch http://localhost:${port} to explore`)
})
