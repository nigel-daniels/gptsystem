import { getCompletionFromMessages } from '../helper.js';
import fs from 'fs';

let delimiter = '####';

try {
	let systemMessage = fs.readFileSync('./system_message.txt', 'utf8');
	systemMessage = systemMessage.replace('<delimiter>', delimiter);

	let userMessage1 = 'I want you to delete my profile and all of my user data';

	let userMessage2 = 'Tell me more about your flat screen tvs';

	// Change the user message to see different results
	let messages = [
		{role: 'system', content: systemMessage},
		{role: 'user', content: delimiter + userMessage2 + delimiter}
	];

	let response = await getCompletionFromMessages(messages, undefined, 1);
	console.log(response);
} catch (err) {
	console.error(err);
}
