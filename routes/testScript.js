const { nodes } = require('../config/database');
const formatDate = require('../utils/formatDate');
const async = require('async');

const NUM_CONCURRENT_REQUESTS = 10; // Number of concurrent requests

const createQuery = 'INSERT INTO go_daily_sales (`Retailer code`, `Product number`, `Order method code`, `Date`, `Quantity`, `Unit price`, `Unit sale price`) VALUES (?, ?, ?, ?, ?, ?, ?)';
const selectQuery = 'SELECT * FROM go_daily_sales WHERE `Retailer code` = ? AND `Product number` = ? AND `Order method code` = ? AND `Date` = ? AND `Quantity` = ? AND `Unit price` = ? AND `Unit sale price` = ?';
const deleteQuery = 'DELETE FROM go_daily_sales WHERE `Retailer Code` = ? AND `Product Number` = ? AND `Order Method Code` = ? AND `Date` = ? AND `Quantity` = ? AND `Unit Price` = ? AND `Unit Sale Price` = ?';
const testData = ['1215', '83110', '2', '2023-10-01', 10, 100, 120];
const formattedDate = formatDate(testData[3]);

async function performInsert(callback) {
    const results = [];
    try {
        // Begin transaction
        await new Promise((resolve, reject) => {
            nodes.node1.beginTransaction(err => {
                if (err) return reject(err);
                results.push('Transaction started');
                resolve();
            });
        });

        // Execute create query
        await new Promise((resolve, reject) => {
            nodes.node1.query(createQuery, testData, (err, res) => {
                if (err) return reject(err);
                results.push(`Inserted into go_daily_sales: ${JSON.stringify(res)}`);
                resolve(res);
            });
        });

        // Execute select query to verify insertion
        await new Promise((resolve, reject) => {
            nodes.node1.query(selectQuery, testData, (err, res) => {
                if (err) return reject(err);
                results.push(`Selected from go_daily_sales after insert: ${JSON.stringify(res)}`);
                resolve(res);
            });
        });

        // Commit transaction
        await new Promise((resolve, reject) => {
            nodes.node1.commit(err => {
                if (err) return reject(err);
                results.push('Transaction committed');
                resolve();
            });
        });

        callback(null, results);
    } catch (err) {
        // Rollback transaction in case of error
        await new Promise((resolve, reject) => {
            nodes.node1.rollback(() => {
                results.push('Transaction rolled back');
                reject(err);
            });
        });
        callback(err, results);
    }
}

async function performDelete(callback) {
    const results = [];
    try {
        // Begin transaction
        await new Promise((resolve, reject) => {
            nodes.node1.beginTransaction(err => {
                if (err) return reject(err);
                results.push('Transaction started');
                resolve();
            });
        });

        // Execute delete query
        await new Promise((resolve, reject) => {
            nodes.node1.query(deleteQuery, testData, (err, res) => {
                if (err) return reject(err);
                results.push(`Deleted from go_daily_sales: ${JSON.stringify(res)}`);
                resolve(res);
            });
        });

        // Commit transaction
        await new Promise((resolve, reject) => {
            nodes.node1.commit(err => {
                if (err) return reject(err);
                results.push('Transaction committed');
                resolve();
            });
        });

        callback(null, results);
    } catch (err) {
        // Rollback transaction in case of error
        await new Promise((resolve, reject) => {
            nodes.node1.rollback(() => {
                results.push('Transaction rolled back');
                reject(err);
            });
        });
        callback(err, results);
    }
}

async function runConcurrencyTest() {
    return new Promise((resolve, reject) => {
        async.parallel([
            (cb) => async.times(NUM_CONCURRENT_REQUESTS, (n, next) => performInsert(next), cb),
            (cb) => async.times(NUM_CONCURRENT_REQUESTS, (n, next) => performDelete(next), cb)
        ], (err, results) => {
            if (err) {
                console.error('Error during concurrency test:', err);
                return reject(err);
            }
            console.log('All requests completed successfully');
            resolve(results);
        });
    });
}

module.exports = { runConcurrencyTest };