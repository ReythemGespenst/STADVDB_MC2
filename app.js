import express from 'express';
import {Sequelize} from 'sequelize';

const app = express();

app.get('/', (req,res) => {
    res.send("Check");
});

app.listen(3000, ()=>{
    console.log('server is listening on port ' + 3000);
})