const fs = require("fs");
const axios = require("axios");
const { cmd } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;

const dbPath = "./lib/wcg-database.json";
const timers = {};
const startTimers = {};

function loadDB() {
  if (!fs.existsSync(dbPath)) return {};
  const data = fs.readFileSync(dbPath, "utf-8");
  return JSON.parse(data || "{}");
}

function saveDB(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

async function isValidWord(word) {
  // تبدیل به حروف کوچک و trim
  word = word.trim().toLowerCase();

  // fallback داخلی: فقط حروف انگلیسی و حداقل 2 حرف
  const fallbackCheck = /^[a-z]{2,}$/.test(word);

  try {
    const query = encodeURIComponent(word);
    const url = `https://api.siputzx.my.id/api/ai/duckai?message=${query}&model=gpt-4o-mini`;
    const res = await axios.get(url);

    if (!res.data || !res.data.status) return fallbackCheck;

    const message = res.data.data.message.toLowerCase();

    // اگر پیام شامل "the correct spelling is" یا "recognized as a standard english word" باشد، کلمه درست است
    if (message.includes("the correct spelling is") || message.includes("recognized as a standard english word")) {
      return true;
    } else {
      // اگر API پاسخی درست نداد، fallback داخلی بررسی شود
      return fallbackCheck;
    }
  } catch (e) {
    console.error("Error in isValidWord:", e.message);
    // هنگام خطا، فقط fallback داخلی
    return fallbackCheck;
  }
}

function clearStartTimer(from) {
  if (startTimers[from]) {
    clearTimeout(startTimers[from]);
    delete startTimers[from];
  }
}

function clearTurnTimer(from) {
  if (timers[from]) {
    clearTimeout(timers[from]);
    delete timers[from];
  }
}

cmd({
  pattern: "wcg",
  desc: "Start a Word Chain Game",
  category: "game",
  filename: __filename
}, async (conn, mek, m, { from, reply, sender }) => {
  const db = loadDB();

  if (db[from] && !db[from].finished) {
    return reply("⚠️ A Word Chain game is already active.");
  }

  db[from] = {
    type: "wcg",
    players: [sender],
    words: [],
    turn: 0,
    waiting: true,
    finished: false,
    wordLimit: 3
  };

  saveDB(db);

  reply(
    `🎮 *Word Chain Game Started!*\n👤 Player 1: @${sender.split("@")[0]}\n⏳ Waiting for more players (up to 20)...\nSend *join-wcg* to join.`,
    null,
    { mentions: [sender] }
  );

  clearStartTimer(from);
  startTimers[from] = setTimeout(() => {
    const db = loadDB();
    if (!db[from] || db[from].finished) return;
    const game = db[from];
    if (game.waiting) {
      game.waiting = false;
      game.turn = 0;
      const randomLetter = String.fromCharCode(97 + Math.floor(Math.random() * 26));
      game.requiredFirstLetter = randomLetter;

      saveDB(db);

      conn.sendMessage(from, {
        text: `⏳ Time's up! Game is starting with ${game.players.length} player(s).\n🧠 *Word Chain Begins!*\n🎯 @${game.players[0].split("@")[0]} starts.\n🔤 First letter: *${randomLetter.toUpperCase()}*\n📌 Send an English word starting with *${randomLetter.toUpperCase()}* and at least *3 letters*`,
        mentions: game.players
      });

      clearStartTimer(from);

      clearTurnTimer(from);
      timers[from] = setTimeout(() => handleTimeout(conn, from), 40 * 1000);
    }
  }, 40 * 1000);
});

cmd({
  pattern: "join-wcg",
  desc: "Join a Word Chain Game",
  category: "game",
  filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
  const db = loadDB();
  const game = db[from];

  if (!game || game.type !== "wcg") return reply("❌ No Word Chain game to join.");
  if (!game.waiting) return reply("⚠️ Game already started.");
  if (game.players.includes(sender)) return reply("⚠️ You already joined the game.");
  if (game.players.length >= 20) return reply("⚠️ Player limit reached (20).");

  game.players.push(sender);
  saveDB(db);

  reply(
    `🙌 @${sender.split("@")[0]} joined the game! (${game.players.length} player(s) now)\n⏳ 40 seconds after first joiner the game will start.`,
    null,
    { mentions: game.players }
  );
});

const lastError = {}; // ذخیره آخرین خطای هر بازیکن

cmd({
  on: "body"
}, async (conn, mek, m, { from, body, sender, reply }) => {
  const text = body.trim().toLowerCase();
  const db = loadDB();
  const game = db[from];
  if (!game || game.type !== "wcg" || game.finished) return;

  if (text === "join-wcg") {
    if (!game.waiting) return reply("⚠️ Game already started.");
    if (game.players.includes(sender)) return reply("⚠️ You already joined the game.");
    if (game.players.length >= 20) return reply("⚠️ Player limit reached (20).");

    game.players.push(sender);
    saveDB(db);

    return reply(
      `🙌 @${sender.split("@")[0]} joined the game! (${game.players.length} player(s) now)\n⏳ 40 seconds after first joiner the game will start.`,
      null,
      { mentions: game.players }
    );
  }

  if (game.waiting) return;

  const currentPlayer = game.players[game.turn];
  if (currentPlayer !== sender) return;

  // بررسی اولیه قبل از API
  if (!/^[a-z]{2,}$/.test(text)) {
    if (lastError[sender] !== "⚠️ Only alphabetic English words are allowed.") {
      lastError[sender] = "⚠️ Only alphabetic English words are allowed.";
      return reply(lastError[sender]);
    } else return; // جلوگیری از اسپم
  }

  if (text.length < game.wordLimit) {
    if (lastError[sender] !== `📏 Word must be at least *${game.wordLimit}* letters.`) {
      lastError[sender] = `📏 Word must be at least *${game.wordLimit}* letters.`;
      return reply(lastError[sender]);
    } else return;
  }

  if (game.words.includes(text)) {
    if (lastError[sender] !== "♻️ Word already used!") {
      lastError[sender] = "♻️ Word already used!";
      return reply(lastError[sender]);
    } else return;
  }

  // پاک کردن آخرین خطا قبل از API
  lastError[sender] = null;

  if (!(await isValidWord(text))) return reply("❌ Not a valid English word!");

  if (game.words.length > 0) {
    const lastWord = game.words[game.words.length - 1];
    if (lastWord[lastWord.length - 1] !== text[0]) {
      return reply(`🔁 Word must start with *${lastWord[lastWord.length - 1].toUpperCase()}*`);
    }
  } else {
    if (text[0] !== game.requiredFirstLetter) {
      return reply(`🔤 First word must start with *${game.requiredFirstLetter.toUpperCase()}*`);
    }
  }

  game.words.push(text);
  game.turn = (game.turn + 1) % game.players.length;
  game.wordLimit = Math.min(game.wordLimit + 1, 7);
  game.lastMoveTime = Date.now();

  clearTurnTimer(from);
  timers[from] = setTimeout(() => handleTimeout(conn, from), 40 * 1000);

  saveDB(db);

  reply(
    `✅ *${text}* accepted!\n🧮 Total words so far: *${game.words.length}*\n🔠 Next word must start with *${text[text.length - 1].toUpperCase()}*\n➡️ @${game.players[game.turn].split("@")[0]}, your turn!\n📏 Min word length: *${game.wordLimit}*\n⏳ You have *40 seconds* to respond.`,
    null,
    { mentions: game.players }
  );
});

async function handleTimeout(conn, from) {
  const db = loadDB();
  if (!db[from]) return;
  const game = db[from];
  if (game.finished) return;

  const loser = game.players[game.turn];
  game.players.splice(game.turn, 1);

  await conn.sendMessage(from, {
    text: `⌛ *Timeout!*\n@${loser.split("@")[0]} did not respond and was eliminated.`,
    mentions: [loser]
  });

  if (game.players.length === 1) {
    game.finished = true;
    await conn.sendMessage(from, {
      text: `🏆 *Game Over!*\n🎉 Winner: @${game.players[0].split("@")[0]}`,
      mentions: game.players
    });
    clearTurnTimer(from);
    clearStartTimer(from);
    delete db[from];
    saveDB(db);
    return;
  }

  if (game.turn >= game.players.length) game.turn = 0;

  const lastWord = game.words[game.words.length - 1];
  const nextLetter = lastWord[lastWord.length - 1];

  clearTurnTimer(from);
  timers[from] = setTimeout(() => handleTimeout(conn, from), 40 * 1000);

  saveDB(db);

  await conn.sendMessage(from, {
    text: `➡️ It's @${game.players[game.turn].split("@")[0]}'s turn\n🔠 Word must start with *${nextLetter.toUpperCase()}*\n📏 Minimum length: *${game.wordLimit}*\n⏳ You have 40 seconds.`,
    mentions: [game.players[game.turn]]
  });
}