import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { env } from "../config/env.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

const upload = multer({ dest: env.uploadsDir });

const DATA_FILE = path.resolve(process.cwd(), "server/src/data/sections.json");

function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function writeData(data) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Get all section images
router.get("/", (req, res) => {
  const data = readData();
  res.json({ items: data });
});

// Admin upload + map to a section key
router.post("/upload", requireAuth, requireRole("admin"), upload.single("file"), (req, res, next) => {
  try {
    const key = req.body.key;
    if (!key) return res.status(400).json({ error: "Missing key" });
    const file = req.file;
    if (!file) return res.status(400).json({ error: "Missing file" });

    const ext = path.extname(file.originalname) || ".png";
    const destName = `${key}-${Date.now()}${ext}`;
    const destPath = path.resolve(process.cwd(), env.uploadsDir, destName);
    fs.renameSync(file.path, destPath);

    const imageUrl = `/uploads/${destName}`;

    const data = readData();
    data[key] = imageUrl;
    writeData(data);

    res.json({ ok: true, key, imageUrl });
  } catch (e) {
    next(e);
  }
});

// Admin update arbitrary text/value for a section key
router.post("/update", requireAuth, requireRole("admin"), express.json(), (req, res, next) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: "Missing key" });

    const data = readData();
    data[key] = value;
    writeData(data);

    res.json({ ok: true, key, value });
  } catch (e) {
    next(e);
  }
});

export default router;
