const bodyParser = require('body-parser');
const express = require('express');
const {Sequelize} = require('sequelize');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const routes = require('./routes/routes.js');

app.use('/routes', routes);

app.get('/', (req,res) => {
    res.send("Check");
});

app.listen(3000, ()=>{
    console.log('server is listening on port ' + 3000);
})