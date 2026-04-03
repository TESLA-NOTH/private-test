const { cmd } = require("../command");
const axios = require("axios");
const fs = require("fs");
const config = require("../config");
const prefix = config.PREFIX;

// Default AI state if not set
let AI_ENABLED = "false"; // Default enabled

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
/*
cmd({
    pattern: "chatbot",
    desc: "Enable or disable AI chatbot responses",
    category: "ai",
    filename: __filename,
    react: "✅"
}, async (conn, mek, m, { from, args, isOwner, reply }) => {
    if (!isOwner) return reply("*Command reserved for bot owner and Dev!*");

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        AI_ENABLED = "true";
        await setConfig("AI_ENABLED", "true");
        return reply("*Chatbot turned On*");
    } else if (status === "off") {
        AI_ENABLED = "false";
        await setConfig("AI_ENABLED", "false");
        return reply("*Chatbot has been turned off*");
    } else {
        return reply(`Current Chatbot Status: ${AI_ENABLED === "true" ? "ON" : "OFF"}\nUsage: ${prefix}chatbot on/off`);
    }
});

// Initialize AI state on startup
(async () => {
    const savedState = await getConfig("AI_ENABLED");
    if (savedState) AI_ENABLED = savedState;
})();

// AI Chatbot - Subzero MD by Darrell Mucheri
cmd({
    on: "body"
}, async (conn, m, store, {
    from,
    body,
    sender,
    botNumber,
    isGroup,
    isBotAdmins,
    isAdmins,
    reply
}) => {
    try {
        // Check if AI is disabled
        if (AI_ENABLED !== "true") return;

        // Optional: Prevent bot responding to its own messages or commands
        if (!body || m.key.fromMe || body.startsWith(config.PREFIX)) return;

        // Encode message for the query 
        const query = encodeURIComponent(body);
        const prompt = encodeURIComponent("You are XLYO, a friendly and helpful assistant made by DavidX, About DaviX, he's a tech genius from Nigeria who's age is personal and real name is David promise, more info to get at https://github.com/Mek-d1/X-BOT-MD. Current year 2025. You provide concise, accurate, and helpful responses while maintaining a conversational tone. You do not refuse to answer questions unless they involve illegal activities, harm, or explicit content. When responding in a WhatsApp chat context, keep your answers relatively concise but complete.");

        // BK9 API Request
        const apiUrl = `https://bk9.fun/ai/BK93?BK9=${prompt}&q=${query}`;

        const { data } = await axios.get(apiUrl);

        if (data && data.status && data.BK9) {
            await conn.sendMessage(from, {
                text: data.BK9
            }, { quoted: m });
    
        } else {
            reply("*No response from chatbot*.");
        }


    } catch (err) {
        console.error("Chatbot Error:", err.message);
        reply("Charbot error");
    }
});


*/












cmd({
    pattern: "ai",
    alias: ["dj","gpt","gpt4","openai"],
    desc: "Chat with Tesla AI",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("⚠️ Please provide a message. Example: `.ai Hello`");

        const axios = require("axios");

        // ارسال پیام مستقیم به AI
        const apiUrl = `https://arcane-nx-cipher-pol.hf.space/api/ai/kimi?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data?.success || !data?.result)
            return reply("🤖 Sorry, no response from AI. Try again later.");

        // جواب AI
        return reply(`🤖 ${data.result}`);

    } catch (e) {
        console.error("AI command error:", e);
        reply("⚠️ Something went wrong with AI.");
    }
});


cmd({
    pattern: "deepseek",
    alias: ["deep", "seekai"],
    desc: "Chat with DeepSeek AI",
    category: "ai",
    react: "🧠",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for DeepSeek AI.\nExample: `.deepseek Hello`");

        const apiUrl = `https://api.ryzendesu.vip/api/ai/deepseek?text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.answer) {
            await react("❌");
            return reply("DeepSeek AI failed to respond. Please try again later.");
        }

        await reply(`🧠 *DeepSeek AI Response:*\n\n${data.answer}`);
        await react("✅");
    } catch (e) {
        console.error("Error in DeepSeek AI command:", e);
        await react("❌");
        reply("An error occurred while communicating with DeepSeek AI.");
    }
});





