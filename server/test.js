const fs = require('fs')
const path = require('path')

app.get('/recordings', (req, res) => {
  const recordingsDir = '/var/lib/asterisk/sounds/custom'
  const files = fs.readdirSync(recordingsDir)
    .filter(f => f.endsWith('.wav') || f.endsWith('.gsm'))
    .map(f => f.replace(/\.(wav|gsm)$/, '')) // remove extension

  res.json(files) // [ 'welcome-message', 'main-ivr', ... ]
})
