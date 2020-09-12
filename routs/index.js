const express = require('express');
const router = express.Router();

//rout handlers
const {showMainPage} = require('./showMainPage/showMainPage');
const {sendMail} = require('./sendMail/sendMail');

//routs
router.get('/', showMainPage);
router.post('/sendMail', sendMail);

module.exports = router;
