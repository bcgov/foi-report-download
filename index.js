const express = require('express')
const app = express()
const port = process.env.port || 8080
const PdfPrinter = require('pdfmake')
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
  const { Client } = require('pg')
  const client = new Client({
    port: process.env.PGPORT || 5439
  })
  await client.connect()
  const output = await client.query('SELECT $1::text as message', ['OK!'])
  await client.end()
  res.end(output.rows[0].message)
})

app.post('/download', (req, res) => {
  if (!req.body || !req.body.format) {
    res.status(403).end('missing format')
  }
  switch (req.body.format) {
    case 'Excel':
      // Require library
      var xl = require('excel4node')

      // Create a new instance of a Workbook class
      var wb = new xl.Workbook()

      // Add Worksheets to the workbook
      var ws = wb.addWorksheet('Sheet 1')
      var ws2 = wb.addWorksheet('Sheet 2')

      // Create a reusable style
      var style = wb.createStyle({
        font: {
          color: '#FF0800',
          size: 12
        },
        numberFormat: '$#,##0.00; ($#,##0.00); -'
      })

      // Set value of cell A1 to 100 as a number type styled with paramaters of style
      ws.cell(1, 1)
        .number(100)
        .style(style)

      // Set value of cell B1 to 200 as a number type styled with paramaters of style
      ws.cell(1, 2)
        .number(200)
        .style(style)

      // Set value of cell C1 to a formula styled with paramaters of style
      ws.cell(1, 3)
        .formula('A1 + B1')
        .style(style)

      // Set value of cell A2 to 'string' styled with paramaters of style
      ws.cell(2, 1)
        .string('string')
        .style(style)

      // Set value of cell A3 to true as a boolean type styled with paramaters of style but with an adjustment to the font size.
      ws.cell(3, 1)
        .bool(true)
        .style(style)
        .style({ font: { size: 14 } })
      wb.write('Excel.xlsx', res)
      break
    case 'PDF':
      const printer = new PdfPrinter(fonts)
      const dd = {
        content: [
          'First paragraph',
          'Another paragraph, this time a little bit longer to make sure, this line will be divided into at least two lines'
        ]
      }
      const options = {}
      const pdfDoc = printer.createPdfKitDocument(dd, options)
      pdfDoc.pipe(res)
      pdfDoc.end()
      break
    default:
      res.status(403).end('unsupported format')
  }
})
app.use(express.static('client'))
app.listen(port, () =>
  console.log(`launch http://localhost:${port} to explore`)
)
