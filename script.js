from pathlib import Path
import textwrap, json, os, re

base = Path("/mnt/data/skgpt_split")
base.mkdir(exist_ok=True)

index_html = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SKGPT — AI Website Builder</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="app">
    <aside class="sidebar">
      <div class="brand">
        <div class="logo">SK</div>
        <div>
          <h1>SKGPT</h1>
          <p>Website builder + code chat</p>
        </div>
      </div>

      <div class="side-section">
        <h3>Start fast</h3>
        <div class="row" style="margin-bottom:10px">
          <button class="btn small secondary" data-template="landing">Landing page</button>
          <button class="btn small secondary" data-template="roblox">Roblox UI</button>
        </div>
        <div class="row">
          <button class="btn small secondary" data-template="anime">Anime game</button>
          <button class="btn small secondary" data-template="dashboard">Dashboard</button>
        </div>
      </div>

      <div class="side-section">
        <h3>API key</h3>
        <div class="field">
          <label for="apiKey">Google Gemini API key</label>
          <input id="apiKey" type="password" placeholder="Paste your API key" autocomplete="off" />
        </div>
        <div class="row">
          <button class="btn secondary" id="saveKeyBtn">Save key</button>
          <button class="btn secondary" id="clearKeyBtn">Clear</button>
        </div>
        <p class="mini" style="margin:10px 2px 0">Saved locally in your browser only.</p>
      </div>

      <div class="side-section">
        <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:10px">
          <h3 style="margin:0">Chats</h3>
          <div class="menu-btn">
            <button class="btn icon secondary" id="menuBtn" aria-label="Open menu">⋯</button>
            <div class="menu-popover" id="menuPopover">
              <div class="menu-item" id="newChatMenu">New chat <span>↩</span></div>
              <div class="menu-item" id="exportChatsMenu">Export chats <span>⤓</span></div>
              <div class="menu-item danger" id="clearAllMenu">Delete all chats <span>🗑</span></div>
            </div>
          </div>
        </div>
        <button class="btn" id="newChatBtn" style="width:100%;margin-bottom:12px">New chat</button>
        <div class="chat-list" id="chatList"></div>
      </div>
    </aside>

    <main class="main">
      <div class="topbar">
        <div class="info">
          <h2>AI website builder</h2>
          <span>Build websites, Roblox Lua scripts, and assistant replies in one place.</span>
        </div>
        <div class="controls">
          <div class="pill">
            <label for="modeSelect">Mode</label>
            <select id="modeSelect">
              <option value="talk">Talking</option>
              <option value="code">Writing code</option>
            </select>
          </div>
          <div class="pill">
            <label for="modelSelect">Model</label>
            <select id="modelSelect">
              <option value="sk1">SK 1.0</option>
              <option value="sk15">SK 1.5</option>
            </select>
          </div>
        </div>
      </div>

      <div class="content">
        <div class="messages" id="messages">
          <div class="welcome">
            <h3>Welcome to SKGPT</h3>
            <p>Describe a website, paste a Roblox Lua idea, or ask for a chill chat. Use <b>Writing code</b> for code output and <b>Talking</b> for normal conversation. Attach files with the plus button.</p>
          </div>
        </div>
        <div class="typing hidden" id="typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span>Thinking...</div>
      </div>

      <div class="composer">
        <div class="composer-shell">
          <div class="composer-top">
            <button class="btn icon ghost" id="attachBtn" aria-label="Attach files">＋</button>
            <input id="fileInput" type="file" class="hidden" multiple accept="image/*,.txt,.json,.lua,.js,.html,.css,.md,.pdf" />
            <textarea id="promptInput" placeholder="Type your idea here...
Example: Build a modern landing page for an anime game." ></textarea>
            <button class="btn send-btn" id="sendBtn">Send</button>
          </div>

          <div class="composer-actions">
            <button class="btn secondary small" id="modelDropBtn">Select model / quality</button>
            <button class="btn secondary small" id="clearFilesBtn">Clear files</button>
            <span class="status" id="statusText">Ready</span>
          </div>

          <div class="quality-box" id="qualityBox">
            <div class="pill">
              <label for="qualitySelect">SK 1.5 quality</label>
              <select id="qualitySelect">
                <option value="Low">Low</option>
                <option value="Medium" selected>Medium</option>
                <option value="High">High</option>
                <option value="Max">Max</option>
              </select>
            </div>
            <div class="pill switch">
              <input id="deepThinking" type="checkbox" />
              <label for="deepThinking">Deep thinking</label>
            </div>
          </div>

          <div id="attachedFiles" class="files"></div>
        </div>
      </div>
    </main>
  </div>

  <script src="script.js"></script>
