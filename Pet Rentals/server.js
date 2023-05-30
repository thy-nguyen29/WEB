
//======= Server setup =======//

const express = require("express");
const exphbs = require("express-handlebars");
const app = express();
const path = require("path");

app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    helpers: {
        json: (context) => { return JSON.stringify(context) }
    }
}));
app.set("view engine", ".hbs");
const HTTP_PORT = process.env.PORT || 8080;
const onHttpStart = () => {
    console.log(`Express http server listening on: ${HTTP_PORT}`);
}
app.use(express.urlencoded({extended: true})); //note: this is for posting the HTML script in JS to the Html page
app.use(express.static("asset"));
app.listen(HTTP_PORT, onHttpStart);



//======= Global objects=======//
const itemList = [
    {id:"HAM1", name:"Jack", minRentDay: 3, available: false, image: "https://www.linkpicture.com/q/ham1.jpg"},
    {id:"HAM2", name:"Matthew", minRentDay: 2, available: true, image:"https://www.linkpicture.com/q/ham2.jpg"},
    {id:"HAM3", name:"Mary", minRentDay: 5, available: true, image:"https://www.linkpicture.com/q/ham3.jpg"},
    {id:"HAM4", name:"Betty", minRentDay: 2, available: true, image:"https://www.linkpicture.com/q/ham4.jpg"},
    {id:"HAM5", name:"Ben", minRentDay: 4, available: true, image:"https://www.linkpicture.com/q/ham5.jpg"},
    {id:"HAM6", name:"Margaret", minRentDay: 3, available: true, image:"https://www.linkpicture.com/q/ham6.jpg"},
]



//======= Endpoints =======//
app.get("/", (req, res) => {
    const items = [];
    for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * itemList.length);
        items.push(itemList[randomIndex]);
    }    
    res.render("home", {layout:"primary", items})
});

app.get ("/rentalcatalogue", (req, res) => {
    res.render("rentalcatalogue", {
        layout:"primary", 
        listOfItems:itemList, 
        })
});

app.get("/error", (req, res) => {
    let errorMessage = req.query.message;
    res.render("error", { layout: "primary", errorMessage: errorMessage });
});



//---POST---

app.post("/search", (req, res) => {
    const keyword = req.body.searchInfo;
    const message = "They are not in our family yet :(";
    let found = [];
    for (let i = 0; i < itemList.length; i++) {
        if (itemList[i].name === keyword) {
            found.push(itemList[i]);
            res.render("rentalcatalogue", {layout:"primary", listOfItems:found})
            return;
        }
    }
    return res.render("error", {layout:"primary", errorMessage:message})
});

app.post ("/update", (req, res) => {
    const selected = req.body.option;
    const message = ["No one is available","You haven't chosen anyone"]
    let result = [];
    let check = false;
    
    if (selected === "0") {
        return res.render ("rentalcatalogue", {layout:"primary", listOfItems:itemList})
    }

    else if (selected === "1") {
        while (check === false) {
            for (let i = 0; i < itemList.length; i++) {
                if (itemList[i].available === true) {
                    result.push(itemList[i]);  
                }         
            }
            if (result.length > 0) {
                check = true;
            }
            else {
                return res.render("error", {layout:"primary", errorMessage:message[0]})
            }
        }
       
        return res.render ("rentalcatalogue", {layout:"primary", listOfItems:result})
    }
    else if (selected === "2") {
        while (check === false) {
            for (let i = 0; i < itemList.length; i++) {
                if (itemList[i].available === false) {
                    result.push(itemList[i]);  
                }
            }
            if (result.length > 0) {
                check = true;
            }
            else {
                return res.render("error", {layout:"primary", errorMessage:message[1]})
            }
        }
        
        return res.render ("rentalcatalogue", {layout:"primary", listOfItems:result})
    }
});

app.post("/rent/:id", (req, res) => {
    const itemId = req.params.id;
    const rentedItemDay = parseInt(req.body.day);
    const message = "They need to stay longer with you";
    let pos = 0;
   
    for (let i = 0; i < itemList.length; i++) {
        if (itemList[i].id === itemId) {
            pos = i;                    
        }
    }
    if (rentedItemDay < itemList[pos].minRentDay) {
        return res.render("error", {layout:"primary", errorMessage:message})
    }
    else{
        itemList[pos].available = false;
        return res.redirect("/rentalcatalogue");
    }
})

app.post("/return", (req, res) => {
    const message = "You haven't chosen anyone yet";
    let found = 0;
    for (let i = 0; i < itemList.length; i++) {
        if (itemList[i].available === false) {
            itemList[i].available = true;
            found++;      
        }      
    }
    if (found === 0) {
        return res.render("error", {layout:"primary", errorMessage:message})
    }
    return res.render ("rentalcatalogue", {layout:"primary", listOfItems:itemList});
})

