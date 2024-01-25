const express = require("express");
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080; // default port 8080

function generateRandomString() {
  const randomString = Math.random().toString(36).substring(2, 8);
  return randomString;
}
generateRandomString();

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
    id: "abcdef",
    email: "mon@example.com",
    password: "purple",
  },
  ghijkl: {
    id: "ghijkl",
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
  const templateVars = { 
    urls: urlDatabase, 
    username: req.cookies['username'] 
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
  const username = req.cookies['username'];
  const templateVars = { username };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const username = req.cookies['username'];

  const templateVars = { id, longURL, username };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
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
  const username = req.body.username;

res.cookie('username', username);
res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');

  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  console.log(req.body);
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  const user = {
    id: id, 
    email: email,
    password: password,
  };

  users[id] = user;

  console.log(users);
  res.redirect('/urls');

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});