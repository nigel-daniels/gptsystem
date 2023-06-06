import { getCompletionFromMessages, moderate } from '../helper.js';
import * as utils from './utils.js';

let productCategory = utils.getProductsAndCategories();
let tests = utils.getTests();

// Test case 1

let userMessage1 = 'Which TV can I buy if I\'m on a budget?';
console.log('Test 1');
let result1 = await findCategoryAndProductV1(userMessage1, productCategory);
console.log(result1);


// Test case 2
/*
let userMessage2 = 'I need a charger for my smartphone';
console.log('Test 2');
let result2 = await findCategoryAndProductV1(userMessage2, productCategory);
console.log(result2);
*/

// Test case 3
/*
let userMessage3 = 'What computers do you have?';
console.log('Test 3');
let result3 = await findCategoryAndProductV1(userMessage3, productCategory);
console.log(result3);
*/

// This can generate commentary
// Test case 4
/*
let userMessage4 = 'tell me about the smartx pro phone and the fotosnap camera, the dslr one. Also, what TVs do you have?';
console.log('Test 4');
let result4 = await findCategoryAndProductV1(userMessage4, productCategory);
console.log(result4);
*/

// This can generate also commentary
// Test case 5
/*
let userMessage5 = 'tell me about the CineView TV, the 8K one, Gamesphere console, the X one. I\'m on a budget, what computers do you have?';
console.log('Test 5');
let result5 = await findCategoryAndProductV1(userMessage5, productCategory);
console.log(result5);
*/

// We can test a failed case against the new approach
// Test case 6
/*
let userMessage6 = 'tell me about the smartx pro phone and the fotosnap camera, the dslr one. Also, what TVs do you have?';
console.log('Test 6');
let result6 = await findCategoryAndProductV2(userMessage6, productCategory);
console.log(result6);
*/

// We can also regression test with previous cases
// Test case 7
/*
let userMessage7 = 'Which TV can I buy if I\'m on a budget?';
console.log('Test 7');
let result7 = await findCategoryAndProductV2(userMessage7, productCategory);
console.log(result7);
*/

// Check the evaluation function is working
/*
let expected = tests[9].expected;

let response = await findCategoryAndProductV2(tests[9].input, productCategory);
console.log(response);
let score = evaluate(response, expected, true);

console.log('test 9 score: ' + score);
*/

// Here we can automate the testing
/*
let total = 0;
let i = 1;
for(const test of tests) {
	console.log('Test : ' + i);
	let expected = test.expected;
	let response = await findCategoryAndProductV2(test.input, productCategory);
	let score = evaluate(response, expected);

	console.log('Score: ' + score + '\n');

	total += score;
	i++;
}
console.log('Fraction of ' + tests.length + ' correct was: ' + (total/tests.length));
*/

function evaluate(response, expected, debug = false) {
	let responseJson = null;
	let correct = 0.0;

	if (debug) {console.log('response    : ' + JSON.stringify(response));}
	// Let's turn the response into JSON
	try {
		responseJson = JSON.parse(response);
	} catch (err) {
		if (debug) {console.log('The response was not good JSON: ' + err);}
	}

	// Check we got something to work with
	if (responseJson) {
		if (debug) {console.log('responseJson: ' + JSON.stringify(responseJson));}

		// Check if an empty array is the correct answer
		if (responseJson.length === 0 && expected.length === 0) {
			return 1.0;
		}

		// Check if either are an empty set, there is a mismatch!
		if (responseJson.length === 0 || expected.length === 0) {
			return 0.0;
		}

		responseJson.forEach(item => {
			let category = item.category;
			let products = item.products;

			if (category && products) {
				if (expected.hasOwnProperty(category)) {
					let expectedProducts = expected[category];

					if (debug) {console.log('expectedProducts: ' + expectedProducts);}
					if (debug) {console.log(products.length + ' == ' + expectedProducts.length + ' = ' + (products.length == expectedProducts.length));}
					if (products.length == expectedProducts.length) {
						let foundAll = true;

						expectedProducts.forEach(expectedProduct => {
							if (debug) {console.log('is ' + expectedProduct + ' in products? ' + products.includes(expectedProduct));}
							if (!products.includes(expectedProduct)) {foundAll = false;}
						});

						if (foundAll) {
							if (debug) {console.log('The products are correct.');}
							correct++;
						}
					} else {
						if (products.length > expectedProducts.length) {
							if (debug) {console.log('The response products are a superset of the expected.');}
						} else {
							if (debug) {console.log('The response products are a subset of the expected.');}
						}
					}

				} else {
					if (debug) {console.log('Did not find "' + category + '" in:\n' + item);}
				}
			}
		});
	} else {
		// We did not get a valid response to compare
		return 0.0;
	}
	return correct/responseJson.length;
}

// Here is the first version of our function
async function findCategoryAndProductV1(input, productCategory) {
	let systemMessage = utils.getSystemMessage1(productCategory);
	let fewShotUser1 = 'I want the most expensive computer.';
	let fewShotAssistant1 = '[{"category": "Computers and Laptops", "products": ["TechPro Ultrabook", "BlueWave Gaming Laptop", "PowerLite Convertible", "TechPro Desktop", "BlueWave Chromebook"]}]';

	let messages = [
		{role: 'system', content: systemMessage},
		{role: 'user', content: utils.DELIMITER + fewShotUser1 + utils.DELIMITER},
		{role: 'assistant', content: fewShotAssistant1},
		{role: 'user', content: utils.DELIMITER + input + utils.DELIMITER}
	];

	return await getCompletionFromMessages(messages);
}

// Added: Do not output any additional text that is not in JSON format.
//        Added a second example (for few-shot prompting) where user asks for
//        the cheapest computer. In both few-shot examples, the shown response
//        is the full list of products in JSON only.
async function findCategoryAndProductV2(input, productCategory) {
	let systemMessage = utils.getSystemMessage2(productCategory);
	let fewShotUser1 = 'I want the most expensive computer. What do you recommend?';
	let fewShotAssistant1 = '[{"category": "Computers and Laptops", "products": ["TechPro Ultrabook", "BlueWave Gaming Laptop", "PowerLite Convertible", "TechPro Desktop", "BlueWave Chromebook"]}]';
	let fewShotUser2 = 'I want the cheapest computer. What do you recommend?';
	let fewShotAssistant2 = '[{"category": "Computers and Laptops", "products": ["TechPro Ultrabook", "BlueWave Gaming Laptop", "PowerLite Convertible", "TechPro Desktop", "BlueWave Chromebook"]}]';

	let messages = [
		{role: 'system', content: systemMessage},
		{role: 'user', content: utils.DELIMITER + fewShotUser1 + utils.DELIMITER},
		{role: 'assistant', content: fewShotAssistant1},
		{role: 'user', content: utils.DELIMITER + fewShotUser2 + utils.DELIMITER},
		{role: 'assistant', content: fewShotAssistant2},
		{role: 'user', content: utils.DELIMITER + input + utils.DELIMITER}
	];

	return await getCompletionFromMessages(messages);
}
