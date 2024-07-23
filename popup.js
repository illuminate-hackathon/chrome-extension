let messageScript = [
  { role: "user", content: "Hello, how are you?" },
  {
    role: "assistant",
    content: "I'm good, thank you for asking. How can I help you today?",
  },
];

const generateLocalStorageKey = function (tabId) {
  return `illuminate_${tabId}`;
};

chrome.tabs.getCurrent((tab) => {
  const tabId = "test";
  const localStorageKey = generateLocalStorageKey(tabId);
  chrome.storage.local.set({ [localStorageKey]: messageScript });
  chrome.storage.local.get(localStorageKey, function (result) {
    if (result[localStorageKey] !== undefined) {
      messageScript = result[localStorageKey];
      if (messageScript[messageScript.length - 1].role === "loading") {
        messageScript.pop();
      }
      renderMessages(tabId);
    } else {
      chrome.storage.local.set({ [localStorageKey]: messageScript });
    }
  });
});

const popup = document.getElementById("popup");
popup.className = "popup-body";
const messagesContainer = document.createElement("div");
messagesContainer.id = "messages-container";
let bodyText = null;
let url = null;
let title = null;
let conversationId = null;

function renderMessages(tabId) {
  messagesContainer.innerHTML = "";
  const messages = messageScript.map((message) => {
    if (message.role === "user") {
      return createUserMessage(message.content);
    }
    if (message.role === "assistant") {
      return createBotMessage(message.content);
    }
    if (message.role === "loading") {
      return createLoadingMessage();
    }
  });

  messages.forEach((message) => {
    messagesContainer.appendChild(message);
  });

  document.getElementById("user-input").value = "";
  const localStorageKey = generateLocalStorageKey(tabId);
  chrome.storage.local.set({ [localStorageKey]: messageScript });

  messagesContainer.lastChild.scrollIntoView();
}

function createBotMessage(message) {
  const botMessage = document.createElement("div");
  botMessage.textContent = message;
  botMessage.className = "message-bubble-bot";

  return botMessage;
}

function createUserMessage(message) {
  const userMessage = document.createElement("div");
  userMessage.textContent = message;
  userMessage.className = "message-bubble-user";

  return userMessage;
}

function createLoadingMessage() {
  const loadingMessage = document.createElement("div");
  loadingMessage.className = "loading-dots message-bubble-bot";
  const dot1 = document.createElement("span");
  dot1.className = "dot";
  const dot2 = document.createElement("span");
  dot2.className = "dot";
  const dot3 = document.createElement("span");
  dot3.className = "dot";

  loadingMessage.appendChild(dot1);
  loadingMessage.appendChild(dot2);
  loadingMessage.appendChild(dot3);

  return loadingMessage;
}

function addUserMessage() {
  return (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (messageScript[messageScript.length - 1].role === "loading") {
        messageScript.pop();
      }
      const userInputValue = event.target.value.trim();

      if (userInputValue === "") return;
      messageScript.push({ role: "user", content: userInputValue });
      messageScript.push({ role: "loading" });

      renderMessages();

      let action =
          conversationId === null ? "createConversation" : "continueConversation";
      chrome.runtime.sendMessage(
          {
            action: action,
            userMessage: userInputValue,
            pageTitle: title,
            pageURL: url,
            pageContext: bodyText,
            conversationId
          },
          (response) => {
            messageScript.pop();
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError.message);
              messageScript.push({
                role: "assistant",
                content: "Sorry couldn't send data",
              });
              renderMessages();
              return;
            }

            if (response === null || response?.error) {
              console.log("Error from AI API");
              messageScript.push({
                role: "assistant",
                content: "Sorry couldn't get data",
              });
              renderMessages();
              return;
            }

            conversationId = response.conversationId;
            if (
                response.chatMessages &&
                Array.isArray(response.chatMessages) &&
                response.chatMessages.length > 1
            ) {
              const aiContent = response.chatMessages[response.chatMessages.length-1].content;
              messageScript.push({ role: "assistant", content: aiContent });
            } else {
              console.error(
                  "Invalid response format or empty content:",
                  response
              );
              messageScript.push({
                role: "assistant",
                content: "Sorry, I couldn't understand the response.",
              });
            }

            renderMessages();
          });
    }
  };
}

function createUserInput() {
  const userInput = document.createElement("textarea");
  userInput.id = "user-input";
  userInput.className = "message-input";
  userInput.placeholder = "Ask ilLuMinate something...";
  userInput.onkeydown = addUserMessage();

  return userInput;
}

const userInput = createUserInput();
messagesContainer.className = "messages-container";
popup.appendChild(messagesContainer);
popup.appendChild(userInput);

renderMessages(messagesContainer);

document.addEventListener('DOMContentLoaded', (event) => {
  userInput.focus();

  chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {action: "scrapePage"}, function(response){
      console.log("response for page load");
      console.log(response);
      if (response != null) {
        bodyText = response.content;
        url = activeTab.url;
        title = response.title;
        console.log(bodyText);
        console.log(url);
        console.log(title);
      }
    });
  });
});
