const express = require('express');
const mysql = require('mysql');

const router = express.Router();

const index = require('../index.html');
const connection = require('../DBConnector');

// Route to fetch database tables and fields
router.get('/tables', (req, res) => {
    const query = `
        SELECT 
            TABLE_NAME, COLUMN_NAME, DATA_TYPE
        FROM 
            INFORMATION_SCHEMA.COLUMNS 
        WHERE 
            TABLE_SCHEMA = '${process.env.DB_NAME || 'your_database_name'}'
    `;

    connection.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Transform results into a structured format
        const tables = {};
        results.forEach(row => {
            const tableName = row.TABLE_NAME;
            if (!tables[tableName]) {
                tables[tableName] = [];
            }
            tables[tableName].push({
                column: row.COLUMN_NAME,
                type: row.DATA_TYPE
            });
        });
        res.json(tables);
    });
});

module.exports = router;