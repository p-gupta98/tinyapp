//helper functions
const generateRandomString = function generateRandomString() {
  const randomString = Math.random().toString(36).substring(2, 8);
  return randomString;
};

const getUserById = function getUserById(id) {
  let foundUser = null;
  for (const key in users) {
    const user = users[key];
    if(user.user_id === id) {
      foundUser = user;
    }
  }
  return foundUser;
}

const findUrlIdById = function findUrlIdById(id) {
  let foundId = null;
  for (const key in urlDatabase) {
    if(key === id) {
      foundId = key;
    }
  }
  return foundId;
};

const urlsForUser = function urlsForUser(givenUser_id) {
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

const getUserByEmail = function getUserByEmail(email) {
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