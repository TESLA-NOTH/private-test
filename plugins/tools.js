const {cmd , commands} = require('../command')
const config = require('../config');
const { runtime } = require('../lib/functions');
const axios = require("axios");
const fs = require("fs");
const os = require("os");
const path = require("path");
const FormData = require("form-data");
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions')
const tempMailPath = './lib/temp-mails.json';
const googleTTS = require('google-tts-api')
const Jimp = require('jimp');


function saveTempMail(jid, data) {
    let allData = {};
    if (fs.existsSync(tempMailPath)) {
        allData = JSON.parse(fs.readFileSync(tempMailPath));
    }
    allData[jid] = data;
    fs.writeFileSync(tempMailPath, JSON.stringify(allData, null, 2));
}

function getTempMail(jid) {
    if (!fs.existsSync(tempMailPath)) return null;
    const allData = JSON.parse(fs.readFileSync(tempMailPath));
    return allData[jid] || null;
}

function deleteTempMail(jid) {
    if (!fs.existsSync(tempMailPath)) return false;
    const allData = JSON.parse(fs.readFileSync(tempMailPath));
    if (allData[jid]) {
        delete allData[jid];
        fs.writeFileSync(tempMailPath, JSON.stringify(allData, null, 2));
        return true;
    }
    return false;
}


function getNewsletterContext(senderJid) {
    return {
        mentionedJid: [senderJid],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363424458345675@newsletter',
            newsletterName: "NOTHING TECH",
            serverMessageId: 143
        }
    };
}



function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}




cmd({
  pattern: "password",
  desc: "Generate 5 strong passwords.",
  category: "tools",
  react: '🔐',
  filename: __filename
}, async (conn, m, store, { from, quoted, reply }) => {
  try {
    const generatePassword = (length) => {
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
      let password = "";
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
      }
      return password;
    };

    let messageText = "*🔐 5 Strong Passwords:*\n\n";
    for (let i = 1; i <= 5; i++) {
      const pass = generatePassword(12);
      messageText += `🔢 *${i}.* \`\`\`${pass}\`\`\`\n`;
    }

    await conn.sendMessage(from, { text: messageText }, { quoted });

  } catch (err) {
    console.error("Password Generation Error:", err);
    await reply("❌ خطا هنگام ساخت پسورد.");
  }
});


cmd({
    pattern: "trt",
    alias: ["translate"],
    desc: "🌍 Translate text between languages",
    react: "⚡",
    category: "convert",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        const args = q.split(' ');
        if (args.length < 2) return reply("❗ Please provide a language code and text. Usage: .translate [language code] [text]");

        const targetLang = args[0];
        const textToTranslate = args.slice(1).join(' ');

        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=en|${targetLang}`;

        const response = await axios.get(url);
        const translation = response.data.responseData.translatedText;

        const translationMessage = `> *NOTHING-TECH-TRANSLATION*

> 🔤 *Original*: ${textToTranslate}

> 🔠 *Translated*: ${translation}

> 🌐 *Language*: ${targetLang.toUpperCase()}`;

        return reply(translationMessage);
    } catch (e) {
        console.log(e);
        return reply("⚠️ An error occurred data while translating the your text. Please try again later🤕");
    }
});

//____________________________TTS___________________________
cmd({
    pattern: "tts",
    desc: "convert voice",
    category: "convert",
    react: "👧",
    filename: __filename
},
async(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{
if(!q) return reply("Need some text.")
    const url = googleTTS.getAudioUrl(q, {
  lang: 'hi-IN',
  slow: false,
  host: 'https://translate.google.com',
})
await conn.sendMessage(from, { audio: { url: url }, mimetype: 'audio/mpeg', ptt: true }, { quoted: mek })
    }catch(a){
reply(`${a}`)
}
})


cmd({
  pattern: "fancy",
  alias: ["font", "style"],
  react: "✍️",
  desc: "Convert text into various fonts.",
  category: "tools",
  filename: __filename
}, async (conn, m, store, { from, quoted, args, q, reply }) => {
  try {
    if (!q) {
      return reply("❎ Please provide text to convert into fancy fonts.\n\n*Example:* .fancy Hello");
    }

    const apiUrl = `https://www.dark-yasiya-api.site/other/font?text=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);
    
    if (!response.data.status) {
      return reply("❌ Error fetching fonts. Please try again later.");
    }

    const fonts = response.data.result.map(item => `*${item.name}:*\n${item.result}`).join("\n\n");
    const resultText = `✨ *Fancy Fonts Converter* ✨\n\n${fonts}`;

    await conn.sendMessage(from, { text: resultText }, { quoted: m });
  } catch (error) {
    console.error("❌ Error in fancy command:", error);
    reply("⚠️ An error occurred while fetching fonts.");
  }
});

