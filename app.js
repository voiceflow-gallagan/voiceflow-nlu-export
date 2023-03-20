require('dotenv').config()
const express = require('express')
const axios = require('axios')
const bodyParser = require('body-parser')
const { parseExportData, generateCsv } = require('./utils')
const fs = require('fs')
const path = require('path')

const app = express()
app.use(bodyParser.json())

// Serve the 'exports' folder as a static resource
app.use('/exports', express.static(path.join(__dirname, 'exports')))

app.post('/export', async (req, res) => {
  try {
    const { versionID, apiKey } = req.body

    const response = await axios.get(
      `https://${process.env.ENDPOINT}/v2/versions/${versionID}/export`,
      {
        headers: {
          Authorization: apiKey,
        },
      }
    )

    const exportData = response.data
    const { intents, slots } = parseExportData(exportData)
    const { csvContent, utterancesCount, entitiesCount } = generateCsv(
      intents,
      slots
    )

    // Save the CSV content to a file in the exports subfolder
    const randomNumber = Math.floor(Math.random() * 900) + 100
    const filename = `export-${Date.now()}-${randomNumber}.csv`
    const filePath = path.join(__dirname, 'exports', filename)
    fs.writeFileSync(filePath, csvContent)

    // Return the JSON response with the status, utterances count, entities count, and the download URL
    res.status(200).json({
      status: 'success',
      utterancesCount,
      entitiesCount,
      url: `${req.protocol}://${req.get('host')}/exports/${filename}`,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error exporting data' })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
