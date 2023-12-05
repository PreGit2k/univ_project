const mysql = require('mysql');


// Configure MySQL database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'counselling'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

module.exports = db;