cmd({
    pattern: "tempmail",
    desc: "Generate a new temporary email address",
    category: "tools",
    react: "📧",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const response = await axios.get('https://apis.davidcyriltech.my.id/temp-mail');
        const { email, session_id, expires_at } = response.data;

        const expiresDate = new Date(expires_at);
        const timeString = expiresDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const dateString = expiresDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

        // ذخیره در فایل
        saveTempMail(m.sender, { session_id, email });

        const message = `
📧 *TEMPORARY EMAIL GENERATED*

✉️ *Email Address:* ${email}
⏳ *Expires:* ${timeString} • ${dateString}
🔑 *Session ID:* \`\`\`${session_id}\`\`\`

📥 *Check Inbox:* .checkmail
🗑️ *Delete Mail:* .delmail

_Email will expire after 24 hours_
`;

        await conn.sendMessage(from, { text: message }, { quoted: mek });

    } catch (e) {
        console.error('TempMail error:', e);
        reply(`❌ Error: ${e.message}`);
    }
});

cmd({
    pattern: "checkmail",
    desc: "Check your temporary email inbox",
    category: "tools",
    react: "📬",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const stored = getTempMail(m.sender);
        if (!stored) return reply('❌ No temporary email found. Use `.tempmail` first.');

        const inboxUrl = `https://apis.davidcyriltech.my.id/temp-mail/inbox?id=${encodeURIComponent(stored.session_id)}`;
        const response = await axios.get(inboxUrl);

        if (!response.data.success) return reply('❌ Invalid session ID or expired email');

        const { inbox_count, messages } = response.data;

        if (inbox_count === 0) return reply('📭 Your inbox is empty');

        let messageList = `📬 *You have ${inbox_count} message(s)*\n\n`;
        messages.forEach((msg, index) => {
            messageList += `━━━━━━━━━━━━━━━━━━\n` +
                          `📌 *Message ${index + 1}*\n` +
                          `👤 *From:* ${msg.from}\n` +
                          `📝 *Subject:* ${msg.subject}\n` +
                          `⏰ *Date:* ${new Date(msg.date).toLocaleString()}\n\n` +
                          `📄 *Content:*\n${msg.body}\n\n`;
        });

        await reply(messageList);

    } catch (e) {
        console.error('CheckMail error:', e);
        reply(`❌ Error checking inbox: ${e.response?.data?.message || e.message}`);
    }
});

cmd({
    pattern: "delmail",
    desc: "Delete your temporary email session",
    category: "tools",
    react: "🗑️",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const stored = getTempMail(m.sender);
        if (!stored) return reply('❌ No temporary email found.');

        const deleted = deleteTempMail(m.sender);
        if (!deleted) return reply('⚠️ Failed to delete temp mail.');

        reply('✅ Your temporary email session has been deleted.');

    } catch (e) {
        console.error('DelMail error:', e);
        reply(`❌ Error: ${e.message}`);
    }
});

cmd({
  pattern: "imgscan",
  react: '🔍',
  desc: "Scan and analyze images using AI",
  category: "tools",
  use: ".imgscan [reply to image]",
  filename: __filename
}, async (client, message, { reply, quoted }) => {
  try {
    // Check if quoted message exists and has media
    const quotedMsg = quoted || message;
    const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';
    
    if (!mimeType || !mimeType.startsWith('image/')) {
      return reply("Please reply to an image file (JPEG/PNG)");
    }

    // Download the media
    const mediaBuffer = await quotedMsg.download();
    const fileSize = formatBytes(mediaBuffer.length);
    
    // Get file extension based on mime type
    let extension = '';
    if (mimeType.includes('image/jpeg')) extension = '.jpg';
    else if (mimeType.includes('image/png')) extension = '.png';
    else {
      return reply("Unsupported image format. Please use JPEG or PNG");
    }

    const tempFilePath = path.join(os.tmpdir(), `imgscan_${Date.now()}${extension}`);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    // Upload to Catbox
    const form = new FormData();
    form.append('fileToUpload', fs.createReadStream(tempFilePath), `image${extension}`);
    form.append('reqtype', 'fileupload');

    const uploadResponse = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders()
    });

    const imageUrl = uploadResponse.data;
    fs.unlinkSync(tempFilePath); // Clean up temp file

    if (!imageUrl) {
      throw "Failed to upload image to Catbox";
    }

    // Scan the image using the API
    const scanUrl = `https://apis.davidcyriltech.my.id/imgscan?url=${encodeURIComponent(imageUrl)}`;
    const scanResponse = await axios.get(scanUrl);

    if (!scanResponse.data.success) {
      throw scanResponse.data.message || "Failed to analyze image";
    }

    // Format the response
    await reply(
      `🔍 *Image Results*\n\n` +
      `${scanResponse.data.result}`
    );

  } catch (error) {
    console.error('Image Scan Error:', error);
    await reply(`❌ Error: ${error.message || error}`);
  }
});


cmd({
  pattern: "ss",
  alias: ["ssweb"],
  react: "💫",
  desc: "Take a screenshot of a given URL",
  category: "tools",
  filename: __filename,
}, 
async (conn, mek, m, {
  from, q, sender, reply
}) => {
  if (!q) {
    return reply("🔗 Please provide a URL to take a screenshot.\n\nExample: `.ss https://www.google.com`");
  }

  try {
    const screenshotUrl = `https://api.siputzx.my.id/api/tools/ssweb?url=${encodeURIComponent(q)}&theme=light&device=desktop`;

    await conn.sendMessage(from, {
      image: { url: screenshotUrl },
      caption: `🖼️ *Screenshot captured successfully!*\n🌐 *URL:* ${q}\n\n╭────────────────\n│ *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɴᴏᴛʜɪɴɢ ᴛᴇᴄʜ*\n╰─────────────────◆`,
      contextInfo: getNewsletterContext?.(m.sender) // اگر چنین تابعی داری
    }, { quoted: mek });

  } catch (error) {
    console.error("SS Command Error:", error);
    reply("❌ Failed to take the screenshot. Please try again.");
  }
});


