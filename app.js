const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const router = require('./routs/index');

// parse application/json
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

require('dotenv').config();

app.use(express.static(__dirname + "/views"));
app.set("viw engine", "ejs");

app.use('/', router);

app.listen(process.env.SERVER_PORT);
