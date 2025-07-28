// --- NEW MODERN CHATBOT FRONTEND LOGIC ---
document.addEventListener('DOMContentLoaded', function() {
  const messagesEl = document.getElementById('chatbot-messages');
  const form = document.getElementById('chatbot-form');
  const input = document.getElementById('chatbot-input');

  // Initial welcome message
  if (!messagesEl || messagesEl.children.length === 0) {
    addMessage('Hi! I am your BlogGen AI assistant. How can I help you today?', 'bot');
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    input.value = '';
    input.style.height = 'auto';
    showTyping();
    // Send to backend
    fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    })
    .then(r => r.json())
    .then(data => {
      hideTyping();
      addMessage(data.response || 'Sorry, I encountered an error.', 'bot');
    })
    .catch(() => {
      hideTyping();
      addMessage('Sorry, I encountered an error processing your request.', 'bot');
    });
  });

  // Auto-grow textarea
  input.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  });

  function addMessage(text, sender) {
    const row = document.createElement('div');
    row.className = 'message-row ' + (sender === 'user' ? 'user' : 'bot');
    // Avatar
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    if (sender === 'user') {
      const img = document.createElement('img');
      img.src = '/static/images/user_avatar.png';
      img.alt = 'User';
      img.onerror = function() {
        avatar.innerHTML = '<i class="fas fa-user"></i>';
      };
      avatar.appendChild(img);
    } else {
      const img = document.createElement('img');
      img.src = '/static/images/bot_avatar.png';
      img.alt = 'Bot';
      img.onerror = function() {
        avatar.innerHTML = '<i class="fas fa-robot"></i>';
      };
      avatar.appendChild(img);
    }
    // Bubble
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = text.replace(/\n/g, '<br>');
    row.appendChild(avatar);
    row.appendChild(bubble);
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    hideTyping();
    const row = document.createElement('div');
    row.className = 'message-row bot';
    row.id = 'typing-indicator';
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.innerHTML = '<i class="fas fa-robot"></i>';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = '<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>';
    row.appendChild(avatar);
    row.appendChild(bubble);
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
  }

  // --- PNG Download Helper ---
  function downloadElementAsPng(element, filename) {
    html2canvas(element, { backgroundColor: null }).then(canvas => {
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }
  window.downloadPostAsPng = function(postCardId, filename) {
    const postCard = document.getElementById(postCardId);
    if (postCard) {
      downloadElementAsPng(postCard, filename);
    }
  };
});