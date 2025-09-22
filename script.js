document.addEventListener('DOMContentLoaded', () => {
    // --- تعريف العناصر الأساسية ---
    const chatBox = document.getElementById('chat-box');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const newChatButton = document.getElementById('new-chat-button');
    
    const apiEndpoint = 'http://localhost:3000/chat';

    // --- التعليمات الأولية (الشخصية ) ---
    const systemPrompt = { 
        role: "system", 
        content: "أنت مساعد ذكي ومرح اسمك 'بونو'. تحدث باللغة العربية بأسلوب ودود وغير رسمي. يمكنك استخدام الإيموجي لإضافة لمسة من المرح على ردودك. مهمتك الأساسية هي مساعدة المستخدمين في البرمجة، ولكن لا تتردد في إلقاء دعابة بسيطة. إذا سألك أحد عن هويتك، قل 'أنا بونو، صديقك المبرمج! 😉'. عند كتابة أي كود، يجب أن تضعه دائمًا داخل ثلاثة backticks ``` متبوعة باسم اللغة، هكذا: ```javascript ...الكود هنا... ```." 
    };

    // --- ذاكرة المحادثة ---
    let conversationHistory = [systemPrompt];

    // --- بدء محادثة جديدة ---
    function startNewChat() {
        chatBox.innerHTML = '';
        conversationHistory = [systemPrompt];
        addMessage("أهلاً بك من جديد! أنا بونو، وجاهز لمساعدتك. ماذا لديك اليوم؟ 😄", 'bot');
    }

    // --- إرسال الرسالة ---
    async function sendMessage() {
        const messageText = messageInput.value.trim();
        if (messageText === '') return;

        addMessage(messageText, 'user');
        messageInput.value = '';
        conversationHistory.push({ role: "user", content: messageText });

        const thinkingMessage = addMessage('<div class="typing-indicator"></div>', 'bot-typing');

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: "llama3:8b", messages: conversationHistory, stream: false }),
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
            addMessage('عذراً، حدث خطأ فني. 🔌 تأكد من أن الخادم الوكيل (النافذة السوداء) و Ollama يعملان على جهازك.', 'bot-error');
        }
    }

    // --- إضافة الرسالة إلى الواجهة (النسخة النهائية) ---
    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');

        // رسائل المستخدم أو مؤشر الكتابة
        if (sender === 'user' || sender === 'bot-typing') {
            contentDiv.innerHTML = text;
        } 
        // رسائل البوت أو الخطأ
        else {
            // استخدام marked.js لتحويل الماركداون إلى HTML
            const htmlContent = marked.parse(text);
            contentDiv.innerHTML = htmlContent;

            // إعادة تلوين الأكواد بعد تحويل الماركداون
            contentDiv.querySelectorAll('pre code').forEach((block) => {
                const lang = Array.from(block.classList).find(c => c.startsWith('language-'));
                const wrapper = document.createElement('div');
                wrapper.className = 'code-block-wrapper';

                const uniqueId = `code-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                block.id = uniqueId;
                
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-btn';
                copyBtn.textContent = 'نسخ';
                copyBtn.setAttribute('data-clipboard-target', `#${uniqueId}`);

                block.parentElement.replaceWith(wrapper);
                wrapper.appendChild(block.parentElement);
                wrapper.appendChild(copyBtn);

                hljs.highlightElement(block);
            });
        }

        messageElement.appendChild(contentDiv);
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;

        // تفعيل النسخ
        new ClipboardJS('.copy-btn').on('success', e => {
            e.trigger.textContent = 'تم النسخ!';
            setTimeout(() => { e.trigger.textContent = 'نسخ'; }, 2000);
            e.clearSelection();
        });
        
        return messageElement; // لإعادة عنصر مؤشر الكتابة
    }

    // --- ربط الأحداث ---
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
    newChatButton.addEventListener('click', startNewChat);

    // --- بدء أول محادثة عند تحميل الصفحة ---
    startNewChat();
});
