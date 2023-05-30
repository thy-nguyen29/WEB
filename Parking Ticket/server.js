/**
 * WEB322   –   Assignment 02
 * Name:       <Thy Nguyen>
 * Student ID: <105310221>
 * Date:       <Feb 06, 2023>
 *
 * I declare that this assignment is my own work in accordance with
 * Seneca Academic Policy. No part of this assignment has been
 * copied manually or electronically from any other source
 * (including web sites) or distributed to other students.
 *      
 **/

//======= Server setup =======//

const express = require("express");
const app = express();
const path = require("path");
const HTTP_PORT = process.env.PORT || 8080;
const onHttpStart = () => {
    console.log(`Express http server listening on: ${HTTP_PORT}`);
}
app.use(express.urlencoded({extended: true})); //note: this is for posting the HTML script in JS to the Html page
app.use(express.static("asset"));
app.listen(HTTP_PORT, onHttpStart);

//======= Endpoints (to get input)=======//

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/parking.html"));
});

app.get("/parking", (req, res) => {
    res.sendFile(path.join(__dirname, "/parking.html"));
});

app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "admin.html"));
});

//======= Global Object =======//
const parkingLot =[];

//======= Endpoints (to post input)=======//
app.post("/receipt", (req, res) => {
    const lot = req.body.parkedLot;
    const hours = req.body.parkedHour;
    const licensePlate = req.body.parkedLicense; 
    let rate;
    let subTotal;
    let tax;
    let total;
    const charge = () => {
        subTotal = rate * hours;
        tax = subTotal * 0.13;
        total = subTotal + tax;
    }

    if (hours > 8) {
        //======= Show ReceiptFail page =======//
        return res.send(
         `<style> 
         body{background-color: rgb(30, 30, 30); font-family: Arial, Helvetica, sans-serif;}
         h1{color: rgb(199, 186, 37);text-align: center;  font-size: 25px;} 
         .navbar {
            display: flex;
            justify-content: center;
            overflow: hidden;
            background-color: rgb(30, 30, 30);
            font-family: 'Arial', sans-serif;
            }
        .home {
            color: rgb(199, 186, 37);
            text-align: center;
            padding: 14px;
            font-size: 100%;
            }
         </style> 
         
         <nav class="navbar">
            <a class="home" href="/parking">Back</a>
        </nav>

         <h1> You can't park more than 8 hours! </h1>`
         
        );
    }
    else {
        if (lot === "Parking Lot A ($1.00 per hour)") {
            rate = 1.00;
            charge();
        }
        else if (lot === "Parking Lot B ($2.00 per hour)") {
            rate = 2.00;
            charge();
        }
        else if (lot === "Underground Parking Lot C ($3.00 per hour)") {
            rate = 3.00;
            charge();
        }
        //NOTE: This is the object that will be pushed to the parkingLot array
        // need to be created AFTER all attribute are calculated 
        const parking = {
            lot: lot,
            hours: hours,
            license: licensePlate,  
            total: total      
        }
       
        parkingLot.push(parking);

        //======= Show RECEIPT page =======//
        return res.send(`<style> 
        body{background-color: rgb(30, 30, 30); font-family: Arial, Helvetica, sans-serif;}
        h1{color: rgb(199, 186, 37);text-align: center;  font-size: 50px;}
        hr{background-color: rgb(218, 202, 35); height: 2px;width: 30%;} 
        p{color: rgb(199, 186, 37); text-align: center;}
        .navbar {
            display: flex;
            justify-content: center;
            overflow: hidden;
            background-color: rgb(30, 30, 30);
            font-family: 'Arial', sans-serif;
            }
        .home {
            color: rgb(199, 186, 37);
            text-align: center;
            padding: 14px;
            font-size: 100%;
            }
        </style>
    
        <nav class="navbar">
            <a class="home" href="/parking">Back</a>
        </nav>
        <h1>Receipt</h1> 
        <hr> 
        <p>Hours Parked: ${hours}</p>
        <p>Hourly Rate: $${ parseFloat(rate).toFixed(2)} per hour</p>
        <p>Sub total: $${parseFloat(subTotal).toFixed(2)}</p>
        <p>Tax: $${parseFloat(tax).toFixed(2)}</p>
        <p><b>Total: $${ parseFloat(total).toFixed(2)}</b></p>`
        );
    }  
});

app.post("/adminInfo", (req, res) => {
    const username = req.body.username;
    const password = req.body.password; 

    if(username === "admin" && password === "0000")
    {
        let sumAmount = 0;
        for(let i = 0; i < parkingLot.length; i++) {
            sumAmount += parkingLot[i].total;
        }

        //======= Show AdminInfo page =======//
        return res.send(
            `<style> 
            body{background-color: rgb(30, 30, 30); font-family: Arial, Helvetica, sans-serif;}
            h1{color: rgb(199, 186, 37);text-align: center;  font-size: 50px;}
            hr{background-color: rgb(218, 202, 35); height: 2px;width: 30%;} 
            p{color: rgb(199, 186, 37); text-align: center;}
            .navbar {
                display: flex;
                justify-content: center;
                overflow: hidden;
                background-color: rgb(30, 30, 30);
                font-family: 'Arial', sans-serif;
            }
            .home {
                color: rgb(199, 186, 37);
                padding: 14px;
                font-size: 100%;
                margin-right: 10%;
              }
              
              .admin {
                color: rgb(199, 186, 37);
                padding: 14px 16px;
                font-size: 100%;
              } 
            </style>
        
            <nav class="navbar">
            <a class="home" href="/parking">Home</a>
            <a class="admin" href="/admin">Admin</a>
            </nav>
            <h1>Summary Data</h1> 
            <hr>
            <p>Total Car: ${parkingLot.length} </p>
            <p>Total Money Collected: ${parseFloat(sumAmount).toFixed(2)}</p>`        
            );
    }
    else
    {
        //======= Show LoginFail page =======//
        return res.send(
           `<style> 
            body{background-color: rgb(30, 30, 30); font-family: Arial, Helvetica, sans-serif;}
            h1{color: rgb(199, 186, 37);text-align: center;  font-size: 50px;} 
            .navbar {
                display: flex;
                justify-content: center;
                overflow: hidden;
                background-color: rgb(30, 30, 30);
                font-family: 'Arial', sans-serif;
                }
                .admin {
                color: rgb(199, 186, 37);
                padding: 14px 16px;
                font-size: 100%;
                text-align: center;
                } 
            </style> 
            
            <nav class="navbar">
            <a class="admin" href="/admin">Back</a>
            </nav>
            <h1> Login Failed!</h1>`
        );
    }
});



