const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'counselling'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);
});

app.get('/update-ranks', (req, res) => {
  // Fetch data from database and sort by marks
  connection.query('SELECT id, marks, name FROM students ORDER BY marks DESC', (err, results) => {
    if (err) {
      console.error('Error fetching data: ' + err.stack);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Update 'update' column with corresponding ranks
    let rank = 1;
    for (const result of results) {
      connection.query('UPDATE students SET rank = ? WHERE id = ?', [rank, result.id], (updateErr) => {
        if (updateErr) {
          console.error('Error updating rank: ' + updateErr.stack);
          res.status(500).send('Internal Server Error');
          return;
        }
      });
      rank++;
    }

    res.send('Ranks updated successfully!');
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