</body>
</html>
"""

style_css = r""":root{
  --bg:#0b1020;
  --panel:#11182f;
  --panel-2:#151f3b;
  --soft:#1c2748;
  --text:#ecf2ff;
  --muted:#9ab0de;
  --accent:#6ea8ff;
  --accent-2:#8b5cf6;
  --good:#34d399;
  --danger:#fb7185;
  --warning:#fbbf24;
  --border:rgba(255,255,255,.08);
  --shadow:0 20px 50px rgba(0,0,0,.35);
  --radius:22px;
  --radius-sm:16px;
  --code:#0b1224;
  --code-border:#223255;
  --chip:#1c2a4b;
}
*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0;
  font-family:Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  background:
    radial-gradient(circle at top left, rgba(110,168,255,.16), transparent 28%),
    radial-gradient(circle at top right, rgba(139,92,246,.14), transparent 25%),
    linear-gradient(180deg, #070a14 0%, #0b1020 100%);
  color:var(--text);
  overflow:hidden;
}
.app{display:grid;grid-template-columns:320px 1fr;height:100vh;gap:16px;padding:16px}
.sidebar,.main{background:rgba(17,24,47,.86);backdrop-filter:blur(18px);border:1px solid var(--border);box-shadow:var(--shadow)}
.sidebar{border-radius:28px;padding:16px;display:flex;flex-direction:column;min-width:280px}
.brand{display:flex;align-items:center;gap:12px;padding:6px 4px 14px}
.logo{
  width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,var(--accent),var(--accent-2));
  display:grid;place-items:center;font-weight:900;color:white;box-shadow:0 10px 25px rgba(110,168,255,.35)
}
.brand h1{margin:0;font-size:20px;line-height:1}
.brand p{margin:4px 0 0;color:var(--muted);font-size:12px}
.side-section{background:rgba(255,255,255,.02);border:1px solid var(--border);border-radius:22px;padding:14px;margin-top:12px}
.side-section h3{margin:0 0 10px;font-size:13px;color:#cfdcff;letter-spacing:.03em;text-transform:uppercase}
.field{display:flex;flex-direction:column;gap:8px;margin-bottom:12px}
.field label{font-size:12px;color:var(--muted)}
input,select,textarea,button{
  font:inherit;color:inherit
}
input,select,textarea{
  width:100%;background:var(--panel-2);border:1px solid var(--border);border-radius:16px;padding:12px 14px;outline:none;transition:.2s ease;
}
textarea{resize:none;min-height:56px;max-height:180px}
input:focus,select:focus,textarea:focus{border-color:rgba(110,168,255,.55);box-shadow:0 0 0 4px rgba(110,168,255,.12)}
.row{display:flex;gap:10px;align-items:center}
.row > *{flex:1}
.btn{
  border:1px solid var(--border);background:linear-gradient(180deg, rgba(110,168,255,.18), rgba(110,168,255,.08));
  padding:12px 14px;border-radius:16px;cursor:pointer;transition:.18s ease;display:inline-flex;align-items:center;justify-content:center;gap:8px;
}
.btn:hover{transform:translateY(-1px);border-color:rgba(110,168,255,.35)}
.btn.secondary{background:rgba(255,255,255,.04)}
.btn.danger{background:rgba(251,113,133,.12)}
.btn.small{padding:8px 10px;border-radius:12px;font-size:12px}
.btn.icon{width:42px;height:42px;padding:0}
.chat-list{display:flex;flex-direction:column;gap:8px;max-height:calc(100vh - 450px);overflow:auto;padding-right:4px}
.chat-item{
  background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:18px;padding:12px;cursor:pointer;display:flex;align-items:flex-start;gap:10px;justify-content:space-between;transition:.18s ease
}
.chat-item:hover{background:rgba(255,255,255,.05)}
.chat-item.active{border-color:rgba(110,168,255,.55);background:rgba(110,168,255,.12)}
.chat-meta{min-width:0;flex:1}
.chat-title{font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chat-sub{font-size:12px;color:var(--muted);margin-top:4px}
.trash{border:none;background:transparent;color:#ff90a3;cursor:pointer;padding:4px;border-radius:10px}
.trash:hover{background:rgba(251,113,133,.12)}

.main{border-radius:28px;display:flex;flex-direction:column;overflow:hidden;min-width:0}
.topbar{padding:16px 18px;border-bottom:1px solid var(--border);display:flex;gap:12px;align-items:center;justify-content:space-between;background:rgba(255,255,255,.03)}
.topbar .info{display:flex;flex-direction:column;gap:4px}
.topbar h2{margin:0;font-size:18px}
.topbar span{color:var(--muted);font-size:12px}
.controls{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}
.pill{background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:999px;padding:8px 12px;display:inline-flex;align-items:center;gap:8px}
.pill label{font-size:12px;color:var(--muted)}
.pill select,.pill input[type="checkbox"]{width:auto}
.pill select{padding:8px 10px;border-radius:999px}
.content{flex:1;display:flex;flex-direction:column;min-height:0}
.messages{flex:1;overflow:auto;padding:20px;display:flex;flex-direction:column;gap:14px}
.welcome{
  border:1px solid var(--border);border-radius:26px;padding:20px;background:linear-gradient(180deg, rgba(110,168,255,.08), rgba(139,92,246,.06));
  margin-bottom:6px
}
.welcome h3{margin:0 0 8px;font-size:22px}
.welcome p{margin:0;color:var(--muted);line-height:1.6}
.msg{display:flex;gap:12px;align-items:flex-start;max-width:100%}
.msg.user{justify-content:flex-end}
.avatar{
  width:36px;height:36px;border-radius:14px;display:grid;place-items:center;flex:0 0 auto;font-weight:800;background:var(--soft);border:1px solid var(--border)
}
.msg.user .avatar{background:linear-gradient(135deg,rgba(110,168,255,.35),rgba(139,92,246,.35))}
.bubble{
  max-width:min(900px, calc(100vw - 100px));
  background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:22px;padding:14px 16px;line-height:1.65;white-space:pre-wrap;word-break:break-word
}
.msg.user .bubble{background:linear-gradient(180deg, rgba(110,168,255,.16), rgba(110,168,255,.08));border-color:rgba(110,168,255,.22)}
.bubble h4{margin:10px 0 6px;font-size:14px}
.bubble p{margin:0 0 10px}
.bubble code{background:rgba(0,0,0,.3);padding:2px 6px;border-radius:8px}
.files{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.file-chip{
  display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.05);border:1px solid var(--border);padding:8px 10px;border-radius:999px;font-size:12px;color:var(--muted)
}
.composer{padding:16px 18px;border-top:1px solid var(--border);background:rgba(255,255,255,.03)}
.composer-shell{background:rgba(10,15,30,.75);border:1px solid var(--border);border-radius:26px;padding:14px;display:flex;flex-direction:column;gap:12px}
.composer-top{display:flex;gap:10px;align-items:flex-end}
.composer-top textarea{flex:1;min-height:60px;border-radius:20px}
.composer-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.ghost{border:1px dashed rgba(154,176,222,.35);background:transparent}
.code-panel{
  margin-top:12px;border:1px solid var(--code-border);border-radius:22px;background:var(--code);overflow:hidden
}
.code-header{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.07)}
.code-header .left{display:flex;align-items:center;gap:10px;min-width:0}
.badge{font-size:11px;padding:5px 8px;border-radius:999px;background:rgba(110,168,255,.12);color:#cfe0ff;border:1px solid rgba(110,168,255,.2)}
.code-title{font-size:13px;color:#dce7ff;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.code-actions{display:flex;gap:8px;align-items:center}
pre{
  margin:0;padding:14px 16px;white-space:pre-wrap;word-break:break-word;overflow:auto;max-height:280px;font-size:13px;line-height:1.55;color:#e9f1ff
}
pre.collapsed{max-height:150px;position:relative}
.fade{
  pointer-events:none;position:absolute;left:0;right:0;bottom:0;height:56px;background:linear-gradient(180deg, rgba(11,18,36,0), rgba(11,18,36,1));
}
.typing{display:flex;align-items:center;gap:6px;color:var(--muted);font-size:12px;padding:0 20px 14px}
.dot{width:8px;height:8px;border-radius:50%;background:var(--accent);animation:b 1.2s infinite ease-in-out}
.dot:nth-child(2){animation-delay:.15s}.dot:nth-child(3){animation-delay:.3s}
@keyframes b{0%,80%,100%{transform:translateY(0);opacity:.35}40%{transform:translateY(-4px);opacity:1}}
.hidden{display:none!important}
.mini{font-size:11px;color:var(--muted)}
.quality-box{display:none;flex-wrap:wrap;gap:10px;margin-top:10px}
.quality-box.show{display:flex}
.quality-box .pill{padding:8px 10px}
.menu-btn{position:relative}
.menu-popover{
  position:absolute;right:0;top:52px;width:260px;background:var(--panel);border:1px solid var(--border);border-radius:18px;box-shadow:var(--shadow);padding:10px;display:none;z-index:12
}
.menu-popover.show{display:block}
.menu-popover .menu-item{display:flex;justify-content:space-between;gap:8px;align-items:center;padding:11px 12px;border-radius:14px;cursor:pointer;color:var(--text)}
.menu-popover .menu-item:hover{background:rgba(255,255,255,.05)}
.menu-popover .menu-item.danger{color:#ff9cad}
.status{font-size:12px;color:var(--muted)}
.switch{display:flex;align-items:center;gap:8px}
.switch input{width:18px;height:18px}
.send-btn{min-width:110px}
@media (max-width: 1000px){
  body{overflow:auto}
  .app{grid-template-columns:1fr;height:auto;min-height:100vh}
  .sidebar{order:2}
  .main{order:1;min-height:70vh}
  .bubble{max-width:100%}
}
"""

script_js = r"""const LS_KEY = 'skgpt-chats-v1';
const LS_ACTIVE = 'skgpt-active-chat-v1';
const LS_API = 'skgpt-api-key-v1';
const state = {
  chats: [],
  activeId: null,
  attachments: [],
  isTyping: false,
};

const $ = (id) => document.getElementById(id);
const chatList = $('chatList');
const messages = $('messages');
const typing = $('typing');
const promptInput = $('promptInput');
const apiKey = $('apiKey');
const modeSelect = $('modeSelect');
const modelSelect = $('modelSelect');
const qualityBox = $('qualityBox');
const qualitySelect = $('qualitySelect');
const deepThinking = $('deepThinking');
const attachedFiles = $('attachedFiles');
const fileInput = $('fileInput');
const statusText = $('statusText');

apiKey.value = localStorage.getItem(LS_API) || '';

function saveChats() {
  localStorage.setItem(LS_KEY, JSON.stringify(state.chats));
  localStorage.setItem(LS_ACTIVE, state.activeId || '');
}

function loadChats() {
  try {
    state.chats = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    state.chats = [];
  }
  state.activeId = localStorage.getItem(LS_ACTIVE) || null;
  if (!state.chats.length) newChat(true);
  if (!state.activeId || !state.chats.some(c => c.id === state.activeId)) state.activeId = state.chats[0].id;
  renderChats();
  renderActiveChat();
}

function uid() { return 'chat-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

function newChat(silent=false) {
  const now = new Date();
  const chat = {
    id: uid(),
    title: 'New chat',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    messages: []
  };
  state.chats.unshift(chat);
  state.activeId = chat.id;
  saveChats();
  renderChats();
  renderActiveChat();
  if (!silent) setStatus('New chat created');
}

function getActiveChat() { return state.chats.find(c => c.id === state.activeId); }

function renderChats() {
  chatList.innerHTML = '';
  state.chats.forEach(chat => {
    const div = document.createElement('div');
    div.className = 'chat-item' + (chat.id === state.activeId ? ' active' : '');
    div.innerHTML = `
      <div class="chat-meta">
        <div class="chat-title">${escapeHtml(chat.title || 'New chat')}</div>
        <div class="chat-sub">${chat.messages.length} message${chat.messages.length === 1 ? '' : 's'}</div>
      </div>
      <button class="trash" title="Delete chat">🗑</button>
    `;
    div.addEventListener('click', (e) => {
      if (e.target.closest('.trash')) {
        deleteChat(chat.id);
        return;
      }
      state.activeId = chat.id;
      saveChats();
      renderChats();
      renderActiveChat();
    });
    chatList.appendChild(div);
  });
}

function deleteChat(id) {
  state.chats = state.chats.filter(c => c.id !== id);
  if (!state.chats.length) {
    newChat(true);
  } else if (state.activeId === id) {
    state.activeId = state.chats[0].id;
  }
  saveChats();
  renderChats();
  renderActiveChat();
  setStatus('Chat deleted');
}

function clearAllChats() {
  if (!confirm('Delete all chats?')) return;
  state.chats = [];
  newChat(true);
  saveChats();
  renderChats();
  renderActiveChat();
  setStatus('All chats deleted');
}

function renderActiveChat() {
  const chat = getActiveChat();
  messages.innerHTML = '';
  const welcome = document.createElement('div');
  welcome.className = 'welcome';
  welcome.innerHTML = `
    <h3>${escapeHtml(chat.title || 'New chat')}</h3>
    <p>Mode: <b>${modeSelect.value === 'talk' ? 'Talking' : 'Writing code'}</b> · Model: <b>${modelLabel()}</b>${modelSelect.value === 'sk15' ? ' · Quality: <b>' + qualitySelect.value + '</b>' : ''}</p>
  `;
  messages.appendChild(welcome);
  chat.messages.forEach((m, idx) => renderMessage(m, idx));
  scrollToBottom();
}

function renderMessage(message, index) {
  const wrap = document.createElement('div');
  wrap.className = 'msg ' + message.role;
  const isUser = message.role === 'user';
  const avatar = isUser ? 'You' : 'SK';
  const body = document.createElement('div');
  body.className = 'bubble';

  let html = escapeHtml(message.text || '');
  if (!isUser) html = formatAssistantText(message.text || '');
  body.innerHTML = html;

  if (message.files && message.files.length) {
    const files = document.createElement('div');
    files.className = 'files';
    message.files.forEach(f => {
      const chip = document.createElement('div');
      chip.className = 'file-chip';
      chip.textContent = `${f.name} · ${prettySize(f.size)}`;
      files.appendChild(chip);
    });
    body.appendChild(files);
  }

  if (message.codeBlocks && message.codeBlocks.length) {
    message.codeBlocks.forEach((block, i) => body.appendChild(createCodePanel(block, i)));
  }

  const avatarEl = document.createElement('div');
  avatarEl.className = 'avatar';
  avatarEl.textContent = avatar;

  if (isUser) {
    wrap.appendChild(body);
    wrap.appendChild(avatarEl);
  } else {
    wrap.appendChild(avatarEl);
    wrap.appendChild(body);
  }
  messages.appendChild(wrap);
  if (index === (getActiveChat().messages.length - 1)) scrollToBottom();
}

function createCodePanel(block, index) {
  const panel = document.createElement('div');
  panel.className = 'code-panel';
  const isLong = (block.code || '').length > 700;
  const isLua = ['lua', 'luau'].includes((block.language || '').toLowerCase()) || /local script|localscript|serverscript|roblox/i.test(block.code || '');
  panel.innerHTML = `
    <div class="code-header">
      <div class="left">
        <span class="badge">${escapeHtml(block.language || 'code')}</span>
        <div class="code-title">${escapeHtml(block.title || (isLua ? 'Roblox Lua script' : 'Copy code'))}</div>
      </div>
      <div class="code-actions">
        <button class="btn small secondary copy-code-btn" title="Copy code">⧉</button>
        <button class="btn small secondary toggle-code-btn">${isLong ? 'Expand' : 'Raw'}</button>
      </div>
    </div>
    <div style="position:relative">
      <pre class="${isLong ? 'collapsed' : ''}"><code>${escapeHtml(block.preview || block.code || '')}</code></pre>
      ${isLong ? '<div class="fade"></div>' : ''}
    </div>
  `;
  const pre = panel.querySelector('pre');
  const codeEl = panel.querySelector('code');
  const codeText = block.code || '';
  const copyBtn = panel.querySelector('.copy-code-btn');
  const toggleBtn = panel.querySelector('.toggle-code-btn');
  copyBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(codeText);
    copyBtn.textContent = '✓';
    setTimeout(() => copyBtn.textContent = '⧉', 900);
  });
  toggleBtn.addEventListener('click', () => {
    const collapsed = pre.classList.toggle('collapsed');
    const fade = panel.querySelector('.fade');
    if (fade) fade.classList.toggle('hidden', !collapsed);
    codeEl.textContent = collapsed ? (block.preview || codeText) : codeText;
    toggleBtn.textContent = collapsed ? 'Expand' : 'Collapse';
  });
  return panel;
}

function formatAssistantText(text) {
  const codeFenceRegex = /```([\w-]*)\n([\s\S]*?)```/g;
  let html = '';
  let last = 0;
  let m;
  const blocks = [];
  while ((m = codeFenceRegex.exec(text)) !== null) {
    const before = text.slice(last, m.index);
    html += escapeHtml(before).replace(/\n/g, '<br>');
    const lang = m[1] || 'code';
    const code = m[2].trimEnd();
    blocks.push({ language: lang, code, preview: buildPreview(code), title: ['lua', 'luau'].includes(lang.toLowerCase()) ? 'Roblox Lua script' : 'Code result' });
    html += `__CODE_BLOCK_${blocks.length - 1}__`;
    last = m.index + m[0].length;
  }
  html += escapeHtml(text.slice(last)).replace(/\n/g, '<br>');
  blocks.forEach((block, i) => {
    html = html.replace(`__CODE_BLOCK_${i}__`, '<div class="code-anchor"></div>');
  });
  return html;
}

function buildPreview(code) {
  const lines = code.split(/\r?\n/);
  if (lines.length <= 14) return code;
  return lines.slice(0, 14).join('\n') + '\n\n...';
}

function prettySize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function modelLabel() {
  return modelSelect.value === 'sk1' ? 'SK 1.0' : 'SK 1.5';
}

function setStatus(text) { statusText.textContent = text; }

function scrollToBottom() { messages.scrollTop = messages.scrollHeight; }

function gatherFileMeta() {
  return state.attachments.map(f => ({ name: f.name, size: f.size, type: f.type }));
}

function renderFiles() {
  attachedFiles.innerHTML = '';
  state.attachments.forEach((f, idx) => {
    const chip = document.createElement('div');
    chip.className = 'file-chip';
    chip.innerHTML = `📎 ${escapeHtml(f.name)} <button class="trash" title="Remove">✕</button>`;
    chip.querySelector('button').addEventListener('click', () => {
      state.attachments.splice(idx, 1);
      renderFiles();
    });
    attachedFiles.appendChild(chip);
  });
  $('clearFilesBtn').disabled = !state.attachments.length;
}

function detectCodeIntent(text) {
  const t = text.toLowerCase();
  return /lua|luau|roblox|script|localscript|serverscript|html|css|javascript|js|code|program|build/.test(t) || modeSelect.value === 'code';
}

function buildPrompt(userText) {
  const isCode = detectCodeIntent(userText);
  const mode = modeSelect.value;
  const quality = modelSelect.value === 'sk15' ? qualitySelect.value : 'Normal';
  const deep = deepThinking.checked ? 'enabled' : 'disabled';
  const attachments = state.attachments.length ? `\nAttachments: ${state.attachments.map(f => `${f.name} (${f.type || 'file'})`).join(', ')}` : '';
  const system = isCode
    ? `You are SKGPT, a premium code assistant for Roblox Studio and web development. Return high-quality, clean, practical code. For Roblox requests, use Lua/Luau. If the user asks for a real effect or active trigger, make it actually work inside the game engine with proper events and scripts. Always separate LocalScript vs Script when relevant. Put the final code inside a single fenced block if code is needed, plus short setup notes outside the block. Do not include unrelated chat fluff.`
    : `You are SKGPT, a chill, helpful assistant. Talk naturally and help with website planning, ideas, or general questions. Do not output code unless the user explicitly asks for code.`;
  const uiContext = `\n\nUI settings:\n- Mode: ${mode}\n- Model: ${modelLabel()}${modelSelect.value === 'sk15' ? `\n- Quality: ${quality}\n- Deep thinking: ${deep}` : ''}${attachments}`;
  return `${system}${uiContext}\n\nUser request: ${userText}`;
}

function titleFromText(text) {
  const clean = text.trim().replace(/\s+/g, ' ');
  if (!clean) return 'New chat';
  return clean.length > 32 ? clean.slice(0, 32) + '…' : clean;
}

function extractCodeBlocks(text) {
  const regex = /```([\w-]*)\n([\s\S]*?)```/g;
  const blocks = [];
  let m;
  while ((m = regex.exec(text)) !== null) {
    const lang = (m[1] || '').toLowerCase();
    const code = m[2].trim();
    blocks.push({
      language: lang || 'code',
      code,
      preview: buildPreview(code),
      title: lang === 'lua' || lang === 'luau' ? 'Roblox Lua script' : 'Code result'
    });
  }
  return blocks;
}

async function sendMessage() {
  const text = promptInput.value.trim();
  if (!text && !state.attachments.length) return;
  const chat = getActiveChat();
  if (!chat) return;

  const userMsg = { role: 'user', text, files: gatherFileMeta(), createdAt: new Date().toISOString() };
  chat.messages.push(userMsg);
  chat.title = chat.messages.length === 1 ? titleFromText(text || 'Attached files') : chat.title;
  chat.updatedAt = new Date().toISOString();
  saveChats();
  renderChats();
  renderActiveChat();
  promptInput.value = '';
  const filesCopy = [...state.attachments];
  state.attachments = [];
  renderFiles();
  setStatus('Thinking...');
  typing.classList.remove('hidden');
  scrollToBottom();

  const api = apiKey.value.trim();
  if (!api) {
    typing.classList.add('hidden');
    const reply = localDemoReply(text);
    appendAssistantReply(reply);
    setStatus('Demo reply shown. Add API key for live AI.');
    return;
  }

  localStorage.setItem(LS_API, api);
  const model = modelSelect.value === 'sk1' ? 'gemini-2.5-flash-lite' : 'gemini-2.5-pro';
  const prompt = buildPrompt(text || 'Please review the uploaded files and answer accordingly.');

  try {
    const payload = {
      model,
      contents: [
        { role: 'user', parts: [{ text: prompt }] }
      ]
    };

    if (filesCopy.length) {
      const fileParts = [];
      for (const f of filesCopy) {
        const part = await fileToPart(f);
        if (part) fileParts.push(part);
      }
      if (fileParts.length) payload.contents[0].parts.push(...fileParts);
    }

    const quality = modelSelect.value === 'sk15' ? qualitySelect.value : 'Medium';
    payload.generationConfig = {
      temperature: quality === 'Low' ? 0.3 : quality === 'Medium' ? 0.55 : quality === 'High' ? 0.8 : 1,
      topP: quality === 'Max' ? 0.98 : 0.9,
      maxOutputTokens: quality === 'Max' ? 8192 : quality === 'High' ? 6144 : 4096
    };
    payload.safetySettings = [];

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(api)}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || 'Request failed');
    const replyText = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || 'No response returned.';
    appendAssistantReply(replyText);
    setStatus('Done');
  } catch (err) {
    appendAssistantReply(`Sorry, I could not reach the AI right now.\n\nError: ${err.message}`);
    setStatus('Error');
  } finally {
    typing.classList.add('hidden');
  }
}

function appendAssistantReply(text) {
  const chat = getActiveChat();
  const blocks = extractCodeBlocks(text);
  const msg = { role: 'assistant', text, codeBlocks: blocks, createdAt: new Date().toISOString() };
  chat.messages.push(msg);
  if (chat.title === 'New chat' && chat.messages.length > 1) chat.title = titleFromText(chat.messages.find(m => m.role === 'user')?.text || 'SKGPT');
  chat.updatedAt = new Date().toISOString();
  saveChats();
  renderChats();
  renderActiveChat();
  scrollToBottom();
}

function localDemoReply(text) {
  const isCode = detectCodeIntent(text);
  const wantsRoblox = /roblox|lua|luau|localscript|script/i.test(text);
  const wantsWeb = /html|css|javascript|website|landing page|dashboard|builder/i.test(text);
  if (!isCode) {
    return `I am ready to help with that.\n\nTell me the website style, sections, colors, and any special buttons or animations you want, and I will shape it into a polished layout.\n\nIf you mention Roblox or Lua, I will switch into code mode and return clean scripts.`;
  }
  if (wantsRoblox) {
    return `Here is a clean Roblox example:\n\n\`\`\`lua\n-- Simple active touch trigger\nlocal part = script.Parent\nlocal debounce = false\n\npart.Touched:Connect(function(hit)\n\tlocal character = hit.Parent\n\tlocal humanoid = character and character:FindFirstChildOfClass('Humanoid')\n\tif not humanoid or debounce then return end\n\tdebounce = true\n\thumanoid.WalkSpeed = humanoid.WalkSpeed * 2\n\ttask.delay(1, function()\n\t\tif humanoid and humanoid.Parent then\n\t\t\thumanoid.WalkSpeed = math.max(humanoid.WalkSpeed / 2, 16)\n\t\tend\n\t\tdebounce = false\n\tend)\nend)\n\`\`\`\n\nThis is set up as an active in-game trigger. If you need separate LocalScript and Script versions, I can structure both.`;
  }
  if (wantsWeb) {
    return `Here is a starter website structure:\n\n\`\`\`html\n<section class="hero">\n  <div class="hero-inner">\n    <h1>SKGPT Builder</h1>\n    <p>Describe your website and generate a clean layout fast.</p>\n  </div>\n</section>\n\`\`\`\n\nI can also turn this into a full page with sidebar, chat panel, template cards, and deploy-ready structure.`;
  }
  return `Here is a simple code-ready response.\n\n\`\`\`js\nconsole.log('SKGPT is ready');\n\`\`\`\n`;
}

async function fileToPart(file) {
  try {
    if (file.type.startsWith('image/')) {
      const dataUrl = await readFileAsDataURL(file);
      const base64 = dataUrl.split(',')[1];
      return { inline_data: { mime_type: file.type, data: base64 } };
    }
    const text = await file.text();
    return { text: `Attached file ${file.name}:\n${text.slice(0, 12000)}` };
  } catch {
    return null;
  }
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

$('saveKeyBtn').addEventListener('click', () => {
  localStorage.setItem(LS_API, apiKey.value.trim());
  setStatus('API key saved');
});
$('clearKeyBtn').addEventListener('click', () => {
  apiKey.value = '';
  localStorage.removeItem(LS_API);
  setStatus('API key cleared');
});
$('newChatBtn').addEventListener('click', () => newChat());
$('newChatMenu').addEventListener('click', () => { newChat(); hideMenu(); });
$('exportChatsMenu').addEventListener('click', () => { hideMenu(); exportChats(); });
$('clearAllMenu').addEventListener('click', () => { hideMenu(); clearAllChats(); });
$('sendBtn').addEventListener('click', sendMessage);
promptInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
$('attachBtn').addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
  state.attachments.push(...Array.from(fileInput.files || []));
  renderFiles();
  fileInput.value = '';
  setStatus(state.attachments.length + ' file(s) attached');
});
$('clearFilesBtn').addEventListener('click', () => {
  state.attachments = [];
  renderFiles();
  setStatus('Files cleared');
});
$('modelDropBtn').addEventListener('click', () => {
  qualityBox.classList.toggle('show');
});
modelSelect.addEventListener('change', () => {
  qualityBox.classList.toggle('show', modelSelect.value === 'sk15');
  renderActiveChat();
  setStatus(modelLabel() + ' selected');
});
modeSelect.addEventListener('change', () => {
  renderActiveChat();
  setStatus(modeSelect.value === 'talk' ? 'Talking mode' : 'Writing code mode');
});
qualitySelect.addEventListener('change', () => {
  renderActiveChat();
  setStatus('Quality: ' + qualitySelect.value);
});
deepThinking.addEventListener('change', () => setStatus('Deep thinking ' + (deepThinking.checked ? 'enabled' : 'disabled')));

$('menuBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  $('menuPopover').classList.toggle('show');
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('.menu-btn')) hideMenu();
});
function hideMenu(){ $('menuPopover').classList.remove('show'); }

