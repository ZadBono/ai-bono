document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    
    // تم تعديل هذا السطر ليتصل بالخادم الوكيل
    const apiEndpoint = 'http://localhost:3000/chat';

    // مصفوفة لحفظ سجل المحادثة
    let conversationHistory = [
        { role: "system", content: "أنت مساعد ذكاء اصطناعي اسمك 'بونو'. يجب أن ترد دائماً باللغة العربية." }
    ];

    async function sendMessage( ) {
        const messageText = messageInput.value.trim();
        if (messageText === '') return;

        addMessage(messageText, 'user');
        messageInput.value = '';

        // إضافة رسالة المستخدم إلى سجل المحادثة
        conversationHistory.push({ role: "user", content: messageText });

        const thinkingMessage = document.createElement('div');
        thinkingMessage.classList.add('message', 'bot-message');
        thinkingMessage.innerHTML = '<div class="typing-indicator"></div>'; // مؤشر كتابة
        chatBox.appendChild(thinkingMessage);
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "phi3:mini",
                    messages: conversationHistory, // إرسال سجل المحادثة كاملاً
                    stream: false
                }),
            });

            if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);

            const data = await response.json();
            const botReply = data.message.content;

            // إضافة رد البوت إلى سجل المحادثة
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
        
        // استخدام innerHTML للسماح بعرض العناصر مثل مؤشر الكتابة
        if (sender === 'bot' || sender === 'user') {
            // تحويل النص العادي إلى HTML آمن لتجنب مشاكل العرض
            const textNode = document.createTextNode(message);
            messageElement.appendChild(textNode);
        } else {
            messageElement.innerHTML = message;
        }
        
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

    // لا حاجة لإضافة الرسالة الترحيبية هنا لأنها تأتي من الـ system prompt
    // addMessage("أهلاً بك! أنا 'بونو'، مساعدك الذكي على جهازك. كيف يمكنني مساعدتك؟", 'bot');
});
