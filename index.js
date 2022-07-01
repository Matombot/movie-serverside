const PgPromise = require("pg-promise")
const express = require('express');
const assert = require('assert');
const bcrypt = require('bcrypt');
// const saltRounds = 10;
// const myPlaintextPassword = 's0/\/\P4$$w0rD';
// const someOtherPlaintextPassword = 'not_bacon';
const fs = require('fs');
const cors = require('cors');
require('dotenv').config()

const API = require('./api');
const { default: axios } = require('axios');
const app = express();
const jwt = require('jsonwebtoken');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const DATABASE_URL= process.env.DATABASE_URL || "postgres://chifhiwa:ts123@localhost:5432/movie_app";
const config = {
    connectionString : DATABASE_URL
}
if (process.env.NODE_ENV == 'production') {
   config.ssl = {
       rejectUnauthorized : false
   }
}
 
const pgp = PgPromise({});
const db = pgp(config);

API(app, db);

const PORT = process.env.PORT || 4000;
app.listen(PORT, function () {
    console.log(`App started on port ${PORT}`)
});