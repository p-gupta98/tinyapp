const bcrypt = require("bcryptjs");

//global objects
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };





//helper functions
const generateRandomString = function generateRandomString() {
  const randomString = Math.random().toString(36).substring(2, 8);
  return randomString;
};

const getUserById = function getUserById(id, userDatabase) {
  let foundUser = null;
  for (const key in userDatabase) {
    const user = userDatabase[key];
    if(user.user_id === id) {
      foundUser = user;
    }
  }
  return foundUser;
}

const findUrlIdById = function findUrlIdById(id, urlDatabase) {
  let foundId = null;
  for (const key in urlDatabase) {
    if(key === id) {
      foundId = key;
    }
  }
  return foundId;
};

const urlsForUser = function urlsForUser(givenUser_id, urlDatabase) {
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

const getUserByEmail = function getUserByEmail(email, users) {
  let foundUser = null;
  for (const user_id in users) {
    const user = users[user_id];
    if (user.email === email) {
      foundUser = user;
    }
  }
  return foundUser;
};

module.exports = {generateRandomString, getUserById, findUrlIdById, urlsForUser, getUserByEmail, };