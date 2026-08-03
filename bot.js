const express = require('express');
const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');

// -------------------------------------------------------------
// SILENCE LOGS (BUT KEEP ERRORS ALIVE FOR DEBUGGING)
// -------------------------------------------------------------
console.log = function() {};
console.warn = function() {};
console.info = function() {};
// Notice I removed console.error = function(){}. We NEED to see fatal crashes!

let bot = null; // Global so the error handler can reach it
let spawnWatchdog; 
let reconnectTimer;

// -------------------------------------------------------------
// ANTI-ZOMBIE ERROR RESCUE (UPGRADED)
// -------------------------------------------------------------
function rescueZombie(reason, err) {
    console.error(`[CRITICAL] Zombie prevented! ${reason}: ${err.message || err}`);
    
    if (bot) {
        try { bot.quit(); } catch(e) {}
        bot = null;
    }
    if (global.gc) global.gc(); 
    
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(initBot, 15000); 
}

process.on('uncaughtException', (err) => rescueZombie('Sync Error', err));
process.on('unhandledRejection', (err) => rescueZombie('Async Error', err));

// Configuration loaded from Environment Variables or directly set as fallbacks
const SERVER_IP = process.env.SERVER_IP || 'mafia_empire2026.aternos.me';
// ... rest of your code ...
const SERVER_PORT = parseInt(process.env.SERVER_PORT || '41899', 10);
// -------------------------------------------------------------
// The Hydra Roster (Bot Rotation System)
// -------------------------------------------------------------
const BOT_ROSTER = [
    'StealthBot_01',
    'ShadowMiner_99',
    'GhostPlayer_X',
    'NightWalker_22'
];

let currentBotIndex = 0; // Starts at the first bot in the list

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
    console.error(`[BOT] Attempting connection to ${SERVER_IP}:${SERVER_PORT}...`);

    let memoryWatchdog; 
    let wasKicked = false; 

    // -------------------------------------------------------------
    // ATERNOS VOID WATCHDOG (LOGIN HANG DETECTOR)
    // -------------------------------------------------------------
    clearTimeout(spawnWatchdog);
    spawnWatchdog = setTimeout(() => {
        console.error('[SYS] Aternos login hang detected (60s). Rebooting...');
        if (bot) bot.quit('Login Timeout');
    }, 60000); 

    // THE FIX: Removed 'let' below so it uses the global bot variable
    bot = mineflayer.createBot({
        host: SERVER_IP,
        port: SERVER_PORT,
        username: BOT_ROSTER[currentBotIndex], 
        version: '1.21.1',
        viewDistance: 2,         
        hideErrors: true         
    });

    // Inject the pathfinding brain
    bot.loadPlugin(pathfinder);

    // -------------------------------------------------------------
// Natural Pathfinding Module
// -------------------------------------------------------------
function performRandomWander() {
    if (!bot || !bot.entity || !bot.pathfinder) return;

    // Get the bot's current exact location
    const pos = bot.entity.position;

    // Calculate a random X and Z coordinate within a 5-block radius
    const randomX = pos.x + (Math.random() * 10 - 5);
    const randomZ = pos.z + (Math.random() * 10 - 5);
    
    // Create the destination goal (Get within 1 block of the random X/Z)
    const goal = new goals.GoalNear(randomX, pos.y, randomZ, 1);
    
    console.log(`[+] Stealth: Wandering to new coordinates...`);
    bot.pathfinder.setGoal(goal);
}

    // -------------------------------------------------------------
