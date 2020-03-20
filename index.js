const express = require('express')
const app = express()
const port = process.env.port || 8080
let session = require('express-session')
const moment = require('moment')
const FileStore = require('session-file-store')(session)
const Keycloak = require('keycloak-connect')
const storeOptions = { logFn: () => {} }
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

  let qryTxt =
    'select request_id, start_date, duedate, status, applicant_type, ' +
    'analyst, description, current_activity from foi.foi'
  let whereClauses = []
  let parameters = []
  let filterMessages = []
  let sortMessages = ['Report is sorted by start date in descending order']
  let parameterIndex = 0
  if (req.body.orgCode) {
    parameters.push("'" + req.body.orgCode.split(',').join(`','`) + "'")
    whereClauses.push(`proc_org in (${parameters[parameterIndex++]})`)
    filterMessages.push(`organization code in (${req.body.orgCode})`)
  }
  if (req.body.dateFrom) {
    parameters.push(req.body.dateFrom)
    whereClauses.push(`start_date >= $${++parameterIndex}`)
    filterMessages.push(`start date ≥ ${req.body.dateFrom}`)
  }
  if (req.body.dateTo) {
    parameters.push(req.body.dateTo)
    whereClauses.push(`start_date <= $${++parameterIndex}`)
    filterMessages.push(`start date ≤ ${req.body.dateTo}`)
  }
  if (req.body.applicantType) {
    parameters.push("'" + req.body.applicantType.split(',').join(`','`) + "'")
    whereClauses.push(`applicant_type in (${parameters[parameterIndex++]})`)
    filterMessages.push(`applicant type in (${req.body.applicantType})`)
  }
  if (req.body.status) {
    parameters.push("'" + req.body.status.split(',').join(`','`) + "'")
    whereClauses.push(`status in (${parameters[parameterIndex++]})`)
    filterMessages.push(`status in (${req.body.status})`)
  }
  if (whereClauses.length > 0) {
    qryTxt += ` WHERE ${whereClauses.join(' AND ')}`
  }
  qryTxt += ' order by start_date desc limit 5000'
  try {
    const { rows } = await pool.query(qryTxt, parameters)
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

        let currRow = 1
        if (filterMessages.length > 0) {
          ws.cell(currRow, 1, currRow + filterMessages.length - 1, 1, true)
            .string('Report is filtered by')
            .style({ alignment: { vertical: 'center' } })
          for (const item of filterMessages) {
            ws.cell(currRow++, 2).string(item)
          }
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
          ws.cell(i + currRow, 1).string(row.request_id)
          ws.cell(i + currRow, 2).date(row.start_date)
          ws.cell(i + currRow, 3).date(row.duedate)
          ws.cell(i + currRow, 4).string(row.status)
          ws.cell(i + currRow, 5).string(row.applicant_type)
          ws.cell(i + currRow, 6).string(row.description)
          ws.cell(i + currRow, 7).string(row.analyst)
          ws.cell(i + currRow, 8).string(row.current_activity)
        }
        wb.write('FOI-report.xlsx', res)
        break
      case 'PDF':
        const printer = new PdfPrinter(pdfFonts)
        const tableBody = rows.map(v => {
          return [
            v.request_id,
            moment(v.start_date).format('YYYY-MM-DD'),
            moment(v.duedate).format('YYYY-MM-DD'),
            v.status,
            v.applicant_type,
            v.description,
            v.analyst,
            v.current_activity
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
              columns: [
                {
                  width: 'auto',
                  stack: sortMessages.concat(
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
app.listen(port, () =>
  console.log(`launch http://localhost:${port} to explore`)
)
