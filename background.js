console.log('Background service worker loaded');

const BASE_API_URL = "http://127.0.0.1:55069";
const SYSTEM_PROMPT = chrome.runtime.getURL('system-prompt.txt');

// In-memory conversation history storage (keyed by conversation id)
const CONVERSATION_HISTORY = {};

async function getSystemPrompt(pageTitle, pageURL, pageContext) {
    const systemPromptTemplate = await fetch(SYSTEM_PROMPT)
        .then(response => response.text());
    return systemPromptTemplate.replace("__PAGE_TITLE__", pageTitle)
        .replace("__PAGE_URL__", pageURL)
        .replace("__PAGE_CONTEXT__", pageContext);
}

async function createConversation({userMessage, pageTitle, pageURL, pageContext}) {

    // Prepare the request body
    const body = {
        context: getSystemPrompt(pageTitle, pageURL, pageContext),
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
    return {conversation: CONVERSATION_HISTORY[conversation.conversationId], conversationId: conversation.conversationId};
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
    return {conversation: CONVERSATION_HISTORY[conversation.conversationId], conversationId: conversation.conversationId};
}

chrome.runtime.onInstalled.addListener(() => {
    console.log("ilLuMinate installed.");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "createConversation") {
        const { userMessage, pageContext, pageURL, pageTitle } = request;
        createConversation({userMessage, pageTitle, pageURL, pageContext})
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
