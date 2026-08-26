// server/index.js

require("dotenv").config();
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ====== MIDDLEWARE ======
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ===============================
// 🟢 UPTIME ROBOT HEALTH CHECK (Added)
// ===============================
// tiny, no-cache endpoints for UptimeRobot or other monitors.
// They are safe and fast — do not touch DB or heavy work.
app.get("/health", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.status(200).json({ status: "ok", timestamp: Date.now() });
});

// Best minimal endpoint for UptimeRobot — returns plain OK
app.get("/uptimerobot", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.status(200).send("OK");
});
// ===============================
// END HEALTH CHECK
// ===============================

// Serve static frontend (root folder with HTML, assets, manifest, SW)
const PUBLIC_DIR = path.join(__dirname, "..");
app.use(express.static(PUBLIC_DIR));

// ===============================
// 1️⃣ CONNECT TO MONGODB
// ===============================
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("❌ MONGODB_URI is missing in .env file");
  process.exit(1);
}

// Log URI safely (hide password)
console.log(
  "🔐 Mongo URI:",
  mongoUri.replace(/\/\/.*?:.*?@/, "//<user>:<pass>@")
);

mongoose
  .connect(mongoUri, {
    serverSelectionTimeoutMS: 30000, // avoid quick timeout
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

// ===============================
// 1.1️⃣ CONNECT TO PHOTOS DB (Secondary)
// ===============================
const photosUri = process.env.MONGODB_PHOTOS_URI;
let photosDbConnection;

if (photosUri) {
  console.log("📸 Connecting to Photos DB...");
  photosDbConnection = mongoose.createConnection(photosUri, {
    serverSelectionTimeoutMS: 30000,
  });

  photosDbConnection.on("connected", () => {
    console.log("✅ Photos DB connected successfully");
  });

  photosDbConnection.on("error", (err) => {
    console.error("❌ Photos DB connection error:", err);
  });
} else {
  console.warn("⚠️ MONGODB_PHOTOS_URI is missing. Photos feature will not work.");
}

// ===============================
// 2️⃣ SCHEMAS & MODELS
// ===============================

// Money collection
// NOTE: we store date as DD-MM-YYYY (string) to match your UI.
// Amount is OPTIONAL (can be 0 or missing).
const moneyEntrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, default: "" },
    amount: { type: Number, default: 0 }, // optional, default 0
    date: { type: String, required: true }, // DD-MM-YYYY (or sometimes old YYYY-MM-DD)
    paymentType: { type: String, default: "" }, // "cash", "upi", "cash,upi"
    items: { type: String, default: "" }, // optional item text
    year: { type: Number, required: true }, // NEW: year field
  },
  { timestamps: true }
);

// Add index for year
moneyEntrySchema.index({ year: 1 });

const MoneyEntry = mongoose.model("MoneyEntry", moneyEntrySchema);

// Expenditure entries
const expenditureSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // expense name
    amount: { type: Number, required: true }, // rupees
    date: { type: String, required: true }, // typically YYYY-MM-DD from <input type="date">
    year: { type: Number, required: true }, // NEW: year field
  },
  { timestamps: true }
);

// Add index for year
expenditureSchema.index({ year: 1 });

const Expenditure = mongoose.model("Expenditure", expenditureSchema);

// Events
const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    place: { type: String, default: "" },
    date: { type: String, required: true }, // YYYY-MM-DD
    year: { type: Number, required: true }, // NEW: year field
  },
  { timestamps: true }
);

// Add index for year
eventSchema.index({ year: 1 });

const Event = mongoose.model("Event", eventSchema);

// Tasks (pending / completed)
const taskSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    status: { type: String, default: "pending" }, // "pending" or "completed"
    year: { type: Number, required: true }, // NEW: year field
  },
  { timestamps: true }
);

// Add index for year
taskSchema.index({ year: 1 });

const Task = mongoose.model("Task", taskSchema);

