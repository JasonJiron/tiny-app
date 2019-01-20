const express       = require("express");
const morgan        = require('morgan');
const cookieParser  = require('cookie-parser');
const cookieSession = require('cookie-session')
const bcrypt        = require('bcrypt');
const saltRounds    = 10;

const app           = express();
const bodyParser    = require("body-parser");
const PORT          = 3000;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['tiny-app'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

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
  res.send('<h2>Hello</h2>');
});

app.get("/urls", (req, res) => {
  let user_id = req.session.user_id
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
  let user_id = req.session.user_id
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
  let user_id = req.session.user_id
  let templateVars = { 
    shortURL: req.params.id,
    url: urlDatabase[req.params.id],
    username: users[user_id].email
   } 
  res.render("urls_show", templateVars)
});

app.post("/urls", (req, res) => {
  let user_id = req.session.user_id
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
  let shortURL = req.params.shortURL
  let longURL = urlDatabase[shortURL].longURL
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  let user_id = req.session.user_id
  let shortURL = req.params.id
  if (user_id === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL]
    res.redirect('/urls')
  } 
  res.send('Only the can delete')
});

app.post("/urls/:id", (req, res) => {
  let user_id = req.session.user_id
  let urlToEdit = req.params.id
  let shortURL = req.params.id
  if (user_id === urlDatabase[shortURL].userID) {
    urlDatabase[urlToEdit].longURL = req.body.urlEdit
    res.redirect('/urls')
  }
  res.send('Login, dude')
});

app.post("/logout", (req, res) => {
  req.session.user_id = null
  res.redirect('/login')
})

app.get('/register', (req, res) => {
  res.render("urls_register")
})

app.post('/register', (req, res) => {
  let email = req.body.email
  let password = req.body.password
  let hashedPassword = bcrypt.hashSync(password, saltRounds);
  let id = generateRandomString();
  if (!email || !password) {
    res.status(400)
    res.redirect('/register')
  } 
  for (key in users) {
    let userInfo = users[key]
    if (email === userInfo.email) {
      res.status(400)
      res.redirect('/register')
      return // ends the function if the email is a dupe
    }
  }
  users[id] = {
    id: id, 
    email: email, 
    password: hashedPassword 
  }
  req.session.user_id = id
  res.redirect('/urls')
})

app.get('/login', (req, res) => {
  res.render("urls_login")
})

app.post("/login", (req, res) => {
  let userEmail = req.body.email
  let userPassword = req.body.password
  for (let key in users) {
    let userInfo = users[key]
    if ((userEmail === userInfo.email) && (bcrypt.compareSync(userPassword, userInfo.password))) {
      req.session.user_id = userInfo.id
      res.redirect('/')
      return // ending the if block and runs 'status(403)' logic
    }
  }
  res.status(403)
  res.redirect('/register')
})

app.listen(PORT, () => {
  console.log(`Tiny-app listening on port ${PORT}!`);
});