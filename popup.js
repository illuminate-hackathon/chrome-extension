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
    if (event.key === "Enter") {
      if (messageScript[messageScript.length - 1].role === "loading") {
        messageScript.pop();
      }
      const userInputValue = event.target.value;
      if (userInputValue === "") return;
      messageScript.push({ role: "user", content: userInputValue });
      messageScript.push({ role: "loading" });
      // send and get response back, replace with actual response
      setTimeout(() => {
        messageScript.pop();
        messageScript.push({
          role: "assistant",
          content: "I'm sorry, I don't have an answer for that yet.",
        });
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

const userInput = createUserInput();
messagesContainer.className = "messages-container";
popup.appendChild(messagesContainer);
popup.appendChild(userInput);

renderMessages(messagesContainer);

document.addEventListener('DOMContentLoaded', (event) => {
    userInput.focus();

    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.close();
        } else if (e.key === 'Enter') {
            performSearch(userInput.value);
        }
    });

    function performSearch(query) {
        console.log('Searching for:', query);
    }

    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        const response = chrome.tabs.sendMessage(activeTab.id, {action: "scrapePage"}, function(response){
                //do something with content
                console.log(response)
            });
    });
});
