const IVRMenu = require('../models/ivr_model');
const ami = require('../index').ami; // Import the AMI client from index.js
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const { writeFileWithSudo } = require('../utils/sudo');
const execPromise = util.promisify(exec);

// Main: Create IVR Menu
const createMenu = async (req, res) => {
  try {
    const { name, options, featureCode, greetings } = req.body;
    console.log("Creating IVR menu:", req.body);

    // Check if extension is already used
    const isAvailable = await checkFeatureCode(featureCode);
    if (!isAvailable) {
      return res.status(409).json({ error: `Feature code ${featureCode} is already in use.` });
    }

    // Save to DB
    const menu = new IVRMenu({
      name,
      greetings,
      featureCode,
      options: options.map(option => ({
        number: parseInt(option.number),
        queue: option.queue
      }))
    });
    await menu.save();
nod
    // Generate IVR + binding
    const configPath = '/etc/asterisk/extensions_custom.conf';
    const ivrConfig = generateAsteriskConfig(menu);
    const dialBinding = generateExtensionBinding(menu);
    const fullConfig = ivrConfig + "\n" + dialBinding;

    // Write to file and reload
    await writeFileWithSudo(configPath, fullConfig);
    await reloadFreePBX();

    res.status(201).json({
      menu,
      message: `IVR created and bound to extension ${featureCode}`
    });
  } catch (error) {
    console.error("Error creating IVR:", error);
    res.status(500).json({ error: `Failed to create IVR: ${error.message}` });
  }
};

// 🔧 Generate Dialable Extension Binding
const generateExtensionBinding = (menu) => {
  const safeName = menu.name.replace(/[^a-zA-Z0-9_-]/g, '');
  return `
[from-internal-custom]
exten => ${menu.featureCode},1,Goto(ivr_${safeName},s,1)
`;
};

// Helper function to generate Asterisk configuration
const generateAsteriskConfig = (menu) => {
  const safeName = menu.name.replace(/[^a-zA-Z0-9_-]/g, '');
  const greetings = menu.greetings.map(g => `custom/${g}`);

  let config = `\n[ivr_${safeName}]
exten => s,1,NoOp(IVR Menu: ${safeName})
 same => n,Answer()
 same => n,Set(TIMEOUT(digit)=5)
 same => n,Set(TIMEOUT(response)=10)
`;

  // Play all greetings in order
  greetings.forEach(greeting => {
    config += ` same => n,Background(${greeting})\n`;
  });

  // Wait for input
  config += ` same => n,WaitExten(5,10)\n`;

  // Route options
  menu.options.forEach(option => {
    const safeNumber = parseInt(option.number);
    const safeDestination = option.queue.replace(/[^a-zA-Z0-9_-]/g, '');
    if (safeNumber >= 0 && safeDestination) {
      config += `
exten => ${safeNumber},1,NoOp(Option ${safeNumber})
 same => n,Goto(ext-queues,${safeDestination},1)
 same => n,Hangup()
`;
    }
  });

  // Handle invalid input and timeout
  config += `
exten => i,1,NoOp(Invalid option)
 same => n,Playback(invalid)
 same => n,Goto(ivr_${safeName},s,1)

exten => t,1,NoOp(Timeout)
 same => n,Playback(please-try-again)
 same => n,Goto(ivr_${safeName},s,1)
`;

  return config;
};


const checkFeatureCode = async (featureCode) => {
  console.log(featureCode)
  try {
    const { stdout } = await execPromise(
      `asterisk -rx "dialplan show from-internal" | grep "exten => ${featureCode}"`
    );

    const available = stdout.trim() === '';
    console.log(`Feature code ${featureCode} available:`, available);
    return available;
  } catch (error) {
    if (error.stdout?.trim() === '') {
      console.log(`Feature code ${featureCode} available: true`);
      return true;
    } else {
      console.error("Error checking feature code:", error.message);
      return false;
    }
  }
};

const addMiscApplication = async (featureCode, destination) => {
  try {
    const description = `IVR_${featureCode}`;
    const command = `sudo fwconsole miscapps --add --ext ${featureCode} --description "${description}" --dest "${destination}"`;
    await execPromise(command);
    console.log(`Misc Application added for ${featureCode}`);
  } catch (error) {
    throw new Error(`Failed to add Misc Application: ${error.message}`);
  }
};

const removeMiscApplication = async (featureCode) => {
  try {
    await execPromise(`sudo fwconsole miscapps --delete ${featureCode}`);
    console.log(`Removed Misc Application for ${featureCode}`);
  } catch (error) {
    console.error(`Failed to remove Misc Application: ${error.message}`);
  }
};

const reloadFreePBX = async () => {
  try {
    await execPromise('sudo fwconsole reload');
    console.log('FreePBX configuration reloaded');
  } catch (error) {
    throw new Error(`Failed to reload FreePBX: ${error.message}`);
  }
};

const checkFeatureCodeFromForm = async (req, res) => {
  console.log("Request Sent .......");
  console.log(req.params);

  try {
    const { featureCode } = req.params;

    if (!/^\*?\d+$/.test(featureCode)) {
      return res.status(400).json({ error: 'Feature code must be numeric (optionally starting with *)' });
    }

    const { stdout } = await execPromise(`asterisk -rx "dialplan show"`);
    
    // Check if the feature code is already in use
    const available = !stdout.includes(featureCode);
    console.log(`Feature code ${featureCode} available:`, available);

    res.status(200).json({ available });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Failed to check feature code: ${error.message}` });
  }
};

module.exports = {createMenu,checkFeatureCodeFromForm};
