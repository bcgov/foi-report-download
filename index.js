const express = require('express')
const app = express()
const port = process.env.port || 8080
const PdfPrinter = require('pdfmake')
const { Pool } = require('pg')
const pool = new Pool({
  port: process.env.PGPORT || 5439
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
  const { rows } = await pool.query('SELECT $1::text as message', ['OK!'])
  res.end(rows[0].message)
})

app.post('/FOI-report', async (req, res) => {
  if (!req.body || !req.body.format) {
    res.status(403).end('missing format')
  }
  try {
    const { rows } = await pool.query(
      `select collector_tstamp ,app_id ,geo_city ,br_family from derived.page_views order by collector_tstamp desc limit 100`
    )
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
          .string('collector_tstamp')
          .style(headerStyle)
          .style({ alignment: { horizontal: 'right' } })

        ws.cell(1, 2)
          .string('app_id')
          .style(headerStyle)

        ws.cell(1, 3)
          .string('geo_city')
          .style(headerStyle)

        ws.cell(1, 4)
          .string('br_family')
          .style(headerStyle)

        for (const [i, row] of rows.entries()) {
          ws.cell(i + 2, 1).date(row.collector_tstamp)
          ws.cell(i + 2, 2).string(row.app_id)
          ws.cell(i + 2, 3).string(row.geo_city)
          ws.cell(i + 2, 4).string(row.br_family)
        }
        wb.write('FOI-report.xlsx', res)
        break
      case 'PDF':
        const printer = new PdfPrinter(fonts)
        const tableBody = rows.map(v => {
          return [
            v.collector_tstamp.toString(),
            v.app_id,
            v.geo_city,
            v.br_family
          ]
        })
        tableBody.unshift([
          'collector_tstamp',
          'app_id',
          'geo_city',
          'br_family'
        ])
        const dd = {
          content: [
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
        res.setHeader('content-disposition','filename="FOI-report.pdf"')
        pdfDoc.pipe(res)
        pdfDoc.end()
        break
      default:
        res.status(403).end('unsupported format')
    }
  } catch (ex) {
    res.status(500).end()
  }
})
app.use(express.static('client'))
app.listen(port, () =>
  console.log(`launch http://localhost:${port} to explore`)
)
