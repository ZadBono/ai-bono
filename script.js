document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
        
        const p = document.createElement('p');
        p.innerText = text;
        messageElement.appendChild(p);
        
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
    }

    function handleSend() {
        const userText = userInput.value.trim();
        if (userText) {
            addMessage(userText, 'user');
            userInput.value = '';

            // !! هنا سيكون مكان الكود الذي يرسل الرسالة للذكاء الاصطناعي !!
            // حالياً، سنضيف رد وهمي للتجربة
            setTimeout(() => {
                addMessage('أنا أفكر...', 'bot');
            }, 1000);
        }
    }

    sendBtn.addEventListener('click', handleSend);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    });
});
