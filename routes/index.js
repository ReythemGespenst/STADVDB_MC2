const express = require('express');
const router = express.Router();
const { nodes, getReadReplica } = require('../config/database');
const { runConcurrencyTest } = require('./testScript');
const formatDate  = require('../utils/formatDate');

// Function to get a random slave node for load balancing
function getRandomSlaveNode() {
    const slaveNodes = [nodes.node2, nodes.node3];
    return slaveNodes[Math.floor(Math.random() * slaveNodes.length)];
}

// Routes for different nodes
router.get('/node1', (req, res) => {
    nodes.node1.query('SELECT * FROM go_daily_sales LIMIT 1000;', (err, results) => {
        if (err) throw err;
        res.render('centralnode', { data: results, ip: nodes.node1.config.host, port: nodes.node1.config.port });
    });
});

router.get('/node2', (req, res) => {
    nodes.node2.query('SELECT * FROM go_daily_sales AS t1 JOIN go_retailers AS t2 WHERE t1.`Retailer code` = t2.`Retailer code` LIMIT 1000;', (err, results) => {
        if (err) throw err;
        res.render('node', { data: results, ip: nodes.node2.config.host, port: nodes.node2.config.port, no: 2 });
    });
});

router.get('/node3', (req, res) => {
    nodes.node3.query('SELECT * FROM go_daily_sales AS t1 JOIN go_retailers AS t2 WHERE t1.`Retailer code` = t2.`Retailer code` LIMIT 1000;', (err, results) => {
        if (err) throw err;
        res.render('node', { data: results, ip: nodes.node3.config.host, port: nodes.node3.config.port, no: 3 });
    });
});

// Create with CONCURRENCY
router.post('/create', (req, res) => {
    const { retailer_code, product_number, order_method_code, date, quantity, unit_price, unit_sale_price } = req.body;
    const query = 'INSERT INTO go_daily_sales (`Retailer code`, `Product number`, `Order method code`, `Date`, `Quantity`, `Unit price`, `Unit sale price`) VALUES (?, ?, ?, ?, ?, ?, ?)';
    nodes.node1.beginTransaction(err => {
        if (err) throw err;
        nodes.node1.query(query, [retailer_code, product_number, order_method_code, date, quantity, unit_price, unit_sale_price], (err, results) => {
            if (err) {
                return nodes.node1.rollback(() => {
                    throw err;
                });
            }
            nodes.node1.commit(err => {
                if (err) {
                    return nodes.node1.rollback(() => {
                        throw err;
                    });
                }
                res.redirect('/node1');
            });
        });
    });
});

// Read
router.get('/read', (req, res) => {
    const { retailer_code } = req.query;
    const query = 'SELECT * FROM go_daily_sales WHERE `Retailer code` = ?';
    nodes.node1.query(query, [retailer_code], (err, results) => {
        if (err) throw err;
        res.render('centralnode', { data: results, ip: nodes.node1.config.host, port: nodes.node1.config.port });
    });
});

router.get('/read2', (req, res) => {
    const { retailer_code } = req.query;
    const query = `
        SELECT * 
        FROM go_daily_sales AS t1 
        JOIN go_retailers AS t2 
        ON t1.\`Retailer code\` = t2.\`Retailer code\` 
        WHERE t1.\`Retailer code\` = ?
    `;
    nodes.node2.query(query, [retailer_code], (err, results) => {
        if (err) throw err;
        res.render('node', { data: results, ip: nodes.node2.config.host, port: nodes.node2.config.port, no: 2 });
    });
});

router.get('/read3', (req, res) => {
    const { retailer_code } = req.query;
    const query = `
        SELECT * 
        FROM go_daily_sales AS t1 
        JOIN go_retailers AS t2 
        ON t1.\`Retailer code\` = t2.\`Retailer code\` 
        WHERE t1.\`Retailer code\` = ?
    `;
    nodes.node3.query(query, [retailer_code], (err, results) => {
        if (err) throw err;
        res.render('node', { data: results, ip: nodes.node3.config.host, port: nodes.node3.config.port, no: 3});
    });
});

// Update
router.post('/update', (req, res) => {
    const { retailer_code, product_number, order_method_code, date, quantity, unit_price, unit_sale_price } = req.body;
    const query = 'UPDATE go_daily_sales SET `Order method code` = ?, `Date` = ?, `Quantity` = ?, `Unit price` = ?, `Unit sale price` = ? WHERE `Retailer code` = ? AND `Product number` = ?';
    nodes.node1.query(query, [order_method_code, date, quantity, unit_price, unit_sale_price, retailer_code, product_number], (err, results) => {
        if (err) throw err;
        res.redirect('/node1');
    });
});

// DELETE with CONCURRENCY
router.post('/delete', (req, res) => {
    const { retailer_code, product_number, order_method_code, date, quantity, unit_price, unit_sale_price } = req.body;
    const formattedDate = formatDate(date);
    const query = 'DELETE FROM go_daily_sales WHERE `Retailer Code` = ? AND `Product Number` = ? AND `Order Method Code` = ? AND `Date` = ? AND `Quantity` = ? AND `Unit Price` = ? AND `Unit Sale Price` = ?';
    nodes.node1.beginTransaction(err => {
        if (err) throw err;
        nodes.node1.query(query, [retailer_code, product_number, order_method_code, formattedDate, quantity, unit_price, unit_sale_price], (err, results) => {
            if (err) {
                return nodes.node1.rollback(() => {
                    throw err;
                });
            }
            nodes.node1.commit(err => {
                if (err) {
                    return nodes.node1.rollback(() => {
                        throw err;
                    });
                }
                res.redirect('/node1');
            });
        });
    });
});

router.get('/tests', (req, res) => {
    res.render('tests', { result: null });
});

// Route to handle the test script execution
router.post('/run-test', async (req, res) => {
    const result = await runConcurrencyTest();
    res.render('tests', { result: result.join('\n') });
});

module.exports = router;