/**
 * WEB322   –   Assignment 01
 * Name:       <Thy Nguyen>
 * Student ID: <105310221>
 * Date:       <Jan 25, 2023>
 *
 * I declare that this assignment is my own work in accordance with
 * Seneca Academic Policy. No part of this assignment has been
 * copied manually or electronically from any other source
 * (including web sites) or distributed to other students.
 *      
 **/

// Import dependencies:
const { v4: uuidv4 } = require("uuid");
const prompt = require("prompt-sync")();

// Car Class definition:
let Car = [
    {
        type:"SUV",
        licensePlate:"ABC 124",
        Availability: false
    },
    {
        type:"Sedan",
        licensePlate:"BXL 009",
        Availability: true
    },
    {
        type:"SUV",
        licensePlate:"KML 155",
        Availability: true
    }
];

// Function to find a vehicle:
const findVehicle = (info) => {
    for (let i = 0; i < Car.length; i++) {
        if (Car[i].type === info.m_carType && Car[i].Availability === true) {
            return i;
        }
    }  
    return -1;
};

// Function to create a reservation:
const createReservation = (info) => {
    let res = findVehicle(info);
    let subTotal = 0;
    if (res === -1) {
        console.log("\nA matching vehicle cannot be found");
        return;
    }
    else{
        console.log("-------------------");
        console.log("RECEIPT");
        console.log("-------------------");
        console.log(`Reservation Number: ${uuidv4()}`);
        console.log(`Car Type: ${Car[res].type}`);
        console.log(`License Plate: ${Car[res].licensePlate}`);

        let carFee = 0;
        if (info.m_carType === 'Sedan'){
            carFee = 10;
        }
        else if (info.m_carType === 'SUV'){
            carFee = 15;
        }
        else{
            carFee = 20;
        }

        let seatFee = 0;
        if (info.m_seat === 'y' && info.m_day > 2){
            seatFee = 2;
        }
        else if (info.m_seat === 'y' && info.m_day <= 2){
            seatFee = 5;
        }
        else if (info.m_seat === 'n'){
            seatFee = 0;
        }
        subTotal = (carFee + seatFee) * info.m_day;
        
    }
    console.log(`Subtotal: ${parseFloat(subTotal).toFixed(2)}`);
    console.log(`Tax: ${parseFloat(subTotal * 0.13).toFixed(2)}`);
    console.log(`Total: ${parseFloat(subTotal * 1.13).toFixed(2)}`);
};

// main program:
const main = () => {
    console.log("-------------------------------");
    console.log("Welcome to David's Car Rentals");
    console.log("-------------------------------");
    const carType = prompt("What type of car do you want to rent? ");
    const day = parseInt(prompt("How many days? (min 1): "));
    const seat = prompt("Do you need a car seat? (y/n): ");
    
    // Create an object to store the input:
    let info = {
        m_carType : carType,
        m_day : day,
        m_seat : seat
    }

    // Call the function to run:
    createReservation(info);
}
main ();

