const IVRMenu = require('../../models/ivr_model');
const AudioRecording = require('../../models/audioRecording');
const { exec } = require('child_process');
const util = require('util');
const { writeFileWithSudo } = require('../../utils/sudo');
const execPromise = util.promisify(exec);

// Helper: Generate Asterisk config for one IVR
const generateAsteriskConfig = (menu) => {
  const safeName = menu.name.replace(/[^a-zA-Z0-9_-]/g, '');
  let config = `\n[ivr_${safeName}]\nexten => s,1,NoOp(IVR Menu: ${safeName})\n same => n,Answer()\n same => n,Set(TIMEOUT(digit)=${menu.dtmf.timeout})\n same => n,Set(TIMEOUT(response)=10)\n`;
  menu.announcement.forEach(audioUrl => {
    const fileName = audioUrl.split('/').pop().replace(/\.\w+$/, '');
    config += ` same => n,Background(custom/${fileName})\n`;
  });
  menu.entries.forEach(entry => {
    config += `\nexten => ${entry.digit},1,NoOp(Option ${entry.digit} - ${entry.label})`;
    if (entry.type === 'extension') {
      config += `\n same => n,Dial(SIP/${entry.value},30)`;
    } else if (entry.type === 'ivr') {
      const targetIvr = entry.value.replace(/[^a-zA-Z0-9_-]/g, '');
      config += `\n same => n,Goto(ivr_${targetIvr},s,1)`;
    } else if (entry.type === 'voicemail') {
      config += `\n same => n,Voicemail(${entry.value})`;
    } else if (entry.type === 'hangup') {
      config += `\n same => n,Hangup()`;
    }
    config += `\n same => n,Hangup()\n`;
  });
  config += `\nexten => i,1,NoOp(Invalid option)\n same => n,Playback(invalid)\n same => n,Goto(ivr_${safeName},s,1)\n\n`;
  config += `exten => t,1,NoOp(Timeout)\n same => n,Playback(please-try-again)\n same => n,Goto(ivr_${safeName},s,1)\n`;
  return config;
};

// Helper: Generate extension binding for one IVR
const generateExtensionBinding = (menu) => {
  const safeName = menu.name.replace(/[^a-zA-Z0-9_-]/g, '');
  return `\n[from-internal-custom]\nexten => 9091,1,Goto(ivr_${safeName},s,1)\n`;
};

// Helper: Reload FreePBX
const reloadFreePBX = async () => {
  try {
    await execPromise('sudo fwconsole reload');
    console.log('FreePBX reloaded successfully');
  } catch (error) {
    console.error('Error reloading FreePBX:', error);
    throw error;
  }
};

// Main: Create IVR Menu and regenerate all IVRs in config
const createIVRMenu = async (req, res) => {
  try {
    const { name, description, dtmf,entries } = req.body;
    console.log("Creating IVR menu:", req.body);

    // 1. Validate and fetch announcement recording
    const announcementRecording = await AudioRecording.findById(dtmf.announcement?.id);
    if (!announcementRecording) {
      return res.status(404).json({
        status: 404,
        message: "Announcement recording not found",
        error: `Announcement recording not found with ID: ${dtmf.announcement?.id}`
      });
    }

    // 2. Validate and fetch invalid retry recording if exists
    let invalidRetryRecording = null;
    if (dtmf.invalidRetryRecording?.id) {
      invalidRetryRecording = await AudioRecording.findById(dtmf.invalidRetryRecording.id);
      if (!invalidRetryRecording) {
        return res.status(404).json({
          status: 404,
          message: "Invalid retry recording not found",
          error: `Invalid retry recording not found with ID: ${dtmf.invalidRetryRecording.id}`
        });
      }
    }

    // 3. Save the new IVR to DB
    const menu = new IVRMenu({
      name,
      description,
      announcement: announcementRecording.audioFiles
        .sort((a, b) => a.order - b.order)
        .map(file => file.url),
      dtmf: {
        timeout: dtmf.timeout || 5,
        invalidRetries: dtmf.invalidRetries || 3,
        timeoutRetries: dtmf.timeoutRetries || 3,
        invalidRetryRecording: invalidRetryRecording?._id
      },
      entries: entries.map(entry => ({
        digit: entry.digit,
        type: entry.type,
        value: entry.value,
        label: entry.label || `Option ${entry.digit}`
      }))
    });

    await menu.save();

    // 4. Fetch all IVRs from DB and regenerate the config file
    const allMenus = await IVRMenu.find();
    let allConfigs = '';
    allMenus.forEach(menuItem => {
      allConfigs += generateAsteriskConfig(menuItem) + '\n' + generateExtensionBinding(menuItem) + '\n';
    });

    // 5. Write the combined config to the file and reload FreePBX
    const configPath = '/etc/asterisk/extensions_custom.conf';
    await writeFileWithSudo(configPath, allConfigs);
    await reloadFreePBX();

    res.status(201).json({
      status: 201,
      message: 'IVR menu created successfully',
      menu,
      config: allConfigs
    });

  } catch (error) {
    console.error('Error creating IVR menu:', error);
    res.status(500).json({
      status: 500,
      error: 'Failed to create IVR menu',
      details: error.message
    });
  }
};

module.exports = {
  createIVRMenu
};