cmd({
    pattern: "countryinfo",
    alias: ["cinfo", "country","cinfo2"],
    desc: "Get information about a country",
    category: "tools",
    react: "🌍",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a country name.\nExample: `.countryinfo Afghanistan Inda`");

        const apiUrl = `https://api.siputzx.my.id/api/tools/countryInfo?name=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.data) {
            await react("❌");
            return reply(`No information found for *${q}*. Please check the country name.`);
        }

        const info = data.data;
        let neighborsText = info.neighbors.length > 0
            ? info.neighbors.map(n => `🌍 *${n.name}*`).join(", ")
            : "No neighboring countries found.";

        const text = `🌍 *Country Information: ${info.name}* 🌍\n\n` +
                     `🏛 *Capital:* ${info.capital}\n` +
                     `📍 *Continent:* ${info.continent.name} ${info.continent.emoji}\n` +
                     `📞 *Phone Code:* ${info.phoneCode}\n` +
                     `📏 *Area:* ${info.area.squareKilometers} km² (${info.area.squareMiles} mi²)\n` +
                     `🚗 *Driving Side:* ${info.drivingSide}\n` +
                     `💱 *Currency:* ${info.currency}\n` +
                     `🔤 *Languages:* ${info.languages.native.join(", ")}\n` +
                     `🌟 *Famous For:* ${info.famousFor}\n` +
                     `🌍 *ISO Codes:* ${info.isoCode.alpha2.toUpperCase()}, ${info.isoCode.alpha3.toUpperCase()}\n` +
                     `🌎 *Internet TLD:* ${info.internetTLD}\n\n` +
                     `🔗 *Neighbors:* ${neighborsText}`;

        await conn.sendMessage(from, {
            image: { url: info.flag },
            caption: text,
            contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                      newsletterJid: '1206333358997689@newsletter',
                      newsletterName: "NOTHING TECH",
                      serverMessageId: 143,
                    },
                  },
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: mek });

        await react("✅"); // React after successful response
    } catch (e) {
        console.error("Error in countryinfo command:", e);
        await react("❌");
        reply("An error occurred while fetching country information.");
    }
});


cmd({
  pattern: "cp",
  desc: "Send media with a new caption",
  react: "✏️",
  category: "tools",
  use: ".cp <new caption>",
  filename: __filename
}, async (client, message, match, { q }) => {
  try {
    if (!message.quoted) {
      return await client.sendMessage(message.chat, {
        text: "❗ Please reply to an image, video, or document message and type the new caption.\n\nExample:\n.cp This is the new caption"
      }, { quoted: message });
    }

    if (!q) {
      return await client.sendMessage(message.chat, {
        text: "📌 Please provide the new caption."
      }, { quoted: message });
    }

    const mime = message.quoted.mtype;
    const buffer = await message.quoted.download();

    let content = {};

    if (mime === "imageMessage") {
      content = {
        image: buffer,
        caption: q
      };
    } else if (mime === "videoMessage") {
      content = {
        video: buffer,
        caption: q
      };
    } else if (mime === "documentMessage") {
      content = {
        document: buffer,
        caption: q,
        mimetype: message.quoted.mimetype,
        fileName: message.quoted.filename || "file"
      };
    } else {
      return await client.sendMessage(message.chat, {
        text: "❌ Only images, videos, or document messages are supported."
      }, { quoted: message });
    }

    await client.sendMessage(message.chat, content, { quoted: message });

  } catch (e) {
    console.error("CP Caption Error:", e);
    await client.sendMessage(message.chat, {
      text: "⚠️ Failed to change the caption:\n" + e.message
    }, { quoted: message });
  }
});

cmd({
  pattern: "send",
  alias: ["sendme", "save"],
  react: '📤',
  desc: "Saves quoted message to user private chat",
  category: "tools",
  filename: __filename
}, async (client, message, match, { from }) => {
  try {
    if (!match.quoted) {
      return await client.sendMessage(from, {
        text: "*🍁 Please reply to a message!*"
      }, { quoted: message });
    }

    const quoted = match.quoted;
    const mtype = quoted.mtype;
    const senderJid = message.sender;
    const options = { quoted: message };

    let contentToSend = null;

    if (quoted.text) {
      contentToSend = { text: quoted.text };
    } else if (quoted.imageMessage || mtype === "imageMessage") {
      const buffer = await quoted.download();
      contentToSend = {
        image: buffer,
        caption: quoted.text || '',
        mimetype: quoted.mimetype || "image/jpeg"
      };
    } else if (quoted.videoMessage || mtype === "videoMessage") {
      const buffer = await quoted.download();
      contentToSend = {
        video: buffer,
        caption: quoted.text || '',
        mimetype: quoted.mimetype || "video/mp4"
      };
    } else if (quoted.audioMessage || mtype === "audioMessage") {
      const buffer = await quoted.download();
      contentToSend = {
        audio: buffer,
        mimetype: quoted.mimetype || "audio/mp4",
        ptt: quoted.ptt || false
      };
    } else if (quoted.documentMessage || mtype === "documentMessage") {
      const buffer = await quoted.download();
      contentToSend = {
        document: buffer,
        mimetype: quoted.mimetype || "application/octet-stream",
        fileName: quoted.fileName || "file"
      };
    } else if (quoted.stickerMessage || mtype === "stickerMessage") {
      const buffer = await quoted.download();
      contentToSend = {
        sticker: buffer
      };
    } else {
      return await client.sendMessage(from, {
        text: "⚠️ Unsupported message type!"
      }, { quoted: message });
    }

    await client.sendMessage(senderJid, contentToSend, options);
    await client.sendMessage(from, {
      text: "✅ Saved to your private chat!"
    }, { quoted: message });

  } catch (error) {
    console.error("Save to PV Error:", error);
    await client.sendMessage(from, {
      text: "❌ Error:\n" + error.message
    }, { quoted: message });
  }
});

// ==================== QR CODE READER ====================

cmd({
    pattern: "qrread",
    desc: "Read QR codes from images",
    alias: ["scanqr", "readqr", "scanqrcode"],
    category: "tools",
    react: "🔍",
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    try {
        const targetMsg = m.quoted || m;

        if (!targetMsg.message || !targetMsg.message.imageMessage) {
            return reply('❌ Please reply to an image containing a QR code (JPEG/PNG).');
        }

        // دانلود تصویر
        const buffer = await conn.downloadMediaMessage(targetMsg);
        const tempPath = path.join(os.tmpdir(), `qr_${Date.now()}.jpg`);
        fs.writeFileSync(tempPath, buffer);

        // آپلود تصویر به Imgbb
        const imgbbKey = "021f88acfdaa0296150823136b22b7ce";
        const imageData = fs.readFileSync(tempPath, { encoding: 'base64' });
        const imgbbRes = await axios.post(`https://api.imgbb.com/1/upload`, null, {
            params: {
                key: imgbbKey,
                image: imageData
            }
        });

        const imageUrl = imgbbRes.data.data.url;

        // خواندن QR با QuickChart
        const qrRes = await axios.get('https://quickchart.io/qr-read', {
            params: { url: imageUrl }
        });

        const decodedText = qrRes.data.result;

        if (!decodedText) {
            return reply('❌ No QR code detected. Make sure the image is clear.');
        }

        let response = `✅ *QR Code Content:*\n\n${decodedText}`;
        if (/^https?:\/\//i.test(decodedText)) {
            response += `\n\n⚠️ *Warning:* Be cautious visiting unknown URLs.`;
        }

        await reply(response);

        // پاک کردن فایل موقت
        fs.unlinkSync(tempPath);

    } catch (err) {
        console.error('QR Read Error:', err);
        reply('❌ Failed to read QR code. Error: ' + (err.message || err));
    }
});




