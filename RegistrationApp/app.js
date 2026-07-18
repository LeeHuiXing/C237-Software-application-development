const express = require('express');
const mysql = require('mysql2');

//******** TODO: Insert code to import 'express-session' *********//
const session = require('express-session');
const flash = require('connect-flash');
const app = express();

// Database connection
const db = mysql.createConnection({
    host: 'c237-marlina-mysql.mysql.database.azure.com',
    user: 'c237_002',
    password: 'c237002@2026!',
    database: 'c237_002_team0_userdb',
    ssl: {
        rejectUnauthorized: false
    }
});
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

//******** TODO: Insert code for Session Middleware below ********//
app.use(session({
secret: 'secret',
resave: false,
saveUninitialized: true,
// Session expires after 1 week of inactivity
cookie: {maxAge: 1000 * 60 * 60 * 24 * 7}
}));



app.use(flash());

// Setting up EJS
app.set('view engine', 'ejs');

// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
    if (!req.session.user) {
        req.flash('error', 'Please log in to continue.');
        return res.redirect('/login');
    }
    next();
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.session.user.role !== 'admin') {
        req.flash('error', 'Access denied. Admins only.');
        return res.redirect('/dashboard');
    }
    next();
};

// Routes
app.get('/', (req, res) => {
    res.render('index', { user: req.session.user, messages: req.flash('success')});
});

app.get('/register', (req, res) => {
    res.render('register', { messages: req.flash('error'), formData: req.flash('formData')[0] });
});


//******** TODO: Create a middleware function validateRegistration ********//
const validateRegistration = (req, res, next) => {
    const { username, email, password, address, contact } = req.body;

    if (!username || !email || !password || !address || !contact) {
        return res.send('All fields are required.');
    }

    if (password.length < 6) {
        req.flash('error', 'Password should be at least 6 or more characters long');
        req.flash('formData', req.body);
        return res.redirect('/register');
    }

    // If all validations pass, the next function is called,
    // allowing the request to proceed to the next middleware
    // function or route handler.
    next();
};


//******** TODO: Integrate validateRegistration into the register route. ********//
app.post('/register', validateRegistration, (req, res) => {

    const { username, email, password, address, contact } = req.body;

    const sql = 'INSERT INTO users (username, email, password, address, contact, role) VALUES (?, ?, SHA1(?), ?, ?, ?)';

    db.query(sql, [username, email, password, address, contact, 'user'], (err, result) => {
        if (err) {
            throw err;
        }

        console.log(result);
        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/login');
    });

});

//******** TODO: Insert code for login routes to render login page below ********//
app.get('/login', (req, res) => {
res.render('login', { 
//retrieve success and error messages from the flash middleware and 
//pass them to the login view for display.
messages: req.flash('success'), 
errors: req.flash('error') 
});
});



//******** TODO: Insert code for login routes for form submission below ********//
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  // Validate email and password
  if (!email || !password) {
    req.flash('error', 'All fields are required.');
    return res.redirect('/login');
  }
  const sql = 'SELECT * FROM users WHERE email = ? AND password = SHA1(?)';
  db.query(sql, [email, password], (err, results) => {
    if (err) {
      throw err;
    }
    if (results.length > 0) {
      // Successful login
      req.session.user = results[0]; // store user in session
      req.flash('success', 'Login successful!');
      res.redirect('/dashboard');
    } else {
      // Invalid credentials
      req.flash('error', 'Invalid email or password.');
      res.redirect('/login');
    }
  });
});

app.get('/dashboard', isLoggedIn, (req, res) => {
    res.render('dashboard', { user: req.session.user });
});

app.get('/admin', isLoggedIn, isAdmin, (req, res) => {
    res.render('admin', { user: req.session.user });
});

//******** TODO: Insert code for logout route ********//
app.get('/logout', (req, res) => {
req.session.destroy();
res.redirect('/');
});

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
