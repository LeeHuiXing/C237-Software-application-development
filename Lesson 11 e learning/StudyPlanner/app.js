// Import the Express.js framework
const express = require('express');

// Import body-parser
const bodyParser = require('body-parser');

// Create an instance of the Express application
const app = express();

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public folder
app.use(express.static('public'));

// Specify the port
const port = 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');

// In-memory data for study sessions
let sessions = [
    { id: 1, subject: 'Mathematics', topic: 'Algebra', duration: '1 hour', status: 'Completed', comment: 'Finished chapter 1 exercises' },
    { id: 2, subject: 'English', topic: 'Essay Writing', duration: '2 hours', status: 'Pending', comment: 'Need to practice more essay structures' },
    { id: 3, subject: 'Science', topic: 'Chemical Bonding', duration: '1.5 hours', status: 'Completed', comment: 'Revised ionic and covalent bonds' },
    { id: 4, subject: 'History', topic: 'World War 2', duration: '1 hour', status: 'Pending', comment: 'Still need to memorise key dates' },
    { id: 5, subject: 'Mathematics', topic: 'Trigonometry', duration: '2 hours', status: 'Pending', comment: 'Need more practice on sine and cosine' },
    { id: 6, subject: 'English', topic: 'Comprehension', duration: '1 hour', status: 'Completed', comment: 'Completed past year paper' }
];

// Route to retrieve and display all study sessions
app.get('/', function (req, res) {
    const search = req.query.search ? req.query.search : '';
    const filteredSessions = search
        ? sessions.filter(session =>
            session.subject.toLowerCase().includes(search.toLowerCase()) ||
            session.topic.toLowerCase().includes(search.toLowerCase()) ||
            session.status.toLowerCase().includes(search.toLowerCase()) ||
            session.comment.toLowerCase().includes(search.toLowerCase())
        )
        : sessions;

    res.render('index', { sessions: filteredSessions, search });
});

// Route to get a specific session by ID
app.get('/sessions/:id', function (req, res) {
    const sessionId = parseInt(req.params.id);
    const session = sessions.find(function (session) {
        return session.id === sessionId;
    });

    if (session) {
        res.render('sessionInfo', { session });
    } else {
        res.redirect('/');
    }
});

// Add a new session form
app.get('/sessions', function (req, res) {
    res.render('addSession');
});

// Add a new study session
app.post('/sessions', function (req, res) {
    const subject = req.body.subject;
    const topic = req.body.topic;
    const duration = req.body.duration;
    const status = req.body.status;
    const comment = req.body.comment;
    const id = sessions.length + 1;
    const newSession = { id, subject, topic, duration, status, comment };
    sessions.push(newSession);
    res.redirect('/');
});

// Edit a session form
app.get('/sessions/:id/edit', function (req, res) {
    const sessionId = parseInt(req.params.id);
    const editSession = sessions.find(function (session) {
        return session.id === sessionId;
    });
    res.render('editSession', { editSession });
});

// Update a study session
app.post('/sessions/:id/edit', function (req, res) {
    const sessionId = parseInt(req.params.id);
    const subject = req.body.subject;
    const topic = req.body.topic;
    const duration = req.body.duration;
    const status = req.body.status;
    const comment = req.body.comment;

    for (let i = 0; i < sessions.length; i++) {
        if (sessions[i].id === sessionId) {
            sessions[i].subject = subject;
            sessions[i].topic = topic;
            sessions[i].duration = duration;
            sessions[i].status = status;
            sessions[i].comment = comment;
        }
    }
    res.redirect('/');
});

// Delete a session
app.get('/sessions/:id/delete', function (req, res) {
    const sessionId = parseInt(req.params.id);
    sessions = sessions.filter(function (session) {
        return session.id !== sessionId;
    });
    res.redirect('/');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
