const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");

const API_KEY = "AIzaSyAGN5Hvd37WD7c9B17p-eUiBxA2G0tKT6k";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

let userMessage = "";
const chatHistory = [];

// Function to create message elements
const createMsgElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

// Typing effect function
const typingEffect = (text, textElement, botMsgDiv) => {
    textElement.textContent = "";
    const words = text.split(" "); // Fix: Use `text` instead of `textElement`
    let wordIndex = 0;

    const typingInterval = setInterval(() => {
        if (wordIndex < words.length) {
            textElement.textContent += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
            botMsgDiv.classList.remove("loading");
        } else {
            clearInterval(typingInterval);
        }
    }, 40);
};

// Function to fetch response from Gemini API
const generateResponse = async (botMsgDiv) => {
    chatHistory.push({
        role: "user",
        parts: [{ text: userMessage }]
    });

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: chatHistory })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        // Extract response text
        const botResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I didn't understand that.";

        // Apply typing effect instead of setting text directly
        const textElement = botMsgDiv.querySelector(".message-text");
        typingEffect(botResponse, textElement, botMsgDiv);

        // Save bot response to history
        chatHistory.push({
            role: "model",
            parts: [{ text: botResponse }]
        });

    } catch (error) {
        console.error(error);
        botMsgDiv.classList.remove("loading");
        botMsgDiv.querySelector(".message-text").textContent = "An error occurred.";
    }
};

// Handle form submission
const handleFormSubmit = (e) => {
    e.preventDefault();
    userMessage = promptInput.value.trim();
    if (!userMessage) return;
    promptInput.value = "";

    // Generate user message
    const userMsgHTML = `<p class="message-text"></p>`;
    const userMsgDiv = createMsgElement(userMsgHTML, "user-message");
    userMsgDiv.querySelector(".message-text").textContent = userMessage;
    chatsContainer.appendChild(userMsgDiv);

    setTimeout(() => {
        // Generate bot message placeholder
        const botMsgHTML = `<img src="./gemini-chatbot-logo.svg" class="avatar"><p class="message-text">Just a sec...</p>`;
        const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
        chatsContainer.appendChild(botMsgDiv);

        // Fetch response from Gemini API
        generateResponse(botMsgDiv);
    }, 600);
};

promptForm.addEventListener("submit", handleFormSubmit);