// Special List (Laddu / Ganesh Bomma)
const specialItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    amount: { type: Number, default: 0 },
    date: { type: String, required: true }, // DD-MM-YYYY
    category: { type: String, required: true }, // "laddu" or "ganesh"
    year: { type: Number, required: true },
  },
  { timestamps: true }
);

specialItemSchema.index({ year: 1, category: 1 });

const SpecialItem = mongoose.model("SpecialItem", specialItemSchema);

// Photos Schema (Connected to Secondary DB)
const photoSchema = new mongoose.Schema(
  {
    image: { type: String, required: true }, // Base64 string
    description: { type: String, default: "" },
    date: { type: String, required: true }, // DD-MM-YYYY
    year: { type: Number, required: true, default: () => new Date().getFullYear() },
  },
  { timestamps: true }
);

let Photo;
if (photosDbConnection) {
  Photo = photosDbConnection.model("Photo", photoSchema);
} else {
  // Fallback if no URI provided (prevents crashes, but won't save)
  console.warn("⚠️ No Photos DB connection, using default Mongoose connection for Photo model (might fail if not intended)");
  Photo = mongoose.model("Photo", photoSchema);
}

// ===============================
// 2.1️⃣ DATE HELPERS (for DD-MM-YYYY)
// ===============================

// parses "DD-MM-YYYY" or "YYYY-MM-DD" and returns { day, month, year, dateObj } or null
function parseFlexibleDate(str) {
  if (!str || typeof str !== "string") return null;
  const s = str.trim();

  // DD-MM-YYYY
  let m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(s);
  if (m) {
    const day = Number(m[1]);
    const month = Number(m[2]);
    const year = Number(m[3]);
    const d = new Date(year, month - 1, day);
    if (
      d.getFullYear() === year &&
      d.getMonth() === month - 1 &&
      d.getDate() === day
    ) {
      return { day, month, year, dateObj: d };
    }
    return null;
  }

  // YYYY-MM-DD (old format support)
  m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) {
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    const d = new Date(year, month - 1, day);
    if (
      d.getFullYear() === year &&
      d.getMonth() === month - 1 &&
      d.getDate() === day
    ) {
      return { day, month, year, dateObj: d };
    }
  }

  return null;
}

function todayDDMMYYYY() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

// Helper to get year from query or default to current year
function getSelectedYear(req) {
  return Number(req.query.year) || new Date().getFullYear();
}

// ===============================
// 3️⃣ ROUTES
// ===============================

// ✅ Root check
app.get("/ping", (req, res) => {
  res.send("✅ Server running successfully");
});

// ✅ LOGIN (single admin account)
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const FIXED_USERNAME = "ganesh";
  const FIXED_PASSWORD = "ganesh";

  console.log("🔐 LOGIN ATTEMPT:", username, password);

  if (
    typeof username === "string" &&
    typeof password === "string" &&
    username.toLowerCase() === FIXED_USERNAME &&
    password === FIXED_PASSWORD
  ) {
    console.log("✅ LOGIN SUCCESS");
    return res.json({ success: true });
  }

  console.log("❌ LOGIN FAILED");
  return res.status(401).json({
    success: false,
    message: "Invalid credentials",
  });
});

// -------------------------------
// MONEY COLLECTION CRUD
// -------------------------------

