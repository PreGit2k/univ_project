const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'counselling'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Database');
});


app.get('/allocate-subjects-for-all', (req, res) => {
    const getAllStudents = 'SELECT id, firstPref, secondPref, thirdPref FROM students ORDER BY rank ASC';

    db.query(getAllStudents, (err, students) => {
        if (err) throw err;

        // Loop through each student
        students.forEach((student) => {
            allocateSubjectsForStudent(student);
        });

        res.json({ message: 'Allocation process completed for all students' });
    });
});

function allocateSubjectsForStudent(student) {
    const studentId = student.id;
    const firstPref = student.firstPref;
    const secondPref = student.secondPref;
    const thirdPref = student.thirdPref;

    // Allocate subjects based on marks
    checkAvl(firstPref, () => {
        allocateSubject(firstPref, studentId);
    }, () => {
        checkAvl(secondPref, () => {
            allocateSubject(secondPref, studentId);
        }, () => {
            checkAvl(thirdPref, () => {
                allocateSubject(thirdPref, studentId);
            }, () => {
                console.log(`No available subjects for student with ID ${studentId}`);
            });
        });
    });
}





function checkAvl(subjectType, successCallback, errorCallback) {
    const getSubjectId = 'SELECT id, available_seats FROM subjects WHERE name = ?';
    db.query(getSubjectId, [subjectType], (err, results) => {
        if (err) throw err;

        const availableSeats = results[0].available_seats;

        if (availableSeats > 0) {
            console.log("Subject available");
            successCallback();
        } else {
            console.log('No available seats for:', subjectType);
            errorCallback();
        }
    });
}

// Function to allocate subject based on available seats
function allocateSubject(subjectType, studentId) {
    const getSubjectId = 'SELECT id, available_seats FROM subjects WHERE name = ?';
    db.query(getSubjectId, [subjectType], (err, results) => {
        if (err) throw err;

        const subjectId = results[0].id;
        const availableSeats = results[0].available_seats;

        if (availableSeats > 0) {
            // Decrement available seats
            const updateSeats = 'UPDATE subjects SET available_seats = ? WHERE id = ?';
            db.query(updateSeats, [availableSeats - 1, subjectId], (err) => {
                if (err) throw err;

                // Save allocation in the database
                const saveAllocation = 'INSERT INTO allocations (student_id, subject_id) VALUES (?, ?)';
                db.query(saveAllocation, [studentId, subjectId], (err) => {
                    if (err) throw err;
                    console.log('Subject allocated:', subjectType);
                    // res.end({ message: 'Subject allocated successfully'+subjectType });
                });
            });
        } else {
            console.log('No available seats for:', subjectType);
            res.json({ message: 'No available seats for ' + subjectType });
        }
    });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
