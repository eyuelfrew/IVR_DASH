const IVRMenu = require('../../models/ivr_model');
const AudioRecording = require('../../models/audioRecording');
const { exec } = require('child_process');
const util = require('util');
const { writeFileWithSudo } = require('../../utils/sudo');
const execPromise = util.promisify(exec);

// Helper: Generate Asterisk config for one IVR
const generateAsteriskConfig = (menu) => {
  console.log(menu);
  const safeName = menu.name.replace(/[^a-zA-Z0-9_-]/g, '');
  let config = `\n[ivr_${safeName}]\nexten => s,1,NoOp(IVR Menu: ${safeName})\n same => n,Answer()\n same => n,Set(TIMEOUT(digit)=${menu.dtmf.timeout})\n same => n,Set(TIMEOUT(response)=10)\n`;
  
  // Add all announcement audio files
  menu.announcement.forEach(audioUrl => {
    const fileName = audioUrl.split('/').pop().replace(/\.\w+$/, '');
    config += ` same => n,Background(custom/${fileName})\n`;
  });
  
  // Add menu timeout handler
  config += `\n same => n,Background(beep)\n same => n,WaitExten(10)\n`;
  
  // Process each menu entry
  menu.entries.forEach(entry => {
    config += `\nexten => ${entry.digit},1,NoOp(Option ${entry.digit} - ${entry.label})`;
    
    switch(entry.type) {
      case 'extension':
        config += `\n same => n,Dial(PJSIP/${entry.value},30)`;
        break;
        
      case 'queue':
        config += `\n same => n, Goto(ext-queues,${entry.value},1)`;
        break;
        
      case 'ivr':
        const targetIvr = entry.value.replace(/[^a-zA-Z0-9_-]/g, '');
        config += `\n same => n,Goto(ivr_${targetIvr},s,1)`;
        break;
        
      case 'voicemail':
        config += `\n same => n,VoiceMail(${entry.value},s)`;
        break;
        
      case 'recording':
        config += `\n same => n,Background(custom/${entry.value})`;
        break;
        
      default:
        config += `\n same => n,Playback(invalid)`;
    }
    
    // Add hangup if not already handled
    if (entry.type !== 'ivr' && entry.type !== 'recording') {
      config += `\n same => n,Hangup()`;
    }
  });
  
  // Add invalid option handler
  config += `\n\nexten => i,1,NoOp(Invalid option)\n same => n,Playback(invalid)\n same => n,Goto(ivr_${safeName},s,1)`;
  
  // Add timeout handler
  config += `\n\nexten => t,1,NoOp(Timeout)\n same => n,Playback(please-try-again)\n same => n,Goto(ivr_${safeName},s,1)`;
  
  // Add dialplan entry
  config += `\n\n[from-internal-custom]\nexten => ${menu.extension || 's'},1,Goto(ivr_${safeName},s,1)`;
  
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
    await execPromise('sudo asterisk -rx "core reload"');
    console.log('FreePBX reloaded successfully');
  } catch (error) {
    console.error('Error reloading FreePBX:', error);
    throw error;
  }
};

// Main: Create IVR Menu and regenerate all IVRs in config
const createIVRMenu = async (req, res) => {
  try {
    const { name, description, dtmf, entries } = req.body;
    console.log("Creating IVR menu:", req.body);

    // 1. Validate and fetch announcement recording
    let announcementRecording;
    let invalidRetryRecording;

    // Fetch announcement recording
    if (dtmf?.announcement?.id) {
      announcementRecording = await AudioRecording.findById(dtmf.announcement.id);
      if (!announcementRecording) {
        return res.status(404).json({
          status: 404,
          message: "Announcement recording not found",
          error: `Announcement recording not found with ID: ${dtmf.announcement.id}`
        });
      }
    }

    // Fetch invalid retry recording
    if (dtmf?.invalidRetryRecording?.id) {
      const recording = await AudioRecording.findById(dtmf.invalidRetryRecording.id);
      if (!recording || !recording.audioFiles || recording.audioFiles.length === 0) {
        return res.status(404).json({
          status: 404,
          message: "Invalid retry recording not found or has no audio files",
          error: `Invalid retry recording not found with ID: ${dtmf.invalidRetryRecording.id}`
        });
      }
      // Get the first audio file's filename
      const audioFile = recording.audioFiles[0];
      const fileName = audioFile.url.split('/').pop().replace(/\.\w+$/, '');
      invalidRetryRecording = {
        _id: recording._id,
        fileName: fileName
      };
    }

    // 2. Process entries and fetch recording details if needed
    const processedEntries = await Promise.all(entries.map(async (entry) => {
      // If entry is a recording, fetch the recording details
      if (entry.type === 'recording') {
        try {
          const recording = await AudioRecording.findById(entry.value);
          if (!recording || !recording.audioFiles || recording.audioFiles.length === 0) {
            throw new Error(`No audio files found for recording ID: ${entry.value}`);
          }
          // Get the first audio file's filename
          const audioFile = recording.audioFiles[0];
          const fileName = audioFile.url.split('/').pop().replace(/\.\w+$/, '');
          
          return {
            digit: entry.digit,
            type: entry.type,
            value: fileName, // Store the actual filename instead of ID
            label: entry.label || `Option ${entry.digit}`,
            recordingId: entry.value // Keep the original ID if needed for reference
          };
        } catch (error) {
          console.error('Error processing recording entry:', error);
          throw new Error(`Invalid recording ID: ${entry.value}`);
        }
      }
      
      // For non-recording entries, return as is
      return {
        digit: entry.digit,
        type: entry.type,
        value: entry.value,
        label: entry.label || `Option ${entry.digit}`
      };
    }));

    // 4. Save the new IVR to DB
    const menu = new IVRMenu({
      name,
      description,
      announcement: announcementRecording?.audioFiles
        .sort((a, b) => a.order - b.order)
        .map(file => file.url),
      dtmf: {
        timeout: dtmf.timeout || 5,
        invalidRetries: dtmf.invalidRetries || 3,
        timeoutRetries: dtmf.timeoutRetries || 3,
        invalidRetryRecording: invalidRetryRecording?.fileName
      },
      entries: processedEntries
    });

    await menu.save();

    // 5. Fetch all IVRs from DB and regenerate the config file
    const allMenus = await IVRMenu.find();
    let allConfigs = '';
    allMenus.forEach(menuItem => {
      allConfigs += generateAsteriskConfig(menuItem) + '\n' + generateExtensionBinding(menuItem) + '\n';
    });

    // 6. Write the combined config to the file and reload FreePBX
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