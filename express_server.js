const express = require("express");
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080; // default port 8080

//helper functions
function generateRandomString() {
  const randomString = Math.random().toString(36).substring(2, 8);
  return randomString;
};

function getUserByEmail(email) {
  let foundUser = null;
  for (const user_id in users) {
    const user = users[user_id];
    if (user.email === email) {
      foundUser = user;
    }
  }
  return foundUser;
};

function getUserById(id) {
  let foundUser = null;
  for (const key in users) {
    const user = users[key];
    if(user.user_id === id) {
      foundUser = user;
    }
  }
  return foundUser;
}

app.set("view engine", "ejs");

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

//global objects
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  abcdef: {
    user_id: "abcdef",
    email: "mon@example.com",
    password: "purple",
  },
  ghijkl: {
    user_id: "ghijkl",
    email: "len@example.com",
    password: "fuzz",
  },
};

//get and post reqs
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  console.log('req.cookies', req.cookies);
  const user_id = req.cookies['user_id'];
  console.log('user_id', user_id);
  console.log('users', users);
  const user = users[user_id];
  console.log('user object', user);
  const templateVars = { 
    urls: urlDatabase, 
    user: user, 
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  //console.log(urlDatabase); // Log the POST request body to the console
  //res.send("redirected to /urls/:id"); // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${id}`);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.cookies['user_id'];
  const user = users[user_id];
  const templateVars = { user: user, };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const user_id = req.cookies['user_id']
  const user = users[user_id];

  const templateVars = { id, longURL, user, };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res, callback) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id
  const longURL = urlDatabase[id];
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post('/login', (req, res) => {
  //extract values from the form
  const email = req.body.email
  const password = req.body.password;

  //match the values to user in users object
  let foundUser = null;

  for (const user_id in users) {
    const user = users[user_id];
    if (user.email === email) {
      foundUser = user;
    }
  }

  //was the user not in the database
  if(!foundUser) {
    return res.status(403).send('user not found');
  //if email was found match the passwords
  } else {
    if (foundUser.password !== password) {
      return res.status(403).send('password does not match');
    }
  }

  res.cookie('user_id', foundUser.user_id);
  res.redirect('/urls');
});

app.get('/login', (req, res) => {

  //if user is logged in redirect to /urls
  const user_id = req.cookies.user_id;
  const foundUser = getUserById(user_id);

  if(foundUser) {
    res.redirect('/urls');
  } else {
    //else render login
  res.render('login');
  }

});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');

  res.redirect('/login');
});

app.get('/register', (req, res) => {
  const user_id = req.cookies.user_id;
  const foundUser = getUserById(user_id);

  if(foundUser) {
    res.redirect('/urls');
  } else {
    //else render register
  res.render('register');
  }
});

app.post('/register', (req, res) => {
  const user_id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

   //if email and password are empty
   if (!email || !password) {
    return res.status(400).send('Provide email and password') 
   }

   //check if user is already in the database
   let foundUser = null;
   
   for (const user_id in users) {
    const user = users[user_id];
    if (user.email === email) {
      foundUser = user;
    }
   }

   //was the user already in the database
   if (foundUser) {
    return res.status(400).send('email already exists')
   }

  //passed all checks, create new user
  const user = {
    user_id: user_id, 
    email: email,
    password: password,
  };

  //add to database
  //console.log('users', users);
  users[user_id] = user;
  // console.log('user', user);
  // console.log(users);

  //set cookie
  res.cookie('user_id', user_id);

  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});