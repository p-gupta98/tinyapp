const express = require("express");
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8080; // default port 8080

//global objects
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

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

function findUrlIdById(id) {
  let foundId = null;
  for (const key in urlDatabase) {
    if(key === id) {
      foundId = key;
    }
  }
  return foundId;
};

function urlsForUser(givenUser_id) {
  const userURLs = {};
  for (const urlID in urlDatabase) {
    const userID = urlDatabase[urlID].userID;
    // console.log(`Checking ${urlID}:`, urlDatabase[urlID]); // Log each URL being checked
    if (userID === givenUser_id) {
      // console.log(`Adding ${urlID} to userURLs`); // Log when a URL is matched and added
      userURLs[urlID] = {longURL: urlDatabase[urlID].longURL, userID: userID, urlID: urlID,
      };
    }
  }
  return userURLs;
};


app.set("view engine", "ejs");

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['abcd'],
}));
app.use(morgan('dev'));



//get and post reqs
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
 
  const foundUser = getUserById(user_id);

  if(!foundUser) {
    return res.status(403).send('You have to login/register first');
  } else {
    // const id = Object.keys(urlDatabase);

    const user = users[user_id];
    // console.log('Current URL Database:', urlDatabase);
    const userURLs = urlsForUser(user_id);
    // console.log('User URLs:', userURLs);

    const templateVars = { 
      userURLs: userURLs, 
      user: user, 
    };

    // console.log(userURLs);
  
    res.render("urls_index", templateVars);
  }
});

app.post("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const foundUser = getUserById(user_id);

  if(!foundUser) {
    return res.status(403).send('You have to log in first');
  } else {
  const id = generateRandomString();
  const givenLongURL = req.body.longURL;
  urlDatabase[id] = {
    longURL: givenLongURL,
    userID: user_id,
  };
  //console.log(urlDatabase); // Log the POST request body to the console
  res.redirect(`/urls/${id}`);
  }
});

app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  const foundUser = getUserById(user_id);

  if(!foundUser) {
    res.redirect('/login');
  } else {
    //else render register
    const templateVars = { user: foundUser, };
    res.render("urls_new", templateVars);
  }
  //const user = users[user_id];
});

app.get("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;
  const foundUser = getUserById(user_id);

  if(!foundUser) {
    return res.status(403).send('You have to login/register first');
  } else {
    const userURLs = urlsForUser(user_id);
    const id = req.params.id;
    if (!userURLs[id]) {
      res.status(403).send('You do not own this URL');
    };
    const longURL = userURLs.longURL;
    const user = users[user_id];
    // const longURL = urlDatabase[id].longURL;
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
  const foundId = findUrlIdById(id);

  if(!foundId) {
    return res.status(400).send('id does not exist');
  } else {
    const longURL = urlDatabase[id].longURL;
    res.redirect(longURL);
  }
});

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id
  const foundId = findUrlIdById(id);
  const user_id = req.session.user_id;
  const foundUser = getUserById(user_id);
  const userURLs = urlsForUser(user_id);

  //check if url exists
  if(!foundId) {
    return res.status(400).send('id does not exist');
    //check if user is logged in
  } else if (!userURLs[id]) {
    return res.status(401).send('You do not own this URL');
  } else {

    if(!foundUser) {
      return res.status(403).send('You have to login/register first');
    }

    //const longURL = urlDatabase[id];
    delete urlDatabase[id];
    //delete longURL;
    res.redirect("/urls");
  }
});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id
  const foundId = findUrlIdById(id);
  const user_id = req.session.user_id;
  const foundUser = getUserById(user_id);
  const userURLs = urlsForUser(user_id);
  

  //check if url exists
  if(!foundId) {
    return res.status(400).send('id does not exist');
    //Check if the URL belongs to this user
  } else if (!userURLs[id]) {
    return res.status(401).send('You do not own this URL');
    //check if user is logged in
  } else {
   
    if(!foundUser) {
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
  const foundUser = getUserById(user_id);

  if(foundUser) {
    res.redirect('/urls');
  } else {
    //else render login
  res.render('login');
  }

});

app.post('/logout', (req, res) => {

  req.session = null; //clear all cookies


  res.redirect('/login');
});

app.get('/register', (req, res) => {
  const user_id = req.session.user_id;
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
  const hashedPassword = bcrypt.hashSync(password, 10);

  const user = {
    user_id: user_id, 
    email: email,
    password: hashedPassword,
  };

  //add to database
  //console.log('users', users);
  users[user_id] = user;
  //console.log('user', user);
  // console.log(users);

  //set cookie
  req.session.user_id = user_id;
 

  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});