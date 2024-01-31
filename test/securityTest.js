const chai = require("chai");
const chaiHttp = require("chai-http");
const bcrypt = require("bcryptjs");
const expect = chai.expect;

chai.use(chaiHttp);

describe("Login and Access Control Test", () => {
  it('should return 403 status code for unauthorized access to "http://localhost:8080/urls/b2xVn2"', () => {
    const agent = chai.request.agent("http://localhost:8080");

    // Step 1: Login with valid credentials
    return agent
      .post("/login")
      .send({ email: "len@example.com", password: bcrypt.hashSync("fuzz")})
      .then((loginRes) => {
        // Step 2: Make a GET request to a protected resource
        return agent.get("/urls/b6UTxQ").then((accessRes) => {
          // Step 3: Expect the status code to be 403
          expect(accessRes).to.have.status(403);
        });
      });
  });
});


// describe("Accessing Nonexistent URL Test", () => {
//   it('should return a 403 status code and an error message for accessing a nonexistent URL', () => {
//     const agent = chai.request.agent("http://localhost:8080");

//     // Step 1: Login with valid credentials
//     return agent
//       .post("/login")
//       .send({ email: "len@example.com", password: bcrypt.hashSync("fuzz") })
//       .then((loginRes) => {
//         // Step 2: Make a GET request to a nonexistent URL
//         return agent.get("/urls/b6UTyQ").then((accessRes) => {
//           // Step 3: Expect the status code to be 403
//           expect(accessRes).to.have.status(403);
//           // Step 4: Expect the response to contain an error message
//           expect(accessRes.body).to.have.property('error');
//           // Add additional assertions for the error message content if needed
//         });
//       });
//   });
// });


describe("Redirects and Status Codes Test", () => {
  let agent; // Declare agent for maintaining session

  // Set up agent before each test
  beforeEach(() => {
    agent = chai.request.agent("http://localhost:8080");
  });

  // Clean up agent after each test
  afterEach(() => {
    agent.close();
  });

  it('should redirect to "/login" with a 302 status code for a GET request to "/"', () => {
    return agent.get("/").then((res) => {
      // Expect a redirection status code (302)
      expect(res).to.redirect;
      // Expect redirection to "/login"
      expect(res).to.redirectTo("http://localhost:8080/login");
    });
  });

  it('should redirect to "/login" with a 302 status code for a GET request to "/urls/new"', () => {
    return agent.get("/urls/new").then((res) => {
      // Expect a redirection status code (302)
      expect(res).to.redirect;
      // Expect redirection to "/login"
      expect(res).to.redirectTo("http://localhost:8080/login");
    });
  });

  it('should return a 404 status code for a GET request to a nonexistent URL "/urls/NOTEXISTS"', () => {
    return agent.get("/urls/NOTEXISTS").then((res) => {
      // Expect a status code of 404 for a nonexistent URL
      expect(res).to.have.status(404);
    });
  });

  it('should return a 403 status code for a GET request to "/urls/b2xVn2"', () => {
    return agent.get("/urls/b2xVn2").then((res) => {
      // Expect a status code of 403 for the specified URL
      expect(res).to.have.status(403);
    });
  });
});