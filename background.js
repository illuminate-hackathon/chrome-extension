console.log('Background service worker loaded');

const BASE_API_URL = 'http://localhost:8123';
const HEADERS = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
};

const generateSystemPrompt = async function (pageTitle, pageURL, pageContext) {
    const systemPromptURL = chrome.runtime.getURL('system-prompt.txt');
    const systemPromptTemplate = await fetch(systemPromptURL)
        .then(response => response.text());
    return systemPromptTemplate.replace('__PAGE_TITLE__', pageTitle)
        .replace('__PAGE_URL__', pageURL)
        .replace('__PAGE_CONTEXT__', pageContext);
}

const requestOptions = function (method, body) {
    return {
        method,
        body: JSON.stringify(body),
        headers: HEADERS,
    };
}

const createConversation = async function ({ userPrompt, pageTitle, pageURL, pageContext }) {
    // Prepare the request body
    const context = await generateSystemPrompt(pageTitle, pageURL, pageContext);
    const body = { context, userPrompt };

    // Make the API request to ilLuMinate
    const conversationResponse = await fetch(
        `${BASE_API_URL}/api/conversations`,
        requestOptions('POST', body)
    );

    // Return the response
    return await conversationResponse.json();
}

const continueConversation = async function ({ conversationId, userMessage }) {
    // Prepare the request body
    const body = {
        userPrompt: userMessage,
    };

    // Make the API request to ilLuMinate
    const conversationResponse = await fetch(
        `${BASE_API_URL}/api/conversations/${conversationId}`,
        requestOptions('PATCH', body)
    );

    // Return the response
    return await conversationResponse.json();
}

// Listen for the extension being installed
chrome.runtime.onInstalled.addListener(() => {
    console.log("ilLuMinate installed.");
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "createConversation") {
        const { userMessage, pageContext, pageURL, pageTitle } = request;
        createConversation({userPrompt:userMessage, pageTitle, pageURL, pageContext})
            .then(conversation => sendResponse(conversation));
        return true;
    }
    if (request.action === 'continueConversation') {
        const { conversationId, userMessage } = request;
        continueConversation({ conversationId, userMessage })
            .then(conversation => sendResponse(conversation));
        return true;
    }
});