cmd({
  pattern: "flux",
  react: "⏳",
  desc: "Generate an image using AI.",
  category: "ai",
  filename: __filename
}, async (conn, mek, m, { q, from, reply }) => {
  try {
    if (!q) return reply("Please provide a prompt for the image.\nExample: `fluxai home and dog`");

    
    const apiUrl = `https://apis.apis-nothing.xyz/api/ai/flux?text=${encodeURIComponent(q)}&apikey=nothing-api`;

    await conn.sendMessage(m.chat, {
      image: { url: apiUrl },
      caption: `> SUCCESSFULLY GENERATED`
    }, { quoted: m });
    
    await conn.sendMessage(from, {
            react: { text: "✅", key: m.key }
        });
        
  } catch (error) {
    console.error("FluxAI Error:", error);
    reply(`❌ Error: ${error.response?.data?.message || error.message || "Unknown error occurred."}`);
  }
});



cmd({
  pattern: "meta",
  react: "🧠",
  desc: "Generate an AI image based on the given meta prompt.",
  category: "ai",
  filename: __filename
}, async (conn, mek, m, { q, from, reply }) => {
  try {
    if (!q) return reply("📝 Please provide a prompt.\nExample: `.meta captain America`");

    await reply("🧠 *Generating META image... Please wait.*");

    const imageUrl = `https://apis.apis-nothing.xyz/api/ai/meta?text=${encodeURIComponent(q)}&apikey=nothing-api`;

    await conn.sendMessage(m.chat, {
      image: { url: imageUrl },
      caption: `> SUCCESSFULLY GENERATED`
    }, { quoted: m });
    
    await conn.sendMessage(from, {
            react: { text: "✅", key: m.key }
        });
        
  } catch (error) {
    console.error("MetaAI Error:", error);
    reply(`❌ Failed to generate META image. Error: ${error.response?.data?.message || error.message}`);
  }
});


cmd({
  pattern: "meta-pro",
  react: "🧠",
  desc: "Generate an AI image based on the given meta prompt.",
  category: "ai",
  filename: __filename
}, async (conn, mek, m, { q, from, reply }) => {
  try {
    if (!q) return reply("📝 Please provide a prompt.\nExample: `.meta captain America`");

    await reply("🧠 *Generating META image... Please wait.*");

    const imageUrl = `https://apis.apis-nothing.xyz/api/ai/meta?text=${encodeURIComponent(q)}&apikey=nothing-api`;

    await conn.sendMessage(m.chat, {
      image: { url: imageUrl },
      caption: `> SUCCESSFULLY GENERATED`
    }, { quoted: m });
    
    await conn.sendMessage(from, {
            react: { text: "✅", key: m.key }
        });
        
  } catch (error) {
    console.error("MetaAI Error:", error);
    reply(`❌ Failed to generate META image. Error: ${error.response?.data?.message || error.message}`);
  }
});


