const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const suggestions = document.querySelectorAll(".suggestion-chip");

// Event listeners
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

// Handle suggestion chips
suggestions.forEach(chip => {
  chip.addEventListener("click", () => {
    userInput.value = chip.textContent.trim().slice(2); // remove emoji
    sendMessage();
  });
});

// Auto-focus input on load
userInput.focus();

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // Append user message
  appendMessage(message, "user");
  userInput.value = "";

  // Show typing indicator
  const typingIndicator = createTypingIndicator();
  chatBox.appendChild(typingIndicator);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const res = await fetch("http://localhost:8000/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    // Remove typing indicator
    typingIndicator.remove();

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    
    // Append bot response with animation
    setTimeout(() => {
      appendMessage(data.reply, "bot");
    }, 300);

  } catch (error) {
    console.error("Error:", error);
    typingIndicator.remove();
    
    // Show error message
    appendMessage(
      "⚠️ Sorry, I'm having trouble connecting right now. Please try again in a moment.",
      "bot"
    );
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendMessage(message, type) {
  const messageWrapper = document.createElement("div");
  messageWrapper.classList.add("message-wrapper", type);

  const avatar = document.createElement("div");
  avatar.classList.add("message-avatar");
  avatar.textContent = type === "user" ? "👤" : "🤖";

  const messageContent = document.createElement("div");
  messageContent.classList.add("message-content");

  const messageDiv = document.createElement("div");
  messageDiv.classList.add(type === "user" ? "user-message" : "bot-message");
  
  // Parse message for formatting (simple markdown-like)
  messageDiv.innerHTML = formatMessage(message);

  messageContent.appendChild(messageDiv);
  messageWrapper.appendChild(avatar);
  messageWrapper.appendChild(messageContent);
  
  chatBox.appendChild(messageWrapper);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Add entrance animation
  setTimeout(() => {
    messageWrapper.style.opacity = "1";
  }, 10);
}

function createTypingIndicator() {
  const messageWrapper = document.createElement("div");
  messageWrapper.classList.add("message-wrapper", "bot");

  const avatar = document.createElement("div");
  avatar.classList.add("message-avatar");
  avatar.textContent = "🤖";

  const messageContent = document.createElement("div");
  messageContent.classList.add("message-content");

  const typingDiv = document.createElement("div");
  typingDiv.classList.add("bot-message", "typing-indicator");
  typingDiv.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;

  messageContent.appendChild(typingDiv);
  messageWrapper.appendChild(avatar);
  messageWrapper.appendChild(messageContent);

  return messageWrapper;
}

function formatMessage(text) {
  // Simple formatting for better readability
  let formatted = text;
  
  // Convert **bold** to <strong>
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert *italic* to <em>
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Convert newlines to <br>
  formatted = formatted.replace(/\n/g, '<br>');
  
  // Convert bullet points (if they exist)
  formatted = formatted.replace(/^- (.+)$/gm, '<li>$1</li>');
  if (formatted.includes('<li>')) {
    formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  }
  
  return formatted;
}

// Handle input placeholder animation
let placeholderIndex = 0;
const placeholders = [
  "Ask about recipes...",
  "Nutrition facts?",
  "Meal suggestions?",
  "Cooking tips?",
  "Dietary advice?"
];

function rotatePlaceholder() {
  userInput.placeholder = placeholders[placeholderIndex];
  placeholderIndex = (placeholderIndex + 1) % placeholders.length;
}

// Rotate placeholder every 3 seconds
setInterval(rotatePlaceholder, 3000);

// Add smooth scroll behavior
chatBox.style.scrollBehavior = "smooth";

// Handle window resize
window.addEventListener("resize", () => {
  chatBox.scrollTop = chatBox.scrollHeight;
});