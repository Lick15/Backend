import express from "express";
import fs from "fs";
import { v4 as uuid } from "uuid";

const router = express.Router();

// Load key file
function loadKeys() {
  if (!fs.existsSync("keys.json")) return [];
  return JSON.parse(fs.readFileSync("keys.json", "utf8"));
}

// Save keys
function saveKeys(data) {
  fs.writeFileSync("keys.json", JSON.stringify(data, null, 2));
}

// Generate new key (expire 24 hours)
router.get("/genkey", (req, res) => {
  const keys = loadKeys();

  const newKey = {
    key: uuid(),
    expires: Date.now() + 24 * 60 * 60 * 1000, // 24h
  };

  keys.push(newKey);
  saveKeys(keys);

  res.json({ status: "ok", newKey });
});

// Verify key
router.post("/verify", (req, res) => {
  const { key } = req.body;
  const keys = loadKeys();

  const found = keys.find((k) => k.key === key);

  if (!found) return res.json({ valid: false, reason: "Key not found" });

  if (found.expires < Date.now()) {
    return res.json({ valid: false, reason: "Expired" });
  }

  res.json({ valid: true });
});

export default router;
