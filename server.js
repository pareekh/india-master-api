const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ---------------- HOME ----------------
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Indian Banking API Running"
  });
});

// ---------------- API DOC (simple) ----------------
app.get("/api/docs", (req, res) => {
  res.json({
    endpoints: [
      "/api/ifsc/:ifsc",
      "/api/bank/:bank",
      "/api/branch/:branch",
      "/api/city/:city",
      "/api/state/:state",
      "/api/search?q=keyword",
      "/api/banks",
      "/api/stats"
    ]
  });
});

// ---------------- OPENAPI JSON (IMPORTANT) ----------------
app.get("/openapi.json", (req, res) => {
  res.json({
    openapi: "3.0.0",
    info: {
      title: "IFSC API",
      version: "1.0.0",
      description:
        "Indian Bank IFSC Code Finder API - Search banks, branches, cities and IFSC details instantly."
    },
    servers: [
      {
        url: "https://ifsc-api-eb4u.onrender.com"
      }
    ],
    paths: {
      "/api/ifsc/{ifsc}": {
        get: { summary: "Get IFSC details" }
      },
      "/api/bank/{bank}": {
        get: { summary: "Search by bank name" }
      },
      "/api/branch/{branch}": {
        get: { summary: "Search by branch" }
      },
      "/api/city/{city}": {
        get: { summary: "Search by city" }
      },
      "/api/state/{state}": {
        get: { summary: "Search by state" }
      },
      "/api/search": {
        get: { summary: "Universal search" }
      },
      "/api/stats": {
        get: { summary: "API statistics" }
      }
    }
  });
});

// ---------------- IFSC SEARCH ----------------
app.get("/api/ifsc/:ifsc", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM ifsc_database WHERE ifsc = $1 LIMIT 1",
      [req.params.ifsc.toUpperCase()]
    );
    res.json(result.rows[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- BANK SEARCH ----------------
app.get("/api/bank/:bank", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM ifsc_database WHERE bank ILIKE $1 LIMIT 100",
      [`%${req.params.bank}%`]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- BRANCH SEARCH ----------------
app.get("/api/branch/:branch", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM ifsc_database WHERE branch ILIKE $1 LIMIT 100",
      [`%${req.params.branch}%`]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- CITY SEARCH ----------------
app.get("/api/city/:city", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM ifsc_database WHERE city1 ILIKE $1 LIMIT 100",
      [`%${req.params.city}%`]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- STATE SEARCH ----------------
app.get("/api/state/:state", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM ifsc_database WHERE state ILIKE $1 LIMIT 100",
      [`%${req.params.state}%`]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- ALL BANKS ----------------
app.get("/api/banks", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT DISTINCT bank FROM ifsc_database ORDER BY bank"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- STATES BY BANK ----------------
app.get("/api/states/:bank", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT DISTINCT state FROM ifsc_database WHERE bank = $1 ORDER BY state",
      [req.params.bank]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- CITIES BY BANK + STATE ----------------
app.get("/api/cities/:bank/:state", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT city1
       FROM ifsc_database
       WHERE bank = $1 AND state = $2
       ORDER BY city1`,
      [req.params.bank, req.params.state]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- BRANCHES BY BANK + STATE + CITY ----------------
app.get("/api/branches/:bank/:state/:city", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT branch
       FROM ifsc_database
       WHERE bank = $1 AND state = $2 AND city1 = $3
       ORDER BY branch`,
      [req.params.bank, req.params.state, req.params.city]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- BRANCH DETAILS ----------------
app.get("/api/details/:bank/:state/:city/:branch", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM ifsc_database
       WHERE bank = $1 AND state = $2 AND city1 = $3 AND branch = $4
       LIMIT 100`,
      [
        req.params.bank,
        req.params.state,
        req.params.city,
        req.params.branch
      ]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- STATS ----------------
app.get("/api/stats", async (req, res) => {
  try {
    const totalBranches = await pool.query("SELECT COUNT(*) FROM ifsc_database");
    const totalBanks = await pool.query("SELECT COUNT(DISTINCT bank) FROM ifsc_database");
    const totalStates = await pool.query("SELECT COUNT(DISTINCT state) FROM ifsc_database");
    const totalCities = await pool.query("SELECT COUNT(DISTINCT city1) FROM ifsc_database");

    res.json({
      total_branches: parseInt(totalBranches.rows[0].count),
      total_banks: parseInt(totalBanks.rows[0].count),
      total_states: parseInt(totalStates.rows[0].count),
      total_cities: parseInt(totalCities.rows[0].count),
      api_status: "online"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- UNIVERSAL SEARCH ----------------
app.get("/api/search", async (req, res) => {
  try {
    const q = req.query.q || "";
    const result = await pool.query(
      `SELECT * FROM ifsc_database
       WHERE ifsc ILIKE $1
       OR bank ILIKE $1
       OR branch ILIKE $1
       OR city1 ILIKE $1
       OR state ILIKE $1
       LIMIT 100`,
      [`%${q}%`]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