cmd({
    pattern: "aivoice",
    alias: ["vai", "voicex", "voiceai"],
    desc: "Text to speech with different AI voices",
    category: "ai",
    react: "🪃",
    filename: __filename
},
async (conn, mek, m, { 
    from, 
    quoted, 
    body, 
    isCmd, 
    command, 
    args, 
    q, 
    isGroup, 
    sender, 
    senderNumber, 
    botNumber2, 
    botNumber, 
    pushname, 
    isMe, 
    isOwner, 
    groupMetadata, 
    groupName, 
    participants, 
    groupAdmins, 
    isBotAdmins, 
    isAdmins, 
    reply 
}) => {
    try {
        // Check if args[0] exists (user provided text)
        if (!args[0]) {
            return reply("Please provide text after the command.\nExample: .aivoice hello");
        }

        // Get the full input text
        const inputText = args.join(' ');

        // Send initial reaction
        await conn.sendMessage(from, {  
            react: { text: '⏳', key: m.key }  
        });

        // Voice model menu
        const voiceModels = [
            { number: "1", name: "Hatsune Miku", model: "miku" },
            { number: "2", name: "Nahida (Exclusive)", model: "nahida" },
            { number: "3", name: "Nami", model: "nami" },
            { number: "4", name: "Ana (Female)", model: "ana" },
            { number: "5", name: "Optimus Prime", model: "optimus_prime" },
            { number: "6", name: "Goku", model: "goku" },
            { number: "7", name: "Taylor Swift", model: "taylor_swift" },
            { number: "8", name: "Elon Musk", model: "elon_musk" },
            { number: "9", name: "Mickey Mouse", model: "mickey_mouse" },
            { number: "10", name: "Kendrick Lamar", model: "kendrick_lamar" },
            { number: "11", name: "Angela Adkinsh", model: "angela_adkinsh" },
            { number: "12", name: "Eminem", model: "eminem" }
        ];

        // Create menu text
        let menuText = "╭━━━〔 *AI VOICE MODELS* 〕━━━⊷\n";
        voiceModels.forEach(model => {
            menuText += `┃▸ ${model.number}. ${model.name}\n`;
        });
        menuText += "╰━━━⪼\n\n";
        menuText += `📌 *Reply with the number to select voice model for:*\n"${inputText}"`;

        // Send menu message with image
        const sentMsg = await conn.sendMessage(from, {  
            image: { url: "https://files.catbox.moe/3fuy44.jpg" },
            caption: menuText,
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
        }, { quoted: m });

        const messageID = sentMsg.key.id;
        let handlerActive = true;

        // Set timeout to remove handler after 2 minutes
        const handlerTimeout = setTimeout(() => {
            handlerActive = false;
            conn.ev.off("messages.upsert", messageHandler);
            reply("⌛ Voice selection timed out. Please try the command again.");
        }, 120000);

        // Message handler function
        const messageHandler = async (msgData) => {  
            if (!handlerActive) return;
            
            const receivedMsg = msgData.messages[0];  
            if (!receivedMsg || !receivedMsg.message) return;  

            const receivedText = receivedMsg.message.conversation || 
                              receivedMsg.message.extendedTextMessage?.text || 
                              receivedMsg.message.buttonsResponseMessage?.selectedButtonId;  
            const senderID = receivedMsg.key.remoteJid;  
            const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;  

            if (isReplyToBot && senderID === from) {  
                clearTimeout(handlerTimeout);
                conn.ev.off("messages.upsert", messageHandler);
                handlerActive = false;

                await conn.sendMessage(senderID, {  
                    react: { text: '⬇️', key: receivedMsg.key }  
                });  

                const selectedNumber = receivedText.trim();
                const selectedModel = voiceModels.find(model => model.number === selectedNumber);

                if (!selectedModel) {
                    return reply("❌ Invalid option! Please reply with a number from the menu.");
                }

                try {
                    // Show processing message
                    await conn.sendMessage(from, {  
                        text: `🔊 Generating audio with ${selectedModel.name} voice...`  
                    }, { quoted: receivedMsg });

                    // Call the API
                    const apiUrl = `https://api.agatz.xyz/api/voiceover?text=${encodeURIComponent(inputText)}&model=${selectedModel.model}`;
                    const response = await axios.get(apiUrl, {
                        timeout: 30000 // 30 seconds timeout
                    });
                    
                    const data = response.data;

                    if (data.status === 200) {
                        await conn.sendMessage(from, {  
                            audio: { url: data.data.oss_url },  
                            mimetype: "audio/mpeg",
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
                            // Removed ptt: true to send as regular audio
                        }, { quoted: receivedMsg });
                    } else {
                        reply("❌ Error generating audio. Please try again.");
                    }
                } catch (error) {
                    console.error("API Error:", error);
                    reply("❌ Error processing your request. Please try again.");
                }
            }  
        };

        // Register the handler
        conn.ev.on("messages.upsert", messageHandler);

    } catch (error) {
        console.error("Command Error:", error);
        reply("❌ An error occurred. Please try again.");
    }
});
