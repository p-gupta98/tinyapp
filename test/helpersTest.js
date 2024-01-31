const { assert } = require('chai');

const { getUserById } = require('../helpers.js');

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
    password: "purple",
  },
  ghijkl: {
    user_id: "ghijkl",
    email: "len@example.com",
    password: "fuzz",
  },
};

// const testUsers = {
//   "userRandomID": {
//     id: "userRandomID", 
//     email: "user@example.com", 
//     password: "purple-monkey-dinosaur"
//   },
//   "user2RandomID": {
//     id: "user2RandomID", 
//     email: "user2@example.com", 
//     password: "dishwasher-funk"
//   }
// };

describe('getUserById', function() {
  it('should return a user with valid Id', function() {
    const foundUser = getUserById("aJ48lW", users);
    const expectedUserID = "aJ48lW";
    // Write your assert statement here
    assert.strictEqual(foundUser.user_id, expectedUserID);
  });

  it('should return undefined if id is not found', function() {
    const foundUser = getUserById("aJ48lH", users);
    const expectedUserID = null;
    // Write your assert statement here
    assert.strictEqual(foundUser, expectedUserID);
  });

});