function exportChats() {
  const blob = new Blob([JSON.stringify(state.chats, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'skgpt-chats.json';
  a.click();
  URL.revokeObjectURL(url);
  setStatus('Chats exported');
}

document.querySelectorAll('[data-template]').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.getAttribute('data-template');
    const templates = {
      landing: 'Build a premium landing page with a hero section, feature cards, pricing, testimonial area, and dark modern styling.',
      roblox: 'Create a Roblox Studio UI system with clean buttons, model selector, and a fully working Lua script set.',
      anime: 'Design an anime-style game website with glowing gradients, action buttons, and a cinematic feel.',
      dashboard: 'Build a modern SaaS dashboard with sidebar, top stats, cards, charts, and responsive layout.'
    };
    promptInput.value = templates[key] || '';
    promptInput.focus();
  });
});

apiKey.addEventListener('input', () => localStorage.setItem(LS_API, apiKey.value));
window.addEventListener('beforeunload', saveChats);

loadChats();
renderFiles();
qualityBox.classList.toggle('show', modelSelect.value === 'sk15');
setStatus('Ready');
"""

(base / "index.html").write_text(index_html, encoding="utf-8")
(base / "style.css").write_text(style_css, encoding="utf-8")
(base / "script.js").write_text(script_js, encoding="utf-8")

print("Created files:")
for p in [base/"index.html", base/"style.css", base/"script.js"]:
    print(p, p.stat().st_size)
