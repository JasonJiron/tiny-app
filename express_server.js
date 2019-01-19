const express = require("express");
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();
const bodyParser = require("body-parser");
const PORT = 3000; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieParser());

// Unique ID 
let generateRandomString = () => {
  let uid = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++)
    uid += possible.charAt(Math.floor(Math.random() * possible.length));
    return uid;
}

const urlDatabase = {
  "b2xVn2": {
    shortURL: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    userID: '1a2b3c'
  },
  "9sm5xK": {
    shortURL:"9sm5xK",
    longURL:"http://www.google.com",
    userID: '4d5e6f'
  } 
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase)
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/urls", (req, res) => {
  let user_id = req.cookies['user_id']
  let usersURLs = {}
  for (let key in urlDatabase) {
    let user = urlDatabase[key].userID
    if (user_id === user) {
      usersURLs[urlDatabase[key].shortURL] = urlDatabase[key].longURL
    }
  }
  let templateVars = { 
    urls: usersURLs,
    username: user_id ? users[user_id].email : null
   }
  res.render("urls_index", templateVars)
});

app.get("/urls/new", (req, res) => {
  let user_id = req.cookies['user_id']
  if (!user_id) {
    res.redirect('/login')
  }
  let templateVars = {
    urls: urlDatabase,
    username: users[user_id].email
  }
  res.render("urls_new", templateVars)
});

app.get("/urls/:id", (req, res) => {
  let user_id = req.cookies['user_id']
  let templateVars = { 
    shortURL: req.params.id,
    url: urlDatabase[req.params.id],
    username: users[user_id].email
   } 
  res.render("urls_show", templateVars)
});

app.post("/urls", (req, res) => {
  let user_id = req.cookies['user_id']
  let templateVars = { username: users[user_id].email }
  let longURL = req.body.longURL
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    shortURL,    
    longURL,
    userID: user_id
  }
  res.redirect(`/urls/${shortURL}`)
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  let user_id = req.cookies['user_id']
  let templateVars = { username: users[user_id].email }
  let shortURL = req.params.id
  // if the user_id === the userID in the Obj


  delete urlDatabase[shortURL]
  res.redirect('/urls')
});

app.post("/urls/:id", (req, res) => {
  let urlToEdit = req.params.id
  urlDatabase[urlToEdit].longURL = req.body.urlEdit
  res.redirect('/urls')

});

app.post("/logout", (req, res) => {
  let username = req.body.username
  res.clearCookie('user_id')
  res.redirect('/login')
})

app.get('/register', (req, res) => {
  res.render("urls_register")
})

app.post('/register', (req, res) => {
  let email = req.body.email
  let password = req.body.password
  let id = generateRandomString();
  if (!email || !password) {
    res.status(400)
    res.redirect('/register')
  } 
  for (key in users) {
    let userInfo = users[key]
    if (email === userInfo.email) {
      console.log('USER OBJ: ', users);
      res.status(400)
      res.redirect('/register')
      return // ends the function if the email is a dupe
    } 
  }
  users[id] = { 
    id: id, 
    email: email, 
    password: password 
  }
  res.cookie('user_id', id)
  res.redirect('/urls')
  console.log(users);
})

app.get('/login', (req, res) => {
  res.render("urls_login")
})

app.post("/login", (req, res) => {
  let userEmail = req.body.email
  let userPassword = req.body.password
  for (let key in users) {
    let userInfo = users[key]
    if ((userEmail === userInfo.email) && (userPassword === userInfo.password)) {
      console.log('USER OBJ2: ', users);      
      res.cookie('user_id', userInfo.id)   
      res.redirect('/')
      return // ending the if block and runs 'status(403)' logic
    }
  }
  res.status(403)
  res.redirect('/register')
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


