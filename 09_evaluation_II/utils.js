import { getCompletionFromMessages } from '../helper.js';
import fs from 'fs';

let productFile = fs.readFileSync('./product_file.json', 'utf8');
let products = JSON.parse(productFile);

export const DELIMITER = '####';

// Get the products of interest based on a user query
export async function getProductsFromQuery(userMessage) {
	let productCategory = getProductsAndCategories();
	let systemMessage = getSystemMessage1(productCategory);

	let messages = [
		{role: 'system', content: systemMessage},
		{role: 'user', content: DELIMITER + userMessage + DELIMITER}
	];

	return await getCompletionFromMessages(messages);
}

// Based on the content of the product file build a list of the
// product categores with the products for each category
function getProductsAndCategories() {
 	let result = {};

	for (const name in products) {
		let product = products[name];
		let category = product.category;

		if (category) {
	  		if (!(category in result)) {
	    		result[category] = [];
	  		}

	  	result[category].push(product['name']);
		}
	}

	return result;
}

// Load this particular system message and ensure it has the products and categories information
function getSystemMessage1(productCategory) {
	let systemMessage = getSystemMessage('./system_message_1.txt');
	systemMessage = systemMessage.replace('<products_and_category>', JSON.stringify(productCategory));
	return systemMessage;
}

// Load this particular system message and ensure it has the products and categories information
function getSystemMessage2() {
	return getSystemMessage('./system_message_2.txt');
}

// Load this particular system message and ensure it has the products and categories information
function getSystemMessage3() {
	return getSystemMessage('./system_message_3.txt');
}

// Load this particular system message and ensure it has the products and categories information
function getSystemMessage4() {
	return getSystemMessage('./system_message_4.txt');
}

// Load a system message and replace any delimiters
function getSystemMessage(fileName) {
	let systemMessage = fs.readFileSync(fileName, 'utf8');
	systemMessage = systemMessage.replaceAll('<delimiter>', DELIMITER);

	return systemMessage;
}

// Go thru the first prompt output and build an array of products of interest
export function getProducts(responseJson) {
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

// Look up in the product JSON by name
function getByName(name) {
	return products[name] || null;
}

// Look up an array in the product JSON based on category
function getByCategory(category) {
	return Object.values(products).filter(product => product.category === category);
}

// Gets a response based on a filtered set of products for the custmer query
export async function answerUserQuery(userMessage, products) {
	let systemMessage = getSystemMessage2();

	let messages = [
		{role: 'system', content: systemMessage},
		{role: 'user', content: userMessage},
		{role: 'assistant', content: 'Relevant product information:\n' + products}
	];

	return await getCompletionFromMessages(messages);
}


export async function evaluateWithRubric(input, context, answer) {
	let systemMessage = getSystemMessage3();
	let userMessage = fs.readFileSync('./user_message_1.txt', 'utf8');

	userMessage = userMessage.replace('<input>', input);
	userMessage = userMessage.replace('<context>', context);
	userMessage = userMessage.replace('<answer>', answer);

	console.log(userMessage);

	let messages = [
		{role: 'system', content: systemMessage},
		{role: 'user', content: userMessage}
	];

	return await getCompletionFromMessages(messages);
}


export async function evaluateWithIdeal(input, ideal, actual) {
	let systemMessage = getSystemMessage4();
	let userMessage = fs.readFileSync('./user_message_2.txt', 'utf8');

	userMessage = userMessage.replace('<input>', input);
	userMessage = userMessage.replace('<ideal>', ideal);
	userMessage = userMessage.replace('<actual>', actual);

	//console.log(userMessage);

	let messages = [
		{role: 'system', content: systemMessage},
		{role: 'user', content: userMessage}
	];

	return await getCompletionFromMessages(messages);
}
