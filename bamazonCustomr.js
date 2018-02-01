var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection(
	{
		host: "localhost",
		port: 3306,
		user: "root",
		password: "35231749d",
		database: "bamazon"
	}
);
connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");

  displayProducts();

});

function displayProducts() {
  console.log("Selecting all products...\n");
  connection.query("SELECT item_id, product_name, price FROM products", function(err, res) {
    if (err) throw err;
    	console.log(res);
    	startSale();
  });
}

function startSale() {
	inquirer.prompt([
		{
			type: "input",
			message: "What is the item_id of the product you wish to purchase?",
			name: "item_id"
		},
		{
			type: "input",
			message: "How many would you like?",
			name: "quantity"
		}
		]).then(answers => {
			console.log("We are checking our storerooms to make sure we can accomodate your order.");


			var item = answers.item_id;
			var quantity = answers.quantity;

			var queryStr = 'SELECT * FROM products WHERE ?';

			connection.query(queryStr, {item_id: item}, function(err, data) {
				if (err) throw err;

				if (data.length === 0) {
					console.log('ERROR: Invalid Item ID. Please select a valid Item ID.');
					displayInventory();

				} else {
					var productData = data[0];
					if (quantity <= productData.stock_quantity) {

						var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity - quantity) + ' WHERE item_id = ' + item;

						connection.query(updateQueryStr, function(err, data) {
							if (err) throw err;

							console.log('Your order has been placed! Your total is $' + productData.price * quantity);
							connection.end();
						})
					} else {
						console.log('Sorry, we do not have enough of your product to accomodate your order.');

						displayProducts();
					}
				}
			})
		})
}