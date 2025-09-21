document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    
    // <<< MODIFICATION 1: Using the NEW ngrok URL from your Colab >>>
    const apiEndpoint = 'https://1917a87e3d94.ngrok-free.app/api/chat';

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
                    'ngrok-skip-browser-warning': 'true' // This header is still important
                },
                body: JSON.stringify({
                    // <<< MODIFICATION 2: Using the CORRECT model (llama3) >>>
                    model: "llama3:8b", 
                    messages: [
                        // <<< MODIFICATION 3: Using the appropriate system prompt for Llama3 >>>
                        { role: "system", content: "You are a helpful AI assistant. You must answer in Arabic only." },
                        { role: "user", content: messageText }
                    ],
                    stream: false
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            chatBox.removeChild(thinkingMessage);
            addMessage(data.message.content, 'bot');

        } catch (error) {
            console.error('Error:', error);
            thinkingMessage.textContent = 'عذراً، حدث خطأ. تأكد من أن نافذة Google Colab لا تزال تعمل وأن الاتصال بالإنترنت سليم.';
        }
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    addMessage('أهلاً بك! أنا مساعدك الذكي، كيف يمكنني مساعدتك اليوم؟', 'bot');
});
