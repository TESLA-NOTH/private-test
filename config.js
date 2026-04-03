// config.js
// TESLA-BOT CONFIG
// POWERED BY NOTHING TECH 🍼

const { getUserConfig, saveUserConfig } = require('./lib/server');
require('dotenv').config();

// ===== Runtime defaults =====
let PREFIX = process.env.PREFIX || "T";
let AGENT_MODE = "off";
let ADMIN_EVENTS = "false";
let WELCOME = "false";
let ANTI_CALL = "false";
let ANTI_CALL_MSG = "*No calls allowed!*";

let AUTO_STATUS_SEEN = "false";
let AUTO_STATUS_REPLY = "false";
let AUTO_STATUS_REACT = "false";
let AUTO_STATUS_MSG = "*Seen your status by Tesla-Bot*";

let AUTO_REACT = "false";
let AUTO_VOICE = "false";
let AUTO_STICKER = "false";
let AUTO_REPLY = "false";
let AUTO_TYPING = "false";
let AUTO_RECORDING = "false";
let ALWAYS_ONLINE = "false";

let READ_MESSAGE = "false";
let READ_CMD = "false";

let ANTI_LINK = "false";
let ANTILINK_WARN = "false";
let ANTILINK_KICK = "false";

let ANTIVIEW_ONCE = "true";
let ANTI_DELETE = "true";
let ANTI_DEL_PATH = "inbox";

let ANTI_BAD = "false";
let MENTION_REPLY = "false";
let CUSTOM_REACT = "false";
let CUSTOM_REACT_EMOJIS = "💝,💖,💗,❤️‍🩹,❤️,🧡,💛,💚,💙,💜,🤎,🖤,🤍";

// ===== Load user-specific config =====
async function loadConfig(botNumber) {
  try {
    const userConfig = await getUserConfig(botNumber);
    if (userConfig) {
      Object.keys(userConfig).forEach(key => {
        global[key] = userConfig[key];
      });
    }
  } catch (e) {
    console.log("loadConfig error:", e);
  }
}

// ===== General setter for any key =====
async function setConfig(key, value, botNumber) {
  try {
    const oldData = (await getUserConfig(botNumber)) || {};
    oldData[key] = value;

    // به‌روزرسانی runtime
    global[key] = value;
    console.log(`⚡ Set config: ${key} = ${value} for ${botNumber}`);

    // ذخیره در GitHub (اگر فایل نبود خودش ساخته می‌شود)
    await saveUserConfig(botNumber, oldData);
  } catch (e) {
    console.log(`setConfig error for ${key}:`, e);
  }
}

// ===== Exported config =====
module.exports = {
  get PREFIX() { return PREFIX; },
  set PREFIX(val) { PREFIX = val; },

  get AGENT_MODE() { return AGENT_MODE; },
  set AGENT_MODE(val) { AGENT_MODE = val; },

  get ADMIN_EVENTS() { return ADMIN_EVENTS; },
  set ADMIN_EVENTS(val) { ADMIN_EVENTS = val; },

  get WELCOME() { return WELCOME; },
  set WELCOME(val) { WELCOME = val; },

  get ANTI_CALL() { return ANTI_CALL; },
  set ANTI_CALL(val) { ANTI_CALL = val; },

  get ANTI_CALL_MSG() { return ANTI_CALL_MSG; },
  set ANTI_CALL_MSG(val) { ANTI_CALL_MSG = val; },

  get AUTO_STATUS_SEEN() { return AUTO_STATUS_SEEN; },
  set AUTO_STATUS_SEEN(val) { AUTO_STATUS_SEEN = val; },

  get AUTO_STATUS_REPLY() { return AUTO_STATUS_REPLY; },
  set AUTO_STATUS_REPLY(val) { AUTO_STATUS_REPLY = val; },

  get AUTO_STATUS_REACT() { return AUTO_STATUS_REACT; },
  set AUTO_STATUS_REACT(val) { AUTO_STATUS_REACT = val; },

  get AUTO_STATUS_MSG() { return AUTO_STATUS_MSG; },
  set AUTO_STATUS_MSG(val) { AUTO_STATUS_MSG = val; },

  get AUTO_REACT() { return AUTO_REACT; },
  set AUTO_REACT(val) { AUTO_REACT = val; },

  get AUTO_VOICE() { return AUTO_VOICE; },
  set AUTO_VOICE(val) { AUTO_VOICE = val; },

  get AUTO_STICKER() { return AUTO_STICKER; },
  set AUTO_STICKER(val) { AUTO_STICKER = val; },

  get AUTO_REPLY() { return AUTO_REPLY; },
  set AUTO_REPLY(val) { AUTO_REPLY = val; },

  get AUTO_TYPING() { return AUTO_TYPING; },
  set AUTO_TYPING(val) { AUTO_TYPING = val; },

  get AUTO_RECORDING() { return AUTO_RECORDING; },
  set AUTO_RECORDING(val) { AUTO_RECORDING = val; },

  get ALWAYS_ONLINE() { return ALWAYS_ONLINE; },
  set ALWAYS_ONLINE(val) { ALWAYS_ONLINE = val; },

  get READ_MESSAGE() { return READ_MESSAGE; },
  set READ_MESSAGE(val) { READ_MESSAGE = val; },

  get READ_CMD() { return READ_CMD; },
  set READ_CMD(val) { READ_CMD = val; },

  get ANTI_LINK() { return ANTI_LINK; },
  set ANTI_LINK(val) { ANTI_LINK = val; },

  get ANTILINK_WARN() { return ANTILINK_WARN; },
  set ANTILINK_WARN(val) { ANTILINK_WARN = val; },

  get ANTILINK_KICK() { return ANTILINK_KICK; },
  set ANTILINK_KICK(val) { ANTILINK_KICK = val; },

  get ANTIVIEW_ONCE() { return ANTIVIEW_ONCE; },
  set ANTIVIEW_ONCE(val) { ANTIVIEW_ONCE = val; },

  get ANTI_DELETE() { return ANTI_DELETE; },
  set ANTI_DELETE(val) { ANTI_DELETE = val; },

  get ANTI_DEL_PATH() { return ANTI_DEL_PATH; },
  set ANTI_DEL_PATH(val) { ANTI_DEL_PATH = val; },

  get ANTI_BAD() { return ANTI_BAD; },
  set ANTI_BAD(val) { ANTI_BAD = val; },

  get MENTION_REPLY() { return MENTION_REPLY; },
  set MENTION_REPLY(val) { MENTION_REPLY = val; },

  get CUSTOM_REACT() { return CUSTOM_REACT; },
  set CUSTOM_REACT(val) { CUSTOM_REACT = val; },

  get CUSTOM_REACT_EMOJIS() { return CUSTOM_REACT_EMOJIS; },
  set CUSTOM_REACT_EMOJIS(val) { CUSTOM_REACT_EMOJIS = val; },

  loadConfig,
  setConfig,

  // ===== Static defaults =====
  SESSION_ID: process.env.SESSION_ID || "",
  BOT_NAME: "ᴛᴇꜱʟᴀ-ʙᴏᴛ",
  STICKER_NAME: "ᴛᴇꜱʟᴀ-ʙᴏᴛ",
  DESCRIPTION: "*© Powered by NOTHING TECH*",
  MENU_IMAGE_URL: "https://files.catbox.moe/3fuy44.jpg",
  ALIVE_IMG: "https://files.catbox.moe/3fuy44.jpg",
  LIVE_MSG: "> Always online ⚡",
  DEV: "93794320865",
  MODE: process.env.MODE || "public",
};