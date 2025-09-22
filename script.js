document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    
    const apiEndpoint = 'http://localhost:3000/chat';

    // --- تم تعديل التعليمات الأولية لتكون أكثر صرامة ---
    let conversationHistory = [
        { 
            role: "system", 
            content: "مهمتك واضحة ومحددة: أنت مساعد برمجي اسمك 'بونو'. ردودك يجب أن تكون باللغة العربية الفصحى فقط. ممنوع استخدام أي لغة أخرى. ابدأ ردك دائمًا بـ 'أهلاً بك'. لا تذكر أي معلومات عن كونك نموذج لغوي أو AI." 
        }
    ];

    async function sendMessage( ) {
        const messageText = messageInput.value.trim();
        if (messageText === '') return;

        addMessage(messageText, 'user');
        messageInput.value = '';

        conversationHistory.push({ role: "user", content: messageText });

        const thinkingMessage = document.createElement('div');
        thinkingMessage.classList.add('message', 'bot-message');
        thinkingMessage.innerHTML = '<div class="typing-indicator"></div>';
        chatBox.appendChild(thinkingMessage);
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // --- تم تغيير اسم النموذج هنا ---
                    model: "gemma:2b",
                    messages: conversationHistory,
                    stream: false
                }),
            });

            if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);

            const data = await response.json();
            const botReply = data.message.content;

            conversationHistory.push({ role: "assistant", content: botReply });

            chatBox.removeChild(thinkingMessage);
            addMessage(botReply, 'bot');

        } catch (error) {
            console.error('Error:', error);
            chatBox.removeChild(thinkingMessage);
            addMessage('عذراً، حدث خطأ. تأكد من أن الخادم الوكيل (النافذة السوداء) و Ollama يعملان على جهازك.', 'bot-error');
        }
    }

    function addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        
        const textNode = document.createTextNode(message);
        messageElement.appendChild(textNode);
        
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
});
