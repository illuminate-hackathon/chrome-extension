console.log('Background service worker loaded');

const BASE_API_URL = "http://localhost:8123";
const SYSTEM_PROMPT = chrome.runtime.getURL('system-prompt.txt');

// In-memory conversation history storage (keyed by conversation id)
const CONVERSATION_HISTORY = {};

async function getSystemPrompt(pageContext) {
    return await fetch(SYSTEM_PROMPT)
        .then(response => response.text())
        .then(systemPrompt => systemPrompt + '\n' + pageContext);
}

async function createConversation(userMessage, pageContext) {

    // Prepare the request body
    const body = {
        context: getSystemPrompt(pageContext),
        userPrompt: userMessage,
    };

    // Make the API request to ilLuMinate
    const conversationResponse = await fetch(`${BASE_API_URL}/api/conversations`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    });
    const conversation = await conversationResponse.json();
    CONVERSATION_HISTORY[conversation.conversationId] = conversation;
    return CONVERSATION_HISTORY[conversation.conversationId];
}

async function continueConversation(conversationId, userMessage) {

    // Prepare the request body
    const body = {
        userPrompt: userMessage,
    };

    // Make the API request to ilLuMinate
    const conversationResponse = await fetch(`${BASE_API_URL}/api/conversations/${conversationId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    });
    const conversation = await conversationResponse.json();
    CONVERSATION_HISTORY[conversation.conversationId] = conversation;
    return CONVERSATION_HISTORY[conversation.conversationId];
}

chrome.runtime.onInstalled.addListener(() => {
    console.log("ilLuMinate installed.");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "createConversation") {
        const { userMessage, pageContext } = request;
        createConversation(userMessage, pageContext)
            .then(conversation => sendResponse(conversation));
        return true;
    }
    if (request.action === "continueConversation") {
        const { conversationId, userMessage } = request;
        continueConversation(conversationId, userMessage)
            .then(conversation => sendResponse(conversation));
        return true;
    }
});
