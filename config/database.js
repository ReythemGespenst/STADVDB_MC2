
const mysql = require('mysql');

const nodes = {
    node1: mysql.createConnection({
        host: 'stadvdb-mco2.cjmom4ya889l.ap-southeast-2.rds.amazonaws.com',
        port: 3306,
        user: 'admin',
        password: 'ilovegaming',
        database: 'ho1'
    }),
    node2: mysql.createConnection({
        host: 'node2.cjmom4ya889l.ap-southeast-2.rds.amazonaws.com',
        port: 3306,
        user: 'admin',
        password: 'ilovegaming',
        database: 'ho1'
    }),
    node3: mysql.createConnection({
        host: 'node3.cjmom4ya889l.ap-southeast-2.rds.amazonaws.com',
        port: 3306,
        user: 'admin',
        password: 'ilovegaming',
        database: 'ho1'
    })
};

function getReadReplica() {
    const replicas = [nodes.node2, nodes.node3];
    return replicas[Math.floor(Math.random() * replicas.length)];
}

module.exports = { nodes, getReadReplica };