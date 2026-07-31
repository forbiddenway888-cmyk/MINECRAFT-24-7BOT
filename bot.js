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
    // 4. Human-Behavior Stealth Engine
    // -------------------------------------------------------------
    function scheduleNextStealthAction() {
        if (!bot || !bot.entity) return;

        // Randomize looking angles
        const yaw = (Math.random() * Math.PI * 2) - Math.PI; // -PI to PI
        const pitch = (Math.random() * Math.PI / 2) - (Math.PI / 4); // -PI/4 to PI/4

        bot.look(yaw, pitch, true, () => {
            // Optional micro-jump with random probability
            if (Math.random() < 0.15) {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 150);
            }
        });

        // Calculate next action delay using Gaussian curve
        // Mean = 25 seconds, Standard Dev = 8 seconds, Minimum clamp = 8 seconds
        let nextDelay = getGaussianRandom(25000, 8000);
        if (nextDelay < 8000) nextDelay = 8000;

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
}

// Start the bot sequence
initBot();
