/*:
 * @target MV
 * @plugindesc Maze Multiplayer v1.0.3
 * @author YourName
 * @param serverUrl
 * @text Server URL
 * @desc WebSocket server URL
 * @default wss://ws.randoms.top
 * @param playerName
 * @text Player Name
 * @desc Name for this player (leave blank for random)
 * @default
 * @param mazeMapId
 * @text Maze Map ID
 * @desc Map ID where multiplayer should activate
 * @type number
 * @default 1
 * @help MazeMultiplayer.js
 *
 * === Maze Multiplayer Plugin ===
 *
 * Features:
 * - Real-time multiplayer maze escape
 * - All players spawn at same location
 * - See other players moving in real-time
 * - First player to exit wins
 * - Auto-reconnection on disconnect
 * - Works with Cloudflare Pages + VPS backend
 *
 * Setup:
 * 1. Set server URL to your WebSocket server
 * 2. Configure player name (or leave blank for random)
 * 3. Set the maze map ID
 * 4. Create exit event with: triggerMazeCompletion()
 * 5. Players will compete in real-time!
 *
 * Server Setup:
 * - Backend runs on your VPS
 * - Game hosted on Cloudflare Pages
 * - Secure WSS connection required
 *
 * Contact: Made for randoms.top maze escape challenge
 */

