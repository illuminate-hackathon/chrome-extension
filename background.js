console.log('Background service worker loaded');

const BASE_API_URL = "http:localhost:8123";
const SYSTEM_PROMPT = ""; // TODO

// In-memory conversation history storage (keyed by conversation id)
const CONVERSATION_HISTORY = {};


async function createConversation(userMessage) {

    // Prepare the request body
    const body = {
        context: SYSTEM_PROMPT,
        userPrompt: userMessage,
    };

    // Make the API request to ilLuMinate
    return await fetch(`${BASE_API_URL}/api/conversations`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        })
        .then(response => JSON.parse(response.json()))
        .then(conversation => {
            CONVERSATION_HISTORY[conversation.conversationId] = conversation;
            return CONVERSATION_HISTORY[conversation.conversationId];
        });
}

async function continueConversation(conversationId, userMessage) {

    // Prepare the request body
    const body = {
        userPrompt: userMessage,
    };

    // Make the API request to ilLuMinate
    return await fetch(`${BASE_API_URL}/api/conversations/${conversationId}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        })
        .then(response => JSON.parse(response.json()))
        .then(conversation => {
            CONVERSATION_HISTORY[conversation.conversationId] = conversation;
            return CONVERSATION_HISTORY[conversation.conversationId];
        });
}
