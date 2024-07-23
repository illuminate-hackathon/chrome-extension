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
        .replace('__PAGE_CONTENT__', pageContext);
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
    let conversationResponse = null;
    try {
        // Make the API request to ilLuMinate
        conversationResponse = await fetch(
            `${BASE_API_URL}/api/conversations`,
            requestOptions('POST', body)
        );
    } catch (e) {
        console.log("failed to get data");
    }

    // Return the response
    return await conversationResponse?.json();
}

const continueConversation = async function ({ conversationId, userPrompt }) {
    // Prepare the request body
    const body = { userPrompt };
    let conversationResponse = null;
    // Make the API request to ilLuMinate
    try {
        conversationResponse = await fetch(
            `${BASE_API_URL}/api/conversations/${conversationId}`,
            requestOptions('PATCH', body)
        );
    } catch (e) {
        console.log("failed to load data");
    }

    // Return the response
    return await conversationResponse?.json();
}

// Listen for the extension being installed
chrome.runtime.onInstalled.addListener(() => {
    console.log("ilLuMinate installed.");
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
    if (request.action === "createConversation") {
        const { userMessage: userPrompt, pageContext, pageURL, pageTitle } = request;
        createConversation({ userPrompt, pageTitle, pageURL, pageContext })
            .then(conversation => sendResponse(conversation));
        return true;
    }
    if (request.action === 'continueConversation') {
        const { conversationId, userMessage: userPrompt } = request;
        continueConversation({ conversationId, userPrompt })
            .then(conversation => sendResponse(conversation));
        return true;
    }
});
