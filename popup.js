let messageScript = [
  { role: "user", content: "Hello, how are you?" },
  {
    role: "assistant",
    content: "I'm good, thank you for asking. How can I help you today?",
  },
];

const popup = document.getElementById("popup");
popup.className = "popup-body";
const messagesContainer = document.createElement("div");
messagesContainer.id = "messages-container";
let bodyText = "";

function renderMessages() {
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
    console.log(event);
    if (event.key === "Enter") {
      if (messageScript[messageScript.length - 1].role === "loading") {
        messageScript.pop();
      }
      const userInputValue = event.target.value;
      if (userInputValue === "") return;
      messageScript.push({ role: "user", content: userInputValue });
      messageScript.push({ role: "loading" });
      console.log(userInputValue);
      // send and get response back
      // Send the content to the background script
      chrome.runtime.sendMessage({ action: "createConversation", userMessage: userInputValue, pageTitle: "", pageURL: window.location.href, pageContext: bodyText }, (response) => {
        messageScript.pop();
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          messageScript.push({role: "assistant", content: "Sorry couldn't send data"});
          return;
        }

        console.log("Received response from background script:", response);

        // const chatArea = document.getElementById('chatArea');

        if (response.error) {
          console.error("Error from AI API:", response.error);
          return;
        }

        // Check if response content exists and is an array
        if (response.response.content && Array.isArray(
            response.response.content) && response.response.content.length
            > 0) {
          const aiContent = response.response.content[0].text;
          messageScript.push({role: "assistant", content: aiContent});
        } else {
          console.error("Invalid response format or empty content:",
              response.response);
          messageScript.push({role: "assistant", content: "Sorry, I couldn't understand the response."});
        }

        renderMessages();
      }, 2000);

      renderMessages();
    }
  };
}

function createUserInput() {
  const userInput = document.createElement("input");
  userInput.id = "user-input";
  userInput.type = "text";
  userInput.className = "message-input";
  userInput.placeholder = "Ask ilLuMinate something...";
  userInput.onkeydown = addUserMessage();

  return userInput;
}


function setup() {
  scrapeContent();
}

// Function to scrape the page content
function scrapeContent() {
  console.log("getting body text");
  bodyText = document.body.innerText;
}

const userInput = createUserInput();
messagesContainer.className = "messages-container";
popup.appendChild(messagesContainer);
popup.appendChild(userInput);

renderMessages(messagesContainer);

document.addEventListener('DOMContentLoaded', (event) => {
    userInput.focus();

    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        const response = chrome.tabs.sendMessage(activeTab.id, {action: "scrapePage"}, function(response){
                //do something with content
                console.log(response)
            });
    });
});

setup();