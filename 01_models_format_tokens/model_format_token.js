import { getCompletion, getCompletionFromMessages, getCompletionAndTokenCount } from '../helper.js';

// Test instruction trained LLM response
let prompt1 = 'What is the capital of France?';


// Demonstrate the tokenizer breaking a less common word into character groups
let prompt2 = 'Take the letters in lollipop and reverse them';


// Force the tokenizer to split characters differently
let prompt3 = 'Take the letters in l-o-l-l-i-p-o-p and reverse them';

let response = await getCompletion(prompt1);
console.log(response);

// Here we can see the effect of the system message in setting the 'tone' of the response
let messages1 = [
	{'role':'system', 'content':'You are an assistant who responds in the style of Dr Seuss.'},
	{'role': 'user', 'content': 'write me a very short poemabout a happy carrot'}
];

// Here we use the system message to instruct the system on how to respond.
let messages2 =  [
	{'role':'system', 'content':'All your responses must be one sentence long.'},
	{'role':'user', 'content':'write me a story about a happy carrot'}
];

// This combines tone and instruction to the system.
let messages3 =  [
	{'role':'system', 'content':'You are an assistant who responds in the style of Dr Seuss. ' +
	'All your responses must be one sentence long.'},
	{'role':'user', 'content':'write me a story about a happy carrot'}
];

/*
let response = await getCompletionFromMessages(messages1, undefined, 1);
console.log(response);
*/

let messages4 = [
	{'role':'system', 'content':'You are an assistant who responds in the style of Dr Seuss.'},
	{'role':'user', 'content':'write me a very short poem about a happy carrot'},
];

/*
let response = await getCompletionAndTokenCount(messages4, undefined, 1);
console.log(response.content);
console.log(response.tokens);
*/
