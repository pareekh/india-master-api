const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "IFSC API Running",
  });
});

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

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
