const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const mysql = require('mysql');

const app = express();
const index = path.join(__dirname, 'index.html');
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (_, res) => {
    res.sendFile(index);
});

// MySQL connection configurations for different nodes
const nodes = {
    node1: mysql.createConnection({
        host: 'stadvdb-mco2.cjmom4ya889l.ap-southeast-2.rds.amazonaws.com',
        port: 3306,
        user: 'admin',
        password: 'ilovegaming',
        database: 'ho1'
    }),
    node2: mysql.createConnection({
        host: 'stadvdb-mco2-node2.cjmom4ya889l.ap-southeast-2.rds.amazonaws.com',
        port: 3306,
        user: 'admin',
        password: 'ilovegaming',
        database: 'ho1'
    }),
    node3: mysql.createConnection({
        host: 'stadvdb-mco2-node3.cjmom4ya889l.ap-southeast-2.rds.amazonaws.com',
        port: 3306,
        user: 'admin',
        password: 'ilovegaming',
        database: 'ho1'
    })
};

nodes.node1.connect(err => {
    if (err) throw err;
    console.log('Connected to Node 1');
});

nodes.node2.connect(err => {
    if (err) throw err;
    console.log('Connected to Node 2');
});

nodes.node3.connect(err => {
    if (err) throw err;
    console.log('Connected to Node 3');
});


// Routes for different nodes
app.get('/node1', (req, res) => {
    nodes.node1.query('SELECT * FROM go_daily_sales LIMIT 1000;', (err, results) => {
        if (err) throw err;
        res.render('centralnode', { data: results, ip: nodes.node1.config.host, port: nodes.node1.config.port });
    });
});

app.get('/node2', (req, res) => {
    nodes.node2.query('SELECT * FROM go_daily_sales;', (err, results) => {
        if (err) throw err;
        res.render('node', { data: results, ip: nodes.node2.config.host, port: nodes.node2.config.port, no: 2});
    });
});

app.get('/node3', (req, res) => {
    nodes.node3.query('SELECT * FROM go_daily_sales;', (err, results) => {
        if (err) throw err;
        res.render('node', { data: results, ip: nodes.node3.config.host, port: nodes.node3.config.port });
    });
});

app.post('/create', (req, res) => {
    const { retailer_code, product_number, order_method_code, date, quantity, unit_price, unit_sale_price } = req.body;
    const query = 'INSERT INTO go_daily_sales (`Retailer code`, `Product number`, `Order method code`, `Date`, `Quantity`, `Unit price`, `Unit sale price`) VALUES (?, ?, ?, ?, ?, ?, ?)';
    nodes.node1.query(query, [retailer_code, product_number, order_method_code, date, quantity, unit_price, unit_sale_price], (err, results) => {
        if (err) throw err;
        res.redirect('/node1');
    });
});

// Read
app.get('/read', (req, res) => {
    const { retailer_code } = req.query;
    const query = 'SELECT * FROM go_daily_sales WHERE `Retailer code` = ?';
    nodes.node1.query(query, [retailer_code], (err, results) => {
        if (err) throw err;
        res.render('centralnode', { data: results, ip: nodes.node1.config.host, port: nodes.node1.config.port });
    });
});

// Update
app.post('/update', (req, res) => {
    const { retailer_code, product_number, order_method_code, date, quantity, unit_price, unit_sale_price } = req.body;
    const query = 'UPDATE go_daily_sales SET `Order method code` = ?, `Date` = ?, `Quantity` = ?, `Unit price` = ?, `Unit sale price` = ? WHERE `Retailer code` = ? AND `Product number` = ?';
    nodes.node1.query(query, [order_method_code, date, quantity, unit_price, unit_sale_price, retailer_code, product_number], (err, results) => {
        if (err) throw err;
        res.redirect('/node1');
    });
});

// Delete
// app.post('/delete', (req, res) => {
//     const { retailer_code, product_number, order_method_code, date, quantity, unit_price, unit_sale_price } = req.body;
//     const formattedDate = new Date(date).toISOString().split('T')[0]; // Format the date as YYYY-MM-DD
//     // const query = 'DELETE FROM go_daily_sales WHERE `Retailer Code` = ? AND `Product Number` = ? AND `Order Method Code` = ? AND `Date` = ? AND `Quantity` = ? AND `Unit Price` = ? AND `Unit Sale Price` = ?';
//     const query = 'DELETE FROM go_daily_sales WHERE `Retailer Code` = 1205 AND `Product Number` = 71110 AND `Order Method Code` = 3 AND `Date` =  "2015-01-11" AND `Quantity` = 28 AND `Unit Price` = 96 AND `Unit Sale Price` = 93;'
//     nodes.node1.query(query, [retailer_code, product_number, order_method_code, formattedDate, quantity, unit_price, unit_sale_price], (err, results) => {
//         if (err) throw err;
//         res.redirect('/node1');
//     });
// });

function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

app.post('/delete', (req, res) => {
    const { retailer_code, product_number, order_method_code, date, quantity, unit_price, unit_sale_price } = req.body;
    const formattedDate = formatDate(date); // Format the date as YYYY-MM-DD
    const query = 'DELETE FROM go_daily_sales WHERE `Retailer Code` = ? AND `Product Number` = ? AND `Order Method Code` = ? AND `Date` = ? AND `Quantity` = ? AND `Unit Price` = ? AND `Unit Sale Price` = ?';
    nodes.node1.query(query, [retailer_code, product_number, order_method_code, formattedDate, quantity, unit_price, unit_sale_price], (err, results) => {
        if (err) throw err;
        console.log(req.body);
        res.redirect('/node1');
    });
});


app.listen(3000, () => {
    console.log('server is listening on port ' + 3000);
});