(() => {
    'use strict';

    const parameters = PluginManager.parameters('MazeMultiplayer');
    const serverUrl = parameters['serverUrl'] || 'wss://ws.randoms.top';
    const playerName = parameters['playerName'] || '';
    const mazeMapId = parseInt(parameters['mazeMapId']) || 1;

    let ws = null;
    let myPlayerId = null;
    let otherPlayers = new Map();
    let isConnected = false;
    let isConnecting = false; // NEW: Prevent multiple connection attempts
    let connectionAttempts = 0;
    let maxRetries = 5;
    let reconnectTimeout = null;
    let pingInterval = null;
    let hasConnectedOnce = false; // NEW: Prevent reconnection on map reloads
    let isFirstConnection = true; // NEW: Track if this is the initial connection

    // Generate player name
    const finalPlayerName = playerName || 'Player' + Math.floor(Math.random() * 1000);

    console.log('🎮 Maze Multiplayer Plugin Loaded');
    console.log(`🎯 Target Map ID: ${mazeMapId}`);
    console.log(`🏷️ Player Name: ${finalPlayerName}`);
    console.log(`🔗 Server URL: ${serverUrl}`);

    // Define completion function immediately
    window.triggerMazeCompletion = function() {
        console.log('🏁 Maze completion triggered!');

        if (isConnected && ws && ws.readyState === WebSocket.OPEN && myPlayerId) {
            // Send completion to server
            ws.send(JSON.stringify({
                type: 'completed'
            }));

            // Show immediate feedback
            $gameMessage.add("🎉 Victory! Checking if you're first...");

            // Disable player movement temporarily
            $gamePlayer._moveSpeed = 0;

        } else {
            // Single player fallback
            $gameMessage.add("🎉 You escaped the maze! 🎉");
            $gameMessage.add("🚫 (Playing in single-player mode)");
            console.log('⚠️ Not connected to multiplayer server');
        }
    };

    // Connect to multiplayer server
    function connectToServer() {
        // FIXED: Prevent multiple simultaneous connections
        if (connectionAttempts >= maxRetries || isConnecting || isConnected) {
            if (isConnected) {
                console.log('✅ Already connected, skipping connection attempt');
            } else if (isConnecting) {
                console.log('⏳ Connection already in progress, skipping');
            } else {
                console.log('❌ Max connection attempts reached. Playing in single-player mode.');
                $gameMessage.add('🚫 Multiplayer unavailable - Playing solo');
            }
            return;
        }

        isConnecting = true; // Prevent multiple simultaneous attempts

        try {
            console.log(`🔄 Connecting to ${serverUrl}... (attempt ${connectionAttempts + 1})`);
            ws = new WebSocket(serverUrl);
            connectionAttempts++;

            ws.onopen = () => {
                console.log('✅ Connected to multiplayer server!');
                isConnected = true;
                isConnecting = false; // Reset connecting flag
                connectionAttempts = 0; // Reset on success

                // Start heartbeat
                startPingPong();

                // Join the game
                ws.send(JSON.stringify({
                    type: 'join',
                    name: finalPlayerName
                }));

                // Only show connection message on first connect
                if (isFirstConnection) {
                    $gameMessage.add('🌐 Connected to multiplayer server!');
                    isFirstConnection = false;
                }
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    handleServerMessage(data);
                } catch (error) {
                    console.error('❌ Error parsing server message:', error);
                }
            };

            ws.onclose = (event) => {
                console.log(`❌ Disconnected from server: ${event.code} - ${event.reason}`);
                isConnected = false;
                isConnecting = false; // Reset connecting flag
                stopPingPong();

                // Clean up other players
                otherPlayers.clear();
                removeAllOtherPlayerSprites();

                // Only show disconnection message for unexpected disconnects
                if (event.code !== 1000 && event.code !== 1001) {
                    $gameMessage.add('🔌 Connection lost - Attempting reconnect...');

                    // Try to reconnect if not intentional disconnect
                    if (connectionAttempts < maxRetries) {
                        reconnectTimeout = setTimeout(() => {
                            console.log('🔄 Attempting to reconnect...');
                            connectToServer();
                        }, 5000); // Increased delay to prevent rapid reconnection
                    }
                }
            };

            ws.onerror = (error) => {
                console.error('❌ WebSocket connection error:', error);
                isConnected = false;
                isConnecting = false; // Reset connecting flag
                $gameMessage.add('⚠️ Connection error - Check your internet');
            };

        } catch (error) {
            console.error('❌ Failed to create WebSocket connection:', error);
            isConnecting = false; // Reset connecting flag

            if (connectionAttempts < maxRetries) {
                setTimeout(connectToServer, 5000);
            }
        }
    }

    // Handle server messages
    function handleServerMessage(data) {
        switch(data.type) {
            case 'joined':
                myPlayerId = data.playerId;
                console.log(`✅ Joined as player: ${myPlayerId}`);

                // FIXED: Only transfer if not already at the correct position to prevent map reload loop
                if ($gamePlayer.x !== data.x || $gamePlayer.y !== data.y) {
                    console.log(`📍 Moving player to spawn: (${data.x}, ${data.y})`);
                    // Use setPosition instead of reserveTransfer to prevent map reload
                    $gamePlayer.setPosition(data.x, data.y);
                    $gamePlayer.setDirection(2); // Face down
                    $gamePlayer.refresh();
                }

                // Welcome message (only show once)
                if (isFirstConnection) {
                    $gameMessage.add(`👋 Welcome ${finalPlayerName}!`);
                    $gameMessage.add(`🎯 Find the exit to win!`);

                    if (data.totalPlayers > 1) {
                        $gameMessage.add(`👥 ${data.totalPlayers} players competing!`);
                    }
                }
                break;

            case 'playerJoined':
                if (data.playerId !== myPlayerId) {
                    otherPlayers.set(data.playerId, {
                        x: data.x,
                        y: data.y,
                        name: data.name
                    });

                    createOtherPlayerSprite(data.playerId, data.x, data.y, data.name);
                    $gameMessage.add(`🆕 ${data.name} joined the maze!`);

                    if (data.totalPlayers) {
                        $gameMessage.add(`👥 Total players: ${data.totalPlayers}`);
                    }
                }
                break;

            case 'playerMoved':
                if (data.playerId !== myPlayerId && otherPlayers.has(data.playerId)) {
                    const player = otherPlayers.get(data.playerId);
                    player.x = data.x;
                    player.y = data.y;
                    updateOtherPlayerSprite(data.playerId, data.x, data.y, data.direction);
                }
                break;

            case 'playerLeft':
                if (otherPlayers.has(data.playerId)) {
                    const playerName = otherPlayers.get(data.playerId).name;
                    otherPlayers.delete(data.playerId);
                    removeOtherPlayerSprite(data.playerId);
                    $gameMessage.add(`👋 ${playerName} left the maze`);

                    if (data.totalPlayers !== undefined) {
                        $gameMessage.add(`👥 Players remaining: ${data.totalPlayers}`);
                    }
                }
                break;

            case 'mazeCompleted':
                // Reset player movement speed
                $gamePlayer._moveSpeed = 4;

                if (data.playerId === myPlayerId) {
                    // I won!
                    $gameMessage.add("🏆🎉 CONGRATULATIONS! 🎉🏆");
                    $gameMessage.add("🥇 YOU ARE THE WINNER! 🥇");
                    $gameMessage.add(`⏱️ Time: ${data.timeText || 'Unknown'}`);
                    $gameMessage.add("💰 Contact the host for your reward!");

                    // Victory sound effect (if you have one)
                    try {
                        $gameSystem.playSe({name: 'Victory1', volume: 90, pitch: 100, pan: 0});
                    } catch (e) {
                        // Ignore if sound doesn't exist
                    }

                } else {
                    // Someone else won
                    $gameMessage.add(`🏆 ${data.name} escaped first! 🏆`);
                    $gameMessage.add(`⏱️ Winning time: ${data.timeText || 'Unknown'}`);
                    $gameMessage.add("😔 Better luck next time!");

                    // Show winner celebration
                    highlightWinner(data.playerId);
                }
                break;

            case 'serverShutdown':
                $gameMessage.add('🛑 Server maintenance');
                $gameMessage.add('🔄 Please refresh page soon');
                break;

            case 'pong':
                // Heartbeat response (don't log to reduce console spam)
                break;
        }
    }

    // Send movement to server
    function sendMovement(x, y, direction) {
        if (isConnected && ws && ws.readyState === WebSocket.OPEN && myPlayerId) {
            ws.send(JSON.stringify({
                type: 'move',
                x: x,
                y: y,
                direction: direction
            }));
        }
    }

    // Create sprite for other player
    function createOtherPlayerSprite(playerId, x, y, name) {
        if (!$gameMap._events) return;

        const playerIndex = Array.from(otherPlayers.keys()).indexOf(playerId);
        const eventId = 100 + playerIndex;

        // Random character sprite for variety
        const characterIndex = Math.floor(Math.random() * 8);

        const eventData = {
            id: eventId,
            name: `Multiplayer_${playerId}`,
            x: x,
            y: y,
            pages: [{
                conditions: {},
                directionFix: false,
                image: {
                    characterIndex: characterIndex,
                    characterName: 'Actor1',
                    direction: 2,
                    pattern: 0
                },
                list: [{
                    code: 108,
                    indent: 0,
                    parameters: [`Other Player: ${name}`]
                }],
                moveRoute: { list: [], repeat: false, skippable: false, wait: false },
                moveSpeed: 3,
                moveType: 0,
                priorityType: 1,
                stepAnime: false,
                through: true, // Players can walk through each other
                trigger: 0,
                walkAnime: true
            }]
        };

        $dataMap.events[eventId] = eventData;
        const event = new Game_Event($gameMap.mapId(), eventId);
        $gameMap._events[eventId] = event;

        // Add to spriteset if map scene is active
        if (SceneManager._scene instanceof Scene_Map) {
            SceneManager._scene._spriteset.createCharacter(event);
        }

        console.log(`👤 Created sprite for ${name} at (${x}, ${y})`);
    }

    // Update other player sprite position
    function updateOtherPlayerSprite(playerId, x, y, direction) {
        const playerIndex = Array.from(otherPlayers.keys()).indexOf(playerId);
        const eventId = 100 + playerIndex;
        const event = $gameMap._events[eventId];

        if (event) {
            event.setPosition(x, y);
            event.setDirection(direction);
        }
    }

    // Remove other player sprite
    function removeOtherPlayerSprite(playerId) {
        const playerIndex = Array.from(otherPlayers.keys()).indexOf(playerId);
        const eventId = 100 + playerIndex;

        if ($gameMap._events[eventId]) {
            delete $gameMap._events[eventId];
            delete $dataMap.events[eventId];

            if (SceneManager._scene instanceof Scene_Map && SceneManager._scene._spriteset) {
                SceneManager._scene._spriteset.refreshCharacter();
            }
        }
    }

    // Remove all other player sprites
    function removeAllOtherPlayerSprites() {
        otherPlayers.forEach((player, playerId) => {
            removeOtherPlayerSprite(playerId);
        });
    }

    // Highlight winner animation
    function highlightWinner(winnerId) {
        const playerIndex = Array.from(otherPlayers.keys()).indexOf(winnerId);
        const eventId = 100 + playerIndex;
        const event = $gameMap._events[eventId];

        if (event) {
            // Simple animation - make winner blink
            let blinkCount = 0;
            const blinkInterval = setInterval(() => {
                if (event && blinkCount < 6) {
                    event._opacity = event._opacity === 255 ? 128 : 255;
                    blinkCount++;
                } else {
                    clearInterval(blinkInterval);
                    if (event) event._opacity = 255;
                }
            }, 300);
        }
    }

    // Ping-pong heartbeat
    function startPingPong() {
        if (pingInterval) clearInterval(pingInterval); // Clear existing interval

        pingInterval = setInterval(() => {
            if (isConnected && ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000);
    }

    function stopPingPong() {
        if (pingInterval) {
            clearInterval(pingInterval);
            pingInterval = null;
        }
    }

    // Hook into player movement
    const _Game_Player_moveStraight = Game_Player.prototype.moveStraight;
    Game_Player.prototype.moveStraight = function(d) {
        _Game_Player_moveStraight.call(this, d);

        if (this.isMovementSucceeded()) {
            sendMovement(this.x, this.y, this.direction());
        }
    };

    // FIXED: Auto-connect when entering the maze map (prevents connection loop)
    const _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
    Scene_Map.prototype.onMapLoaded = function() {
        _Scene_Map_onMapLoaded.call(this);

        // Only connect ONCE per game session on the specified maze map
        if ($gameMap.mapId() === mazeMapId && !isConnected && !hasConnectedOnce && !isConnecting) {
            console.log(`🎮 Entering maze map ${mazeMapId} - Connecting to multiplayer...`);
            hasConnectedOnce = true; // Prevent multiple connections
            connectToServer();
        }
    };

    // Clean up on scene change
    const _Scene_Map_terminate = Scene_Map.prototype.terminate;
    Scene_Map.prototype.terminate = function() {
        console.log('🚪 Leaving map - Disconnecting multiplayer...');

        // Clear reconnection timeout
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }

        // Stop heartbeat
        stopPingPong();

        // Disconnect WebSocket
        if (ws && isConnected) {
            ws.close(1000, 'Map change');
        }

        // Reset connection state for potential re-entry
        isConnected = false;
        isConnecting = false;
        connectionAttempts = 0;
        myPlayerId = null;
        otherPlayers.clear();
        hasConnectedOnce = false; // Allow reconnection if player re-enters maze
        isFirstConnection = true; // Reset for next session

        _Scene_Map_terminate.call(this);
    };

    console.log('✅ Maze Multiplayer Plugin Ready!');
    console.log(`🎯 Will activate on map ${mazeMapId}`);
    console.log(`🏁 Use triggerMazeCompletion() in your exit event`);
})();
