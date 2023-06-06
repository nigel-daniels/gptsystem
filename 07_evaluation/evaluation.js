import { getCompletionFromMessages, moderate } from '../helper.js';
import * as utils from './utils.js';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';



await collectMessages();



async function testBot() {
	try {
		let userInput = "Tell me about the Smartx Pro phone and the Fotosnap camera, the DSLR one. Also what tell me about your TVs.";

		let result = await processUserMessage(userInput);

		console.log(result.response);
	} catch (err) {
		console.log(err);
	}
}

async function collectMessages(debug = false) {
	const read = readline.createInterface({ input, output });

	// Tell the user how to end the coversation and set up the end flag
    console.log('Just hit <return> to stop chatting.\n');
    let ok = true;
	let messages = [];

	// Now continually loop chatting until the user is done
	try {
	    do {
			// Get the users input and add it to the context
	        let prompt = await read.question('You: ');

			if (prompt === '') {
				ok = false;
			} else {
				let completion = await processUserMessage(prompt, messages, debug);

				messages = completion.messages;

				messages.push({role: 'user', content: prompt});
				messages.push({role: 'assistant', content: completion.response});

				console.log('Bot: ' + completion.response);
			}

	    } while (ok);
	} catch(err) {
		console.log(err);
	} finally {
		// close the input stream
	    read.close();
	}
}


// Look up in the product JSON by name
async function processUserMessage(input, messages = [], debug = true) {

	// Step 1: Check input to see if it flags the Moderation API or is a prompt injection
	let s1Moderation = await moderate(input);

	if (s1Moderation.flagged) {
	   if (debug) {console.log('Step 1: Input flagged by Moderation API.');}
	   return {response: 'Sorry, we cannot process this request.', messages: messages};
	}

	if (debug) {console.log('Step 1: Input passed moderation check.');}


	// Step 2: Extract the list of products
	let s2SystemMessage = utils.getS2SystemMessage();
	let s2Messages = [s2SystemMessage];
	messages.forEach(message => {s2Messages.push(message);});
	s2Messages.push({role: 'user', content: utils.DELIMITER + input + utils.DELIMITER});

	let s2Response = await getCompletionFromMessages(s2Messages);

	// Note we are returning a JSON array so we dont need to convert to a list
	if (debug) {console.log('Step 2: Extracted array of products.');}

	// Sometimes GPT 3.5 adds commentary!
	s2Response = s2Response.substring(s2Response.indexOf('['),s2Response.lastIndexOf(']')+1);


	// Step 3: If products are found, look them up
	let s3Products = utils.getProducts(JSON.parse(s2Response));

	if (debug) {console.log('Step 3: Looked up product information.');}


	// Step 4: Answer the user question
	let s4SystemMessage = utils.getS4SystemMessage();
	let s4Messages = [s4SystemMessage];
	messages.forEach(message => {s4Messages.push(message);});

	let s4UserMessage = {role: 'user', content: input};
	let s4AssistantMessage = {role: 'assistant', content: 'Relevant product information:\n' + s3Products};

	s4Messages.push(s4UserMessage);
	s4Messages.push(s4AssistantMessage);

	messages.push(s4UserMessage);
	messages.push(s4AssistantMessage);

	let s4Response = await getCompletionFromMessages(s4Messages);

	if (debug) {console.log('Step 4: Generated response to user question.');}


	// Step 5: Put the answer through the Moderation API
	let s5Moderation = await moderate(s4Response);

	if (s5Moderation.flagged) {
	   if (debug) {console.log('Step 5: Response flagged by Moderation API.');}
	   return {response: 'Sorry, we cannot provide this information. Let me connect you to a human.', messages: messages};
	}

	if (debug) {console.log('Step 5: Response passed moderation check.');}

	return {response: s4Response, messages: messages};
}