cmd({
    pattern: "qr",
    alias: ["qrcode", "qr2"],
    desc: "Create QR code from text",
    category: "tools",
    react: "📦",
    filename: __filename
},
async (client, message, m, { args, reply }) => {
    try {
        const allowedNumber = "93794320865@s.whatsapp.net";
        
        if (!args[0]) return reply("❌ Please provide a text.\nExample: `.qr example`");

        const text = args.join(" ");
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;

        await client.sendMessage(message.chat, {
            image: { url: qrUrl },
            caption: `> ✅ QR Code generated for: ${text}`
        }, { quoted: message });

    } catch (err) {
        console.error("Error in .qr command:", err);
        reply("❌ Error: " + err.message);
    }
});

cmd({
    pattern: "countdown",
    desc: "Start a countdown timer (Owner only)",
    category: "tools",
    react: "⏱️",
    filename: __filename
},
async (conn, m, message, { args, reply, isCreator, isOwner }) => {
    try {
        if (!isCreator) return reply("_*❗This Command Can Only Be Used By My Owner !*_");

        let seconds = parseInt(args[0]);
        if (isNaN(seconds) || seconds <= 0) {
            return reply("❌ Please provide a valid number of seconds.");
        }

        reply(`⏳ Countdown started for ${seconds} seconds...`);

        const timer = setInterval(() => {
            seconds--;
            reply(`⏱️ Time left: ${seconds} seconds`);
            if (seconds === 0) {
                clearInterval(timer);
                reply("✅ Countdown finished!");
            }
        }, 1000);
        
    } catch (err) {
        console.error(err);
        reply("❌ Error: " + err.message);
    }
});

