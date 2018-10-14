var inquirer = require('inquirer');
var mysql = require('mysql');

var connection = mysql.createConnection({

    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "Bamazon"

});

connection.connect(function (err) {
    if (err) throw err;
    start();
});

function start() {
    connection.query("SELECT item_id, product_name, price FROM Products", function (err, results) {
        if (err) throw err;
        for (var i = 0; i < results.length; i++) {
            console.log("Item ID: " + results[i].item_id);
            console.log("Product Name: " + results[i].product_name);
            console.log("Price: " + results[i].price + "\n");
        }
        purchase();
    });
}

function purchase() {
    inquirer.prompt([
        {
            name: "purchase",
            message: "What is the ID of the item you'd like to purchase?",
            type: "input"
        },
        {
            name: "quantity",
            message: "How many of that product would you like to buy?",
            type: "input"
        }
    ])
        .then(function(choices) {

            var chosenItem = parseInt(choices.purchase) - 1;

            connection.query("SELECT * FROM Products", function (err, items) {

                if (items[chosenItem].stock_quantity >= choices.quantity) {
                    var updatedQuantity = items[chosenItem].stock_quantity - choices.quantity;

                    console.log(updatedQuantity);

                    connection.query("UPDATE Products SET stock_quantity = " + parseInt(updatedQuantity) + " WHERE item_id = " + parseInt(choices.purchase) + ";", function (err) { });

                    var totalPrice = items[chosenItem].price * choices.quantity;

                    console.log("\nTotal price of today's sale: $" + totalPrice);
                    console.log("Updated quantity of " + items[chosenItem].product_name + " is " + updatedQuantity);
                }
                else {
                    console.log("Unfortately we don't have enough stock of that item.");
                }

            });

            connection.end();

        });

}
