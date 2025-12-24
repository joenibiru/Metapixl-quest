  // ===== SYSTEME AUDIO =====
        var bgMusic = document.getElementById('background-music');
        var introMusic = document.getElementById('intro-music');
        var musicEnabled = true;
        var audioCtx = null;
        
        function initAudio() {
            if (audioCtx) return;
            try {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            } catch(e) {
                console.log('Audio non supporte');
            }
        }
        
        function startIntroMusic() {
            if (introMusic && musicEnabled) {
                introMusic.volume = 0.5;
                introMusic.play().catch(function(e) {
                    console.log('Autoplay bloque');
                });
            }
        }
        
        function stopIntroMusic() {
            if (introMusic) {
                introMusic.pause();
                introMusic.currentTime = 0;
            }
        }
        
        function startMusic() {
            if (bgMusic && musicEnabled) {
                bgMusic.volume = 0.5;
                bgMusic.play().catch(function(e) {
                    console.log('Autoplay bloque, cliquez pour jouer');
                });
            }
        }
        
        function stopMusic() {
            if (bgMusic) {
                bgMusic.pause();
            }
        }
        
        function toggleMusic() {
            musicEnabled = !musicEnabled;
            if (musicEnabled) {
                if (gameState.started) {
                    startMusic();
                } else if (!document.getElementById('intro-screen').classList.contains('hidden')) {
                    startIntroMusic();
                }
            } else {
                stopMusic();
                stopIntroMusic();
            }
            document.getElementById('music-toggle').textContent = 'MUSIQUE: ' + (musicEnabled ? 'ON' : 'OFF');
        }
        
        function playNote(freq, duration, type, startTime, volume) {
            if (!audioCtx) return;
            try {
                var osc = audioCtx.createOscillator();
                var gain = audioCtx.createGain();
                
                osc.type = type || 'square';
                osc.frequency.value = freq;
                
                gain.gain.setValueAtTime(volume || 0.1, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
                
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                
                osc.start(startTime);
                osc.stop(startTime + duration);
            } catch(e) {}
        }
        
        function playSFX(type) {
            if (!audioCtx) initAudio();
            if (!audioCtx) return;
            try {
                if (audioCtx.state === 'suspended') audioCtx.resume();
                var now = audioCtx.currentTime;
                
                if (type === 'dialog') {
                    playNote(600, 0.08, 'square', now, 0.1);
                } else if (type === 'success') {
                    playNote(523, 0.15, 'square', now, 0.15);
                    playNote(659, 0.15, 'square', now + 0.1, 0.15);
                    playNote(784, 0.2, 'square', now + 0.2, 0.15);
                } else if (type === 'error') {
                    playNote(200, 0.3, 'sawtooth', now, 0.1);
                } else if (type === 'step') {
                    playNote(100 + Math.random() * 50, 0.05, 'triangle', now, 0.03);
                }
            } catch(e) {}
        }
        
        // ===== CONFIGURATION DU JEU =====
        const TILE_SIZE = 32;
        const MAP_WIDTH = 50;
        const MAP_HEIGHT = 40;
        const CANVAS_WIDTH = 640;
        const CANVAS_HEIGHT = 480;
        
        const COLORS = {
            grass: ['#3d9970', '#2ecc71', '#27ae60'],
            path: ['#8b7355', '#a08060', '#6b5344'],
            water: ['#3498db', '#2980b9', '#1f618d'],
            mountain: ['#7f8c8d', '#95a5a6', '#6c7a7d'],
            forest: ['#1e5631', '#2d6a4f', '#1b4332'],
            building: ['#c0392b', '#a93226', '#922b21'],
            roof: ['#8e44ad', '#7d3c98', '#6c3483'],
            snow: ['#ecf0f1', '#d5dbdb', '#bfc9ca'],
            causses: ['#d4b896', '#c4a882', '#b89b6f']
        };
        
        const CHARACTERS = {
            julien: { name: 'Julien', colors: { hair: '#5d4e37', skin: '#f5cba7', shirt: '#3498db', pants: '#2c3e50' }, role: "L'Expert Linux" },
            orl: { name: 'ORL', colors: { hair: '#1a1a1a', skin: '#e0c4a8', shirt: '#e74c3c', pants: '#1a1a1a' }, role: "Le Couteau Suisse du Retrogaming" },
            gwana: { name: 'Gwana', colors: { hair: '#8b4513', skin: '#d4a574', shirt: '#27ae60', pants: '#2c3e50' }, role: "Le Modeur Fou" },
            joe: { name: 'Joe', colors: { hair: '#d4a017', skin: '#fad6a5', shirt: '#9b59b6', pants: '#34495e' }, role: "Le Collectionneur" }
        };
        
        const VILLAGES = [
            { 
                id: 'marvejols', name: 'Marvejols', x: 8, y: 24, region: 'Gevaudan',
                artifact: { name: 'Rubis de Zelda', icon: '💎', color: '#e74c3c' },
                npc: { name: 'Maitre Hyrule', dialog: [
                    "Bienvenue a Marvejols, cite royale du Gevaudan !",
                    "Je suis Maitre Hyrule, gardien du RUBIS SACRE.",
                    "Ce rubis vient des coffres du royaume d'Hyrule...",
                    "Prouvez votre valeur pour l'obtenir !"
                ]},
                quiz: { question: "Quel studio a developpe le jeu E.T. pour l'Atari 2600 ?", options: ["Atari", "Nintendo", "Sega", "Activision"], correct: 0, hint: "C'etait le proprietaire de la console..." }
            },
            { 
                id: 'st-chely', name: "St-Chely-d'Apcher", x: 10, y: 8, region: 'Margeride',
                artifact: { name: 'Anneau de Sonic', icon: '⭕', color: '#d0ff00ff' },
                npc: { name: 'Forgeron Robotnik', dialog: [
                    "Bienvenue a Saint-Chely-d'Apcher !",
                    "Je suis le Forgeron Robotnik... oui, j'ai change de camp !",
                    "Je garde l'ANNEAU DORE de Green Hill Zone...",
                    "Montrez-moi votre vitesse... mentale !"
                ]},
                quiz: { question: "Combien de cartouches d'E.T. auraient ete enterrees dans le desert ?", options: ["Quelques centaines", "Environ 700 000", "10 millions", "1 million"], correct: 1, hint: "Un nombre impressionnant..." }
            },
            { 
                id: 'langogne', name: 'Langogne', x: 42, y: 12, region: 'Haut-Allier',
                artifact: { name: 'Champignon de Mario', icon: '🍄', color: '#e74c3c' },
                npc: { name: 'Pecheur Lakitu', dialog: [
                    "Vous voila a Langogne, aux portes de l'Ardeche !",
                    "Je suis Lakitu, j'ai range mon nuage pour pecher...",
                    "Je garde le SUPER CHAMPIGNON du Royaume Champignon !",
                    "Repondez a ma question pour grandir !"
                ]},
                quiz: { question: "Quelle etait la capacite memoire d'une cartouche Atari 2600 ?", options: ["4 Ko", "64 Ko", "128 Ko", "1 Mo"], correct: 0, hint: "Tres peu de memoire..." }
            },
            { 
                id: 'mende', name: 'Mende', x: 24, y: 25, region: 'Prefecture',
                artifact: { name: 'Etoile Invincible', icon: '★', color: '#eeff00ff' },
                npc: { name: 'Prefet Pong', dialog: [
                    "Mende, capitale de la Lozere, vous salue !",
                    "Je suis le Prefet Pong, le premier de tous les jeux !",
                    "Je garde l'ETOILE INVINCIBLE de Super Mario !",
                    "Prouvez votre expertise retro !"
                ]},
                quiz: { question: "En quelle annee le jeu E.T. est-il sorti sur Atari 2600 ?", options: ["1980", "1982", "1984", "1986"], correct: 1, hint: "L'annee du film..." }
            },
            { 
                id: 'chanac', name: 'Chanac', x: 18, y: 28, region: 'Vallee du Lot',
                artifact: { name: 'Cerise de Pac-Man', icon: '🍒', color: '#e74c3c' },
                npc: { name: 'Berger Pac', dialog: [
                    "Chanac vous accueille, voyageurs !",
                    "Je suis Berger Pac, wakawaka !",
                    "Mes moutons sont comme des fantomes a guider...",
                    "Je garde la CERISE BONUS de Pac-Man !"
                ]},
                quiz: { question: "Combien de temps pour developper E.T. ?", options: ["5 semaines", "3 mois", "6 mois", "1 an"], correct: 0, hint: "Un delai tres court..." }
            },
            { 
                id: 'florac', name: 'Florac', x: 30, y: 33, region: 'Cevennes',
                artifact: { name: 'Coeur de Vie', icon: '♥', color: '#e74c3c' },
                npc: { name: 'Gardienne Samus', dialog: [
                    "Florac, porte des Cevennes !",
                    "Je suis Samus, en pause entre deux missions...",
                    "Je garde le COEUR DE VIE, source d'energie !",
                    "Montrez votre savoir de chasseuse de primes !"
                ]},
                quiz: { question: "Ou les cartouches d'E.T. ont-elles ete enterrees ?", options: ["Nevada", "Nouveau-Mexique", "Arizona", "Texas"], correct: 1, hint: "A Alamogordo..." }
            },
            { 
                id: 'pont-montvert', name: 'Pont-de-Montvert', x: 38, y: 28, region: 'Mont Lozere',
                artifact: { name: 'Piece d\'Or', icon: '🪙', color: '#f1c40f' },
                npc: { name: 'Guide Konami', dialog: [
                    "Le Pont-de-Montvert, au pied du Mont Lozere !",
                    "Je suis Guide Konami, gardien du CODE SECRET...",
                    "Haut Haut Bas Bas Gauche Droite Gauche Droite B A !",
                    "Je garde la PIECE D'OR de 100 points !"
                ]},
                quiz: { question: "Le crash de 1983 a dure combien de temps ?", options: ["6 mois", "1 an", "2 ans", "5 ans"], correct: 2, hint: "Jusqu'a la NES en 1985..." }
            },
            { 
                id: 'meyrueis', name: 'Meyrueis', x: 24, y: 36, region: 'Gorges de la Jonte',
                artifact: { name: 'Plume de Platformer', icon: '🪶', color: '#ecf0f1' },
                npc: { name: 'Spelunky Jones', dialog: [
                    "Meyrueis, aux portes de l'Aven Armand !",
                    "Je suis Spelunky Jones, explorateur de grottes !",
                    "Je garde la PLUME MAGIQUE des jeux de plateforme !",
                    "Avant-derniere enigme, aventurier !"
                ]},
                quiz: { question: "Quelle console a sauve l'industrie du jeu video ?", options: ["Game Boy", "SNES", "NES", "Nintendo 64"], correct: 2, hint: "La Famicom aux USA..." }
            },
            { 
                id: 'aigoual', name: 'Mont Aigoual', x: 28, y: 38, region: 'Sommet 1567m',
                artifact: { name: 'Fragment de Triforce', icon: '▲', color: '#c8ff00ff' },
                npc: { name: 'Gardien Glitch', dialog: [
                    "Vous avez atteint le Mont Aigoual, a 1567 metres !",
                    "Je suis le Gardien Glitch, protecteur de la Caverne...",
                    "Avec vos 8 artefacts, vous etes presque prets !",
                    "Le FRAGMENT DE TRIFORCE vous ouvrira le passage...",
                    "Vers la CAVERNE DU GLITCH ou vit DATABASE !",
                    "Le Cheater Gris pourra enfin lever la malediction !",
                    "Mais d'abord... l'ultime epreuve !"
                ]},
                quiz: { question: "Slogan de la NES a son lancement ?", options: ["Now you're playing with power!", "Genesis does", "It's thinking", "Play it loud"], correct: 0, hint: "La puissance..." },
                isFinal: true
            }
        ];
        
        let gameState = {
            started: false,
            currentVillage: 0,
            fragments: 0,
            playerX: 8 * TILE_SIZE,
            playerY: 24 * TILE_SIZE + 48,
            playerDir: 'down',
            playerFrame: 0,
            cameraX: 0,
            cameraY: 0,
            inDialog: false,
            dialogIndex: 0,
            currentDialog: [],
            currentNPC: null,
            inQuiz: false,
            currentQuiz: null,
            inventory: [],
            animationTime: 0,
            mapTiles: [],
            canMove: true,
            dialogTyping: false,
            typeInterval: null,
            lastStepTime: 0
        };
        
        const canvas = document.getElementById('game-canvas');
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        const minimapCanvas = document.getElementById('minimap-canvas');
        const minimapCtx = minimapCanvas.getContext('2d');
        minimapCtx.imageSmoothingEnabled = false;
        
        function generateMap() {
            const map = [];
            for (let y = 0; y < MAP_HEIGHT; y++) {
                map[y] = [];
                for (let x = 0; x < MAP_WIDTH; x++) {
                    let tile = 'grass';
                    
                    if (y >= 24 && y <= 26 && x >= 5 && x <= 26 && Math.abs(y - 25 + Math.sin(x * 0.3)) < 1.5) tile = 'water';
                    if (x >= 40 && x <= 44 && y >= 5 && y <= 20 && Math.abs(x - 42 + Math.sin(y * 0.3)) < 1.5) tile = 'water';
                    if (y >= 28 && y <= 35 && x >= 28 && x <= 40 && Math.abs(y - 31 + Math.sin(x * 0.2) * 2) < 1.5) tile = 'water';
                    
                    if (x < 15 && y < 15 && Math.random() < 0.6) tile = 'mountain';
                    if (x > 35 && y > 20 && y < 32 && Math.random() < 0.5) tile = 'mountain';
                    if (y > 35) { tile = 'mountain'; if (x >= 26 && x <= 32) tile = 'snow'; }
                    
                    if (y >= 28 && y <= 35 && x >= 10 && x <= 28 && Math.random() < 0.4 && tile === 'grass') tile = 'causses';
                    if (Math.random() < 0.12 && tile === 'grass') tile = 'forest';
                    
                    VILLAGES.forEach(function(v, i) {
                        var dist = Math.sqrt(Math.pow(x - v.x, 2) + Math.pow(y - v.y, 2));
                        if (dist < 3) tile = 'path';
                        
                        if (VILLAGES[i + 1]) {
                            var next = VILLAGES[i + 1];
                            var dx = next.x - v.x;
                            var dy = next.y - v.y;
                            for (var t = 0; t <= 1; t += 0.02) {
                                var px = v.x + dx * t;
                                var py = v.y + dy * t;
                                if (Math.abs(x - px) < 1.2 && Math.abs(y - py) < 1.2 && tile !== 'water') tile = 'path';
                            }
                        }
                    });
                    
                    map[y][x] = tile;
                }
            }
            return map;
        }
        
        function drawTile(x, y, type, time) {
            var px = x * TILE_SIZE - gameState.cameraX;
            var py = y * TILE_SIZE - gameState.cameraY;
            if (px < -TILE_SIZE || px > CANVAS_WIDTH || py < -TILE_SIZE || py > CANVAS_HEIGHT) return;
            
            var colors = COLORS[type] || COLORS.grass;
            ctx.fillStyle = colors[0];
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            
            if (type === 'grass') {
                ctx.fillStyle = colors[1];
                for (var i = 0; i < 3; i++) {
                    ctx.fillRect(px + 4 + i * 10 + Math.sin(time/500 + x + i) * 2, py + 10 + i * 7, 2, 6);
                }
            } else if (type === 'water') {
                ctx.fillStyle = colors[1];
                var wave = Math.sin(time/300 + x * 0.5) * 3;
                ctx.fillRect(px, py + 10 + wave, TILE_SIZE, 4);
            } else if (type === 'forest') {
                ctx.fillStyle = '#5d4e37';
                ctx.fillRect(px + 12, py + 18, 8, 14);
                ctx.fillStyle = colors[0];
                ctx.beginPath();
                ctx.arc(px + 16, py + 12, 12, 0, Math.PI * 2);
                ctx.fill();
            } else if (type === 'mountain' || type === 'snow') {
                ctx.fillStyle = type === 'snow' ? '#fff' : colors[1];
                ctx.beginPath();
                ctx.moveTo(px + 16, py + 4);
                ctx.lineTo(px + 28, py + 28);
                ctx.lineTo(px + 4, py + 28);
                ctx.fill();
            } else if (type === 'path') {
                ctx.fillStyle = colors[1];
                ctx.fillRect(px + 3, py + 8, 6, 4);
                ctx.fillRect(px + 15, py + 20, 6, 4);
            }
        }
        
        function drawCharacter(x, y, char, direction, frame, isPlayer) {
            var px = x - gameState.cameraX;
            var py = y - gameState.cameraY;
            var colors = char.colors;
            var bounce = isPlayer ? Math.sin(frame * 0.3) * 2 : 0;
            
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(px + 16, py + 30, 10, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = colors.pants;
            ctx.fillRect(px + 8, py + 20 + bounce, 16, 10);
            ctx.fillStyle = colors.shirt;
            ctx.fillRect(px + 6, py + 10 + bounce, 20, 12);
            ctx.fillStyle = colors.skin;
            ctx.fillRect(px + 8, py + 2 + bounce, 16, 12);
            ctx.fillStyle = colors.hair;
            ctx.fillRect(px + 6, py + bounce, 20, 6);
            ctx.fillStyle = '#000';
            ctx.fillRect(px + 11, py + 6 + bounce, 3, 3);
            ctx.fillRect(px + 18, py + 6 + bounce, 3, 3);
        }
        
        function drawNPC(village, index) {
            var px = village.x * TILE_SIZE - gameState.cameraX + 32;
            var py = village.y * TILE_SIZE - gameState.cameraY;
            if (px < -TILE_SIZE || px > CANVAS_WIDTH || py < -TILE_SIZE || py > CANVAS_HEIGHT) return;
            
            var completed = index < gameState.currentVillage;
            var current = index === gameState.currentVillage;
            var npcColors = ['#8e44ad', '#e74c3c', '#3498db', '#27ae60', '#f39c12', '#1abc9c', '#9b59b6', '#e67e22', '#2ecc71'];
            
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(px + 16, py + 30, 10, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = npcColors[index];
            ctx.fillRect(px + 6, py + 12, 20, 18);
            ctx.fillStyle = '#f5cba7';
            ctx.fillRect(px + 8, py + 2, 16, 12);
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(px + 4, py - 2, 24, 8);
            ctx.fillStyle = '#000';
            ctx.fillRect(px + 11, py + 6, 3, 3);
            ctx.fillRect(px + 18, py + 6, 3, 3);
            
            if (current && !completed) {
                ctx.fillStyle = '#f4d03f';
                ctx.font = '16px Arial';
                ctx.fillText('!', px + 14, py - 8 + Math.sin(gameState.animationTime / 200) * 3);
            } else if (completed) {
                ctx.fillStyle = '#2ecc71';
                ctx.font = '14px Arial';
                ctx.fillText('OK', px + 8, py - 5);
            }
        }
        
        function drawVillage(village, index) {
            var px = village.x * TILE_SIZE - gameState.cameraX;
            var py = village.y * TILE_SIZE - gameState.cameraY;
            if (px < -96 || px > CANVAS_WIDTH + 64 || py < -96 || py > CANVAS_HEIGHT + 64) return;
            
            var completed = index < gameState.currentVillage;
            var current = index === gameState.currentVillage;
            
            ctx.fillStyle = completed ? '#27ae60' : (current ? '#f4d03f' : COLORS.building[0]);
            ctx.fillRect(px - 10, py - 10, 40, 30);
            ctx.fillStyle = COLORS.roof[0];
            ctx.beginPath();
            ctx.moveTo(px + 10, py - 30);
            ctx.lineTo(px + 35, py - 10);
            ctx.lineTo(px - 15, py - 10);
            ctx.fill();
            ctx.fillStyle = '#5d4e37';
            ctx.fillRect(px + 5, py + 5, 10, 15);
            ctx.fillStyle = '#f4d03f';
            ctx.fillRect(px + 20, py - 2, 8, 8);
            
            var playerDist = Math.sqrt(Math.pow(gameState.playerX/TILE_SIZE - village.x, 2) + Math.pow(gameState.playerY/TILE_SIZE - village.y, 2));
            if (playerDist < 10 || current) {
                ctx.fillStyle = current ? '#f4d03f' : '#fff';
                ctx.font = '10px "Press Start 2P"';
                ctx.textAlign = 'center';
                ctx.fillText(village.name.toUpperCase(), px + 10, py - 38);
                ctx.fillStyle = '#888';
                ctx.font = '6px "Press Start 2P"';
                ctx.fillText(village.region, px + 10, py - 28);
                ctx.textAlign = 'left';
            }
        }
        
        function drawTeam() {
            var chars = Object.values(CHARACTERS);
            drawCharacter(gameState.playerX, gameState.playerY, chars[0], gameState.playerDir, gameState.playerFrame, true);
            var offsets = [{ x: -24, y: 8 }, { x: 24, y: 8 }, { x: 0, y: 24 }];
            for (var i = 1; i < chars.length; i++) {
                drawCharacter(gameState.playerX + offsets[i-1].x, gameState.playerY + offsets[i-1].y, chars[i], gameState.playerDir, gameState.playerFrame + i * 5, false);
            }
        }
        
        function drawMinimap() {
            minimapCtx.fillStyle = '#1a1a2e';
            minimapCtx.fillRect(0, 0, 120, 100);
            var scaleX = 120 / MAP_WIDTH;
            var scaleY = 100 / MAP_HEIGHT;
            
            for (var y = 0; y < MAP_HEIGHT; y += 2) {
                for (var x = 0; x < MAP_WIDTH; x += 2) {
                    var tile = gameState.mapTiles[y] ? gameState.mapTiles[y][x] : 'grass';
                    minimapCtx.fillStyle = COLORS[tile] ? COLORS[tile][0] : '#2ecc71';
                    minimapCtx.fillRect(x * scaleX, y * scaleY, scaleX * 2, scaleY * 2);
                }
            }
            
            VILLAGES.forEach(function(v, i) {
                minimapCtx.fillStyle = i < gameState.currentVillage ? '#2ecc71' : i === gameState.currentVillage ? '#f4d03f' : '#e74c3c';
                minimapCtx.beginPath();
                minimapCtx.arc(v.x * scaleX, v.y * scaleY, 3, 0, Math.PI * 2);
                minimapCtx.fill();
            });
            
            minimapCtx.fillStyle = '#fff';
            minimapCtx.fillRect((gameState.playerX / TILE_SIZE) * scaleX - 2, (gameState.playerY / TILE_SIZE) * scaleY - 2, 4, 4);
        }
        
        function updateCamera() {
            var targetX = gameState.playerX - CANVAS_WIDTH / 2 + 16;
            var targetY = gameState.playerY - CANVAS_HEIGHT / 2 + 16;
            gameState.cameraX += (targetX - gameState.cameraX) * 0.1;
            gameState.cameraY += (targetY - gameState.cameraY) * 0.1;
            gameState.cameraX = Math.max(0, Math.min(gameState.cameraX, MAP_WIDTH * TILE_SIZE - CANVAS_WIDTH));
            gameState.cameraY = Math.max(0, Math.min(gameState.cameraY, MAP_HEIGHT * TILE_SIZE - CANVAS_HEIGHT));
        }
        
        function canMoveTo(x, y) {
            var tileX = Math.floor(x / TILE_SIZE);
            var tileY = Math.floor(y / TILE_SIZE);
            if (tileX < 0 || tileX >= MAP_WIDTH || tileY < 0 || tileY >= MAP_HEIGHT) return false;
            var tile = gameState.mapTiles[tileY] ? gameState.mapTiles[tileY][tileX] : 'grass';
            return tile !== 'water' && tile !== 'mountain' && tile !== 'snow';
        }
        
        var keys = {};
        document.addEventListener('keydown', function(e) {
            keys[e.key.toLowerCase()] = true;
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                handleInteraction();
            }
        });
        document.addEventListener('keyup', function(e) { keys[e.key.toLowerCase()] = false; });
        
        function handleMovement() {
            if (!gameState.started || !gameState.canMove || gameState.inDialog || gameState.inQuiz) return;
            
            var speed = 3;
            var dx = 0, dy = 0;
            
            if (keys['arrowup'] || keys['z'] || keys['w']) { dy = -speed; gameState.playerDir = 'up'; }
            if (keys['arrowdown'] || keys['s']) { dy = speed; gameState.playerDir = 'down'; }
            if (keys['arrowleft'] || keys['q'] || keys['a']) { dx = -speed; gameState.playerDir = 'left'; }
            if (keys['arrowright'] || keys['d']) { dx = speed; gameState.playerDir = 'right'; }
            
            if (dx !== 0 || dy !== 0) {
                var newX = gameState.playerX + dx;
                var newY = gameState.playerY + dy;
                
                if (canMoveTo(newX + 8, newY + 16) && canMoveTo(newX + 24, newY + 16) &&
                    canMoveTo(newX + 8, newY + 28) && canMoveTo(newX + 24, newY + 28)) {
                    gameState.playerX = newX;
                    gameState.playerY = newY;
                    gameState.playerFrame++;
                    
                    if (Date.now() - gameState.lastStepTime > 200) {
                        playSFX('step');
                        gameState.lastStepTime = Date.now();
                    }
                }
            }
            
            var closestVillage = null;
            var closestDist = 999;
            VILLAGES.forEach(function(v) {
                var dist = Math.sqrt(Math.pow(gameState.playerX/TILE_SIZE - v.x, 2) + Math.pow(gameState.playerY/TILE_SIZE - v.y, 2));
                if (dist < closestDist) { closestDist = dist; closestVillage = v; }
            });
            document.getElementById('location-name').textContent = (closestVillage && closestDist < 6) ? closestVillage.name.toUpperCase() : 'LOZERE';
        }
        
        function handleInteraction() {
            if (gameState.inQuiz) return;
            if (gameState.inDialog) { advanceDialog(); return; }
            
            var currentVillage = VILLAGES[gameState.currentVillage];
            if (!currentVillage) return;
            
            var dist = Math.sqrt(
                Math.pow(gameState.playerX/TILE_SIZE - currentVillage.x, 2) + 
                Math.pow(gameState.playerY/TILE_SIZE - currentVillage.y, 2)
            );
            
            if (dist < 4) startDialog(currentVillage);
        }
        
        function startDialog(village) {
            gameState.inDialog = true;
            gameState.dialogIndex = 0;
            gameState.currentDialog = village.npc.dialog.slice();
            gameState.currentNPC = village;
            
            document.getElementById('dialog-box').style.display = 'block';
            document.getElementById('speaker-name').textContent = village.npc.name;
            
            typeText(gameState.currentDialog[0]);
            playSFX('dialog');
        }
        
        function typeText(text) {
            var dialogText = document.getElementById('dialog-text');
            dialogText.textContent = '';
            gameState.dialogTyping = true;
            var i = 0;
            
            if (gameState.typeInterval) clearInterval(gameState.typeInterval);
            
            gameState.typeInterval = setInterval(function() {
                if (i < text.length) {
                    dialogText.textContent += text[i];
                    i++;
                } else {
                    clearInterval(gameState.typeInterval);
                    gameState.dialogTyping = false;
                }
            }, 25);
        }
        
        function advanceDialog() {
            if (gameState.dialogTyping) {
                clearInterval(gameState.typeInterval);
                document.getElementById('dialog-text').textContent = gameState.currentDialog[gameState.dialogIndex];
                gameState.dialogTyping = false;
                return;
            }
            
            gameState.dialogIndex++;
            playSFX('dialog');
            
            if (gameState.dialogIndex < gameState.currentDialog.length) {
                typeText(gameState.currentDialog[gameState.dialogIndex]);
            } else {
                closeDialog();
                if (gameState.currentNPC && gameState.currentNPC.quiz) {
                    setTimeout(function() { startQuiz(gameState.currentNPC.quiz, gameState.currentNPC); }, 300);
                }
            }
        }
        
        function closeDialog() {
            gameState.inDialog = false;
            gameState.dialogTyping = false;
            if (gameState.typeInterval) clearInterval(gameState.typeInterval);
            document.getElementById('dialog-box').style.display = 'none';
        }
        
        function startQuiz(quiz, village) {
            gameState.inQuiz = true;
            gameState.currentQuiz = { quiz: quiz, village: village };
            
            document.getElementById('quiz-panel').style.display = 'block';
            document.getElementById('quiz-question').textContent = quiz.question;
            
            var options = document.getElementById('quiz-options');
            options.innerHTML = '';
            
            quiz.options.forEach(function(opt, i) {
                var btn = document.createElement('button');
                btn.className = 'quiz-option';
                btn.textContent = String.fromCharCode(65 + i) + '. ' + opt;
                btn.onclick = function() { checkAnswer(i); };
                options.appendChild(btn);
            });
        }
        
        function checkAnswer(index) {
            var quiz = gameState.currentQuiz.quiz;
            var village = gameState.currentQuiz.village;
            var buttons = document.querySelectorAll('.quiz-option');
            
            buttons.forEach(function(btn, i) {
                btn.disabled = true;
                if (i === quiz.correct) btn.classList.add('correct');
                else if (i === index) btn.classList.add('wrong');
            });
            
            if (index === quiz.correct) {
                playSFX('success');
                setTimeout(function() {
                    gameState.fragments++;
                    document.getElementById('quest-progress').textContent = 'Artefacts: ' + gameState.fragments + '/9';
                    
                    // Ajouter l'artefact specifique du village
                    gameState.inventory.push(village.artifact);
                    updateInventory();
                    
                    // Afficher le message de victoire dans le quiz panel
                    document.getElementById('quiz-title').textContent = 'ARTEFACT OBTENU !';
                    document.getElementById('quiz-question').innerHTML = '<span style="color:' + village.artifact.color + '; font-size: 24px;">' + village.artifact.icon + '</span><br><br><span style="color: #f1c40f;">' + village.artifact.name + '</span>';
                    document.getElementById('quiz-options').innerHTML = '';
                    
                    setTimeout(function() {
                        if (village.isFinal) {
                            showVictory();
                        } else {
                            gameState.currentVillage++;
                        }
                        closeQuiz();
                    }, 2000);
                }, 1000);
            } else {
                playSFX('error');
                
                // Afficher l'indice dans le quiz panel au lieu d'une alerte
                document.getElementById('quiz-title').textContent = 'MAUVAISE REPONSE !';
                document.getElementById('quiz-question').innerHTML = '<span style="color: #e74c3c;">Indice :</span><br><br>' + quiz.hint;
                document.getElementById('quiz-options').innerHTML = '<button class="quiz-option" onclick="closeQuiz()" style="margin-top: 20px; background: #e74c3c; border-color: #e74c3c;">REESSAYER</button>';
            }
        }
        
        function closeQuiz() {
            gameState.inQuiz = false;
            document.getElementById('quiz-panel').style.display = 'none';
        }
        
        function updateInventory() {
            var bar = document.getElementById('inventory-bar');
            bar.innerHTML = '';
            for (var i = 0; i < 9; i++) {
                var slot = document.createElement('div');
                slot.className = 'inv-slot' + (gameState.inventory[i] ? ' has-item' : '');
                if (gameState.inventory[i]) {
                    var artifact = gameState.inventory[i];
                    slot.innerHTML = '<span class="inv-item" style="color:' + artifact.color + '" title="' + artifact.name + '">' + artifact.icon + '</span>';
                }
                bar.appendChild(slot);
            }
        }
        
       function showVictory() {
            stopMusic();
            startIntroMusic();
            document.getElementById('victory-screen').classList.add('active');
            
            // Dessiner Database le Cheater Gris
            var dbCanvas = document.getElementById('database-canvas');
            var dbCtx = dbCanvas.getContext('2d');
            dbCtx.imageSmoothingEnabled = false;
            
            var glitchFrame = 0;
            var sceneStep = 0;
            
            var dialogues = [
                { title: "CAVERNE DU GLITCH", text: "Les 9 artefacts legendaires brillent dans votre inventaire...<br><br>Le passage vers la Caverne du Glitch s'ouvre !" },
                { title: "CAVERNE DU GLITCH", text: "Vous descendez dans les profondeurs obscures...<br><br>Une silhouette grise et pixelisee emerge des tenebres..." },
                { title: "DATABASE", text: "Je suis <span style='color:#9b59b6'>DATABASE</span>, le Cheater Gris...<br><br>Gardien des codes oublies et des bugs ancestraux..." },
                { title: "DATABASE", text: "Le Rubis de Zelda... L'Anneau de Sonic...<br>Le Champignon de Mario... L'Etoile Invincible...<br><br>Vous avez reuni les reliques sacrees !" },
                { title: "DATABASE", text: "Et cette disquette... E.T. l'Extra-Terrestre...<br><br>La <span style='color:#e74c3c'>MALEDICTION DE L'INJOUABILITE</span>...<br>Je connais les CHEAT CODES INTERDITS !" },
                { title: "RITUAL DU GLITCH", text: "<span style='color:#2ecc71'>IDDQD... IDKFA... NOCLIP...</span><br><span style='color:#3498db'>UP UP DOWN DOWN LEFT RIGHT LEFT RIGHT B A...</span><br><br>La disquette tremble... les pixels se reorganisent !" },
                { title: "MALEDICTION LEVEE !", text: "C'EST FAIT ! La malediction est brisee !<br><br>Les gamers du monde entier pourront<br><span style='color:#f1c40f'>ENFIN TERMINER E.T.</span> !" },
                { title: "VICTOIRE !", text: "<span style='color:#f1c40f'>METAPIXL</span> a accompli l'impossible !<br><br>Grace a <span style='color:#3498db'>Julien</span>, <span style='color:#e74c3c'>ORL</span>, <span style='color:#27ae60'>Gwana</span> et <span style='color:#9b59b6'>Joe</span>...<br>Et a <span style='color:#9b59b6'>Database</span> le Cheater Gris...<br><br>Le pire jeu de l'histoire est maintenant JOUABLE !<br><br><span style='color:#f1c40f'>FIN</span>" }
            ];
            
            function drawDatabase(frame) {
                dbCtx.fillStyle = '#0a0a14';
                dbCtx.fillRect(0, 0, 200, 150);
                
                // Effet de glitch sur le fond
                for (var i = 0; i < 10; i++) {
                    dbCtx.fillStyle = 'rgba(' + Math.floor(Math.random()*50) + ',0,' + Math.floor(Math.random()*80) + ',0.5)';
                    dbCtx.fillRect(Math.random() * 200, Math.random() * 150, Math.random() * 30 + 5, 2);
                }
                
                // Caverne
                dbCtx.fillStyle = '#2c2c54';
                dbCtx.beginPath();
                dbCtx.moveTo(0, 50);
                dbCtx.lineTo(40, 20);
                dbCtx.lineTo(100, 10);
                dbCtx.lineTo(160, 20);
                dbCtx.lineTo(200, 50);
                dbCtx.lineTo(200, 150);
                dbCtx.lineTo(0, 150);
                dbCtx.fill();
                
                // Database le Cheater Gris
                var dbX = 85;
                var dbY = 60;
                var glitch = Math.sin(frame * 0.2) * 2;
                
                // Aura de glitch
                dbCtx.fillStyle = 'rgba(155, 89, 182, ' + (0.3 + Math.sin(frame * 0.1) * 0.2) + ')';
                dbCtx.beginPath();
                dbCtx.arc(dbX + 15, dbY + 40, 35 + Math.sin(frame * 0.15) * 5, 0, Math.PI * 2);
                dbCtx.fill();
                
                // Corps gris
                dbCtx.fillStyle = '#7f8c8d';
                dbCtx.fillRect(dbX + 5 + glitch, dbY + 35, 20, 30);
                
                // Robe de code
                dbCtx.fillStyle = '#5d6d7e';
                dbCtx.fillRect(dbX + glitch, dbY + 40, 30, 40);
                
                // Tete
                dbCtx.fillStyle = '#95a5a6';
                dbCtx.fillRect(dbX + 5 + glitch, dbY + 10, 20, 25);
                
                // Capuche
                dbCtx.fillStyle = '#4a4a4a';
                dbCtx.beginPath();
                dbCtx.moveTo(dbX + 15 + glitch, dbY);
                dbCtx.lineTo(dbX + 30 + glitch, dbY + 20);
                dbCtx.lineTo(dbX + glitch, dbY + 20);
                dbCtx.fill();
                
                // Yeux brillants (glitch)
                var eyeColor = frame % 10 < 5 ? '#9b59b6' : '#3498db';
                dbCtx.fillStyle = eyeColor;
                dbCtx.fillRect(dbX + 8 + glitch, dbY + 18, 4, 4);
                dbCtx.fillRect(dbX + 18 + glitch, dbY + 18, 4, 4);
                
                // Symboles de code flottants
                dbCtx.fillStyle = '#2ecc71';
                dbCtx.font = '8px monospace';
                var codes = ['0x', '[]', '{}', ';;', '##', '**'];
                for (var c = 0; c < 6; c++) {
                    var cx = 20 + c * 30 + Math.sin(frame * 0.1 + c) * 10;
                    var cy = 30 + Math.cos(frame * 0.1 + c) * 15;
                    dbCtx.fillText(codes[c], cx, cy);
                }
                
                // Disquette si scene avancee
                if (sceneStep >= 4) {
                    dbCtx.fillStyle = '#2c3e50';
                    dbCtx.fillRect(dbX + 40, dbY + 50 + Math.sin(frame * 0.3) * 5, 25, 25);
                    dbCtx.fillStyle = '#ecf0f1';
                    dbCtx.fillRect(dbX + 45, dbY + 52 + Math.sin(frame * 0.3) * 5, 15, 10);
                    dbCtx.fillStyle = '#e74c3c';
                    dbCtx.fillRect(dbX + 50, dbY + 65 + Math.sin(frame * 0.3) * 5, 8, 8);
                    
                    // Effet magique
                    dbCtx.strokeStyle = '#f1c40f';
                    dbCtx.lineWidth = 2;
                    for (var r = 0; r < 3; r++) {
                        dbCtx.beginPath();
                        dbCtx.arc(dbX + 52, dbY + 62, 20 + r * 10 + frame % 20, 0, Math.PI * 2);
                        dbCtx.stroke();
                    }
                }
            }
            
            function animateDatabase() {
                glitchFrame++;
                drawDatabase(glitchFrame);
                if (document.getElementById('victory-screen').classList.contains('active')) {
                    requestAnimationFrame(animateDatabase);
                }
            }
            
            animateDatabase();
            
            // Gestion des scenes
            document.getElementById('next-scene-btn').style.display = 'block';
            document.getElementById('next-scene-btn').onclick = function() {
                sceneStep++;
                if (sceneStep < dialogues.length) {
                    document.querySelector('.victory-title').textContent = dialogues[sceneStep].title;
                    document.getElementById('victory-text-content').innerHTML = dialogues[sceneStep].text;
                    
                    if (sceneStep === dialogues.length - 1) {
                        document.getElementById('next-scene-btn').style.display = 'none';
                        document.getElementById('restart-btn').style.display = 'block';
                    }
                }
            };
        }
        
        function drawCharacterPreview(canvasId, char) {
            var c = document.getElementById(canvasId);
            if (!c) return;
            var cx = c.getContext('2d');
            cx.imageSmoothingEnabled = false;
            cx.clearRect(0, 0, 48, 48);
            
            var colors = char.colors;
            cx.fillStyle = colors.pants;
            cx.fillRect(16, 28, 16, 12);
            cx.fillStyle = colors.shirt;
            cx.fillRect(14, 18, 20, 12);
            cx.fillStyle = colors.skin;
            cx.fillRect(16, 8, 16, 12);
            cx.fillStyle = colors.hair;
            cx.fillRect(14, 6, 20, 6);
            cx.fillStyle = '#000';
            cx.fillRect(19, 12, 3, 3);
            cx.fillRect(26, 12, 3, 3);
        }
        
        function gameLoop(timestamp) {
            gameState.animationTime = timestamp;
            
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            
            if (gameState.started) {
                handleMovement();
                updateCamera();
                
                for (var y = 0; y < MAP_HEIGHT; y++) {
                    for (var x = 0; x < MAP_WIDTH; x++) {
                        drawTile(x, y, gameState.mapTiles[y][x], timestamp);
                    }
                }
                
                VILLAGES.forEach(function(village, index) {
                    drawVillage(village, index);
                    drawNPC(village, index);
                });
                
                drawTeam();
                drawMinimap();
            }
            
            requestAnimationFrame(gameLoop);
        }
        
        function init() {
            gameState.mapTiles = generateMap();
            updateInventory();
            
            Object.keys(CHARACTERS).forEach(function(key) {
                drawCharacterPreview('preview-' + key, CHARACTERS[key]);
            });
            
            // ===== SYSTEME D'INTRO NARRATIVE =====
            var introSlides = [
                "Il y a bien longtemps, en <span class='highlight'>1982</span>...<br><br>Un jeu video fut cree dans la precipitation...<br><br>Un jeu si <span class='villain'>MAUDIT</span> que personne ne put jamais le terminer...",
                
                "<span class='villain'>E.T. L'EXTRA-TERRESTRE</span><br>sur Atari 2600<br><br>Developpe en seulement 5 semaines...<br>Des millions de cartouches invendues...<br>Enterrees dans le desert du Nouveau-Mexique...",
                
                "La <span class='villain'>MALEDICTION DE L'INJOUABILITE</span><br>fut scellee a jamais...<br><br>Aucun gamer ne pouvait finir ce jeu...<br>Les bugs, les glitches, la frustration...<br>Tout semblait perdu...",
                
                "Mais une legende parlait d'un espoir...<br><br>Au coeur de la <span class='highlight'>LOZERE</span>, sous le Mont Aigoual...<br>Se cacherait la <span class='magic'>CAVERNE DU GLITCH</span>...",
                
                "Et dans cette caverne vivrait<br><span class='magic'>DATABASE, LE CHEATER GRIS</span><br><br>Gardien des codes oublies...<br>Maitre des cheat codes interdits...<br>Lui seul pourrait lever la malediction !",
                
                "En 2024, quatre amis decident d'agir...<br><br>Ils fondent la communaute<br><span class='highlight'>METAPIXL</span>",
                
                "<span class='character'>JULIEN</span> - L'Expert Linux<br><span class='character'>ORL</span> - Le Couteau Suisse du Retrogaming<br><span class='character'>GWANA</span> - Le Modeur Fou<br><span class='character'>JOE</span> - Le Collectionneur<br><br>Ensemble, ils retrouvent une disquette maudite...",
                
                "Leur mission :<br><br>Traverser toute la <span class='highlight'>LOZERE</span><br>De <span class='highlight'>MARVEJOLS</span> au <span class='highlight'>MONT AIGOUAL</span><br><br>Collecter les <span class='magic'>9 ARTEFACTS LEGENDAIRES</span><br>Et atteindre la <span class='magic'>CAVERNE DU GLITCH</span>...",
                
                "Pour que <span class='magic'>DATABASE</span> puisse enfin<br>lever la <span class='villain'>MALEDICTION</span>...<br><br>Et que les gamers du monde entier<br>puissent <span class='highlight'>TERMINER E.T.</span> !<br><br><span class='highlight'>L'AVENTURE COMMENCE...</span>"
            ];
            
            var currentIntroSlide = 0;
            var introTyping = false;
            var introTypeInterval = null;
            
            function typeIntroText(text) {
                var introText = document.getElementById('intro-text');
                introText.innerHTML = '';
                introTyping = true;
                var i = 0;
                var tempText = '';
                var inTag = false;
                
                if (introTypeInterval) clearInterval(introTypeInterval);
                
                introTypeInterval = setInterval(function() {
                    if (i < text.length) {
                        var char = text[i];
                        tempText += char;
                        
                        // Gerer les balises HTML
                        if (char === '<') inTag = true;
                        if (char === '>') inTag = false;
                        
                        introText.innerHTML = tempText;
                        i++;
                    } else {
                        clearInterval(introTypeInterval);
                        introTyping = false;
                    }
                }, inTag ? 1 : 35);
            }
            
            function advanceIntro() {
                if (introTyping) {
                    // Afficher tout le texte immediatement
                    clearInterval(introTypeInterval);
                    document.getElementById('intro-text').innerHTML = introSlides[currentIntroSlide];
                    introTyping = false;
                    return;
                }
                
                currentIntroSlide++;
                if (currentIntroSlide < introSlides.length) {
                    typeIntroText(introSlides[currentIntroSlide]);
                } else {
                    // Fin de l'intro, arreter musique intro et afficher le menu
                    stopIntroMusic();
                    document.getElementById('intro-screen').classList.add('hidden');
                    document.getElementById('menu-screen').classList.remove('hidden');
                }
            }
            
            // Demarrer l'intro et la musique
            typeIntroText(introSlides[0]);
            
            // Lancer la musique d'intro automatiquement
            startIntroMusic();
            
            // Gestion des touches pour l'intro
            document.addEventListener('keydown', function(e) {
                if (!document.getElementById('intro-screen').classList.contains('hidden')) {
                    if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        advanceIntro();
                    }
                }
            });
            
            document.getElementById('intro-screen').onclick = function() {
                advanceIntro();
            };
            
            // ===== FIN SYSTEME D'INTRO =====
            
            document.getElementById('music-toggle').onclick = toggleMusic;
            
            document.getElementById('start-btn').onclick = function() {
                initAudio();
                document.getElementById('menu-screen').classList.add('hidden');
                gameState.started = true;
                gameState.playerX = VILLAGES[0].x * TILE_SIZE;
                gameState.playerY = VILLAGES[0].y * TILE_SIZE + 48;
                startMusic();
            };
            
            document.getElementById('restart-btn').onclick = function() { location.reload(); };
            
            requestAnimationFrame(gameLoop);
        }
        
        init();