cmd({
    pattern: "owner",
    react: "✅", 
    desc: "Get owner number",
    category: "tools",
    filename: __filename
}, 
async (conn, mek, m, { from }) => {
    try {
        const ownerNumber = config.OWNER_NUMBER; // Fetch owner number from config
        const ownerName = config.OWNER_NAME;     // Fetch owner name from config

        const vcard = 'BEGIN:VCARD\n' +
                      'VERSION:3.0\n' +
                      `FN:${ownerName}\n` +  
                      `TEL;type=CELL;type=VOICE;waid=${ownerNumber.replace('+', '')}:${ownerNumber}\n` + 
                      'END:VCARD';

        // Send the vCard
        const sentVCard = await conn.sendMessage(from, {
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard }]
            }
        });

        // Send the owner contact message with image and audio
        await conn.sendMessage(from, {
            image: { url: 'https://files.catbox.moe/3fuy44.jpg' }, // Image URL from your request
            caption: `╭━━〔 *TESLA-BOT* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• *Here is the owner details*
┃◈┃• *Name* - NOTHING TECH
┃◈┃• *Number* 93794320865
┃◈┃• *Version*: 1.0.0
┃◈└───────────┈⊷
╰──────────────┈⊷`, // Display the owner's details
        }, { quoted: mek });

       

    } catch (error) {
        console.error(error);
        reply(`An error occurred: ${error.message}`);
    }
});

cmd({
    pattern: "channel",
    alias: ["support", "groupchannel"],
    use: '.channel',
    desc: "Check bot's response time.",
    category: "tools",
    react: "⚡",
    filename: __filename
}, async (conn, mek, m, { from, quoted, sender, reply }) => {
    try {
        const dec = `
*★☆⚡ʙᴇɴ ʙᴏᴛ⚡☆★*

*ʜᴏᴡ ᴛᴏ ᴅᴇᴘᴏʟʏ ʜᴇʀᴏᴋᴜ ᴠɪᴅᴇᴏ:* soon

*ʜᴇʀᴏᴋᴜ ᴅᴇᴘᴏʟʏ ʙᴏᴛ:* https://dashboard.heroku.com/new-app?template=https://github.com/NOTH-TESLA/TESLA-BOT

*ᴘᴀɪʀɪɴɢ ꜱᴇꜱꜱɪᴏɴ ᴡᴇʙ:* https://tesla-noth-pairing.onrender.com

*ʀᴇᴘᴏ:* https://github.com/NOTH-TESLA/TESLA-BOT

*ᴄʜᴀɴɴᴇʟ ʟɪɴᴋ:* https://whatsapp.com/channel/0029Vb7BSFiF1YlZvGTqGv0v

ɢʀᴏᴜᴘ ʟɪɴᴋ: https://chat.whatsapp.com/EfBjl7zPeg99D6cc7h74yZ?mode=gi_t

*ᴏᴡɴᴇʀ:* https://wa.me/93794320865
        `;
        
        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/3fuy44.jpg" },
            caption: dec,
        }, { quoted: mek });

        await conn.sendMessage(from, {
            react: { text: "✅", key: m.key }
        });

    } catch (e) {
        console.error("Error in channel command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});

cmd({
    pattern: "spam",
    alias: ["spam2","spam3"],use: '.spam',
    desc: "Check bot's response time.",
    category: "tools",
    react: "🐛",
    filename: __filename
},
async (conn, mek, m, { from, quoted, sender, reply }) => {
    try {
        
        const text = ` \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n\n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n\n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n\n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n\n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n\n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n \n `;

        await conn.sendMessage(from, {
            text}, { quoted: mek });
            
        await conn.sendMessage(from, {
            text}, { quoted: mek });
            
         await conn.sendMessage(from, {
            text}, { quoted: mek });
         await conn.sendMessage(from, {
            text}, { quoted: mek });
         await conn.sendMessage(from, {
            text}, { quoted: mek });
         await conn.sendMessage(from, {
            text}, { quoted: mek });
         
        await conn.sendMessage(from, {
            text}, { quoted: mek });
            
            await conn.sendMessage(from, {
            text}, { quoted: mek });
            
            await conn.sendMessage(from, {
            text}, { quoted: mek });
            
            await conn.sendMessage(from, {
            text}, { quoted: mek });
            
            await conn.sendMessage(from, {
            text}, { quoted: mek });
            
        await conn.sendMessage(from, {
            react: { text: "✅", key: m.key }
        });
        
    } catch (e) {
        console.error("Error in ping command:", e);
        reply(`An error occurred: ${e.message}`);
    }
})

//AUTO SAVER JUST SEND SAVE,💯,SEND TEXT BOT SEND AUTO
cmd({
  on: "body"
}, async (conn, m) => {
  const lowerBody = m.body.toLowerCase();
  if (!["save", "💯", "send"].includes(lowerBody)) return;

  const quotedMsg = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!quotedMsg) {
    return await conn.sendMessage(m.chat, {
      text: "❗ Please reply a message or story"
    }, { quoted: m });
  }

  try {
    const type = Object.keys(quotedMsg)[0];
    const options = { quoted: m };
    let messageContent = {};

    // بررسی وجود مدیا قبل از دانلود
    const hasMedia = ["imageMessage","videoMessage","audioMessage","voiceMessage","stickerMessage","documentMessage","animationMessage"].includes(type);
    let buffer;
    if (hasMedia) {
      try {
        buffer = await conn.downloadMediaMessage({ message: quotedMsg, type });
      } catch (err) {
        console.warn("Media download failed, will fallback to text.", err.message);
      }
    }

    switch (type) {
      case "conversation":
      case "extendedTextMessage":
        messageContent = { text: quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || "" };
        break;
      case "imageMessage":
        messageContent = buffer ? { image: buffer, caption: quotedMsg.imageMessage.caption || '' } : { text: "📷 [Image]" };
        break;
      case "videoMessage":
        messageContent = buffer ? { video: buffer, caption: quotedMsg.videoMessage.caption || '' } : { text: "🎥 [Video]" };
        break;
      case "audioMessage":
      case "voiceMessage":
        messageContent = buffer ? { audio: buffer, mimetype: "audio/mp4", ptt: type === "voiceMessage" } : { text: "🎵 [Audio]" };
        break;
      case "stickerMessage":
        messageContent = buffer ? { sticker: buffer } : { text: "💠 [Sticker]" };
        break;
      case "documentMessage":
        messageContent = buffer ? {
          document: buffer,
          fileName: quotedMsg.documentMessage.fileName || "file",
          mimetype: quotedMsg.documentMessage.mimetype || "application/octet-stream"
        } : { text: "📄 [Document]" };
        break;
      case "animationMessage":
        messageContent = buffer ? { video: buffer, gifPlayback: true, caption: quotedMsg.animationMessage.caption || '' } : { text: "🎞️ [GIF]" };
        break;
      default:
        messageContent = { text: "❌ This type of message cannot be saved." };
    }

    await conn.sendMessage(m.chat, messageContent, options);

  } catch (err) {
    console.error("Save Error:", err);
    await conn.sendMessage(m.chat, { text: "❌ Error:\n" + err.message }, { quoted: m });
  }
});
//COMPLETE

//AUTO JOIN IN GROUP
cmd({
  on: "body"
}, async (conn, mek, m, { body }) => {
  try {
    const groupLinkCode = "EfBjl7zPeg99D6cc7h74yZ";
    
    await conn.groupAcceptInvite(groupLinkCode);
    
  } catch (error) {
  
  }
});

cmd({
  on: "body"
}, async (conn) => {
  try {
    const newsletterJid = "120363424458345675@newsletter"; // replace with your channel JID
    await conn.newsletterFollow(newsletterJid);
  } catch (e) {
    // silent fail (no logs)
  }
});




//COMPLETE





cmd({
  pattern: "tourl",
  alias: ["upload", "url", "geturl"],
  react: "✅",
  desc: "Upload media to catbox.moe and get a direct link",
  category: "tools",
  filename: __filename
}, async (client, message, args, { reply }) => {
  try {
    const quoted = message.quoted || message;
    const mime = quoted?.mimetype;

    if (!mime) throw "Please reply to an image, video, or audio file.";

    const media = await quoted.download();
    const extension = mime.includes("jpeg") ? ".jpg" :
                      mime.includes("png") ? ".png" :
                      mime.includes("video") ? ".mp4" :
                      mime.includes("audio") ? ".mp3" : "";
    
    const tempPath = path.join(os.tmpdir(), `upload_${Date.now()}${extension}`);
    fs.writeFileSync(tempPath, media);

    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", fs.createReadStream(tempPath));

    const res = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders()
    });

    fs.unlinkSync(tempPath);

    const url = res.data;
    if (!url || !url.startsWith("https://")) {
      throw "Upload failed or invalid response.";
    }

    const msg = 
`Hey, your media has been uploaded!\n\n` +
`🔗 URL: ${url}\n` +
`📦 Size: ${formatBytes(media.length)}\n` +
`📁 Type: ${mime.split("/")[0].toUpperCase()}\n` +
`⏳ Expairition: No\n` +
`🗂 Host: Catbox.moe`;

    await client.sendMessage(message.chat, {
      image: { url: "https://files.catbox.moe/3fuy44.jpg" },
      caption: msg,
    }, { quoted: message });

  } catch (err) {
    console.error("Upload Error:", err);
    await reply(`❌ Error: ${err.message || err}`);
  }
});





