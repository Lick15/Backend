import express from "express";
import cors from "cors";
import fs from "fs-extra";
import { v4 as uuid } from "uuid";

const app = express();
app.use(cors());
app.use(express.json());

const KEY_FILE = "./keys.json";
const KEY_EXPIRE_HOURS = 24;

// โหลดไฟล์คีย์
async function loadKeys() {
    if (!await fs.pathExists(KEY_FILE)) {
        await fs.writeJson(KEY_FILE, []);
    }
    return await fs.readJson(KEY_FILE);
}

// บันทึกคีย์
async function saveKeys(keys) {
    await fs.writeJson(KEY_FILE, keys);
}

// ลบคีย์หมดอายุ
function removeExpired(keys) {
    const now = Date.now();
    return keys.filter(k => now < k.expireAt);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 API: สร้างคีย์ใหม่ /generate
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get("/generate", async (req, res) => {
    let keys = await loadKeys();

    // ลบคีย์หมดอายุ
    keys = removeExpired(keys);

    const newKey = uuid().replace(/-/g, "").substring(0, 20); // คีย์สวย 20 ตัว
    const expireAt = Date.now() + KEY_EXPIRE_HOURS * 60 * 60 * 1000;

    keys.push({ key: newKey, expireAt });
    await saveKeys(keys);

    res.json({
        key: newKey,
        expire_in_hours: KEY_EXPIRE_HOURS
    });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 API: ตรวจสอบคีย์ /verify?key=xxxx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get("/verify", async (req, res) => {
    const { key } = req.query;

    if (!key) return res.json({ valid: false, reason: "Missing key" });

    let keys = await loadKeys();

    keys = removeExpired(keys);

    const found = keys.find(k => k.key === key);

    if (!found) {
        return res.json({ valid: false });
    }

    return res.json({ valid: true });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 Start Server
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Key backend running on port " + PORT));
