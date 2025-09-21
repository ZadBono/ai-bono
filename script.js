document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    // عنوان الخادم المحلي الذي تشغله Ollama
    const OLLAMA_API_URL = 'http://localhost:11434/api/chat';

    function addMessage(text, sender ) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
        
        const p = document.createElement('p');
        p.innerText = text;
        messageElement.appendChild(p);
        
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    async function getBotResponse(userText) {
        try {
            const response = await fetch(OLLAMA_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: "phi3:mini", // اسم النموذج الذي نستخدمه
                    messages: [{ role: "user", content: userText }],
                    stream: false // لتبسيط الأمر، سنجعل الرد يأتي دفعة واحدة
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            addMessage(data.message.content, 'bot');

        } catch (error) {
            console.error("Error fetching from Ollama API:", error);
            addMessage("عذراً، حدث خطأ أثناء محاولة الاتصال بالنموذج. تأكد من أن Ollama تعمل.", 'bot');
        }
    }

    function handleSend() {
        const userText = userInput.value.trim();
        if (userText) {
            addMessage(userText, 'user');
            userInput.value = '';
            getBotResponse(userText);
        }
    }

    sendBtn.addEventListener('click', handleSend);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    });
});
