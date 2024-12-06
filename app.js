const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const app = express();
const index = path.join(__dirname, 'index.html');
const { nodes } = require('./config/database');
const routes = require('./routes');

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (_, res) => {
    res.sendFile(index);
});

// Initialize database connections
Object.keys(nodes).forEach(node => {
    nodes[node].connect(err => {
        if (err) throw err;
        console.log(`Connected to ${node}`);
    });
});

// Use routes
app.use('/', routes);

app.listen(3000, () => {
    console.log('server is listening on port ' + 3000);
});