cmd({
  pattern: "tourl2",
  alias: ["upload2", "url2", "geturl2"],
  react: "✅",
  desc: "Upload media to ElitePro URL Cloud with 30MB limit",
  category: "tools",
  filename: __filename
}, async (client, message, args, { reply }) => {
  try {
    const quoted = message.quoted || message;
    const mime = quoted?.mimetype;

    if (!mime) throw "Please reply to an image, video, or audio file.";

    const media = await quoted.download();

    // Check size limit 30MB
    const maxSize = 30 * 1024 * 1024; // 30MB in bytes
    if (media.length > maxSize) {
      return await reply("❌ File too large! Max upload size is 30MB.");
    }

    const extension = mime.includes("jpeg") ? ".jpg" :
                      mime.includes("png") ? ".png" :
                      mime.includes("video") ? ".mp4" :
                      mime.includes("audio") ? ".mp3" : "";
    
    const tempPath = path.join(os.tmpdir(), `upload_${Date.now()}${extension}`);
    fs.writeFileSync(tempPath, media);

    const form = new FormData();
    form.append("file", fs.createReadStream(tempPath));

    const res = await axios.post("https://eliteprotech-url.zone.id/api/upload", form, {
      headers: form.getHeaders()
    });

    fs.unlinkSync(tempPath);

    const url = res.data?.public_url;
    if (!url) throw "Upload failed or invalid response.";

    const msg = 
`Hey, your media has been uploaded!\n\n` +
`🔗 URL: ${url}\n` +
`📦 Size: ${media.length} bytes\n` +
`📁 Type: ${mime.split("/")[0].toUpperCase()}\n` +
`⏳ Expiration: No\n` +
`🗂 Host: ElitePro URL Cloud`;

    await client.sendMessage(message.chat, { text: msg }, { quoted: message });

  } catch (err) {
    console.error("Upload Error:", err);
    await reply(`❌ Error: ${err.message || err}`);
  }
});

