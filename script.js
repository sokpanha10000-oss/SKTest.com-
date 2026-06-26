// DOM Elements
const gameGrid = document.getElementById('gameGrid');
const gameNameInput = document.getElementById('gameName');
const gameImgInput = document.getElementById('gameImg');
const addGameBtn = document.getElementById('addGameBtn');

const gameScreen = document.getElementById('gameScreen');
const currentPlayingName = document.getElementById('currentPlayingName');
const exitGameBtn = document.getElementById('exitGameBtn');

const floatingBtn = document.getElementById('floatingBtn');
const executorMenu = document.getElementById('executorMenu');
const closeMenuBtn = document.getElementById('closeMenuBtn');
const executeBtn = document.getElementById('executeBtn');
const luaInput = document.getElementById('luaInput');

// 1. Add Custom Game to Hub
addGameBtn.addEventListener('click', () => {
    const name = gameNameInput.value.trim();
    let img = gameImgInput.value.trim();

    if (!name) {
        alert("Please enter a game name!");
        return;
    }

    // Default image if blank
    if (!img) {
        img = "https://images.rbxcdn.com/9cf70da93806fb41de80537c62ee8f27.png";
    }

    // Create Game Card
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
        <img src="${img}" alt="Game Icon">
        <h4>${name}</h4>
    `;
    
    // Add Click listener to simulated launch
    card.onclick = () => launchGame(name);

    gameGrid.appendChild(card);

    // Clear Inputs
    gameNameInput.value = '';
    gameImgInput.value = '';
});

// 2. Launch Simulated Game
function launchGame(name) {
    currentPlayingName.innerText = name;
    gameScreen.classList.remove('hidden');
}

// 3. Exit Game
exitGameBtn.addEventListener('click', () => {
    gameScreen.classList.add('hidden');
    executorMenu.classList.add('hidden'); // Close menu too
    luaInput.value = ''; // Reset code area
});

// 4. Toggle Executor UI via Floating Button
floatingBtn.addEventListener('click', () => {
    executorMenu.classList.toggle('hidden');
});

closeMenuBtn.addEventListener('click', () => {
    executorMenu.classList.add('hidden');
});

// 5. Simulate Lua Execution
executeBtn.addEventListener('click', () => {
    const scriptText = luaInput.value.trim();
    
    if (!scriptText) {
        alert("Please type or paste a Lua script first!");
        return;
    }

    // Alert simulation response
    alert(`[SYSTEM] Script Executed Successfully inside the simulator!\n\nSent Context:\n${scriptText.substring(0, 100)}${scriptText.length > 100 ? '...' : ''}`);
});