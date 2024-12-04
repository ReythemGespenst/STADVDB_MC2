const bodyParser = require('body-parser');
const express = require('express');
const {Sequelize} = require('sequelize');

const app = express();
const index = require('./index.html')
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const routes = require('./routes/routes.js');

app.get('/', (req,res) => {
    res.render(index);
});

app.use('/api', routes);

app.use('/routes', routes);


app.listen(3000, ()=>{
    console.log('server is listening on port ' + 3000);
})