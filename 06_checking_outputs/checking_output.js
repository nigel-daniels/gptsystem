import { moderate, getCompletionFromMessages } from '../helper.js';
import fs from 'fs';

let delimiter = '####';


try {
	// Here is the response from the previous exercise
	// We can check this using moderation or the system
	let response1 = fs.readFileSync('./response_1.txt', 'utf8');

	// We can check this in the user message below
	let response2 = 'Life is like a box of chocolates';


	// Here we use the system to check the response
	let systemMessage = fs.readFileSync('./system_message.txt', 'utf8');
	systemMessage = systemMessage.replace('<delimiter>', delimiter);

	// This is the user request from the previous exercise
	let userRequest = 'Tell me about the SmartX Pro phone and the Fotosnap ' +
		'camera, the DSLR one. Also tell me about your TVs.';

	// This is the product information from the previous  exercise
	let productInformation = fs.readFileSync('./product_information.txt', 'utf8');

	// This is the user message we build using the previous components
	// NOTE: Change the response to see if the evaluation is working
	let userMessage = 'Customer message: ' + delimiter + userRequest + delimiter + '\n' +
		'Product information: ' + delimiter + productInformation  + delimiter + '\n' +
		'Agent response: ' + delimiter + response1  + delimiter + '\n\n' +
		'Does the response use the retrieved information correctly?\n' +  // A good check to ensure no hallucinations
		'Does the response sufficiently answer the question?\n' +
		'Output Y or N';


	let messages = [
	    {role: 'system', content: systemMessage},
	    {role: 'user', content: userMessage}
	];

	let response = await moderate(response1);

	/*
	let response = await getCompletionFromMessages(messages);
	console.log(response);
	*/
} catch (err) {
	console.error(err);
}
