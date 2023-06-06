import fs from 'fs';

let productFile = fs.readFileSync('./product_file.json', 'utf8');
let products = JSON.parse(productFile);

export const DELIMITER = '####';

export function getTests() {
	let testFile = fs.readFileSync('./tests.json', 'utf8');
	return JSON.parse(testFile);
}

export function getSystemMessage1(productCategory) {
	let systemMessage = getSystemMessage('./system_message_1.txt');
	systemMessage = systemMessage.replace('<products_and_category>', JSON.stringify(productCategory));
	return systemMessage;
}

export function getSystemMessage2(productCategory) {
	let systemMessage = getSystemMessage('./system_message_2.txt');
	systemMessage = systemMessage.replace('<products_and_category>', JSON.stringify(productCategory));
	return systemMessage;
}

// Load a system message and replace any delimiters
function getSystemMessage(fileName) {
	let systemMessage = fs.readFileSync(fileName, 'utf8');
	systemMessage = systemMessage.replaceAll('<delimiter>', DELIMITER);

	return systemMessage;
}

export function getProductsAndCategories() {
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
