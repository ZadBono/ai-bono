document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const apiEndpoint = 'http://127.0.0.1:11434/api/chat';

    // Function to add a message to the chat box
    function addMessage(message, sender ) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.textContent = message;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
    }

    // Function to handle sending a message
    async function sendMessage() {
        const messageText = messageInput.value.trim();
        if (messageText === '') return;

        addMessage(messageText, 'user');
        messageInput.value = ''; // Clear input field

        // Add a "thinking" message
        const thinkingMessage = document.createElement('div');
        thinkingMessage.classList.add('message', 'bot-message');
        thinkingMessage.textContent = 'جاري التفكير...';
        chatBox.appendChild(thinkingMessage);
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: "phi3:mini", // The model we are using
                    messages: [{ role: "user", content: messageText }],
                    stream: false // We want the full response at once
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            // Remove the "thinking" message
            chatBox.removeChild(thinkingMessage);

            // Add the bot's actual response
            addMessage(data.message.content, 'bot');

        } catch (error) {
            console.error('Error:', error);
            // Update the "thinking" message to show an error
            thinkingMessage.textContent = 'عذراً، حدث خطأ أثناء محاولة الاتصال بالنموذج. تأكد من أن Ollama تعمل.';
        }
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    // Initial bot message
    addMessage('أهلاً بك! أنا مساعدك البرمجي، كيف يمكنني مساعدتك اليوم؟', 'bot');
});