// ✅ GET all money entries (sorted by newest created)
app.get("/api/money", async (req, res) => {
  try {
    const year = getSelectedYear(req);
    const entries = await MoneyEntry.find({ year }).sort({
      createdAt: -1,
    });
    res.json(entries);
  } catch (err) {
    console.error("❌ GET /api/money:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ CREATE new entry (amount OPTIONAL, date in DD-MM-YYYY)
app.post("/api/money", async (req, res) => {
  try {
    const { name, mobile, amount, date, paymentType, items, year } = req.body;

    if (!name || !date) {
      return res
        .status(400)
        .json({ error: "name and date are required" });
    }

    const selectedYear = year ? Number(year) : new Date().getFullYear();

    // amount optional → if given, clean it; else default 0
    let cleanAmount = 0;
    if (amount !== undefined && amount !== null && amount !== "") {
      const num = Number(amount);
      cleanAmount = Number.isNaN(num) ? 0 : Math.round(num);
    }

    const entry = await MoneyEntry.create({
      name,
      mobile: mobile || "",
      amount: cleanAmount,
      date, // store as DD-MM-YYYY (from frontend)
      paymentType: paymentType || "",
      items: items || "",
      year: selectedYear,
    });

    res.status(201).json(entry);
  } catch (err) {
    console.error("❌ POST /api/money:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ UPDATE entry (amount still optional)
app.put("/api/money/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, mobile, amount, date, paymentType, items, year } = req.body;

    const updateData = {
      name,
      mobile: mobile || "",
      date,
      paymentType: paymentType || "",
      items: items || "",
    };

    if (year !== undefined) {
      updateData.year = Number(year);
    }

    if (amount !== undefined && amount !== null && amount !== "") {
      const num = Number(amount);
      updateData.amount = Number.isNaN(num) ? 0 : Math.round(num);
    }

    const updated = await MoneyEntry.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("❌ PUT /api/money/:id:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ DELETE entry
app.delete("/api/money/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await MoneyEntry.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE /api/money/:id:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------------------
// MONEY: 2025 ONLY (for 2025money.html & previous-years.html)
// -------------------------------
app.get("/api/money/2025", async (req, res) => {
  try {
    const allEntries = await MoneyEntry.find();
    const filtered = allEntries.filter((e) => {
      const parsed = parseFlexibleDate(e.date);
      return parsed && parsed.year === 2025;
    });
    res.json(filtered);
  } catch (err) {
    console.error("❌ GET /api/money/2025:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------------------
// MONEY SUMMARY ENDPOINT (for home.html)
// -------------------------------
app.get("/api/money/summary", async (req, res) => {
  try {
    const year = getSelectedYear(req);

    // Total for selected year
    const totalResult = await MoneyEntry.aggregate([
      { $match: { year } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalAmount = totalResult.length > 0 ? totalResult[0].total : 0;

    // Today's amount (only for selected year)
    const today = new Date();
    const todayStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${year}`;
    const todayEntries = await MoneyEntry.find({ year, date: todayStr });
    const todayAmount = todayEntries.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    // Last year total
    const lastYear = year - 1;
    const lastYearResult = await MoneyEntry.aggregate([
      { $match: { year: lastYear } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const lastYearAmount = lastYearResult.length > 0 ? lastYearResult[0].total : 0;

    res.json({
      totalAmount,
      todayAmount,
      lastYearAmount,
    });
  } catch (err) {
    console.error("❌ GET /api/money/summary:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------------------
// EXPENDITURE CRUD
// -------------------------------
app.get("/api/expenditure", async (req, res) => {
  try {
    const year = getSelectedYear(req);
    const items = await Expenditure.find({ year }).sort({
      date: -1,
      createdAt: -1,
    });
    res.json(items);
  } catch (err) {
    console.error("❌ GET /api/expenditure:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/expenditure", async (req, res) => {
  try {
    const { name, amount, date, year } = req.body;

    if (!name || amount == null || !date) {
      return res
        .status(400)
        .json({ error: "name, amount, date are required" });
    }

    const selectedYear = year ? Number(year) : new Date().getFullYear();

    const item = await Expenditure.create({
      name,
      amount: Math.round(Number(amount)),
      date,
      year: selectedYear,
    });

    res.status(201).json(item);
  } catch (err) {
    console.error("❌ POST /api/expenditure:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/expenditure/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount, date, year } = req.body;

    const updateData = {
      name,
      amount: amount == null ? undefined : Math.round(Number(amount)),
      date,
    };

    if (year !== undefined) {
      updateData.year = Number(year);
    }

    const updated = await Expenditure.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Expenditure not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("❌ PUT /api/expenditure/:id:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/expenditure/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Expenditure.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Expenditure not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE /api/expenditure/:id:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------------------
// EVENTS CRUD
// -------------------------------
app.get("/api/events", async (req, res) => {
  try {
    const year = getSelectedYear(req);
    const items = await Event.find({ year }).sort({
      date: -1,
      createdAt: -1,
    });
    res.json(items);
  } catch (err) {
    console.error("❌ GET /api/events:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/events", async (req, res) => {
  try {
    const { name, place, date, year } = req.body;

    if (!name || !date) {
      return res
        .status(400)
        .json({ error: "name and date are required" });
    }

    const selectedYear = year ? Number(year) : new Date().getFullYear();

    const item = await Event.create({
      name,
      place: place || "",
      date,
      year: selectedYear,
    });

    res.status(201).json(item);
  } catch (err) {
    console.error("❌ POST /api/events:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, place, date, year } = req.body;

    const updateData = {
      name,
      place: place || "",
      date,
    };

    if (year !== undefined) {
      updateData.year = Number(year);
    }

    const updated = await Event.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("❌ PUT /api/events/:id:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/events/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Event.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE /api/events/:id:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------------------
// TASKS CRUD
// -------------------------------
app.get("/api/tasks", async (req, res) => {
  try {
    const year = getSelectedYear(req);
    const items = await Task.find({ year }).sort({
      date: -1,
      createdAt: -1,
    });
    res.json(items);
  } catch (err) {
    console.error("❌ GET /api/tasks:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const { name, date, status, year } = req.body;

    if (!name || !date) {
      return res
        .status(400)
        .json({ error: "name and date are required" });
    }

    const selectedYear = year ? Number(year) : new Date().getFullYear();

    const item = await Task.create({
      name,
      date,
      status: status || "pending",
      year: selectedYear,
    });

    res.status(201).json(item);
  } catch (err) {
    console.error("❌ POST /api/tasks:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, date, status, year } = req.body;

    const updateData = {
      name,
      date,
      status: status || "pending",
    };

    if (year !== undefined) {
      updateData.year = Number(year);
    }

    const updated = await Task.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("❌ PUT /api/tasks/:id:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Task.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE /api/tasks/:id:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------------------
// SPECIAL LIST CRUD (Laddu / Ganesh)
// -------------------------------
app.get("/api/special", async (req, res) => {
  try {
    const year = getSelectedYear(req);
    const { category } = req.query; // "laddu" or "ganesh" (optional)

    const query = { year };
    if (category) query.category = category;

    const items = await SpecialItem.find(query).sort({
      createdAt: -1,
    });
    res.json(items);
  } catch (err) {
    console.error("❌ GET /api/special:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/special", async (req, res) => {
  try {
    const { name, amount, date, category, year } = req.body;

    if (!name || !date || !category) {
      return res.status(400).json({ error: "name, date, category are required" });
    }

    const selectedYear = year ? Number(year) : new Date().getFullYear();

    const item = await SpecialItem.create({
      name,
      amount: amount ? Number(amount) : 0,
      date,
      category,
      year: selectedYear,
    });

    res.status(201).json(item);
  } catch (err) {
    console.error("❌ POST /api/special:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/special/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount, date, category, year } = req.body;

    const updateData = {
      name,
      amount: amount ? Number(amount) : 0,
      date,
      category,
    };

    if (year !== undefined) {
      updateData.year = Number(year);
    }

    const updated = await SpecialItem.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) return res.status(404).json({ error: "Item not found" });

    res.json(updated);
  } catch (err) {
    console.error("❌ PUT /api/special/:id:", err);
    res.status(500).json({ error: "Server error" });
  }
});



// -------------------------------
// PHOTOS CRUD
// -------------------------------
app.get("/api/photos", async (req, res) => {
  try {
    if (!photosDbConnection) {
      return res.status(503).json({ error: "Photos DB not connected" });
    }
    // Fetch all photos, sorted by year (desc) then newest (desc)
    const photos = await Photo.find().sort({ year: -1, createdAt: -1 });
    res.json(photos);
  } catch (err) {
    console.error("❌ GET /api/photos:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/photos", async (req, res) => {
  try {
    if (!photosDbConnection) {
      return res.status(503).json({ error: "Photos DB not connected" });
    }

    const { image, description, date, year } = req.body;

    if (!image || !date) {
      return res.status(400).json({ error: "Image and date are required" });
    }

    // Limit check (naive) - Mongo limit is 16MB/doc, keep it sane
    if (image.length > 50 * 1024 * 1024) {
      return res.status(413).json({ error: "Image too large (max ~50MB)" });
    }

    const selectedYear = year ? Number(year) : new Date().getFullYear();

    const newPhoto = await Photo.create({
      image,
      description: description || "",
      date,
      year: selectedYear
    });

    res.status(201).json(newPhoto);
  } catch (err) {
    console.error("❌ POST /api/photos:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/photos/:id", async (req, res) => {
  try {
    if (!photosDbConnection) {
      return res.status(503).json({ error: "Photos DB not connected" });
    }

    const { id } = req.params;
    const deleted = await Photo.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Photo not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE /api/photos/:id:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------------------
// MIGRATION: Add year to existing data (run once)
// -------------------------------
app.post("/api/migrate", async (req, res) => {
  try {
    const { password } = req.body;

    if (password !== "ganesh") {
      return res.status(401).json({ message: "Invalid password" });
    }

    // For money entries, extract year from date
    const moneyEntries = await MoneyEntry.find({ year: { $exists: false } });
    for (const entry of moneyEntries) {
      const parsed = parseFlexibleDate(entry.date);
      if (parsed) {
        await MoneyEntry.findByIdAndUpdate(entry._id, { year: parsed.year });
      }
    }

    // For expenditure, extract year from date
    const expenditures = await Expenditure.find({ year: { $exists: false } });
    for (const exp of expenditures) {
      const parsed = parseFlexibleDate(exp.date);
      if (parsed) {
        await Expenditure.findByIdAndUpdate(exp._id, { year: parsed.year });
      }
    }

    // For events, extract year from date
    const events = await Event.find({ year: { $exists: false } });
    for (const event of events) {
      const parsed = parseFlexibleDate(event.date);
      if (parsed) {
        await Event.findByIdAndUpdate(event._id, { year: parsed.year });
      }
    }

    // For tasks, extract year from date
    const tasks = await Task.find({ year: { $exists: false } });
    for (const task of tasks) {
      const parsed = parseFlexibleDate(task.date);
      if (parsed) {
        await Task.findByIdAndUpdate(task._id, { year: parsed.year });
      }
    }

    // For special items, extract year from date
    const specials = await SpecialItem.find({ year: { $exists: false } });
    for (const item of specials) {
      const parsed = parseFlexibleDate(item.date);
      if (parsed) {
        await SpecialItem.findByIdAndUpdate(item._id, { year: parsed.year });
      }
    }

    res.json({ message: "Migration completed successfully" });
  } catch (err) {
    console.error("❌ POST /api/migrate:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------------------
// RESET DATA (YEAR-WISE ONLY)
// -------------------------------
app.post("/api/reset", async (req, res) => {
  try {
    const { password, year } = req.body;

    if (password !== "ganesh") {
      return res.status(401).json({ message: "Invalid password" });
    }

    const selectedYear = year ? Number(year) : new Date().getFullYear();

    // Delete only selected year data
    await MoneyEntry.deleteMany({ year: selectedYear });
    await Expenditure.deleteMany({ year: selectedYear });
    await Task.deleteMany({ year: selectedYear });
    await Task.deleteMany({ year: selectedYear });
    await Event.deleteMany({ year: selectedYear });
    await SpecialItem.deleteMany({ year: selectedYear });

    res.json({ message: `Data for year ${selectedYear} has been reset successfully` });
  } catch (err) {
    console.error("❌ POST /api/reset:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===============================
// 4️⃣ START SERVER
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
