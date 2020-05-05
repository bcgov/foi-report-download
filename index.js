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
const pastDueMsg = 'Overdue requests are displayed in red'
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
  TRA: 'Ministry of Transportation and Infrastructure',
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
  FIN: ['FIN', 'PSA'],
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
      MAG: [...commonOrgGroup.MAG, 'OCC'],
    },
  },
  {
    date: moment('2015-07-01'),
    orgGroup: {
      ...commonOrgGroup,
      FIN: [...commonOrgGroup.FIN, 'BRD'],
      CTZ: [...commonOrgGroup.CTZ, 'GCP'],
      MAH: [...commonOrgGroup.MAH, 'HOU'],
      PSS: [...commonOrgGroup.PSS, 'LDB', 'OCC'],
    },
  },
]
const statusMap = {
  'All Open': [
    'Amended',
    'Assigned',
    'DAddRvwLog',
    'Disposition Accepted',
    'Documents Added',
    'Documents Delivered',
    'On Hold-Fee Related',
    'On Hold-Need Info/Clarification',
    'On Hold-Other',
    'Perfected',
    'Received',
    'Request for Docs Sent',
  ],
  'All On-Hold': [
    'On Hold-Fee Related',
    'On Hold-Need Info/Clarification',
    'On Hold-Other',
  ],
  'All Open excluding on-hold': [
    'Amended',
    'Assigned',
    'DAddRvwLog',
    'Disposition Accepted',
    'Documents Added',
    'Documents Delivered',
    'Perfected',
    'Received',
    'Request for Docs Sent',
  ],
  'All Closed': ['Closed'],
}

const summaryStatusMap = {
  open: [
    'Amended',
    'Assigned',
    'DAddRvwLog',
    'Disposition Accepted',
    'Documents Added',
    'Documents Delivered',
    'Perfected',
    'Received',
    'Request for Docs Sent',
  ],
  onHold: [
    'On Hold-Fee Related',
    'On Hold-Need Info/Clarification',
    'On Hold-Other',
  ],
}

const generalSummaryApplicantTypes = [
  'Business',
  'Individual',
  'Interest Group',
  'Law Firm',
  'Media',
  'Other Governments',
  'Other Public Body',
  'Political Party',
  'Researcher',
]

const typeMap = {
  Generals: ['General'],
  Personals: ['Personal'],
  Consultations: ['Consultation'],
  'OIPC Reviews/Complaints': ['Review', 'Complaint'],
}

if (process.env.FILE_STORE_PATH) {
  storeOptions.path = process.env.FILE_STORE_PATH
}
const store = new FileStore(storeOptions)
const keycloak = new Keycloak({ store: store, idpHint: 'idir' })
if (process.env.TRUST_PROXY) {
  app.set('trust proxy', process.env.TRUST_PROXY)
}
app.use(
  session({
    name: 'foiRequestDownload',
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    store: store,
  })
)
app.use(keycloak.middleware())
const PdfPrinter = require('pdfmake')
const { Pool } = require('pg')
const pool = new Pool({
  port: process.env.PGPORT || 5439,
  ssl: {
    rejectUnauthorized: false,
  },
})
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))
// Define font files
const pdfFonts = {
  Roboto: {
    normal: 'fonts/Roboto-Regular.ttf',
    bold: 'fonts/Roboto-Medium.ttf',
    italics: 'fonts/Roboto-Italic.ttf',
    bolditalics: 'fonts/Roboto-MediumItalic.ttf',
  },
}

