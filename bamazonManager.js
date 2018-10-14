var inquirer = require('inquirer');
var mysql = require('mysql');
var Table = require('cli-table');

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: "root",
    password: "root",
    database: "Bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    startMenu();
});

function startMenu() {
    inquirer.prompt([
        {
            name: 'start',
            type: 'rawlist',
            message: 'What would you like to do?',
            choices: ['View products for sale', 'View low inventory',
                'Add to Inventory', 'Add new product']
        }
    ]).then(function (option) {
        if (option.start === 'View products for sale') {
            viewProducts();
        }
        else if (option.start === 'View low inventory') {
            lowInventory();
        }
        else if (option.start === 'Add to Inventory') {
            addInventory();
        }
        else if (option.start === 'Add new product') {
            newProduct();
        }
    });
}

function viewProducts() {

    connection.query("SELECT * FROM Products", function (err, data) {

        if (err) throw err;

        var table = new Table({
            head: ['ID', 'Name', 'Price', 'Quantity']
        })

        for (var i = 0; i < data.length; i++) {
            table.push([data[i].item_id, data[i].product_name, data[i].price, data[i].stock_quantity])
        }

        console.log(table.toString());
        connection.end();

    });
}

function lowInventory() {

    connection.query("SELECT * FROM Products WHERE stock_quantity < 5", function (err, data) {
        if (err) throw err;

        var table = new Table({
            head: ['ID', 'Name', 'Price', 'Quantity']
        })

        for (var i = 0; i < data.length; i++) {
            table.push([data[i].item_id, data[i].product_name, data[i].price, data[i].stock_quantity])
        }

        if (data.length == 0) {
            console.log("All stock Greater then 5.");
        }
        else {
            console.log(table.toString());
        }
        connection.end();
    });
}

function addInventory() {

    connection.query("SELECT * FROM Products", function (err, data) {

        if (err) throw err;

        var table = new Table({
            head: ['ID', 'Name', 'Price', 'Quantity']
        })

        for (var i = 0; i < data.length; i++) {
            table.push([data[i].item_id, data[i].product_name, data[i].price, data[i].stock_quantity])
        }

        console.log(table.toString());

        inquirer.prompt([
            {
                name: 'whichProduct',
                message: 'What is the ID number you wish to add stock too?',
                type: 'submit'
            },
            {
                name: 'howMany',
                message: 'How much additional stock would you like added?',
                type: 'submit'
            }
        ]).then(function (choices) {
            var chosenItem = parseInt(choices.whichProduct) - 1;

                var updatedQuantity = parseInt(choices.howMany) + data[chosenItem].stock_quantity;

                connection.query("UPDATE Products SET stock_quantity = " + updatedQuantity + " WHERE item_id = " + parseInt(choices.whichProduct) + ";", function (err) { });

                console.log("Updated quantity of " + data[chosenItem].product_name + " is " + updatedQuantity);

        });

    });

    connection.end();

}

function newProduct() {
    inquirer.prompt([
        {
            type: 'submit',
            message: 'Product name?',
            name: 'prodName'
        },
        {
            type: 'submit',
            message: 'Products Department?',
            name: 'prodDept'
        },
        {
            type: 'submit',
            message: 'Products price?',
            name: 'prodPrice'
        },
        {
            type: 'submit',
            message: 'Initial stock quantity?',
            name: 'prodQuantity'
        }
    ]).then(function(responses) {
        connection.query("INSERT INTO Products SET ?",
        {
            product_name: responses.prodName,
            department_name: responses.prodDept,
            price: parseFloat(responses.prodPrice),
            stock_quantity: parseInt(responses.prodQuantity)
        },
        function(err) {
            if (err) throw err;
            console.log("Item has been added");
            viewProducts();
        }    
    )
    });
}