/*:
 * @target MV
 * @plugindesc Maze Multiplayer v1.0.0
 * @author YourName
 * @param serverUrl
 * @text Server URL
 * @desc WebSocket server URL
 * @default ws://158.69.199.2:1313
 * @param playerName
 * @text Player Name
 * @desc Name for this player
 * @default Player
 * @help MazeMultiplayer.js
 *
 * Multiplayer maze game for randoms.top
 *
 * Instructions:
 * 1. Set server URL to your WebSocket server
 * 2. Configure player name (or leave default for random)
 * 3. Create an event at maze exit with script call: triggerMazeCompletion()
 * 4. All players spawn at same location and can see each other
 * 5. First player to reach exit wins!
 */

(() => {
    'use strict';

    const parameters = PluginManager.parameters('MazeMultiplayer');
    const serverUrl = parameters['serverUrl'] || 'ws://158.69.199.2:1313';
    const playerName = parameters['playerName'] || 'Player';

    let ws = null;
    let myPlayerId = null;
    let otherPlayers = new Map();
    let isConnected = false;
    let connectionAttempts = 0;
    let maxRetries = 5;

    // Generate random player name if default
    const finalPlayerName = playerName === 'Player' ?
        'Player' + Math.floor(Math.random() * 1000) : playerName;

    // Connect to multiplayer server
    function connectToServer() {
        if (connectionAttempts >= maxRetries) {
            console.log('Max connection attempts reached. Playing in single-player mode.');
            $gameMessage.add('Playing in single-player mode');
            return;
        }

        try {
            console.log(`Connecting to ${serverUrl}... (attempt ${connectionAttempts + 1})`);
            ws = new WebSocket(serverUrl);
            connectionAttempts++;

            ws.onopen = () => {
                console.log('Connected to randoms.top multiplayer server');
                isConnected = true;
                connectionAttempts = 0; // Reset on successful connection

                // Join the game
                ws.send(JSON.stringify({
                    type: 'join',
                    name: finalPlayerName
                }));
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    handleServerMessage(data);
                } catch (error) {
                    console.error('Error parsing server message:', error);
                }
            };

            ws.onclose = (event) => {
                console.log('Disconnected from multiplayer server:', event.code, event.reason);
                isConnected = false;
                otherPlayers.clear();
                removeAllOtherPlayerSprites();

                // Try to reconnect after 3 seconds if not intentional
                if (event.code !== 1000 && connectionAttempts < maxRetries) {
                    setTimeout(connectToServer, 3000);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                isConnected = false;
            };

        } catch (error) {
            console.error('Failed to connect to server:', error);
            // Try again after delay
            if (connectionAttempts < maxRetries) {
                setTimeout(connectToServer, 3000);
            }
        }
    }

    // Handle messages from server
    function handleServerMessage(data) {
        switch(data.type) {
            case 'joined':
                myPlayerId = data.playerId;
                console.log('Joined as player:', myPlayerId);
                // Force player to spawn position
                $gamePlayer.reserveTransfer($gameMap.mapId(), data.x, data.y, 2, 0);
                $gameMessage.add(`Welcome ${finalPlayerName}! Find the exit!`);
                break;

            case 'playerJoined':
                if (data.playerId !== myPlayerId) {
                    otherPlayers.set(data.playerId, {
                        x: data.x,
                        y: data.y,
                        name: data.name
                    });
                    createOtherPlayerSprite(data.playerId, data.x, data.y, data.name);
                    $gameMessage.add(`${data.name} joined the maze!`);
                }
                break;

            case 'playerMoved':
                if (data.playerId !== myPlayerId && otherPlayers.has(data.playerId)) {
                    otherPlayers.get(data.playerId).x = data.x;
                    otherPlayers.get(data.playerId).y = data.y;
                    updateOtherPlayerSprite(data.playerId, data.x, data.y, data.direction);
                }
                break;

            case 'playerLeft':
                if (otherPlayers.has(data.playerId)) {
                    const playerName = otherPlayers.get(data.playerId).name;
                    otherPlayers.delete(data.playerId);
                    removeOtherPlayerSprite(data.playerId);
                    $gameMessage.add(`${playerName} left the maze.`);
                }
                break;

            case 'mazeCompleted':
                $gameMessage.add(`🎉 ${data.name} escaped the maze first! 🎉`);
                if (data.playerId === myPlayerId) {
                    $gameMessage.add("🏆 CONGRATULATIONS! You are the winner! 🏆");
                    $gameMessage.add("Contact the host to claim your reward!");
                } else {
                    $gameMessage.add("Better luck next time!");
                }
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

        const eventId = 100 + Array.from(otherPlayers.keys()).indexOf(playerId);

        const eventData = {
            id: eventId,
            name: `OtherPlayer_${playerId}`,
            x: x,
            y: y,
            pages: [{
                conditions: {},
                directionFix: false,
                image: {
                    characterIndex: Math.floor(Math.random() * 8), // Random character sprite
                    characterName: 'Actor1', // Use default character sprite
                    direction: 2,
                    pattern: 0
                },
                list: [],
                moveRoute: { list: [], repeat: false, skippable: false, wait: false },
                moveSpeed: 3,
                moveType: 0,
                priorityType: 1,
                stepAnime: false,
                through: true, // Other players can walk through each other
                trigger: 0,
                walkAnime: true
            }]
        };

        $dataMap.events[eventId] = eventData;
        const event = new Game_Event($gameMap.mapId(), eventId);
        $gameMap._events[eventId] = event;

        if (SceneManager._scene instanceof Scene_Map) {
            SceneManager._scene._spriteset.createCharacter(event);
        }
    }

    // Update other player sprite position
    function updateOtherPlayerSprite(playerId, x, y, direction) {
        const eventId = 100 + Array.from(otherPlayers.keys()).indexOf(playerId);
        const event = $gameMap._events[eventId];

        if (event) {
            event.setPosition(x, y);
            event.setDirection(direction);
        }
    }

    // Remove other player sprite
    function removeOtherPlayerSprite(playerId) {
        const eventId = 100 + Array.from(otherPlayers.keys()).indexOf(playerId);

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

    // Hook into player movement
    const _Game_Player_moveStraight = Game_Player.prototype.moveStraight;
    Game_Player.prototype.moveStraight = function(d) {
        _Game_Player_moveStraight.call(this, d);

        if (this.isMovementSucceeded()) {
            sendMovement(this.x, this.y, this.direction());
        }
    };

    // Auto-connect when entering the maze map
    const _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
    Scene_Map.prototype.onMapLoaded = function() {
        _Scene_Map_onMapLoaded.call(this);

        // Only connect on your specific maze map (change map ID as needed)
        if ($gameMap.mapId() === 1 && !isConnected) { // Change '1' to your maze map ID
            connectToServer();
        }
    };

    // Clean up on scene change
    const _Scene_Map_terminate = Scene_Map.prototype.terminate;
    Scene_Map.prototype.terminate = function() {
        if (ws && isConnected) {
            ws.close(1000, 'Scene change');
        }
        _Scene_Map_terminate.call(this);
    };

    // Maze completion trigger (call this from an event when player reaches exit)
    window.triggerMazeCompletion = function() {
        if (isConnected && ws && ws.readyState === WebSocket.OPEN && myPlayerId) {
            ws.send(JSON.stringify({
                type: 'completed'
            }));
        } else {
        }
    };
})();
