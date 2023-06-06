import { getCompletionFromMessages } from '../helper.js';
import fs from 'fs';

let delimiter = '####';

let productFile = fs.readFileSync('./product_file.txt', 'utf8');
let products = JSON.parse(productFile);

try {
	console.log('Perform first prompt.');
	// Here we identlfy products and categories for a customer
	let systemMessage1 = fs.readFileSync('./system_message_1.txt', 'utf8');

	systemMessage1 = systemMessage1.replace('<delimiter>', delimiter);

	let userMessage1 = 'Tell me about the smartx pro phone and the ' +
		'Fotosnap camera, the DSLR one. Also tell me about your TVs';


	let userMessage2 = 'My router isn\'t working.';

	// Change the use message to try different responses
	let messages1 = [
		{ role: 'system', content: systemMessage1 },
		{ role: 'user', content: delimiter + userMessage1 + delimiter}
	];

	// Let's get the first response and use it to look up data
	// found in the products JSON
	let response = await getCompletionFromMessages(messages1);


	/*
	// Let's check the helper functions work
	console.log(getByName('TechPro Ultrabook'));
	console.log(getByCategory('Computers and Laptops'));
	*/

	console.log('Perform second prompt.\n');
	// Here we use the first response to gather product data
	let productCategoryList = generateOutput(JSON.parse(response));

	// Now let's build another message array with the previous user message
	// and the data we found based on that message to generate the final response
	let systemMessage2 = fs.readFileSync('./system_message_2.txt', 'utf8');

	let messages2 = [
		{ role: 'system', content: systemMessage2 },
		{ role: 'user', content: userMessage1},
		{ role: 'assistant', content: 'Relevent product information:\n' + productCategoryList}
	];

	let finalResponse = await getCompletionFromMessages(messages2);

	console.log(finalResponse);

} catch (err) {
	console.error(err);
}

// Look up in the product JSON by name
function getByName(name) {
    return products[name] || null;
}

// Look up an array in the product JSON based on category
function getByCategory(category) {
    return Object.values(products).filter(product => product.category === category);
}

// Go thru the first prompt output and build an array of products of interest
function generateOutput(responseJson) {
	let result = [];

	if (responseJson) {
		responseJson.forEach(item => {

			if(item.hasOwnProperty('products') || item.hasOwnProperty('category')) {

				if (item.hasOwnProperty('products')) {
					let productNames = item.products;

					productNames.forEach(name => {
						let product = getByName(name);

						if (product) {
							result = result.concat(product);
						} else {
							console.log('Error: product ' + name + ' not found.');
						}
					});
				}

				if (item.hasOwnProperty('category')) {
					let productList = getByCategory(item.category);

					result = result.concat(productList);
				}

			} else {
				console.log('Error: invalid object format');
			}
		});
	} else {
		return '';
	}

	return JSON.stringify(result);
}
