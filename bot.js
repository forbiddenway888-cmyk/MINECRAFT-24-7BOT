const express = require('express');
const mineflayer = require('mineflayer');

// Configuration loaded from Environment Variables or directly set as fallbacks
const SERVER_IP = process.env.SERVER_IP || 'mafia_empire2026.aternos.me';
const SERVER_PORT = parseInt(process.env.SERVER_PORT || '41899', 10);
const BOT_USERNAME = process.env.BOT_USERNAME || 'StealthBot_01';

// -------------------------------------------------------------
// 1. Ultra-Lightweight Keep-Alive Web Server for Render
// -------------------------------------------------------------
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.send('Stealth keep-alive bot status: ACTIVE');
});

app.listen(PORT, () => {
    console.log(`[SYS] Keep-alive web server listening on port ${PORT}`);
});

// -------------------------------------------------------------
// 2. Math Utility: Gaussian Random Generator (Bell-Curve Delay)
// -------------------------------------------------------------
// Generates human-like delays around a mean (avg) value
function getGaussianRandom(mean, standardDeviation) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + num * standardDeviation;
}

// -------------------------------------------------------------
// 3. Core Mineflayer Bot Instantiation
// -------------------------------------------------------------
function initBot() {
    console.log(`[BOT] Attempting connection to ${SERVER_IP}:${SERVER_PORT}...`);

    const bot = mineflayer.createBot({
        host: SERVER_IP,
        port: SERVER_PORT,
        username: BOT_USERNAME,
        version: '1.21.1', // <--- EXPLICITLY SET YOUR VERSION HERE
        // CRITICAL MEMORY & BANDWIDTH SAVINGS:
        physicsEnabled: false, // Disables local physics engine calculation
        viewDistance: 'tiny'   // Minimizes world chunk caching
    });

    // -------------------------------------------------------------
// God-Tier Human Emulation Engine
// -------------------------------------------------------------
function scheduleNextStealthAction() {
    if (!bot || !bot.entity) return;

    // Pick a random human action weight (0.0 to 1.0)
    const actionRoll = Math.random();

    if (actionRoll < 0.35) {
        // 1. Human-like Head Turn (Stepped interpolation)
        const targetYaw = (Math.random() * Math.PI * 2) - Math.PI;
        const targetPitch = (Math.random() * Math.PI / 3) - (Math.PI / 6);
        bot.look(targetYaw, targetPitch, false); // false = smooth turn, not snap

    } else if (actionRoll < 0.55) {
        // 2. Fidget Hotbar Slot
        const randomSlot = Math.floor(Math.random() * 9);
        bot.setQuickBarSlot(randomSlot);

    } else if (actionRoll < 0.70) {
        // 3. Air Punch / Arm Swing
        bot.swingArm('mainhand');

    } else if (actionRoll < 0.85) {
        // 4. Crouch/Uncrouch Fidget
        bot.setControlState('sneak', true);
        setTimeout(() => {
            if (bot) bot.setControlState('sneak', false);
        }, getGaussianRandom(600, 200));

    } else {
        // 5. Micro-Movement Pulse (W/A/S/D tap)
        const directions = ['forward', 'back', 'left', 'right'];
        const chosenDir = directions[Math.floor(Math.random() * directions.length)];
        
        bot.setControlState(chosenDir, true);
        setTimeout(() => {
            if (bot) bot.setControlState(chosenDir, false);
        }, getGaussianRandom(250, 80)); // 250ms tap mimics key press
    }

    // Bell-curve distribution delay between actions (15s avg, 5s std dev)
    let nextDelay = getGaussianRandom(15000, 5000);
    if (nextDelay < 5000) nextDelay = 5000; // Hard clamp minimum

    setTimeout(scheduleNextStealthAction, nextDelay);
}

    // -------------------------------------------------------------
    // 5. Event Handlers & Auto-Reconnection Protocol
    // -------------------------------------------------------------
    bot.on('login', () => {
        console.log(`[+] Successfully authenticated as ${bot.username}`);
    });

    bot.on('spawn', () => {
        console.log('[+] Bot spawned into the world. Activating stealth engine...');
        // Delay initial action slightly to allow world packet settlement
        setTimeout(scheduleNextStealthAction, 5000);
    });

    // -------------------------------------------------------------
    // Auto-Login Handler for Auth Plugins / Cracked Servers
    // -------------------------------------------------------------
    bot.on('message', (message) => {
        const text = message.toString().toLowerCase();
        
        // If the server asks to register (first time joining)
        if (text.includes('/register')) {
            console.log('[!] Server requested registration. Sending password...');
            bot.chat('/register YourSecretPassword123 YourSecretPassword123'); 
        }
        
        // If the server asks to login (subsequent joins)
        if (text.includes('/login')) {
            console.log('[!] Server requested login. Sending password...');
            bot.chat('/login YourSecretPassword123'); 
        }
    });
    

    bot.on('error', (err) => {
        console.error(`[-] Protocol/Network Error: ${err.message}`);
    });

    bot.on('kicked', (reason) => {
        console.log(`[!] Kicked from server. Reason: ${reason}`);
    });

    bot.on('end', () => {
        // Gaussian reconnect delay (between 20s and 45s) to avoid spam-reconnection bans
        const reconnectDelay = getGaussianRandom(30000, 5000);
        console.log(`[-] Connection terminated. Scheduling reconnect in ${(reconnectDelay / 1000).toFixed(1)}s...`);
        setTimeout(initBot, reconnectDelay);
    });

    // -------------------------------------------------------------
    // Humanized Conversational Chat Engine
    // -------------------------------------------------------------
    bot.on('chat', (username, message) => {
        // Ignore our own messages to prevent infinite loops
        if (username === bot.username) return;

        const msgLower = message.toLowerCase();

        // 1. Check if the message is directed at the bot
        // (Using a generic list of triggers so it responds naturally)
        if (msgLower.includes(bot.username.toLowerCase()) || msgLower.includes('bot') || msgLower.includes('hello')) {
            
            // 2. Chance to ignore the message (humans get distracted)
            if (Math.random() < 0.25) { 
                console.log(`[CHAT] Ignored message from ${username}`);
                return;
            }

            // 3. Select a natural, slightly flawed response
            const responses = [
                'yeah?',
                'sup',
                'im here',
                'lagging a bit tbh',
                'what',
                'busy atm',
                'brb actually',
                'yo',
                'who pinged me',
                'give me a sec'
            ];
            
            const chosenResponse = responses[Math.floor(Math.random() * responses.length)];

            // 4. Calculate a realistic typing delay
            // Humans type around 5 chars per second (~200ms per character), plus reaction time
            const typingTime = (chosenResponse.length * 200);
            const reactionTime = getGaussianRandom(1500, 500); 
            const totalDelay = typingTime + reactionTime;

            console.log(`[CHAT] Preparing to reply to ${username} in ${(totalDelay/1000).toFixed(1)}s`);

            // 5. Send the message after the calculated delay
            setTimeout(() => {
                bot.chat(chosenResponse);
            }, totalDelay);
        }
    });
    
}



// Start the bot sequence
initBot();
