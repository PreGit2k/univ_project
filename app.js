const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const db = require('./dbConnect');


app.set('view engine', 'ejs');
app.set('views', __dirname + '/views'); 


const port = 3000;


//session
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Parse incoming data as JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Login page rout
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/studentLogin.html');
});

//Student registration page routing
app.get('/studentRegistration',(req,res)=>{
    res.render('studentRegistration')
})

//dashbord after Student login routing 
app.get('/dashboard', (req, res) => {
    if (req.session.loggedin) {
        res.render('studentHome', { username: req.session.username }); 
    } else {
        res.redirect('/stude');
    }
});


//Regisrtation page data saved routing
app.post('/regSave', (req, res) => {
    const data = req.body;

    const sql = 'INSERT INTO student_registration (first_name, last_name, email, mobile_number, application_id, registration_id, date_of_birth, gender, department, course) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [
        data.myFname,
        data.myLname,
        data.myEmail,
        data.myMobileNumber,
        data.myApplicationId,
        data.myRegistrationId,
        data.myDateOfBirth,
        data.Gender,
        data.Department,
        data.Course,
    ];

    db.query(sql, values, (error, results) => {
        if (error) {
            console.error('Database query error: ' + error.message);
            res.status(500).send('Error saving data to the database');
        } else {
            console.log('Data saved to the database');
            res.sendFile(__dirname + '/studentLogin.html');
        }
    });
})

//Login
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (error, results, fields) => {
            if (results.length > 0) {
                req.session.loggedin = true;
                req.session.username = username;
                res.redirect('/dashboard');
            } else {
                res.send('Incorrect username and/or password.');
            }
            res.end();
        });
    } else {
        res.send('Please enter username and password.');
        res.end();
    }
});

//Server run
app.listen(port, () => {
    console.log('Server is running on port ');
});
