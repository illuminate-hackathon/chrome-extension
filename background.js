console.log('Background service worker loaded');

const BASE_API_URL = 'http://localhost:8123';
const HEADERS = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
};
const SYSTEM_PROMPT = chrome.runtime.getURL('system-prompt.txt');

async function generateSystemPrompt(pageTitle, pageURL, pageContext) {
    const systemPromptTemplate = await fetch(SYSTEM_PROMPT)
        .then(response => response.text());
    return systemPromptTemplate.replace('__PAGE_TITLE__', pageTitle)
        .replace('__PAGE_URL__', pageURL)
        .replace('__PAGE_CONTEXT__', pageContext);
}

async function createConversation({ userMessage: userPrompt, pageTitle, pageURL, pageContext }) {
    // Prepare the request body
    const context = await generateSystemPrompt(pageTitle, pageURL, pageContext);
    const body = { context, userPrompt };

    // Make the API request to ilLuMinate
    const conversationResponse = await fetch(`${BASE_API_URL}/api/conversations`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: HEADERS,
    });
    return await conversationResponse.json();
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
        headers: HEADERS,
    });
    return await conversationResponse.json();
}

chrome.runtime.onInstalled.addListener(() => {
    console.log("ilLuMinate installed.");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'createConversation') {
        const { userMessage, pageContext } = request;
        createConversation(userMessage, pageContext)
            .then(conversation => sendResponse(conversation));
        return true;
    }
    if (request.action === 'continueConversation') {
        const { conversationId, userMessage } = request;
        continueConversation(conversationId, userMessage)
            .then(conversation => sendResponse(conversation));
        return true;
    }
});
