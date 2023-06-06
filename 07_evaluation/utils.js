import { getCompletion } from '../helper.js';
import fs from 'fs';

let productFile = fs.readFileSync('./product_file.json', 'utf8');
let products = JSON.parse(productFile);

export const DELIMITER = '####';

export function getS2SystemMessage() {
	return getSystemMessage('./system_message_s2.txt');
}

export function getS4SystemMessage() {
	return getSystemMessage('./system_message_s4.txt');
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

// Load a system message and replace any delimiters
function getSystemMessage(fileName) {
	let systemMessage = fs.readFileSync(fileName, 'utf8');
	systemMessage = systemMessage.replaceAll('<delimiter>', DELIMITER);

	return {role: 'system', content: systemMessage};
}

// Look up in the product JSON by name
function getByName(name) {
	return products[name] || null;
}

// Look up an array in the product JSON based on category
function getByCategory(category) {
	return Object.values(products).filter(product => product.category === category);
}
