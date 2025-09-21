document.addEventListener('DOMContentLoaded', ( ) => {
    const chatBox = document.getElementById('chat-box');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    // <<< FINAL UPDATE: Using the new ngrok URL from your screenshot >>>
    const apiEndpoint = 'https://13d19a40e0f2.ngrok-free.app/api/chat';

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
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    model: "deepseek-coder:6.7b", 
                    messages: [
                        { role: "system", content: "You are an expert programming AI assistant. You must always answer in Arabic." },
                        { role: "user", content: messageText }
                    ],
                    stream: false
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
            thinkingMessage.textContent = 'عذراً، حدث خطأ أثناء محاولة الاتصال بالنموذج. تأكد من أن Colab notebook يعمل.';
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
