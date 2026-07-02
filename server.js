const express = require("express");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { Pool } = require("pg");
const app = express();

app.use(cors());

app.use(express.json());

app.use(compression());

app.use(helmet());

app.use(morgan("dev"));
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: {
        success:false,
        message:"Too many requests"
    }
});

app.use(limiter);
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:{
        rejectUnauthorized:false
    }
});
app.get("/",(req,res)=>{

res.json({

project:"India Master API",

version:"1.0.0",

status:"online"

});

});
