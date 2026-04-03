const axios = require("axios");
const fs = require("fs");
const os = require("os");
const path = require("path");
const FormData = require("form-data");
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');
const config = require('../config');
const yts = require("yt-search");
const {
  generateWAMessageFromContent,
  generateWAMessageContent,
} = require("baileys");




cmd({
    pattern: "menu",
    alias: ["help", "commands"],
    desc: "Show all menu categories",
    category: "menu",
    react: "⏳",
    filename: __filename
},
async (conn, mek, m, { from, pushname: _0x1279c5, reply }) => {
    try {
        const os = require("os");
        const uptime = process.uptime();
        const totalMem = os.totalmem() / (1024 ** 3);
        const freeMem = os.freemem() / (1024 ** 3);
        const usedMem = totalMem - freeMem;

        const version = "𝟏.𝟎.𝟎";
        const plugins = commands.length;
        const now = new Date();
        const time = now.toLocaleTimeString("en-US", { hour12: true, timeZone: "Asia/Kabul" });
        const date = now.toLocaleDateString("en-CA", { timeZone: "Asia/Kabul" });

        const days = Math.floor(uptime / (3600 * 24));
        const hours = Math.floor((uptime % (3600 * 24)) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const uptimeStr = `${days}𝐝 ${hours}𝐡 ${minutes}𝐦 ${seconds}𝐬`;

        let menuText = `╭══〘〘 *ᴛᴇꜱʟᴀ-ʙᴏᴛ* 〙〙═⊷
┃❍ *Mᴏᴅᴇ:* ${config.MODE}
┃❍ *Pʀᴇғɪx:* [ ${config.PREFIX} ]
┃❍ *Usᴇʀ:* ${_0x1279c5 || "User"}
┃❍ *Pʟᴜɢɪɴs:* ${plugins}
┃❍ *Vᴇʀsɪᴏɴ:* ${version}
┃❍ *Uᴘᴛɪᴍᴇ:* ${uptimeStr}
┃❍ *Tɪᴍᴇ Nᴏᴡ:* ${time}
┃❍ *Dᴀᴛᴇ Tᴏᴅᴀʏ:* ${date}
┃❍ *Tɪᴍᴇ Zᴏɴᴇ:* Asia/Kabul
┃❍ *Sᴇʀᴠᴇʀ Rᴀᴍ:* ${usedMem.toFixed(2)} GB / ${totalMem.toFixed(2)} GB
╰═════════════════⊷\n\n`;

        // حذف دسته‌های menu، nothing و misc
        const filteredCommands = commands.filter(cmd =>
            !["menu", "nothing", "misc"].includes(cmd.category)
        );

        const categories = [...new Set(filteredCommands.map(cmd => cmd.category))];

        const fancy = (txt) => {
            if (Array.isArray(txt)) txt = txt[0]; // اگه آرایه بود، اولین عنصرش رو بگیر
            const map = {
                a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ғ',
                g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ',
                m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ',
                s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x',
                y: 'ʏ', z: 'ᴢ', "1": "𝟏", "2": "𝟐", "3": "𝟑",
                "4": "𝟒", "5": "𝟓", "6": "𝟔", "7": "𝟕", "8": "𝟖",
                "9": "𝟗", "0": "𝟎", ".": ".", "-": "-", "_": "_"
            };
            return txt.split('').map(c => map[c.toLowerCase()] || c).join('');
        };

        for (const category of categories) {
            const cmdsInCat = filteredCommands.filter(cmd => cmd.category === category);
            if (cmdsInCat.length === 0) continue;

            menuText += `╭━━━━❮ *${category.toUpperCase()}* ❯━⊷\n`;
            cmdsInCat.forEach(cmd => {
                menuText += `┃◈  ${fancy(cmd.pattern)}\n`;
            });
            menuText += `╰━━━━━━━━━━━━━━━━━⊷\n\n`;
        }

        await conn.sendMessage(from, {
            image: { url: `https://cdn.davidxtech.de/cdn/image/upload_1774908829768.jpg` },
            caption: menuText.trim(),
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363424458345675@newsletter',
                    newsletterName: "NOTHING TECH",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

        await conn.sendMessage(from, {
            react: { text: "✅", key: m.key }
        });

    } catch (e) {
        console.error(e);
        reply("Error while generating menu:\n" + e.toString());
    }
});