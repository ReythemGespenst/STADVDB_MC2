// routes/testScript.js
const { nodes }= require('../config/database');
const formatDate = require('../utils/formatDate');

const testScript = async () => {
    const results = [];
    try {
        const createQuery = 'INSERT INTO go_daily_sales (`Retailer code`, `Product number`, `Order method code`, `Date`, `Quantity`, `Unit price`, `Unit sale price`) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const deleteQuery = 'DELETE FROM go_daily_sales WHERE `Retailer code` = ? AND `Product number` = ? AND `Order method code` = ? AND `Date` = ? AND `Quantity` = ? AND `Unit price` = ? AND `Unit sale price` = ?';
        const selectQuery = 'SELECT * FROM go_daily_sales WHERE `Retailer code` = ? AND `Product number` = ? AND `Order method code` = ? AND `Date` = ? AND `Quantity` = ? AND `Unit price` = ? AND `Unit sale price` = ?';
        const testData = ['1215', '83110', '2', '2023-10-01', 10, 100, 120];
        const formattedDate = formatDate(testData[3]);

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

        // Execute delete query
        await new Promise((resolve, reject) => {
            nodes.node1.query(deleteQuery, [...testData.slice(0, 3), formattedDate, ...testData.slice(4)], (err, res) => {
                if (err) return reject(err);
                results.push(`Deleted from go_daily_sales: ${JSON.stringify(res)}`);
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

        return results;
    } catch (err) {
        // Rollback transaction in case of error
        await new Promise((resolve, reject) => {
            nodes.node1.rollback(() => {
                results.push('Transaction rolled back');
                resolve();
            });
        });
        results.push(`Error: ${err.message}`);
        return results;
    }
};

module.exports = testScript;