// plugins/anti-call.js
const { cmd } = require('../command');
const config = require('../config');
const { saveUserConfig } = require('../lib/server');

// Default values
config.ANTICALL = config.ANTICALL || "false";
config.ANTICALL_MSG = config.ANTICALL_MSG || "*No calls allowed*!";

// Handler
const Anticall = async (json, conn) => {
    if (!Array.isArray(json)) return;
    for (const call of json) {
        if (!call || !call.status || !call.from || !call.id) continue;

        if (call.status === "offer") {
            try {
                if (config.ANTICALL === "true") {
                    await conn.sendMessage(call.from, { text: config.ANTICALL_MSG, mentions: [call.from] });
                    await conn.rejectCall(call.id, call.from);
                } else if (config.ANTICALL === "block") {
                    await conn.sendMessage(call.from, { text: "No calls allowed and you're blocked!", mentions: [call.from] });
                    await conn.rejectCall(call.id, call.from);
                    await conn.updateBlockStatus(call.from, "block");
                }
            } catch (e) {
                console.error("AntiCall runtime error:", e);
            }
        }
    }
};

// Command
cmd({
    pattern: "anticall",
    alias: ["callblock"],
    desc: "Configure AntiCall mode",
    category: "owner",
    filename: __filename,
    react: "📵"
}, async (conn, m, { reply }) => {
    try {
        const text = m.text?.toLowerCase() || "";
        const botNumber = conn.user.id.split(':')[0];

        if (text.includes("on") || text.includes("true")) {
            config.ANTICALL = "true";
            await config.setConfig("ANTI_CALL", "true", botNumber);
        } else if (text.includes("off")) {
            config.ANTICALL = "false";
            await config.setConfig("ANTI_CALL", "false", botNumber);
        } else if (text.includes("block")) {
            config.ANTICALL = "block";
            await config.setConfig("ANTI_CALL", "block", botNumber);
        } else if (text.startsWith("anticall msg")) {
            const newMsg = m.text.slice("anticall msg".length).trim();
            if (newMsg) config.ANTICALL_MSG = newMsg;
            await config.setConfig("ANTI_CALL_MSG", config.ANTICALL_MSG, botNumber);
            return reply(`📵 AntiCall message updated:\n${config.ANTICALL_MSG}`);
        } else {
            return reply(`📵 *AntiCall Settings*\nMode: ${config.ANTICALL.toUpperCase()}\nMessage: ${config.ANTICALL_MSG}\n\nUsage:
→ anticall on / true (reject calls)
→ anticall off (disable)
→ anticall block (reject+block)
→ anticall msg [your message]`);
        }

        reply(`📵 AntiCall Mode set to: ${config.ANTICALL.toUpperCase()}
${config.ANTICALL === "block" ? "⚠️ Callers will be BLOCKED" : config.ANTICALL === "true" ? "❗ Calls will be rejected" : "✅ Disabled"}`);
    } catch (err) {
        console.error("AntiCall command error:", err);
    }
});

module.exports = { Anticall, anticallHandler: Anticall };