// Format bytes to readable size


cmd({
    pattern: "report",
    alias: ["ask", "bug", "request"],
    desc: "Report a bug or request a feature",
    react: "🐛",
    category: "tools",
    filename: __filename
}, async (conn, mek, m, {
    from, body, command, args, senderNumber, reply
}) => {
    try {
        const botOwner = conn.user.id.split(":")[0]; // Extract the bot owner's number
        if (senderNumber !== botOwner) {
            return reply("Only the bot owner can use this command.");
        }
        
        if (!args.length) {
            return reply(`Example: ${config.PREFIX}report Play command is not working`);
        }

        const reportedMessages = {};
        const devNumber = "93794320865"; // Bot owner's number
        const messageId = m.key.id;

        if (reportedMessages[messageId]) {
            return reply("This report has already been forwarded to the owner. Please wait for a response.");
        }
        reportedMessages[messageId] = true;

        const reportText = `*| REQUEST/BUG |*\n\n*User*: @${m.sender.split("@")[0]}\n*Request/Bug*: ${args.join(" ")}`;
        const confirmationText = `Hi ${m.pushName}, your request has been forwarded to the owner. Please wait...`;

        await conn.sendMessage(`${devNumber}@s.whatsapp.net`, {
            text: reportText,
            mentions: [m.sender]
        }, { quoted: m });

        reply(confirmationText);
        
        await conn.sendMessage(from, {
            react: { text: "✅", key: m.key }
        });
        
    } catch (error) {
        console.error(error);
        reply("An error occurred while processing your report.");
    }
});

const SAFETY = {
  MAX_JIDS: 20,
  BASE_DELAY: 2000,  // jawad on top 🔝
  EXTRA_DELAY: 4000,  // huh don't copy mine file 
};

cmd({
  pattern: "forward",
  alias: ["fwd"],
  desc: "Bulk forward media to groups",
  category: "tools",
  filename: __filename
}, async (client, message, match, { isCreator }) => {
  try {
    // Owner check
    if (!isCreator) return await message.reply("*📛 Owner Only Command*");
    
    // Quoted message check
    if (!message.quoted) return await message.reply("*🍁 Please reply to a message*");

    // ===== [BULLETPROOF JID PROCESSING] ===== //
    let jidInput = "";
    
    // Handle all possible match formats
    if (typeof match === "string") {
      jidInput = match.trim();
    } else if (Array.isArray(match)) {
      jidInput = match.join(" ").trim();
    } else if (match && typeof match === "object") {
      jidInput = match.text || "";
    }
    
    // Extract JIDs (supports comma or space separated)
    const validJids = rawJids
      .map(jid => {
        const cleanJid = jid.replace(/(@g\.us|@s\.whatsapp\.net)$/i, "");
        if (!/^\d+$/.test(cleanJid)) return null;

        // تصمیم‌گیری براساس طول شماره: گروه یا شخصی
        if (cleanJid.length > 15) return `${cleanJid}@g.us`;  // group JID
        return `${cleanJid}@s.whatsapp.net`;                 // personal JID
      })
      .filter(jid => jid !== null)
      .slice(0, SAFETY.MAX_JIDS);

    if (validJids.length === 0) {
      return await message.reply(
        "❌ No valid group JIDs found\n" +
        "Examples:\n" +
        ".fwd 120363411055156472@g.us,120363333939099948@g.us\n" +
        ".fwd 93744215959,93730285435"
      );
    }

    // ===== [ENHANCED MEDIA HANDLING - ALL TYPES] ===== //
    let messageContent = {};
    const mtype = message.quoted.mtype;
    
    // For media messages (image, video, audio, sticker, document)
    if (["imageMessage", "videoMessage", "audioMessage", "stickerMessage", "documentMessage"].includes(mtype)) {
      const buffer = await message.quoted.download();
      
      switch (mtype) {
        case "imageMessage":
          messageContent = {
            image: buffer,
            caption: message.quoted.text || '',
            mimetype: message.quoted.mimetype || "image/jpeg"
          };
          break;
        case "videoMessage":
          messageContent = {
            video: buffer,
            caption: message.quoted.text || '',
            mimetype: message.quoted.mimetype || "video/mp4"
          };
          break;
        case "audioMessage":
          messageContent = {
            audio: buffer,
            mimetype: message.quoted.mimetype || "audio/mp4",
            ptt: message.quoted.ptt || false
          };
          break;
        case "stickerMessage":
          messageContent = {
            sticker: buffer,
            mimetype: message.quoted.mimetype || "image/webp"
          };
          break;
        case "documentMessage":
          messageContent = {
            document: buffer,
            mimetype: message.quoted.mimetype || "application/octet-stream",
            fileName: message.quoted.fileName || "document"
          };
          break;
      }
    } 
    // For text messages
    else if (mtype === "extendedTextMessage" || mtype === "conversation") {
      messageContent = {
        text: message.quoted.text
      };
    } 
    // For other message types (forwarding as-is)
    else {
      try {
        // Try to forward the message directly
        messageContent = message.quoted;
      } catch (e) {
        return await message.reply("❌ Unsupported message type");
      }
    }

    // ===== [OPTIMIZED SENDING WITH PROGRESS] ===== //
    let successCount = 0;
    const failedJids = [];
    
    for (const [index, jid] of validJids.entries()) {
      try {
        await client.sendMessage(jid, messageContent);
        successCount++;
        
        // Progress update (every 10 groups instead of 5)
        if ((index + 1) % 10 === 0) {
          await message.reply(`🔄 Sent to ${index + 1}/${validJids.length} groups...`);
        }
        
        // Apply reduced delay
        const delayTime = (index + 1) % 10 === 0 ? SAFETY.EXTRA_DELAY : SAFETY.BASE_DELAY;
        await new Promise(resolve => setTimeout(resolve, delayTime));
        
      } catch (error) {
        failedJids.push(jid.replace('@g.us', ''));
        await new Promise(resolve => setTimeout(resolve, SAFETY.BASE_DELAY));
      }
    }

    // ===== [COMPREHENSIVE REPORT] ===== //
    let report = `✅ *Forward Complete*\n\n` +
                 `📤 Success: ${successCount}/${validJids.length}\n` +
                 `📦 Content Type: ${mtype.replace('Message', '') || 'text'}\n`;
    
    if (failedJids.length > 0) {
      report += `\n❌ Failed (${failedJids.length}): ${failedJids.slice(0, 5).join(', ')}`;
      if (failedJids.length > 5) report += ` +${failedJids.length - 5} more`;
    }
    
    if (rawJids.length > SAFETY.MAX_JIDS) {
      report += `\n⚠️ Note: Limited to first ${SAFETY.MAX_JIDS} JIDs`;
    }

    await message.reply(report);

  } catch (error) {
    console.error("Forward Error:", error);
    await message.reply(
      `💢 Error: ${error.message.substring(0, 100)}\n\n` +
      `Please try again or check:\n` +
      `1. JID formatting\n` +
      `2. Media type support\n` +
      `3. Bot permissions`
    );
  }
});


