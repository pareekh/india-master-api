const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
connectionString: process.env.DATABASE_URL,
ssl: {
rejectUnauthorized: false,
},
});

// Home
app.get("/", (req, res) => {
res.json({
status: "success",
message: "Indian Banking API Running",
});
});

// API Documentation
app.get("/api/docs", (req, res) => {
res.json({
endpoints: [
"/api/ifsc/:ifsc",
"/api/bank/:bank",
"/api/branch/:branch",
"/api/city/:city",
"/api/state/:state",
"/api/search?q=keyword",
],
});
});

// IFSC Search
app.get("/api/ifsc/:ifsc", async (req, res) => {
try {
const result = await pool.query(
"SELECT * FROM ifsc_database WHERE ifsc = $1 LIMIT 1",
[req.params.ifsc.toUpperCase()]
);

```
res.json(result.rows[0] || {});
```

} catch (error) {
res.status(500).json({ error: error.message });
}
});

// Bank Search
app.get("/api/bank/:bank", async (req, res) => {
try {
const result = await pool.query(
"SELECT * FROM ifsc_database WHERE bank ILIKE $1 LIMIT 100",
[`%${req.params.bank}%`]
);

```
res.json(result.rows);
```

} catch (error) {
res.status(500).json({ error: error.message });
}
});

// Branch Search
app.get("/api/branch/:branch", async (req, res) => {
try {
const result = await pool.query(
"SELECT * FROM ifsc_database WHERE branch ILIKE $1 LIMIT 100",
[`%${req.params.branch}%`]
);

```
res.json(result.rows);
```

} catch (error) {
res.status(500).json({ error: error.message });
}
});

// City Search
app.get("/api/city/:city", async (req, res) => {
try {
const result = await pool.query(
"SELECT * FROM ifsc_database WHERE city1 ILIKE $1 LIMIT 100",
[`%${req.params.city}%`]
);

```
res.json(result.rows);
```

} catch (error) {
res.status(500).json({ error: error.message });
}
});

// State Search
app.get("/api/state/:state", async (req, res) => {
try {
const result = await pool.query(
"SELECT * FROM ifsc_database WHERE state ILIKE $1 LIMIT 100",
[`%${req.params.state}%`]
);

```
res.json(result.rows);
```

} catch (error) {
res.status(500).json({ error: error.message });
}
});

// Universal Search
app.get("/api/search", async (req, res) => {
try {
const q = req.query.q;

```
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
```

} catch (error) {
res.status(500).json({ error: error.message });
}
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});
