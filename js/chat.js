const ChatModule = (() => {
  const STORAGE_KEY = 'mbti_earth_chat_config';

  const PROVIDERS = {
    gemini: {
      name: 'Google Gemini',
      description: 'Google\'s powerful AI. Fast & free tier available.',
      keyUrl: 'https://aistudio.google.com/apikey',
      keyLabel: 'Get free API key at aistudio.google.com',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      color: '#4285F4'
    },
    openrouter: {
      name: 'OpenRouter',
      description: 'Access many free models through one API.',
      keyUrl: 'https://openrouter.ai/keys',
      keyLabel: 'Get free API key at openrouter.ai',
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'google/gemini-2.0-flash-exp:free',
      color: '#B44AFF'
    },
    groq: {
      name: 'Groq',
      description: 'Ultra-fast inference. Generous free tier.',
      keyUrl: 'https://console.groq.com/keys',
      keyLabel: 'Get free API key at console.groq.com',
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      model: 'llama-3.3-70b-versatile',
      color: '#F55036'
    }
  };

  const SYSTEM_PROMPT = `You are "Atlas" — a witty, well-traveled personality expert who lives at the crossroads of MBTI psychology and world cultures. You have visited every country, studied every culture, and somehow also have a PhD in Jungian typology (and a minor in dad jokes).

Your personality:
- You're warm, enthusiastic, and genuinely funny — never dry or robotic
- You use emojis naturally (but not excessively) to add flavor
- You speak like a charming travel companion who also happens to be a psychology nerd
- You love playful cultural stereotypes (always lighthearted, never offensive)
- You sprinkle in fun facts, puns, and unexpected connections

Your specialties:
1. **MBTI Country Matchmaking** — You can match any MBTI type to their "soulmate country" and explain why with vivid, entertaining reasoning
2. **Guess the Country's MBTI** — You play an interactive game where you describe a country's vibe and the user guesses its type (or vice versa)
3. **MBTI Travel Roulette** — You spin the wheel and give a surprise destination recommendation based on the user's type
4. **Personality Compatibility Reports** — You compare any two countries' "personalities" like a relationship counselor
5. **Immigration & Travel Tips** — You give practical cultural advice flavored with personality insights
6. **Cultural Deep Dives** — You share fascinating cultural facts and explain them through an MBTI lens

Formatting rules:
- Use **bold** for emphasis and key terms
- Use bullet points (- item) for lists
- Keep paragraphs short and punchy
- Break up long responses with headers and spacing

When the conversation starts, introduce yourself briefly and invite the user to try one of your specialties. Keep your first message concise and exciting — save the depth for when they ask!

Remember: You're not just an AI assistant — you're Atlas, the world's most entertaining personality-culture expert. Make every interaction feel like a conversation at the coolest bar in the world.`;

  const WELCOME_MESSAGE = `Hey there, fellow explorer! I'm **Atlas** — your personal guide to the wild world where MBTI meets global culture.

I can match your personality to countries, play guessing games, give travel tips through a personality lens, and much more. What sounds fun?`;

  const SUGGESTION_CHIPS = [
    { label: '🎲 Which country matches my personality?', text: 'Which country is the best match for my MBTI personality? Ask me my type!' },
    { label: '🌍 Guess the Country\'s MBTI', text: 'Let\'s play Guess the Country\'s MBTI! Give me a country to type.' },
    { label: '🎰 MBTI Travel Roulette', text: 'Spin the MBTI Travel Roulette for me! I\'m an ENFP.' },
    { label: '⚔️ Country vs Country', text: 'Compare Japan and Brazil as if they were people with MBTI types — who would they be and how would they get along?' },
    { label: '🧳 Immigration Tips', text: 'I\'m an INTJ thinking about moving abroad. Which cultures would suit my personality best?' }
  ];

  let chatWindow, messagesEl, inputEl, fab;
  let conversationHistory = [];
  let config = null; // { provider: string, apiKey: string }

  function init() {
    loadConfig();
    createDOM();
    bindEvents();
  }

  function loadConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) config = JSON.parse(raw);
    } catch (e) {
      config = null;
    }
  }

  function saveConfig(provider, apiKey) {
    config = { provider, apiKey };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }

  function clearConfig() {
    config = null;
    localStorage.removeItem(STORAGE_KEY);
    conversationHistory = [];
  }

  // ── DOM Creation ──────────────────────────────────────────────

  function createDOM() {
    fab = document.createElement('button');
    fab.className = 'chat-fab';
    fab.setAttribute('aria-label', 'Open AI Assistant');
    fab.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    document.body.appendChild(fab);

    chatWindow = document.createElement('div');
    chatWindow.className = 'chat-window';
    chatWindow.innerHTML = `
      <div class="chat-header">
        <span class="chat-header-title"><span class="dot"></span>Atlas — MBTI Explorer</span>
        <div class="chat-header-actions">
          <button class="chat-settings-btn" aria-label="Settings" title="Change AI provider">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
          <button class="chat-close" aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
      <div class="chat-messages"></div>
      <div class="chat-input-area">
        <input type="text" placeholder="Ask Atlas anything..." />
        <button class="chat-send" aria-label="Send">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    `;
    document.body.appendChild(chatWindow);

    messagesEl = chatWindow.querySelector('.chat-messages');
    inputEl = chatWindow.querySelector('.chat-input-area input');
  }

  function bindEvents() {
    fab.addEventListener('click', toggleChat);
    chatWindow.querySelector('.chat-close').addEventListener('click', toggleChat);
    chatWindow.querySelector('.chat-send').addEventListener('click', handleSend);
    chatWindow.querySelector('.chat-settings-btn').addEventListener('click', openSettings);
    inputEl.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.isComposing) handleSend();
    });
  }

  // ── Chat Toggle & Welcome ────────────────────────────────────

  function toggleChat() {
    const isOpen = chatWindow.classList.toggle('open');
    if (isOpen && messagesEl.children.length === 0) {
      showWelcome();
    }
    if (isOpen) inputEl.focus();
  }

  function showWelcome() {
    if (config && config.apiKey) {
      showWelcomeMessage();
    } else {
      showProviderSetup();
    }
  }

  function showWelcomeMessage() {
    appendMessage('ai', WELCOME_MESSAGE);
    showSuggestionChips();
  }

  function showSuggestionChips() {
    const container = document.createElement('div');
    container.className = 'chat-suggestions';
    SUGGESTION_CHIPS.forEach(chip => {
      const btn = document.createElement('button');
      btn.className = 'chat-chip';
      btn.textContent = chip.label;
      btn.addEventListener('click', () => {
        container.remove();
        inputEl.value = chip.text;
        handleSend();
      });
      container.appendChild(btn);
    });
    messagesEl.appendChild(container);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // ── Provider Setup Screen ────────────────────────────────────

  function showProviderSetup() {
    const wrapper = document.createElement('div');
    wrapper.className = 'chat-setup';

    const title = document.createElement('div');
    title.className = 'chat-setup-title';
    title.textContent = 'Choose your AI provider';
    wrapper.appendChild(title);

    const subtitle = document.createElement('div');
    subtitle.className = 'chat-setup-subtitle';
    subtitle.textContent = 'All providers are free! Pick one and paste your API key.';
    wrapper.appendChild(subtitle);

    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'chat-provider-cards';

    let selectedProvider = null;

    Object.entries(PROVIDERS).forEach(([key, prov]) => {
      const card = document.createElement('div');
      card.className = 'chat-provider-card';
      card.style.setProperty('--prov-color', prov.color);
      card.innerHTML = `
        <div class="chat-provider-card-name">${prov.name}</div>
        <div class="chat-provider-card-desc">${prov.description}</div>
        <a class="chat-provider-card-link" href="${prov.keyUrl}" target="_blank" rel="noopener">${prov.keyLabel}</a>
      `;
      card.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') return;
        cardsContainer.querySelectorAll('.chat-provider-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedProvider = key;
        keyInput.placeholder = `Paste your ${prov.name} API key...`;
        keyInput.focus();
      });
      cardsContainer.appendChild(card);
    });
    wrapper.appendChild(cardsContainer);

    const keyInput = document.createElement('input');
    keyInput.type = 'text';
    keyInput.className = 'chat-setup-input';
    keyInput.placeholder = 'Select a provider above first...';
    wrapper.appendChild(keyInput);

    const saveBtn = document.createElement('button');
    saveBtn.className = 'chat-setup-save';
    saveBtn.textContent = 'Save & Start Chatting';
    saveBtn.addEventListener('click', () => {
      const val = keyInput.value.trim();
      if (!selectedProvider) {
        keyInput.placeholder = 'Please select a provider first!';
        keyInput.classList.add('shake');
        setTimeout(() => keyInput.classList.remove('shake'), 500);
        return;
      }
      if (!val) {
        keyInput.placeholder = 'Please enter your API key!';
        keyInput.classList.add('shake');
        setTimeout(() => keyInput.classList.remove('shake'), 500);
        return;
      }
      saveConfig(selectedProvider, val);
      wrapper.remove();
      showWelcomeMessage();
    });
    wrapper.appendChild(saveBtn);

    messagesEl.appendChild(wrapper);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function openSettings() {
    const provName = config ? PROVIDERS[config.provider]?.name : 'None';
    messagesEl.innerHTML = '';
    conversationHistory = [];

    const wrapper = document.createElement('div');
    wrapper.className = 'chat-setup';

    if (config) {
      const current = document.createElement('div');
      current.className = 'chat-setup-subtitle';
      current.innerHTML = `Current provider: <strong>${provName}</strong>. Choose a new one or update your key.`;
      wrapper.appendChild(current);
    }

    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'chat-provider-cards';

    let selectedProvider = config?.provider || null;

    Object.entries(PROVIDERS).forEach(([key, prov]) => {
      const card = document.createElement('div');
      card.className = 'chat-provider-card' + (key === selectedProvider ? ' selected' : '');
      card.style.setProperty('--prov-color', prov.color);
      card.innerHTML = `
        <div class="chat-provider-card-name">${prov.name}</div>
        <div class="chat-provider-card-desc">${prov.description}</div>
        <a class="chat-provider-card-link" href="${prov.keyUrl}" target="_blank" rel="noopener">${prov.keyLabel}</a>
      `;
      card.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') return;
        cardsContainer.querySelectorAll('.chat-provider-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedProvider = key;
        keyInput.placeholder = `Paste your ${prov.name} API key...`;
      });
      cardsContainer.appendChild(card);
    });
    wrapper.appendChild(cardsContainer);

    const keyInput = document.createElement('input');
    keyInput.type = 'text';
    keyInput.className = 'chat-setup-input';
    keyInput.placeholder = selectedProvider ? `Paste your ${PROVIDERS[selectedProvider].name} API key...` : 'Select a provider first...';
    if (config?.apiKey) keyInput.value = config.apiKey.slice(0, 8) + '...' + config.apiKey.slice(-4);
    wrapper.appendChild(keyInput);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:8px;';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'chat-setup-save';
    saveBtn.textContent = 'Save & Restart';
    saveBtn.addEventListener('click', () => {
      let val = keyInput.value.trim();
      if (!selectedProvider) return;
      // If user didn't change the masked key, keep the old one
      if (val.includes('...') && config?.apiKey) val = config.apiKey;
      if (!val) return;
      saveConfig(selectedProvider, val);
      wrapper.remove();
      showWelcomeMessage();
    });
    btnRow.appendChild(saveBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'chat-setup-save';
    cancelBtn.style.background = 'rgba(255,255,255,0.06)';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => {
      wrapper.remove();
      showWelcomeMessage();
    });
    btnRow.appendChild(cancelBtn);

    wrapper.appendChild(btnRow);
    messagesEl.appendChild(wrapper);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // ── Message Rendering ────────────────────────────────────────

  function formatMarkdown(text) {
    // Escape HTML
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold: **text**
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic: *text*
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Process lines for bullet lists and line breaks
    const lines = html.split('\n');
    let result = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const bulletMatch = line.match(/^\s*[-*]\s+(.+)/);

      if (bulletMatch) {
        if (!inList) {
          result.push('<ul>');
          inList = true;
        }
        result.push('<li>' + bulletMatch[1] + '</li>');
      } else {
        if (inList) {
          result.push('</ul>');
          inList = false;
        }
        if (line.trim() === '') {
          result.push('<br>');
        } else {
          result.push(line + '<br>');
        }
      }
    }
    if (inList) result.push('</ul>');

    return result.join('');
  }

  function appendMessage(role, text) {
    const msg = document.createElement('div');
    msg.className = 'chat-msg ' + role;
    if (role === 'ai') {
      msg.innerHTML = formatMarkdown(text);
    } else {
      msg.textContent = text;
    }
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return msg;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'chat-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  // ── Sending Messages ─────────────────────────────────────────

  function handleSend() {
    if (!config || !config.apiKey) {
      if (messagesEl.querySelector('.chat-setup')) return;
      messagesEl.innerHTML = '';
      showProviderSetup();
      return;
    }
    sendMessage();
  }

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;

    // Remove suggestion chips if they exist
    const chips = messagesEl.querySelector('.chat-suggestions');
    if (chips) chips.remove();

    appendMessage('user', text);
    inputEl.value = '';

    // Store in universal format for history
    conversationHistory.push({ role: 'user', content: text });

    const typing = showTyping();

    try {
      const reply = await callProvider();
      typing.remove();
      appendMessage('ai', reply);
      conversationHistory.push({ role: 'assistant', content: reply });
    } catch (err) {
      typing.remove();
      const errMsg = err.message || 'Unknown error';
      if (errMsg.toLowerCase().includes('api key') || errMsg.toLowerCase().includes('auth') || errMsg.toLowerCase().includes('401') || errMsg.toLowerCase().includes('403')) {
        appendMessage('error', 'API key issue: ' + errMsg + '\nClick the gear icon to update your key.');
      } else {
        appendMessage('error', 'Oops! Something went wrong: ' + errMsg);
      }
    }
  }

  // ── API Calls ─────────────────────────────────────────────────

  async function callProvider() {
    const provider = config.provider;
    if (provider === 'gemini') {
      return callGemini();
    } else {
      return callOpenAICompatible(provider);
    }
  }

  async function callGemini() {
    // Convert universal history to Gemini format
    const geminiHistory = conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const body = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: geminiHistory
    };

    const res = await fetch(PROVIDERS.gemini.endpoint + '?key=' + config.apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.error?.message || 'Gemini API request failed (' + res.status + ')');
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    if (!candidate?.content?.parts?.[0]?.text) {
      throw new Error('No valid response from Gemini');
    }
    return candidate.content.parts[0].text;
  }

  async function callOpenAICompatible(provider) {
    const prov = PROVIDERS[provider];

    // Build messages array with system prompt + history
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory
    ];

    const body = {
      model: prov.model,
      messages,
      temperature: 0.8,
      max_tokens: 1024
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + config.apiKey
    };

    // OpenRouter wants extra headers
    if (provider === 'openrouter') {
      headers['HTTP-Referer'] = window.location.origin;
      headers['X-Title'] = 'MBTI Earth';
    }

    const res = await fetch(prov.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      const errMsg = errData?.error?.message || errData?.error || '';
      throw new Error(errMsg || `${prov.name} API request failed (${res.status})`);
    }

    const data = await res.json();
    const choice = data.choices?.[0];
    if (!choice?.message?.content) {
      throw new Error(`No valid response from ${prov.name}`);
    }
    return choice.message.content;
  }

  return { init };
})();