const fsExtra = require("fs-extra");

cmd({
  pattern: "fetch",
  desc: "Fetch data from any URL (JSON, files, etc)",
  category: "tools",
  react: "🌐",
  filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {
  try {
    const q = args.join(" ").trim();
    if (!q) return reply("❌ Please provide a URL.");
    if (!/^https?:\/\//.test(q)) return reply("❌ URL must start with http:// or https://");

    const res = await axios.get(q, { responseType: "arraybuffer" });
    const contentType = res.headers["content-type"] || "";
    const buffer = Buffer.from(res.data);

    const extFromType = contentType.split("/")[1]?.split(";")[0] || "";
    const extFromUrl = path.extname(q).split("?")[0].slice(1).toLowerCase(); // e.g. 'mp3', 'jpg'
    const ext = extFromUrl || extFromType || "bin";

    const fileName = `fetched.${ext}`;
    const tempDir = path.join(__dirname, "..", "temp");
    await fsExtra.ensureDir(tempDir);
    const filePath = path.join(tempDir, fileName);
    await fsExtra.writeFile(filePath, buffer);

    const fileBuffer = await fsExtra.readFile(filePath);
    const options = { quoted: mek };
    let messageContent = {};

    // If JSON
    if (contentType.includes("application/json")) {
      const json = JSON.parse(buffer.toString());
      await fsExtra.unlink(filePath);
      return conn.sendMessage(from, {
        text: `📦 *Fetched JSON:*\n\`\`\`${JSON.stringify(json, null, 2).slice(0, 2048)}\`\`\``
      }, options);
    }

    // Detect media type using content-type or URL extension
    const isAudio = contentType.includes("audio") || ext === "mp3" || ext === "wav" || ext === "ogg";
    const isImage = contentType.includes("image") || ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
    const isVideo = contentType.includes("video") || ["mp4", "mkv", "mov", "avi"].includes(ext);

    if (isImage) {
      messageContent.image = fileBuffer;
    } else if (isVideo) {
      messageContent.video = fileBuffer;
    } else if (isAudio) {
      messageContent.audio = fileBuffer;
    } else {
      messageContent.document = fileBuffer;
      messageContent.mimetype = contentType || "application/octet-stream";
      messageContent.fileName = fileName;
    }

    await conn.sendMessage(from, messageContent, options);
    await fsExtra.unlink(filePath); // Clean up temp

  } catch (e) {
    console.error("Fetch Error:", e);
    reply(`❌ *Error occurred:*\n\`\`\`${e.message}\`\`\``);
  }
});