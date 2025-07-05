  const express = require('express');
const AmiClient = require('asterisk-ami-client');
const cors = require('cors');
const connectDB = require('./config/dbconfig');
const mongoose = require('mongoose');

const app = express();
const port = 3000;



app.use(cors());
app.use(express.json()); // For parsing JSON bodies

const fs = require('fs')
const path = require('path');
const router = require('./routes/routes');
// ✅ This serves the recordings
app.use('/audio', express.static(path.join(__dirname, 'audio')));
app.use('/recordings', express.static('/var/lib/asterisk/sounds/en/custome'))
app.get('/recordings', (req, res) => {
  const recordingsDir = '/var/lib/asterisk/sounds/en/custome'
  const files = fs.readdirSync(recordingsDir)
    .filter(f => f.endsWith('.wav') || f.endsWith('.gsm'))
    .map(f => f.replace(/\.(wav|gsm)$/, '')) // remove extension

  res.json(files) // [ 'welcome-message', 'main-ivr', ... ]
})



// Use the routes
app.use('/api', router);

// Asterisk AMI connection settings
const ami = new AmiClient();
const amiConfig = {
  host: '10.42.0.1',
  port: 5038,
  username: 'manager',
  password: '12345678',
};

ami.connect(amiConfig.username, amiConfig.password, { host: amiConfig.host, port: amiConfig.port })
  .then(() => {
    console.log('Connected to Asterisk AMI');
  })
  .catch(error => {
    console.error('AMI Connection Error:', error);
  });

// Basic route
app.get('/', (req, res) => {
  res.send('IVR Node.js server is running!');
});

// Create IVR menu
// app.post('/ivr-menus', async (req, res) => {
//   try {
//     const { name, options } = req.body;
//     const menu = new IVRMenu({ name, options });
//     await menu.save();
//     res.status(201).json(menu);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // List IVR menus
// app.get('/ivr-menus', async (req, res) => {
//   try {
//     const menus = await IVRMenu.find();
//     res.json(menus);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

app.listen(port, () => {
  // Connect to database
connectDB();
  console.log(`Server listening at http://localhost:${port}`);
});