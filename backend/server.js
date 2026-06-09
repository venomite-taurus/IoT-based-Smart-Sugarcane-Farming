const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config({ override: true });

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize PostgreSQL connection pool
// Note: We use ssl: { rejectUnauthorized: false } for hosted databases like Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Create table if it doesn't exist
const initDB = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS sensor_data (
        id SERIAL PRIMARY KEY,
        temperature NUMERIC,
        humidity NUMERIC,
        soil_moisture NUMERIC,
        node VARCHAR(50),
        rain INTEGER CHECK (rain IN (0, 1)),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(query);
    console.log("Database table 'sensor_data' verified/initialized successfully.");
  } catch (err) {
    console.error("Error initializing database table:", err);
  }
};

// Call initialization on startup
initDB();

// POST endpoint to receive data from ESP32
app.post('/api/data', async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    // Destructure the expected fields from the request body
    const { temperature, humidity, soil_moisture, rain, node } = req.body;
    
    // Log the received data from ESP
    console.log(`Received data from ESP - Node: ${node}, Temp: ${temperature}, Hum: ${humidity}, Soil: ${soil_moisture}, Rain: ${rain}`);
    
    // Optional: Validate that 'rain' is either 0 or 1, if it is provided
    if (rain !== undefined && rain !== 0 && rain !== 1) {
      return res.status(400).json({ error: "The 'rain' parameter must be 0 or 1" });
    }

    // Validate that 'node' is one of the allowed enums
    const validNodes = ['node1', 'node2', 'node3'];
    if (!node || !validNodes.includes(node)) {
      return res.status(400).json({ error: "The 'node' parameter is required and must be one of: 'node1', 'node2', 'node3'" });
    }

    const query = `
      INSERT INTO sensor_data (temperature, humidity, soil_moisture, rain, node)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [temperature, humidity, soil_moisture, rain, node];
    
    const result = await pool.query(query, values);
    
    res.status(201).json({
      success: true,
      message: "Data saved successfully",
      data: result.rows[0]
    });
  } catch (err) {
    console.error("Error saving data:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET endpoint to fetch recent ESP32 sensor data
app.get('/api/data', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const node = req.query.node;
    let query = `SELECT * FROM sensor_data`;
    const values = [];

    if (node) {
      query += ` WHERE node = $1`;
      values.push(node);
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1};`;
    values.push(limit);

    const result = await pool.query(query, values);
    res.status(200).json({
      success: true,
      count: result.rowCount,
      data: result.rows
    });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ success: false, error: err.message, stack: err.stack });
  }
});

// GET endpoint to fetch the latest ESP32 reading, optionally for a given node
app.get('/api/data/latest', async (req, res) => {
  try {
    const node = req.query.node;
    let query = `SELECT * FROM sensor_data`;
    const values = [];

    if (node) {
      query += ` WHERE node = $1`;
      values.push(node);
    }

    query += ` ORDER BY created_at DESC LIMIT 1;`;
    const result = await pool.query(query, values);
    res.status(200).json({
      success: true,
      data: result.rows[0] || null
    });
  } catch (err) {
    console.error("Error fetching latest data:", err);
    res.status(500).json({ success: false, error: err.message, stack: err.stack });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