app.get('/ping', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT $1::text as message', ['OK!'])
    res.end(rows[0].message)
  } catch (ex) {
    res.status(500).end()
  }
})
app.use(keycloak.protect())
app.post('/FOI-report', async (req, res) => {
  if (req.body.downloadToken) {
    res.cookie('downloadToken', req.body.downloadToken)
  }
  if (!req.body || !req.body.format) {
    res.status(403).end('missing format')
  }

  const selectStmt =
    'select request_id, applicant_type, description, start_date, duedate, ' +
    'current_activity, analyst, no_pages_in_request::integer, end_date, ' +
    'status, publication, type from foi.foi'
  const summarySelectStmt =
    'select type, applicant_type, status, case when ' +
    'duedate < trunc(getdate()) then true else false end ' +
    'as is_past_due from foi.foi'
  let filterMessages = []
  let pdfOnlyMessages = ['Report is sorted by start date in descending order']
  function composeQry(selectStmt, includeAllWhereClauses) {
    let parameters = []
    let qryTxt = ''
    for (const [i, e] of orgGroupByDate.entries()) {
      qryTxt += i === 0 ? '' : ' union all '
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
          includeAllWhereClauses &&
          filterMessages.push(
            `organization in (${orgCodes.map((e) => orgMap[e]).join(', ')})`
          )
      }
      if (req.body.startDateFrom) {
        parameters.push(req.body.startDateFrom)
        whereClauses.push('start_date >= ?')
        i === 0 &&
          includeAllWhereClauses &&
          filterMessages.push(`start date ≥ ${req.body.startDateFrom}`)
      }
      if (req.body.startDateTo) {
        parameters.push(req.body.startDateTo)
        whereClauses.push('start_date <= ?')
        i === 0 &&
          includeAllWhereClauses &&
          filterMessages.push(`start date ≤ ${req.body.startDateTo}`)
      }
      if (req.body.dueDateFrom) {
        parameters.push(req.body.dueDateFrom)
        whereClauses.push('duedate >= ?')
        i === 0 &&
          includeAllWhereClauses &&
          filterMessages.push(`due date ≥ ${req.body.dueDateFrom}`)
      }
      if (req.body.dueDateTo) {
        parameters.push(req.body.dueDateTo)
        whereClauses.push('duedate <= ?')
        i === 0 &&
          includeAllWhereClauses &&
          filterMessages.push(`due date ≤ ${req.body.dueDateTo}`)
      }
      if (req.body.applicantType && includeAllWhereClauses) {
        const applicantTypes = req.body.applicantType.split(',')
        parameters.push(applicantTypes)
        whereClauses.push(
          `applicant_type in ${pgParametrize.toTuple([applicantTypes])}`
        )
        i === 0 &&
          filterMessages.push(`applicant type in (${req.body.applicantType})`)
      }
      if (req.body.status && includeAllWhereClauses) {
        const statuses = req.body.status.split(',')
        const qryStatuses = _.uniq(
          statuses.reduce((a, e) => a.concat(statusMap[e]), [])
        )
        parameters.push(qryStatuses)
        whereClauses.push(`status in ${pgParametrize.toTuple([qryStatuses])}`)
        i === 0 && filterMessages.push(`status in (${req.body.status})`)
      }
      if (req.body.isOverdue && includeAllWhereClauses) {
        const isOverdueArr = req.body.isOverdue.split(',')
        if (
          isOverdueArr.indexOf('true') >= 0 &&
          isOverdueArr.indexOf('false') >= 0
        ) {
        } else if (isOverdueArr.indexOf('true') >= 0) {
          whereClauses.push(
            `(status <> 'Closed' AND duedate < '${moment().format(
              'YYYY-MM-DD'
            )}' ` + `OR status = 'Closed' AND duedate < end_date)`
          )
          i === 0 && filterMessages.push('Overdue requests')
        } else if (isOverdueArr.indexOf('false') >= 0) {
          whereClauses.push(
            `(status <> 'Closed' AND duedate >= '${moment().format(
              'YYYY-MM-DD'
            )}' ` + `OR status = 'Closed' AND duedate >= end_date)`
          )
          i === 0 && filterMessages.push('Non-overdue requests')
        }
      }
      // types
      let types = _.flatten(Object.values(typeMap))
      parameters.push(types)
      whereClauses.push(`type in ${pgParametrize.toTuple([types])}`)
      if (whereClauses.length > 0) {
        qryTxt += ` WHERE ${whereClauses.join(' AND ')}`
      }
    }
    return { query: qryTxt, parameters }
  }
  let { query: qryTxt, parameters } = composeQry(selectStmt, true)
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
            bold: true,
          },
        })
        const dataRowStyle = wb.createStyle({
          alignment: { wrapText: true, vertical: 'top' },
        })

        ws.column(1).setWidth(18)
        ws.column(2).setWidth(16)
        ws.column(3).setWidth(50)
        ws.column(4).setWidth(14)
        ws.column(5).setWidth(14)
        ws.column(6).setWidth(18)
        ws.column(7).setWidth(14)
        ws.column(8).setWidth(18)
        ws.column(9).setWidth(18)

        let currRow = 1
        if (filterMessages.length > 0) {
          ws.cell(currRow, 1, currRow + filterMessages.length - 1, 1, true)
            .string('Report is filtered by')
            .style({ alignment: { vertical: 'center' } })
          for (const item of filterMessages) {
            ws.cell(currRow++, 2).string(item)
          }
        }
        if (
          rows.some(
            (e) => e.duedate < moment().startOf('day') && e.status !== 'Closed'
          )
        ) {
          ws.cell(currRow++, 1).string(pastDueMsg)
        }
        ws.cell(currRow, 1).string('Request #').style(headerStyle)
        ws.cell(currRow, 2).string('Applicant Type').style(headerStyle)
        ws.cell(currRow, 3).string('Description').style(headerStyle)
        ws.cell(currRow, 4)
          .string('Start Date')
          .style(headerStyle)
          .style({ alignment: { horizontal: 'right' } })
        ws.cell(currRow, 5)
          .string('Due Date')
          .style(headerStyle)
          .style({ alignment: { horizontal: 'right' } })
        ws.cell(currRow, 6).string('Current Action').style(headerStyle)
        ws.cell(currRow, 7).string('Analyst').style(headerStyle)
        ws.cell(currRow, 8)
          .string('No Pages in Request')
          .style(headerStyle)
          .style({ alignment: { horizontal: 'right' } })
        ws.cell(currRow, 9).string('Publication Status').style(headerStyle)
        currRow++

        for (const [i, row] of rows.entries()) {
          let color = 'black'
          if (
            (row.duedate < moment().startOf('day') &&
              row.status !== 'Closed') ||
            (row.duedate < row.end_date && row.status === 'Closed')
          ) {
            color = 'red'
          }
          ws.cell(i + currRow, 1)
            .string(row.request_id)
            .style(dataRowStyle)
            .style({ font: { color: color } })
          ws.cell(i + currRow, 2)
            .string(row.applicant_type)
            .style(dataRowStyle)
            .style({ font: { color: color } })
          ws.cell(i + currRow, 3)
            .string(row.description)
            .style(dataRowStyle)
            .style({ font: { color: color } })
          ws.cell(i + currRow, 4)
            .date(row.start_date)
            .style(dataRowStyle)
            .style({ font: { color: color } })
          ws.cell(i + currRow, 5)
            .date(row.duedate)
            .style(dataRowStyle)
            .style({ font: { color: color } })
          ws.cell(i + currRow, 6)
            .string(row.current_activity)
            .style(dataRowStyle)
            .style({ font: { color: color } })
          ws.cell(i + currRow, 7)
            .string(row.analyst)
            .style(dataRowStyle)
            .style({ font: { color: color } })
          ws.cell(i + currRow, 8)
            .number(row.no_pages_in_request)
            .style(dataRowStyle)
            .style({ font: { color: color } })
          ws.cell(i + currRow, 9)
            .string(row.publication)
            .style(dataRowStyle)
            .style({ font: { color: color } })
        }
        wb.write('FOI-report.xlsx', res)
        break
      case 'PDF':
        let { query: qryTxt, parameters } = composeQry(summarySelectStmt, false)
        qryTxt = `select type, applicant_type, status, is_past_due::boolean, count(*)::integer as count from (${qryTxt}) group by 1,2,3,4`
        const { rows: summaryRows } = await pool.query(
          pgParametrize.toOrdinal(qryTxt),
          _.flatten(parameters)
        )
        const generalSummary = summaryRows.reduce(
          (acc, e) => {
            if (e.type !== 'General') {
              return acc
            }
            const idx = generalSummaryApplicantTypes.indexOf(e.applicant_type)
            if (idx < 0) {
              return acc
            }
            if (summaryStatusMap.open.indexOf(e.status) >= 0) {
              acc[idx].counts.open += e.count
              if (e.is_past_due) {
                acc[idx].counts.openAndOverDue += e.count
              }
            } else if (summaryStatusMap.onHold.indexOf(e.status) >= 0) {
              acc[idx].counts.onHold += e.count
            }
            return acc
          },
          generalSummaryApplicantTypes.map((e) => ({
            applicantType: e,
            counts: {
              open: 0,
              onHold: 0,
              openAndOverDue: 0,
            },
          }))
        )
        let generalSummaryTableBody = generalSummary.map((v, i) => {
          return [
            i === 0 ? { text: 'General', rowSpan: generalSummary.length } : '',
            { text: v.applicantType },
            { text: v.counts.open, style: { alignment: 'right' } },
            { text: v.counts.onHold, style: { alignment: 'right' } },
            { text: v.counts.openAndOverDue, style: { alignment: 'right' } },
          ]
        })
        generalSummaryTableBody.unshift([
          '',
          '',
          'Open',
          'On-Hold',
          'Currently Open and Overdue',
        ])
        generalSummaryTableBody.unshift([
          '',
          '',
          { text: 'General Requests', colSpan: 3, alignment: 'center' },
          '',
          '',
        ])

        const personalSummary = summaryRows.reduce(
          (acc, e) => {
            if (e.type !== 'Personal') {
              return acc
            }
            if (summaryStatusMap.open.indexOf(e.status) >= 0) {
              acc.open += e.count
              if (e.is_past_due) {
                acc.openAndOverDue += e.count
              }
            } else if (summaryStatusMap.onHold.indexOf(e.status) >= 0) {
              acc.onHold += e.count
            }
            return acc
          },
          {
            open: 0,
            onHold: 0,
            openAndOverDue: 0,
          }
        )
        let personalSummaryTableBody = [
          [
            'Personal',
            'Total',
            { text: personalSummary.open, style: { alignment: 'right' } },
            { text: personalSummary.onHold, style: { alignment: 'right' } },
            {
              text: personalSummary.openAndOverDue,
              style: { alignment: 'right' },
            },
          ],
        ]
        personalSummaryTableBody.unshift([
          '',
          '',
          'Open',
          'On-Hold',
          'Currently Open and Overdue',
        ])
        personalSummaryTableBody.unshift([
          '',
          '',
          { text: 'Personal Requests', colSpan: 3, alignment: 'center' },
          '',
          '',
        ])

        const printer = new PdfPrinter(pdfFonts)
        let hasOverdueOpenRows = false
        const tableBody = rows.map((v) => {
          let color = 'black'
          if (
            (v.duedate < moment().startOf('day') && v.status !== 'Closed') ||
            (v.duedate < v.end_date && v.status === 'Closed')
          ) {
            color = 'red'
            if (!hasOverdueOpenRows) {
              hasOverdueOpenRows = true
              pdfOnlyMessages.push(pastDueMsg)
            }
          }
          return [
            { text: v.request_id, color: color },
            { text: v.applicant_type, color: color },
            { text: v.description, color: color },
            { text: moment(v.start_date).format('YYYY-MM-DD'), color: color },
            { text: moment(v.duedate).format('YYYY-MM-DD'), color: color },
            { text: v.current_activity, color: color },
            { text: v.analyst, color: color },
            { text: v.no_pages_in_request, color: color, alignment: 'right' },
            { text: v.publication, color: color },
          ]
        })
        tableBody.unshift([
          'Request #',
          'Applicant Type',
          'Description',
          'Start Date',
          'Due Date',
          'Current Action',
          'Analyst',
          { text: 'No Pages in Request', alignment: 'right' },
          'Publication Status',
        ])
        const dd = {
          content: [
            {
              image: 'citz.jpg',
              width: 150,
            },
            {
              columns: [
                {
                  layout: 'lightHorizontalLines',
                  table: {
                    headerRows: 2,
                    body: generalSummaryTableBody,
                  },
                },
                {
                  layout: 'lightHorizontalLines',
                  table: {
                    headerRows: 2,
                    body: personalSummaryTableBody,
                  },
                },
              ],
              pageBreak: 'after',
            },
            {
              columns: [
                {
                  width: 'auto',
                  stack: pdfOnlyMessages.concat(
                    filterMessages.length === 0
                      ? []
                      : ['Report is filtered by', { ul: filterMessages }]
                  ),
                },
                {
                  stack: [
                    `Report generated on: ${moment().format('YYYY-MM-DD')}`,
                    `Total records: ${rows.length}`,
                  ],
                  width: '*',
                  alignment: 'right',
                },
              ],
            },
            {
              layout: 'modifiedLightHorizontalLines',
              table: {
                headerRows: 1,
                widths: [40, 40, 320, 46, 46, 40, 50, 34, '*'],
                body: tableBody,
              },
            },
          ],
          defaultStyle: {
            fontSize: 9,
          },
          pageOrientation: 'landscape',
          pageSize: 'LETTER',
          pageMargins: 20,
        }
        const options = {
          tableLayouts: {
            modifiedLightHorizontalLines: {
              // modified version of lightHorizontalLines with reduced padding
              // https://github.com/bpampuch/pdfmake/blob/f9c81aab71df3336d569dbd900c87c173d37636c/src/tableLayouts.js#L40
              hLineWidth(i, node) {
                if (i === 0 || i === node.table.body.length) {
                  return 0
                }
                return i === node.table.headerRows ? 2 : 1
              },
              vLineWidth(i) {
                return 0
              },
              hLineColor(i) {
                return i === 1 ? 'black' : '#aaa'
              },
              paddingLeft(i) {
                return i === 0 ? 0 : 4
              },
              paddingRight(i, node) {
                return i === node.table.widths.length - 1 ? 0 : 4
              },
            },
          },
        }
        const pdfDoc = printer.createPdfKitDocument(dd, options)
        res.setHeader(
          'content-disposition',
          'attachment; filename="FOI-report.pdf"'
        )
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
app.set('view engine', 'ejs')
app.set('views', 'client/dist')
app.engine('html', require('ejs').renderFile)
app.get('/', function (req, res) {
  res.render('index.html')
})
app.use(express.static('client/dist'))
app.listen(port, function () {
  // don't timeout in 2min for node<13
  this.setTimeout(0)
  console.log(`launch http://localhost:${port} to explore`)
})