// Simulated Inventory Fidgeting
// -------------------------------------------------------------
async function fidgetInventory() {
    if (!bot || !bot.inventory) return;

    try {
        const items = bot.inventory.items();
        
        // If the bot has at least 2 items in its inventory, pretend to swap them
        if (items.length >= 2) {
            const slotA = items[0].slot;
            const slotB = items[1].slot;
            
            // Simulates physically clicking items in the inventory GUI
            await bot.clickWindow(slotA, 0, 0);
            await bot.clickWindow(slotB, 0, 0);
            await bot.clickWindow(slotA, 0, 0);
            
            console.log('[+] Stealth: Fidgeting with inventory items.');
        }
    } catch (err) {
        // Silently ignore if the server cancels the inventory click
    }
}

    function scheduleNextStealthAction() {
        if (!bot || !bot.entity) return;

        const actionRoll = Math.random();

        // 1. 10% chance to open inventory and move items
        if (actionRoll < 0.10) {
            fidgetInventory();

        // 2. 40% chance to physically walk somewhere new (Increased from 30% to 40%)
        } else if (actionRoll < 0.50) {
            performRandomWander();

        // 3. Human-like Head Turn
        } else if (actionRoll < 0.60) {
            const targetYaw = (Math.random() * Math.PI * 2) - Math.PI;
            const targetPitch = (Math.random() * Math.PI / 3) - (Math.PI / 6);
            bot.look(targetYaw, targetPitch, false);

        // 4. Fidget Hotbar Slot & JUMP (Added jumping to prove we are human)
        } else if (actionRoll < 0.70) {
            const randomSlot = Math.floor(Math.random() * 9);
            bot.setQuickBarSlot(randomSlot);
            bot.setControlState('jump', true);
            setTimeout(() => { if (bot) bot.setControlState('jump', false); }, 500);

        // 5. Air Punch / Arm Swing
        } else if (actionRoll < 0.85) {
            bot.swingArm('mainhand');

        // 6. Crouch Fidget
        } else if (actionRoll < 0.90) {
            bot.setControlState('sneak', true);
            setTimeout(() => {
                if (bot) bot.setControlState('sneak', false);
            }, getGaussianRandom(600, 200));

        // 7. Micro-Movement Pulse (Now with 50% chance to jump while moving)
        } else {
            const directions = ['forward', 'back', 'left', 'right'];
            const chosenDir = directions[Math.floor(Math.random() * directions.length)];
            
            bot.setControlState(chosenDir, true);
            if (Math.random() > 0.5) bot.setControlState('jump', true); 

            setTimeout(() => {
                if (bot) {
                    bot.setControlState(chosenDir, false);
                    bot.setControlState('jump', false);
                }
            }, getGaussianRandom(400, 100)); // Moves for longer bursts now
        }

        // TIMER FIX: Bot will now act every 3 to 8 seconds (much faster!)
        let nextDelay = getGaussianRandom(5000, 2000);
        if (nextDelay < 3000) nextDelay = 3000;

        setTimeout(scheduleNextStealthAction, nextDelay);
    }
    // -------------------------------------------------------------
    // 5. Event Handlers & Auto-Reconnection Protocol
    // -------------------------------------------------------------
    bot.on('login', () => {
        console.log(`[+] Successfully authenticated as ${bot.username}`);
    });

    // -------------------------------------------------------------
    // Spawn Event (WITH GRACE PERIOD FIX)
    // -------------------------------------------------------------
    let emergencyLogoutEnabled = false; // Flag to prevent infinite join/leave loops

    bot.on('spawn', () => {
    // THE FIX: We spawned successfully! Turn off the Void Watchdog.
    clearTimeout(spawnWatchdog); 
    
    console.error('[+] Bot spawned into the world. Activating stealth engine...');
    
    const defaultMove = new Movements(bot);
        defaultMove.canDig = false; 
        defaultMove.allow1by1towers = false; 
        bot.pathfinder.setMovements(defaultMove);

// -------------------------------------------------------------
// TACTICAL MEMORY WATCHDOG (SUPERCHARGED)
// -------------------------------------------------------------
memoryWatchdog = setInterval(() => { 
    const memoryMB = process.memoryUsage().rss / 1024 / 1024;
    
    if (memoryMB > 320) {
        console.log(`[SYS] Memory hit ${memoryMB.toFixed(1)}MB. Ejecting before crash...`);
        
        clearInterval(memoryWatchdog);
        if (bot) bot.quit('Tactical Reboot: Clearing RAM');
    }
}, 10000); // <--- Now checks every 10 seconds!

        // --- THE FIX: 15 Second Grace Period ---
        emergencyLogoutEnabled = false;
        console.log('[SYS] Spawn grace period active. Bot will not emergency-logout for 15 seconds so it can eat/heal.');
        
        setTimeout(() => {
            emergencyLogoutEnabled = true;
            console.log('[SYS] Grace period ended. Emergency logout is now armed.');
        }, 15000); 

        scheduleNextStealthAction();
    });

    // -------------------------------------------------------------
    // Step 3: Emergency Survival & Auto-Eat Protocol (UPDATED)
    // -------------------------------------------------------------
    bot.on('health', async () => {
        // 1. Auto-Eat when hunger drops below 16 (8 food bars)
        if (bot.food < 16 && (!bot.pathfinder || !bot.pathfinder.isMoving())) {
            const food = bot.inventory.items().find(item => 
                item.name.includes('cooked') || 
                item.name === 'bread' || 
                item.name === 'apple' ||
                item.name === 'steak' ||
                item.name === 'porkchop'
            );

            if (food) {
                try {
                    console.log(`[+] Health Low/Hungry: Attempting to eat ${food.name}...`);
                    await bot.equip(food, 'hand');
                    await bot.consume();
                    console.log('[+] Bot ate food successfully.');
                } catch (err) {
                    // Silently ignore if eating action was interrupted
                }
            }
        }

        // 2. Emergency Disconnect (NOW PROTECTED BY GRACE PERIOD)
        if (bot.health <= 6 && bot.health > 0) {
            if (emergencyLogoutEnabled) {
                console.log('[!] CRITICAL DAMAGE DETECTED! Emergency logging out to prevent death...');
                bot.quit('Emergency Logout: Critical Health');
            } else {
                console.log('[!] Health is low, but staying online to attempt eating/healing (Grace Period active).');
            }
        }
    });

    // 3. Auto-Respawn Backup (If the bot dies before it can disconnect)
    bot.on('death', () => {
        console.log('[!] Bot died in combat/environment. Respawning...');
        // Respawn packet is handled automatically by Mineflayer, swing arm to trigger world reload
        bot.swingArm('mainhand');
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
        // 1. Move to the next bot in our roster array
        currentBotIndex++;
        
        // 2. If we reach the end of the list, loop back to the first bot
        if (currentBotIndex >= BOT_ROSTER.length) {
            currentBotIndex = 0;
        }
        
        wasKicked = true; // Trigger the Lay Low protocol!
    });

    bot.on('end', () => {
    clearInterval(memoryWatchdog);
    clearTimeout(spawnWatchdog); // Ensure login timer stops
    
    if (bot) {
        bot.removeAllListeners();
        if (bot.pathfinder) bot.pathfinder.setGoal(null); 
        bot = null; 
    }
    
    if (global.gc) {
        global.gc(); 
    }

    // Use the global timer to prevent duplicate bots
    clearTimeout(reconnectTimer);
    
    let reconnectDelay;
    if (wasKicked) {
        reconnectDelay = getGaussianRandom(150000, 30000); 
        if (reconnectDelay > 240000) reconnectDelay = 230000; 
        wasKicked = false; 
    } else {
        reconnectDelay = getGaussianRandom(30000, 5000); 
    }
    
    reconnectTimer = setTimeout(initBot, reconnectDelay);
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
