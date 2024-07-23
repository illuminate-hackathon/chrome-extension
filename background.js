console.log('Background service worker loaded');

const BASE_API_URL = "https://api.amazon.com/bedrock/v1";
const AWS_ACCESS_KEY_ID = "";
const MODEL_ID = "anthropic.claude-3.5-sonnet-20240620-v1:0";
const SYSTEM_PROMPT = ""; // TODO

// In-memory conversation history storage
const CONVERSATION_HISTORY = [];

async function converse(userMessage) {

    CONVERSATION_HISTORY.push({
        role: "user",
        content: [
            {
                text: userMessage,
            }
        ],
    })

    const params = {
        messages: CONVERSATION_HISTORY,
        system: [ 
           {
            text: SYSTEM_PROMPT,
           }
        ],
     }

     const bedrockRuntime = new AWS.BedrockRuntime();
     
     bedrockRuntime.converse(params, function(err, data) {
        if (err) {
            console.log(err, err.stack);
            CONVERSATION_HISTORY.push({
                role: "system",
                content: [
                    {
                        text: "I'm sorry, I'm having trouble connecting to the server. Please try again later.",
                    }
                ],
            })
        } else {
            CONVERSATION_HISTORY.push(data.output.message);
        }
     });

     return CONVERSATION_HISTORY;
}