document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    
    const apiEndpoint = 'http://localhost:3000/chat';

    async function sendMessage( ) {
        const messageText = messageInput.value.trim();
        if (messageText === '') return;

        addMessage(messageText, 'user');
        messageInput.value = '';

        const thinkingMessage = document.createElement('div');
        thinkingMessage.classList.add('message', 'bot-message');
        thinkingMessage.textContent = 'جاري التفكير...';
        chatBox.appendChild(thinkingMessage);
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "phi3:mini",
                    messages: [
                        { role: "system", content: "أنت مساعد ذكاء اصطناعي اسمك 'بونو'. يجب أن ترد دائماً باللغة العربية." },
                        { role: "user", content: messageText }
                    ],
                    stream: false
                }),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            chatBox.removeChild(thinkingMessage);
            addMessage(data.message.content, 'bot');

        } catch (error) {
            console.error('Error:', error);
            thinkingMessage.textContent = 'عذراً، حدث خطأ. تأكد من أن Ollama تعمل على جهازك (من أيقونتها بجانب الساعة).';
        }
    }

    function addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.textContent = message;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

    addMessage("أهلاً بك! أنا 'بونو'، مساعدك الذكي على جهازك. كيف يمكنني مساعدتك؟", 'bot');
});
