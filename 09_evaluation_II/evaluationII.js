import * as utils from './utils.js';
import fs from 'fs';

let userMessage1 = 'Tell me about the Smartx Pro phone and the Fotosnap camera, the DSLR one. Also, what TVs or TV related products do you have?';
let userMessage2 = 'Life is like a box of chocolates.';

console.log('Starting evaluation.\n');
// This uses the LLM to assess the result the system gave
let productsByCategory = await utils.getProductsFromQuery(userMessage1);
let products = utils.getProducts(JSON.parse(productsByCategory));
console.log(products + '\n');
let response = await utils.answerUserQuery(userMessage1, products);
console.log(response + '\n');

// NOTE: To save running these queries multiple times the results were saved in these files
//let products = fs.readFileSync('./products.json', 'utf8');
//let response = fs.readFileSync('./response.txt', 'utf8');

let result = await utils.evaluateWithRubric(userMessage, products, response);


// This compares an expert written answer with the actual answer
// The prompt is based on https://github.com/openai/evals/tree/main
/*
let ideal = fs.readFileSync('./ideal.txt', 'utf8');
let response = fs.readFileSync('./response.txt', 'utf8');

let result = await utils.evaluateWithIdeal(userMessage1, ideal, response);
*/
console.log(result);
