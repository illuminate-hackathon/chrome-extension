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

function createUserInput() {
  const userInput = document.createElement("input");
  userInput.className = "message-input";
  userInput.placeholder = "Ask ilLuMinate something...";
  return userInput;
}

const testScript = [
  { role: "user", content: "Hello, how are you?" },
  {
    role: "assistant",
    content: "I'm good, thank you for asking. How can I help you today?",
  },
];

const popup = document.getElementById("popup");
popup.className = "popup-body";
const messagesContainer = document.createElement("div");

const messages = testScript.map((message) => {
  if (message.role === "user") {
    return createUserMessage(message.content);
  }
  if (message.role === "assistant") {
    return createBotMessage(message.content);
  }
});

const userInput = createUserInput();

messagesContainer.className = "messages-container";
messages.forEach((message) => {
  messagesContainer.appendChild(message);
});

popup.appendChild(messagesContainer);
popup.appendChild(userInput);
