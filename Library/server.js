const express = require("express");
const exphbs = require("express-handlebars");
const app = express();
const path = require("path");
const HTTP_PORT = process.env.PORT || 3030;

app.use(express.urlencoded({ extended: true }))
app.use(express.static("assets"))

app.set("view engine", ".hbs")
app.use(express.urlencoded({extended: true}));
app.use(express.static("assets"));
app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    helpers: {
        json: (context) => { return JSON.stringify(context) }
    }
}));
const session = require('express-session')
app.use(session({
   secret: "the quick brown fox jumped over the lazy dog 1234567890",  // random string, used for configuring the session
   resave: false,
   saveUninitialized: true
}))


// ----------------
const onHttpStart = () => {
    console.log(`Express web server running on port: ${HTTP_PORT}`)
    console.log(`Press CTRL+C to exit`)
  }
  app.listen(HTTP_PORT, onHttpStart)


// --------------
//    DATABASE 
// --------------

const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://ThyNguyen:Tiggy2986@cluster0.uiqqv03.mongodb.net/Library?retryWrites=true&w=majority");
const Schema = mongoose.Schema

// Book Schema
const bookSchema = new Schema({
    image: String,
    title: String,
    author: String,   
    desc: String,
    borrower: String,
    
});
const Book = mongoose.model("books_collection", bookSchema);

// User Schema
const userSchema = new Schema({
    borrower: String
});
const User = mongoose.model("users_collection", userSchema);



// ----------------
//    END POINTS
// ----------------

app.get("/", async (req, res) => {
    const userFromUI = req.session.user;

    try {
        if (userFromUI === undefined) {
            req.session.loggedUser = false;
        }

        const bookList = await Book.find().lean();
        return res.render("home", {layout:"layout", log: req.session.loggedUser,  books: bookList})        
    }
    catch (err) {
        console.log(err)
    }
});

app.get("/login", async (req, res) => {
    return res.render("login", { layout: "layout", log: req.session.loggedUser });
});

app.get("/logout", async (req, res) => {
    try{
        if (req.session.loggedUser === false) {
            req.session.error = "You are not logged in";
            return res.render("error", {layout:"layout", log: req.session.loggedUser, error: req.session.error})
        }
        req.session.destroy();
        return res.redirect("/");
    }
    catch(err) {
        console.log(err)
    }  
});

app.post("/logging", async (req, res) => {
    const userFromUI = req.body.cardNumber;
    try {
        const userFromDB = await User.findOne({borrower: userFromUI}).lean();
        if (userFromDB === null) {
            req.session.loggedUser = false;
            req.session.error = "Invalid Card Number";
            return res.render("error", {layout:"layout", log: req.session.loggedUser, error: req.session.error})
        }

        const bookList = await Book.find().lean();
        req.session.loggedUser = true;
        req.session.user = userFromUI;   
        return res.render("home", {layout:"layout", log: req.session.loggedUser,  books: bookList, user: req.session.user});
    }
    catch (err) {
        console.log(err)
    }

});

app.post("/borrow/:title", async (req, res) => {
    const userFromUI = req.session.user;
    const bookTitle = req.params.title;
   
    try {
        const userFromDB = await User.findOne({borrower: userFromUI}).lean();
        if (userFromDB === null) {
            req.session.loggedUser = false;
            req.session.error = "Please login to borrow books";
            return res.render("error", {layout:"layout", log: req.session.loggedUser, error: req.session.error})
        }
       const book = await Book.findOneAndUpdate({title: bookTitle}, {$set: {borrower: userFromUI}}).lean();
       const bookList = await Book.find().lean();
       return res.render("home", {layout:"layout", log: req.session.loggedUser,  books: bookList, user: req.session.user});
    }
    catch(err) {
        console.log(err)
    }   
});

app.get("/profile", async (req, res) => {
    const userFromUI = req.session.user;
    try{       
        if (req.session.user === undefined) {
            req.session.loggedUser = false;
            const errorMessage = "Please login to view your profile";
            return res.render("error", {layout:"layout", log: req.session.loggedUser, error: errorMessage})
        }
        const bookList = await Book.find({borrower: userFromUI}).lean();
      
        if (bookList.length === 0) {
            return res.render ("profile", {layout:"layout", log: req.session.loggedUser, books: bookList})
        }    
        return res.render("profile", {layout:"layout", log: req.session.loggedUser, books: bookList});       
    }
    catch(err) {
        console.log(err)
    }
});

app.post("/return/:title", async (req, res) => {    
    try{
        const bookTitle = req.params.title;
        const book = await Book.findOneAndUpdate({title: bookTitle}, {$set: {borrower: ""}}).lean();
        const bookList = await Book.find({borrower: req.session.user}).lean();
    
        return res.render("profile", {layout:"layout", log: req.session.loggedUser, books: bookList});  
    } 
    catch(err) {
        console.log(err)
    } 
});

