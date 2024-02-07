const express = require("express");
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const helpers = require('./helpers');

const app = express();
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieSession({
  name: 'session',
  keys: ['abcd'],
}));
app.use(morgan('dev'));

//global objects
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  }
};

const users = {
  aJ48lW: {
    user_id: "aJ48lW",
    email: "mon@example.com",
    password: bcrypt.hashSync("purple"),
  },
  ghijkl: {
    user_id: "ghijkl",
    email: "len@example.com",
    password: bcrypt.hashSync("fuzz"),
  },
};

//get and post reqs
app.get("/", (req, res) => {

  //if user is not logged in redirect to /login
  const user_id = req.session.user_id;
  const foundUser = helpers.getUserById(user_id, users);

  if (!foundUser) {
    res.redirect('/login');
  } else {
    //else send hello!
    res.send("Hello!");
  }

});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const foundUser = helpers.getUserById(user_id, users);

  //check if user exists
  if (!foundUser) {
    return res.status(403).send('You have to login/register first');

  //otherwise send the user info to urls_index & render urls page
  } else {
    const user = users[user_id];
    const userURLs = helpers.urlsForUser(user_id, urlDatabase);

    const templateVars = {
      userURLs,
      user
    };
  
    res.render("urls_index", templateVars);
  }
});

app.post("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const foundUser = helpers.getUserById(user_id, users);

  //check if user is logged in
  if (!foundUser) {
    return res.status(403).send('You have to log in first');

  //add the url to databse
  } else {
    const id = helpers.generateRandomString();
    const givenLongURL = req.body.longURL;
    urlDatabase[id] = {
      longURL: givenLongURL,
      userID: user_id,
    };
    //redirect to the added url
    res.redirect(`/urls/${id}`);
  }
});

app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  const foundUser = helpers.getUserById(user_id, users);

  //check if user is logged in
  if (!foundUser) {
    res.redirect('/login');
  } else {
    //else render register
    const templateVars = { user: foundUser, };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;
  const foundUser = helpers.getUserById(user_id, users);

  //check if user is logged in
  if (!foundUser) {
    return res.status(403).send('You have to login/register first');
  } else {
    const userURLs = helpers.urlsForUser(user_id, urlDatabase);
    const id = req.params.id;

    //check if user owns the url
    if (!userURLs[id]) {
      res.status(403).send('You do not own this URL');
    }

    //edit the url
    const longURL = userURLs.longURL;
    const user = users[user_id];
    const templateVars = {
      id,
      longURL,
      user,
    };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const foundId = helpers.findUrlIdById(id, urlDatabase);

  //check if url exists
  if (!foundId) {
    return res.status(400).send('id does not exist');
  } else {
    const longURL = urlDatabase[id].longURL;
    res.redirect(longURL);
  }
});

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  const foundId = helpers.findUrlIdById(id, urlDatabase);
  const user_id = req.session.user_id;
  const foundUser = helpers.getUserById(user_id, users);
  const userURLs = helpers.urlsForUser(user_id, urlDatabase);

  //check if url exists
  if (!foundId) {
    return res.status(400).send('id does not exist');
    //check if user is logged in
  } else if (!userURLs[id]) {
    return res.status(401).send('You do not own this URL');
  } else {

    if (!foundUser) {
      return res.status(403).send('You have to login/register first');
    }

    //const longURL = urlDatabase[id];
    console.log('req.session object',req.session);
    delete urlDatabase[id];
    console.log('urlDatabse',urlDatabase);
    console.log('req.session object',req.session);
    //delete longURL;
    res.redirect("/urls");
  }
});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const foundId = helpers.findUrlIdById(id, urlDatabase);
  const user_id = req.session.user_id;
  const foundUser = helpers.getUserById(user_id, users);
  const userURLs = helpers.urlsForUser(user_id, urlDatabase);
  

  //check if url exists
  if (!foundId) {
    return res.status(400).send('id does not exist');
    //Check if the URL belongs to this user
  } else if (!userURLs[id]) {
    return res.status(401).send('You do not own this URL');
    //check if user is logged in
  } else {
   
    if (!foundUser) {
      return res.status(403).send('You have to login/register first');
    }
    
    const longURL = req.body.longURL;
    urlDatabase[id].longURL = longURL;
    res.redirect("/urls");
  }
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post('/login', (req, res) => {
  //extract values from the form
  const email = req.body.email;
  const password = req.body.password;

  //match the values to user in users object
  const foundUser = helpers.getUserByEmail(email, users);
  

  //was the user not in the database
  if (!foundUser) {
    return res.status(403).send('user not found');

  //if email was found match the passwords
  } else {
    const result = bcrypt.compareSync(password, foundUser.password);
    //if (foundUser.password !== password) {
    if (!result) {
      return res.status(403).send('password does not match');
    }
  }
  req.session.user_id = foundUser.user_id;
 
  res.redirect('/urls');
});

app.get('/login', (req, res) => {

  //if user is logged in redirect to /urls
  const user_id = req.session.user_id;
  const foundUser = helpers.getUserById(user_id, users);

  if (foundUser) {
    res.redirect('/urls');
  } else {
    //else send user info and render login
    const templateVars = { user: foundUser, };
    res.render('login', templateVars);
  }

});

app.post('/logout', (req, res) => {

  req.session = null; //clear all cookies


  res.redirect('/login');
});

app.get('/register', (req, res) => {
  const user_id = req.session.user_id;
  const foundUser = helpers.getUserById(user_id, users);

  if (foundUser) {
    res.redirect('/urls');
  } else {
    //else send user info and render register
    const templateVars = { user: foundUser, };
    res.render('register', templateVars);
  }
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  

  //if email and password are empty
  if (!email || !password) {
    return res.status(400).send('Provide email and password');
  }

  //check if user is already in the database
  const foundUser = helpers.getUserByEmail(email, users);

  //was the user already in the database
  if (foundUser) {
    return res.status(400).send('email already exists');
  }

  //passed all checks, create new user
  const user_id = helpers.generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  const user = {
    user_id,
    email,
    password: hashedPassword,
  };

  users[user_id] = user;

  //set cookie
  req.session.user_id = user_id;
 
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});