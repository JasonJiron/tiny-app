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

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase)
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
   }
  res.render("urls_index", templateVars)
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new")
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { 
    shortURL: req.params.id,
    urls: urlDatabase,
    username: req.cookies["username"]
   } 
  res.render("urls_show", templateVars)
});

app.post("/urls", (req, res) => {
  let templateVars = { username: req.cookies["username"] }
  let longURL = req.body.longURL
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL
  res.redirect(`/urls/${shortURL}`)
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  console.log('LONGURL: ', longURL);
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  let templateVars = { username: req.cookies["username"] }
  let shortURL = req.params.id
  delete urlDatabase[shortURL]
  res.redirect('/urls')
});

app.post("/urls/:id", (req, res) => {
  let urlToEdit = req.params.id
  urlDatabase[urlToEdit] = req.body.urlEdit
  res.redirect('/urls')
});

app.post("/login", (req, res) => {
  username = req.body.username
  res.cookie('username', username)
  res.redirect('/urls')
});

app.post("/logout", (req, res) => {
  username = req.body.username
  res.clearCookie('username')
  res.redirect('/urls')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


