const express = require('express');
const mysql = require('mysql');

const router = express.Router();

const index = require('../index.html');

router.get('/', (req,res) => {
    res.render(index);
});

module.export = router;