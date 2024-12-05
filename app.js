const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const mysql = require('mysql');

const app = express();
const index = path.join(__dirname, 'index.html');
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (_, res) => {
    res.sendFile(index);
});

const nodes = {
    node1: mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '1234',
        database: 'ho1'
    }),
    node2: mysql.createConnection({
        host: '192.168.1.2',
        port: 8081,
        user: 'root',
        password: '1234',
        database: 'your-database'
    }),
    node3: mysql.createConnection({
        host: '192.168.1.3',
        port: 8082,
        user: 'root',
        password: '1234',
        database: 'your-database'
    })
};

// Routes for different nodes
app.get('/node1', (req, res) => {
    nodes.node1.connect(err => {
        if (err) throw err;
        console.log('Connected to Node 1');
        nodes.node1.query('SELECT * FROM go_daily_sales;', (err, results) => {
        if (err) throw err;
        res.render('node1', { data: results, ip: nodes.node2.config.host, port: nodes.node2.config.port });
    });
    });
});

app.get('/node2', (req, res) => {
    nodes.node2.connect(err => {
        if (err) throw err;
        console.log('Connected to Node 2');
        res.send('Connected to Node 2');
    });
});

app.get('/node3', (req, res) => {
    nodes.node3.connect(err => {
        if (err) throw err;
        console.log('Connected to Node 3');
        res.send('Connected to Node 3');
    });
});

app.listen(3000, () => {
    console.log('server is listening on port ' + 3000);
});