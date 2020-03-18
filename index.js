const express = require('express')
const app = express()
const port = process.env.port || 8080
let session = require('express-session')
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
  ssl: true
})
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))
// Define font files
const fonts = {
  Roboto: {
    normal: 'fonts/Roboto-Regular.ttf',
    bold: 'fonts/Roboto-Medium.ttf',
    italics: 'fonts/Roboto-Italic.ttf',
    bolditalics: 'fonts/Roboto-MediumItalic.ttf'
  }
}

app.get('/ping', async (req, res) => {
  try {
    console.log(req.headers)
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
  try {
    const { rows } = await pool.query(
      `select start_date ,request_id ,applicant_type,description from foi.foi order by start_date desc limit 100`
    )
    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0')
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const yyyy = today.getFullYear()

    switch (req.body.format) {
      case 'Excel':
        // Require library
        const xl = require('excel4node')

        // Create a new instance of a Workbook class
        const wb = new xl.Workbook()

        // Add Worksheets to the workbook
        const ws = wb.addWorksheet('Sheet 1')

        // Create a reusable style
        const headerStyle = wb.createStyle({
          font: {
            bold: true
          }
        })

        ws.cell(1, 1)
          .string('start_date')
          .style(headerStyle)
          .style({ alignment: { horizontal: 'right' } })

        ws.cell(1, 2)
          .string('request_id')
          .style(headerStyle)

        ws.cell(1, 3)
          .string('applicant_type')
          .style(headerStyle)

        ws.cell(1, 4)
          .string('description')
          .style(headerStyle)

        for (const [i, row] of rows.entries()) {
          ws.cell(i + 2, 1).date(row.start_date)
          ws.cell(i + 2, 2).string(row.request_id)
          ws.cell(i + 2, 3).string(row.applicant_type)
          ws.cell(i + 2, 4).string(row.description)
        }
        wb.write('FOI-report.xlsx', res)
        break
      case 'PDF':
        const printer = new PdfPrinter(fonts)
        const tableBody = rows.map(v => {
          return [
            v.start_date.toString(),
            v.request_id,
            v.applicant_type,
            v.description
          ]
        })
        tableBody.unshift([
          'start_date',
          'request_id',
          'applicant_type',
          'description'
        ])
        const dd = {
          content: [
            {
              text: `Report generated: ${yyyy}-${mm}-${day}`,
              alignment: 'right'
            },
            {
              layout: 'lightHorizontalLines', // optional
              table: {
                headerRows: 1,
                widths: ['auto', '*', '*', 'auto'],
                body: tableBody
              }
            }
          ]
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
