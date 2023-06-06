import { getCompletionFromMessages } from '../helper.js';
import fs from 'fs';

let delimiter = '####';

try {

	// Here we use an 'inner monologue' to build up the response
	// but we hide the reasoning from the user.
	let systemMessage = fs.readFileSync('./system_message.txt', 'utf8');

	systemMessage = systemMessage.replaceAll('<delimiter>', delimiter);

	let userMessage1 = 'By how much is the BlueWave Chromebook more ' +
		'expensive than the TechPro Desktop?';

	let userMessage2 = 'Do you sell TVs?';

	// Change the use message to try different responses
	let messages = [
		{ role: 'system', content: systemMessage },
		{ role: 'user', content: delimiter + userMessage1 + delimiter}
	];

	let response = await getCompletionFromMessages(messages);
	console.log(response);

	// This final stage hides the 'inner monologue' so the user only
	// sees the final step.
	/*
	let finalResponse = '';

	try {
		let responseArray = response.split(delimiter);
		finalResponse = responseArray[responseArray.length - 1].trim();
	} catch (err) {
		finalResponse = 'Sorry, I\'m having trouble right now, please try asking another question.';
	}
	console.log(finalResponse);
	*/
} catch (err) {
	console.error(err);
}
