document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    
    const apiEndpoint = 'http://localhost:3000/chat';

    let conversationHistory = [
        { 
            role: "system", 
            content: "أنت مساعد برمجي اسمك 'بونو'. ردودك يجب أن تكون باللغة العربية الفصحى. إذا سألك أي شخص 'من أنت؟' أو ما شابه، يجب أن تكون إجابتك 'أنا بونو، مساعدك البرمجي'. عند كتابة أي كود، يجب أن تضعه دائمًا داخل ثلاثة backticks ``` متبوعة باسم اللغة، هكذا: ```javascript ...الكود هنا... ```. لا تستخدم الإيموجي." 
        }
    ];

    function initializeChat( ) {
        chatBox.innerHTML = '';
        addMessage("أهلاً بك! أنا بونو، مساعدك البرمجي. كيف يمكنني مساعدتك اليوم؟", 'bot');
    }

    async function sendMessage() {
        const messageText = messageInput.value.trim();
        if (messageText === '') return;

        addMessage(messageText, 'user');
        messageInput.value = '';
        conversationHistory.push({ role: "user", content: messageText });

        const thinkingMessage = document.createElement('div');
        thinkingMessage.classList.add('message', 'bot-message');
        thinkingMessage.innerHTML = '<div><div class="typing-indicator"></div></div>';
        chatBox.appendChild(thinkingMessage);
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
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

    // ==================================================================
    // === النسخة النهائية والمبسطة من دالة addMessage ===
    // ==================================================================
    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);

        // رسائل المستخدم بسيطة ومباشرة
        if (sender === 'user') {
            const p = document.createElement('p');
            p.textContent = text;
            messageElement.appendChild(p);
        } 
        // رسائل البوت تحتاج إلى تحليل
        else {
            const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
            let lastIndex = 0;
            let match;

            while ((match = codeBlockRegex.exec(text)) !== null) {
                // إضافة النص العادي قبل الكود
                if (match.index > lastIndex) {
                    const p = document.createElement('p');
                    p.textContent = text.substring(lastIndex, match.index);
                    messageElement.appendChild(p);
                }

                const lang = match || 'plaintext';
                const code = match.trim();
                
                const wrapper = document.createElement('div');
                wrapper.className = 'code-block-wrapper';

                const pre = document.createElement('pre');
                const codeEl = document.createElement('code');
                const uniqueId = `code-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                codeEl.id = uniqueId;
                codeEl.className = `language-${lang}`;
                codeEl.textContent = code;
                
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-btn';
                copyBtn.textContent = 'نسخ';
                copyBtn.setAttribute('data-clipboard-target', `#${uniqueId}`);

                pre.appendChild(codeEl);
                wrapper.appendChild(pre);
                wrapper.appendChild(copyBtn);
                messageElement.appendChild(wrapper);

                lastIndex = codeBlockRegex.lastIndex;
            }

            // إضافة أي نص متبقي بعد آخر كتلة كود
            if (lastIndex < text.length) {
                const p = document.createElement('p');
                p.textContent = text.substring(lastIndex);
                messageElement.appendChild(p);
            }
        }

        // لا تضف عنصر رسالة فارغ
        if (messageElement.hasChildNodes()) {
            chatBox.appendChild(messageElement);
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        // تفعيل المكتبات فقط لرسائل البوت
        if (sender === 'bot') {
            hljs.highlightAll();
            const clipboard = new ClipboardJS('.copy-btn');
            clipboard.on('success', function(e) {
                e.trigger.textContent = 'تم النسخ!';
                setTimeout(() => { e.trigger.textContent = 'نسخ'; }, 2000);
                e.clearSelection();
            });
        }
    }

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

    initializeChat();
});
