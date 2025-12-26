       // ===== SYSTEME AUDIO =====
        var bgMusic = document.getElementById('background-music');
        var introMusic = document.getElementById('intro-music');
        var musicEnabled = true;
        var audioCtx = null;
        
        function initAudio() {
            if (audioCtx) return;
            try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
        }
        
        function startIntroMusic() {
            if (introMusic && musicEnabled) {
                introMusic.volume = 0.5;
                introMusic.play().catch(function(e) {});
            }
        }
        
        function stopIntroMusic() {
            if (introMusic) { introMusic.pause(); introMusic.currentTime = 0; }
        }
        
        function startMusic() {
            if (bgMusic && musicEnabled) {
                bgMusic.volume = 0.5;
                bgMusic.play().catch(function(e) {});
            }
        }
        
        function stopMusic() {
            if (bgMusic) bgMusic.pause();
        }
        
        function toggleMusic() {
            musicEnabled = !musicEnabled;
            if (musicEnabled) {
                if (gameState.started) startMusic();
                else if (!document.getElementById('intro-screen').classList.contains('hidden')) startIntroMusic();
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
                if (type === 'dialog') playNote(600, 0.08, 'square', now, 0.1);
                else if (type === 'success') { playNote(523, 0.15, 'square', now, 0.15); playNote(659, 0.15, 'square', now + 0.1, 0.15); playNote(784, 0.2, 'square', now + 0.2, 0.15); }
                else if (type === 'error') playNote(200, 0.3, 'sawtooth', now, 0.1);
                else if (type === 'step') playNote(100 + Math.random() * 50, 0.05, 'triangle', now, 0.03);
            } catch(e) {}
        }
        
        // ===== CONFIGURATION =====
        var TILE_SIZE = 32;
        var MAP_WIDTH = 50;
        var MAP_HEIGHT = 40;
        var CANVAS_WIDTH = 640;
        var CANVAS_HEIGHT = 480;
        
        var COLORS = {
            grass: ['#3d9970', '#2ecc71', '#27ae60', '#229954'],
            path: ['#8b7355', '#a08060', '#6b5344'],
            water: ['#3498db', '#2980b9', '#1f618d', '#5dade2'],
            mountain: ['#7f8c8d', '#95a5a6', '#6c7a7d', '#566573'],
            forest: ['#1e5631', '#2d6a4f', '#1b4332', '#145a32'],
            building: ['#c0392b', '#a93226', '#922b21'],
            roof: ['#8e44ad', '#7d3c98', '#6c3483'],
            snow: ['#ecf0f1', '#d5dbdb', '#bfc9ca', '#ffffff'],
            causses: ['#d4b896', '#c4a882', '#b89b6f']
        };
        
        var CHARACTERS = {
            julien: { name: 'Julien', colors: { hair: '#5d4e37', hairLight: '#7a6b54', skin: '#f5cba7', skinShade: '#e0b090', shirt: '#3498db', shirtShade: '#2980b9', pants: '#2c3e50', pantsShade: '#1a252f', eyes: '#2c3e50' }, role: "L'Expert Linux" },
            orl: { name: 'ORL', colors: { hair: '#1a1a1a', hairLight: '#333333', skin: '#e0c4a8', skinShade: '#c9a87c', shirt: '#e74c3c', shirtShade: '#c0392b', pants: '#1a1a1a', pantsShade: '#0d0d0d', eyes: '#1a1a1a' }, role: "Le Couteau Suisse" },
            gwana: { name: 'Gwana', colors: { hair: '#8b4513', hairLight: '#a0522d', skin: '#d4a574', skinShade: '#b8956a', shirt: '#27ae60', shirtShade: '#1e8449', pants: '#2c3e50', pantsShade: '#1a252f', eyes: '#1e5631' }, role: "Le Modeur Fou" },
            joe: { name: 'Joe', colors: { hair: '#d4a017', hairLight: '#f1c40f', skin: '#fad6a5', skinShade: '#e5c08a', shirt: '#9b59b6', shirtShade: '#7d3c98', pants: '#34495e', pantsShade: '#2c3e50', eyes: '#4a235a' }, role: "Le Collectionneur" }
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
        
        var gameState = {
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
            selectedOption: 0,
            quizSuccess: false,
            quizVillage: null,
            inventory: [],
            animationTime: 0,
            mapTiles: [],
            canMove: true,
            dialogTyping: false,
            typeInterval: null,
            lastStepTime: 0,
            touchDir: { x: 0, y: 0 }
        };
        
        var canvas = document.getElementById('game-canvas');
        var ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        
        var minimapCanvas = document.getElementById('minimap-canvas');
        var minimapCtx = minimapCanvas.getContext('2d');
        minimapCtx.imageSmoothingEnabled = false;
        
        // ===== GENERATION MAP =====
        function generateMap() {
            var map = [];
            for (var y = 0; y < MAP_HEIGHT; y++) {
                map[y] = [];
                for (var x = 0; x < MAP_WIDTH; x++) {
                    var tile = 'grass';
                    
                    // Rivieres
                    if (y >= 24 && y <= 26 && x >= 5 && x <= 26 && Math.abs(y - 25 + Math.sin(x * 0.3)) < 1.5) tile = 'water';
                    if (x >= 40 && x <= 44 && y >= 5 && y <= 20 && Math.abs(x - 42 + Math.sin(y * 0.3)) < 1.5) tile = 'water';
                    if (y >= 28 && y <= 35 && x >= 28 && x <= 40 && Math.abs(y - 31 + Math.sin(x * 0.2) * 2) < 1.5) tile = 'water';
                    
                    // Montagnes
                    if (x < 15 && y < 15 && Math.random() < 0.6) tile = 'mountain';
                    if (x > 35 && y > 20 && y < 32 && Math.random() < 0.5) tile = 'mountain';
                    if (y > 35) { tile = 'mountain'; if (x >= 26 && x <= 32) tile = 'snow'; }
                    
                    // Causses et forets
                    if (y >= 28 && y <= 35 && x >= 10 && x <= 28 && Math.random() < 0.4 && tile === 'grass') tile = 'causses';
                    if (Math.random() < 0.12 && tile === 'grass') tile = 'forest';
                    
                    // Chemins
                    VILLAGES.forEach(function(v, i) {
                        var dist = Math.sqrt(Math.pow(x - v.x, 2) + Math.pow(y - v.y, 2));
                        if (dist < 3) tile = 'path';
                        if (VILLAGES[i + 1]) {
                            var next = VILLAGES[i + 1];
                            var dx = next.x - v.x, dy = next.y - v.y;
                            for (var t = 0; t <= 1; t += 0.02) {
                                var px = v.x + dx * t, py = v.y + dy * t;
                                if (Math.abs(x - px) < 1.2 && Math.abs(y - py) < 1.2 && tile !== 'water') tile = 'path';
                            }
                        }
                    });
                    map[y][x] = tile;
                }
            }
            return map;
        }
        
        // ===== DESSIN TILES AMELIORES =====
        function drawTile(x, y, type, time) {
            var px = x * TILE_SIZE - gameState.cameraX;
            var py = y * TILE_SIZE - gameState.cameraY;
            if (px < -TILE_SIZE || px > CANVAS_WIDTH || py < -TILE_SIZE || py > CANVAS_HEIGHT) return;
            
            var colors = COLORS[type] || COLORS.grass;
            
            // Base
            ctx.fillStyle = colors[0];
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            
            if (type === 'grass') {
                // Variations herbe
                ctx.fillStyle = colors[1];
                for (var i = 0; i < 4; i++) {
                    var gx = px + 3 + (i * 8) + Math.sin(time/600 + x + i) * 1.5;
                    var gy = py + 8 + (i % 2) * 12;
                    ctx.fillRect(gx, gy, 2, 5 + Math.sin(time/400 + i) * 2);
                }
                // Fleurs occasionnelles
                if ((x + y) % 7 === 0) {
                    ctx.fillStyle = '#f1c40f';
                    ctx.fillRect(px + 14, py + 14, 4, 4);
                }
            } else if (type === 'water') {
                // Vagues animees
                var wave = Math.sin(time/250 + x * 0.5) * 3;
                ctx.fillStyle = colors[3];
                ctx.fillRect(px, py + 6 + wave, TILE_SIZE, 6);
                ctx.fillStyle = colors[1];
                ctx.fillRect(px, py + 16 + wave * 0.5, TILE_SIZE, 4);
                // Reflets
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.fillRect(px + 8 + wave, py + 4, 8, 2);
            } else if (type === 'forest') {
                // Tronc avec details
                ctx.fillStyle = '#5d4e37';
                ctx.fillRect(px + 13, py + 16, 6, 16);
                ctx.fillStyle = '#4a3c2a';
                ctx.fillRect(px + 13, py + 16, 2, 16);
                // Feuillage multicouche
                ctx.fillStyle = colors[2];
                ctx.beginPath();
                ctx.arc(px + 16, py + 14, 11, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = colors[0];
                ctx.beginPath();
                ctx.arc(px + 14, py + 12, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = colors[1];
                ctx.beginPath();
                ctx.arc(px + 18, py + 10, 6, 0, Math.PI * 2);
                ctx.fill();
            } else if (type === 'mountain') {
                // Montagne avec ombrage
                ctx.fillStyle = colors[3];
                ctx.beginPath();
                ctx.moveTo(px + 16, py + 2);
                ctx.lineTo(px + 30, py + 30);
                ctx.lineTo(px + 2, py + 30);
                ctx.fill();
                ctx.fillStyle = colors[1];
                ctx.beginPath();
                ctx.moveTo(px + 16, py + 2);
                ctx.lineTo(px + 16, py + 30);
                ctx.lineTo(px + 30, py + 30);
                ctx.fill();
                // Neige au sommet
                ctx.fillStyle = '#ecf0f1';
                ctx.beginPath();
                ctx.moveTo(px + 16, py + 2);
                ctx.lineTo(px + 22, py + 10);
                ctx.lineTo(px + 10, py + 10);
                ctx.fill();
            } else if (type === 'snow') {
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.moveTo(px + 16, py);
                ctx.lineTo(px + 32, py + 32);
                ctx.lineTo(px, py + 32);
                ctx.fill();
                ctx.fillStyle = '#d5dbdb';
                ctx.beginPath();
                ctx.moveTo(px + 16, py);
                ctx.lineTo(px + 16, py + 32);
                ctx.lineTo(px + 32, py + 32);
                ctx.fill();
                // Brillance
                ctx.fillStyle = 'rgba(255,255,255,0.8)';
                ctx.fillRect(px + 10, py + 8, 4, 4);
            } else if (type === 'path') {
                // Chemin avec cailloux
                ctx.fillStyle = colors[1];
                ctx.fillRect(px + 2, py + 6, 8, 5);
                ctx.fillRect(px + 14, py + 18, 10, 6);
                ctx.fillRect(px + 22, py + 6, 6, 5);
                ctx.fillStyle = colors[2];
                ctx.fillRect(px + 6, py + 22, 5, 4);
            } else if (type === 'causses') {
                ctx.fillStyle = colors[1];
                ctx.fillRect(px + 2, py + 2, 12, 6);
                ctx.fillRect(px + 18, py + 14, 10, 8);
                ctx.fillStyle = colors[2];
                ctx.fillRect(px + 8, py + 22, 8, 6);
            }
        }
        
        // ===== SPRITES PERSONNAGES AMELIORES =====
        function drawCharacter(x, y, char, direction, frame, isPlayer) {
            var px = x - gameState.cameraX;
            var py = y - gameState.cameraY;
            var c = char.colors;
            var bounce = isPlayer ? Math.sin(frame * 0.3) * 2 : 0;
            var walkCycle = Math.sin(frame * 0.4) * 3;
            
            // Ombre
            ctx.fillStyle = 'rgba(0,0,0,0.35)';
            ctx.beginPath();
            ctx.ellipse(px + 16, py + 31, 11, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Jambes avec animation de marche
            ctx.fillStyle = c.pants;
            if (isPlayer && (gameState.touchDir.x !== 0 || gameState.touchDir.y !== 0 || keys['arrowup'] || keys['arrowdown'] || keys['arrowleft'] || keys['arrowright'] || keys['z'] || keys['q'] || keys['s'] || keys['d'])) {
                // Jambe gauche
                ctx.fillRect(px + 8, py + 22 + bounce, 6, 8 + walkCycle);
                // Jambe droite
                ctx.fillRect(px + 18, py + 22 + bounce, 6, 8 - walkCycle);
            } else {
                ctx.fillRect(px + 8, py + 22 + bounce, 6, 8);
                ctx.fillRect(px + 18, py + 22 + bounce, 6, 8);
            }
            // Ombre jambes
            ctx.fillStyle = c.pantsShade;
            ctx.fillRect(px + 8, py + 26 + bounce, 2, 4);
            ctx.fillRect(px + 18, py + 26 + bounce, 2, 4);
            
            // Corps
            ctx.fillStyle = c.shirt;
            ctx.fillRect(px + 6, py + 10 + bounce, 20, 13);
            // Ombre corps
            ctx.fillStyle = c.shirtShade;
            ctx.fillRect(px + 6, py + 10 + bounce, 4, 13);
            ctx.fillRect(px + 6, py + 19 + bounce, 20, 4);
            
            // Bras avec animation
            var armSwing = isPlayer ? Math.sin(frame * 0.4) * 4 : 0;
            ctx.fillStyle = c.shirt;
            ctx.fillRect(px + 2, py + 12 + bounce + armSwing, 5, 10);
            ctx.fillRect(px + 25, py + 12 + bounce - armSwing, 5, 10);
            ctx.fillStyle = c.shirtShade;
            ctx.fillRect(px + 2, py + 18 + bounce + armSwing, 5, 4);
            ctx.fillRect(px + 25, py + 18 + bounce - armSwing, 5, 4);
            
            // Mains
            ctx.fillStyle = c.skin;
            ctx.fillRect(px + 2, py + 20 + bounce + armSwing, 5, 4);
            ctx.fillRect(px + 25, py + 20 + bounce - armSwing, 5, 4);
            
            // Tete
            ctx.fillStyle = c.skin;
            ctx.fillRect(px + 8, py + 2 + bounce, 16, 10);
            // Ombre visage
            ctx.fillStyle = c.skinShade;
            ctx.fillRect(px + 8, py + 8 + bounce, 16, 4);
            
            // Cheveux
            ctx.fillStyle = c.hair;
            ctx.fillRect(px + 6, py + bounce, 20, 5);
            ctx.fillRect(px + 6, py + 2 + bounce, 3, 6);
            ctx.fillRect(px + 23, py + 2 + bounce, 3, 6);
            // Reflet cheveux
            ctx.fillStyle = c.hairLight;
            ctx.fillRect(px + 10, py + 1 + bounce, 8, 2);
            
            // Yeux avec direction
            ctx.fillStyle = c.eyes || '#000';
            var eyeOffsetX = direction === 'left' ? -2 : direction === 'right' ? 2 : 0;
            var eyeOffsetY = direction === 'up' ? -1 : direction === 'down' ? 1 : 0;
            ctx.fillRect(px + 10 + eyeOffsetX, py + 5 + bounce + eyeOffsetY, 3, 3);
            ctx.fillRect(px + 19 + eyeOffsetX, py + 5 + bounce + eyeOffsetY, 3, 3);
            // Reflet yeux
            ctx.fillStyle = '#fff';
            ctx.fillRect(px + 11 + eyeOffsetX, py + 5 + bounce + eyeOffsetY, 1, 1);
            ctx.fillRect(px + 20 + eyeOffsetX, py + 5 + bounce + eyeOffsetY, 1, 1);
            
            // Bouche
            ctx.fillStyle = c.skinShade;
            ctx.fillRect(px + 13, py + 9 + bounce, 6, 1);
        }
        
        // ===== NPC AMELIORES =====
        function drawNPC(village, index) {
            var px = village.x * TILE_SIZE - gameState.cameraX + 32;
            var py = village.y * TILE_SIZE - gameState.cameraY;
            if (px < -TILE_SIZE || px > CANVAS_WIDTH || py < -TILE_SIZE || py > CANVAS_HEIGHT) return;
            
            var completed = index < gameState.currentVillage;
            var current = index === gameState.currentVillage;
            var npc = village.npc;
            var float = Math.sin(gameState.animationTime / 300) * 2;
            
            // Ombre
            ctx.fillStyle = 'rgba(0,0,0,0.35)';
            ctx.beginPath();
            ctx.ellipse(px + 16, py + 32, 12, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Robe
            ctx.fillStyle = npc.robeColor;
            ctx.beginPath();
            ctx.moveTo(px + 6, py + 14);
            ctx.lineTo(px + 26, py + 14);
            ctx.lineTo(px + 30, py + 32);
            ctx.lineTo(px + 2, py + 32);
            ctx.fill();
            // Ombre robe
            ctx.fillStyle = npc.hatColor;
            ctx.beginPath();
            ctx.moveTo(px + 6, py + 14);
            ctx.lineTo(px + 10, py + 14);
            ctx.lineTo(px + 6, py + 32);
            ctx.lineTo(px + 2, py + 32);
            ctx.fill();
            
            // Ceinture
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(px + 6, py + 20, 20, 3);
            
            // Tete
            ctx.fillStyle = '#f5cba7';
            ctx.fillRect(px + 9, py + 4, 14, 11);
            ctx.fillStyle = '#e0b090';
            ctx.fillRect(px + 9, py + 11, 14, 4);
            
            // Chapeau/capuche
            ctx.fillStyle = npc.hatColor;
            ctx.beginPath();
            ctx.moveTo(px + 16, py - 6 + float);
            ctx.lineTo(px + 28, py + 8);
            ctx.lineTo(px + 4, py + 8);
            ctx.fill();
            ctx.fillStyle = npc.robeColor;
            ctx.fillRect(px + 8, py + 4, 16, 4);
            
            // Yeux
            ctx.fillStyle = '#000';
            ctx.fillRect(px + 12, py + 7, 3, 3);
            ctx.fillRect(px + 18, py + 7, 3, 3);
            ctx.fillStyle = '#fff';
            ctx.fillRect(px + 13, py + 7, 1, 1);
            ctx.fillRect(px + 19, py + 7, 1, 1);
            
            // Barbe pour certains
            if (index % 3 === 0) {
                ctx.fillStyle = '#bdc3c7';
                ctx.fillRect(px + 11, py + 12, 10, 4);
                ctx.fillRect(px + 13, py + 16, 6, 3);
            }
            
            // Indicateur
            if (current && !completed) {
                ctx.fillStyle = '#f4d03f';
                ctx.font = 'bold 18px Arial';
                ctx.fillText('!', px + 13, py - 10 + float);
            } else if (completed) {
                ctx.fillStyle = '#2ecc71';
                ctx.font = 'bold 12px Arial';
                ctx.fillText('✓', px + 11, py - 6);
            }
        }
        
        // ===== VILLAGES AMELIORES =====
        function drawVillage(village, index) {
            var px = village.x * TILE_SIZE - gameState.cameraX;
            var py = village.y * TILE_SIZE - gameState.cameraY;
            if (px < -96 || px > CANVAS_WIDTH + 64 || py < -96 || py > CANVAS_HEIGHT + 64) return;
            
            var completed = index < gameState.currentVillage;
            var current = index === gameState.currentVillage;
            
            // Maison principale
            var houseColor = completed ? '#27ae60' : (current ? '#f4d03f' : '#c0392b');
            var houseShade = completed ? '#1e8449' : (current ? '#d4ac0d' : '#922b21');
            
            // Mur
            ctx.fillStyle = houseColor;
            ctx.fillRect(px - 12, py - 8, 44, 32);
            ctx.fillStyle = houseShade;
            ctx.fillRect(px - 12, py - 8, 8, 32);
            ctx.fillRect(px - 12, py + 16, 44, 8);
            
            // Toit
            ctx.fillStyle = '#8e44ad';
            ctx.beginPath();
            ctx.moveTo(px + 10, py - 32);
            ctx.lineTo(px + 38, py - 8);
            ctx.lineTo(px - 18, py - 8);
            ctx.fill();
            ctx.fillStyle = '#6c3483';
            ctx.beginPath();
            ctx.moveTo(px + 10, py - 32);
            ctx.lineTo(px + 10, py - 8);
            ctx.lineTo(px + 38, py - 8);
            ctx.fill();
            
            // Porte
            ctx.fillStyle = '#5d4e37';
            ctx.fillRect(px + 4, py + 6, 12, 18);
            ctx.fillStyle = '#4a3c2a';
            ctx.fillRect(px + 4, py + 6, 4, 18);
            // Poignee
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(px + 12, py + 14, 2, 3);
            
            // Fenetres
            ctx.fillStyle = '#f4d03f';
            ctx.fillRect(px + 20, py, 10, 10);
            ctx.fillStyle = '#f39c12';
            ctx.fillRect(px + 24, py + 2, 2, 6);
            ctx.fillRect(px + 21, py + 4, 8, 2);
            
            // Cheminee
            ctx.fillStyle = '#7f8c8d';
            ctx.fillRect(px + 24, py - 26, 8, 12);
            // Fumee animee
            var smoke = Math.sin(gameState.animationTime / 400) * 3;
            ctx.fillStyle = 'rgba(200,200,200,0.5)';
            ctx.beginPath();
            ctx.arc(px + 28 + smoke, py - 30, 4, 0, Math.PI * 2);
            ctx.arc(px + 26 - smoke, py - 36, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Nom du village
            var playerDist = Math.sqrt(Math.pow(gameState.playerX/TILE_SIZE - village.x, 2) + Math.pow(gameState.playerY/TILE_SIZE - village.y, 2));
            if (playerDist < 10 || current) {
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(px - 20, py - 50, 60, 18);
                ctx.fillStyle = current ? '#f4d03f' : '#fff';
                ctx.font = '8px "Press Start 2P"';
                ctx.textAlign = 'center';
                ctx.fillText(village.name.toUpperCase(), px + 10, py - 40);
                ctx.fillStyle = '#888';
                ctx.font = '5px "Press Start 2P"';
                ctx.fillText(village.region, px + 10, py - 34);
                ctx.textAlign = 'left';
            }
        }
        
        function drawTeam() {
            var chars = Object.values(CHARACTERS);
            var offsets = [{ x: -26, y: 10 }, { x: 26, y: 10 }, { x: 0, y: 26 }];
            
            // Dessiner les suiveurs d'abord (derriere)
            for (var i = 1; i < chars.length; i++) {
                drawCharacter(gameState.playerX + offsets[i-1].x, gameState.playerY + offsets[i-1].y, chars[i], gameState.playerDir, gameState.playerFrame + i * 5, false);
            }
            // Leader en dernier (devant)
            drawCharacter(gameState.playerX, gameState.playerY, chars[0], gameState.playerDir, gameState.playerFrame, true);
        }
        
        function drawMinimap() {
            minimapCtx.fillStyle = '#1a1a2e';
            minimapCtx.fillRect(0, 0, 100, 80);
            var scaleX = 100 / MAP_WIDTH;
            var scaleY = 80 / MAP_HEIGHT;
            
            for (var y = 0; y < MAP_HEIGHT; y += 2) {
                for (var x = 0; x < MAP_WIDTH; x += 2) {
                    var tile = gameState.mapTiles[y] ? gameState.mapTiles[y][x] : 'grass';
                    minimapCtx.fillStyle = COLORS[tile] ? COLORS[tile][0] : '#2ecc71';
                    minimapCtx.fillRect(x * scaleX, y * scaleY, scaleX * 2, scaleY * 2);
                }
            }
            
            // Chemins sur minimap
            VILLAGES.forEach(function(v, i) {
                if (VILLAGES[i + 1]) {
                    minimapCtx.strokeStyle = i < gameState.currentVillage ? '#2ecc71' : '#666';
                    minimapCtx.lineWidth = 1;
                    minimapCtx.beginPath();
                    minimapCtx.moveTo(v.x * scaleX, v.y * scaleY);
                    minimapCtx.lineTo(VILLAGES[i+1].x * scaleX, VILLAGES[i+1].y * scaleY);
                    minimapCtx.stroke();
                }
                
                minimapCtx.fillStyle = i < gameState.currentVillage ? '#2ecc71' : i === gameState.currentVillage ? '#f4d03f' : '#e74c3c';
                minimapCtx.beginPath();
                minimapCtx.arc(v.x * scaleX, v.y * scaleY, 3, 0, Math.PI * 2);
                minimapCtx.fill();
            });
            
            // Joueur
            minimapCtx.fillStyle = '#fff';
            minimapCtx.fillRect((gameState.playerX / TILE_SIZE) * scaleX - 2, (gameState.playerY / TILE_SIZE) * scaleY - 2, 4, 4);
        }
        
        function updateCamera() {
            var targetX = gameState.playerX - CANVAS_WIDTH / 2 + 16;
            var targetY = gameState.playerY - CANVAS_HEIGHT / 2 + 16;
            gameState.cameraX += (targetX - gameState.cameraX) * 0.08;
            gameState.cameraY += (targetY - gameState.cameraY) * 0.08;
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
        
        // ===== CONTROLES CLAVIER =====
        var keys = {};
        document.addEventListener('keydown', function(e) {
            keys[e.key.toLowerCase()] = true;
            
            // Navigation dans le quiz
            if (gameState.inQuiz) {
                if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'z' || e.key.toLowerCase() === 'w') {
                    e.preventDefault();
                    navigateQuiz(-1);
                } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
                    e.preventDefault();
                    navigateQuiz(1);
                } else if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    handleQuizAction();
                }
                return;
            }
            
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                handleInteraction();
            }
        });
        document.addEventListener('keyup', function(e) { keys[e.key.toLowerCase()] = false; });
        
        function handleQuizAction() {
            var options = document.querySelectorAll('.quiz-option');
            
            // Si on est dans l'écran de résultat (pas d'options actives)
            if (options.length === 0 || (options.length > 0 && options[0].disabled)) {
                if (gameState.quizSuccess) {
                    if (gameState.quizVillage && gameState.quizVillage.isFinal) {
                        showVictory();
                    } else {
                        gameState.currentVillage++;
                    }
                }
                closeQuiz();
                return;
            }
            
            // Sinon valider l'option
            validateQuizOption();
        }
        
        // ===== CONTROLES TACTILES =====
        function setupTouchControls() {
            var dpadBtns = ['up', 'down', 'left', 'right'];
            dpadBtns.forEach(function(dir) {
                var btn = document.getElementById('dpad-' + dir);
                
                btn.addEventListener('touchstart', function(e) {
                    if (e.cancelable) e.preventDefault();
                    
                    // Navigation quiz avec D-pad
                    if (gameState.inQuiz) {
                        if (dir === 'up') navigateQuiz(-1);
                        if (dir === 'down') navigateQuiz(1);
                        return;
                    }
                    
                    if (dir === 'up') gameState.touchDir.y = -1;
                    if (dir === 'down') gameState.touchDir.y = 1;
                    if (dir === 'left') gameState.touchDir.x = -1;
                    if (dir === 'right') gameState.touchDir.x = 1;
                }, { passive: false });
                
                btn.addEventListener('touchend', function(e) {
                    if (e.cancelable) e.preventDefault();
                    if (gameState.inQuiz) return;
                    
                    if (dir === 'up' || dir === 'down') gameState.touchDir.y = 0;
                    if (dir === 'left' || dir === 'right') gameState.touchDir.x = 0;
                }, { passive: false });
                
                btn.addEventListener('touchcancel', function(e) {
                    gameState.touchDir = { x: 0, y: 0 };
                });
                
                // Support souris aussi pour test sur desktop
                btn.addEventListener('mousedown', function(e) {
                    // Navigation quiz avec D-pad
                    if (gameState.inQuiz) {
                        if (dir === 'up') navigateQuiz(-1);
                        if (dir === 'down') navigateQuiz(1);
                        return;
                    }
                    
                    if (dir === 'up') gameState.touchDir.y = -1;
                    if (dir === 'down') gameState.touchDir.y = 1;
                    if (dir === 'left') gameState.touchDir.x = -1;
                    if (dir === 'right') gameState.touchDir.x = 1;
                });
                
                btn.addEventListener('mouseup', function(e) {
                    if (gameState.inQuiz) return;
                    if (dir === 'up' || dir === 'down') gameState.touchDir.y = 0;
                    if (dir === 'left' || dir === 'right') gameState.touchDir.x = 0;
                });
                
                btn.addEventListener('mouseleave', function(e) {
                    if (gameState.inQuiz) return;
                    if (dir === 'up' || dir === 'down') gameState.touchDir.y = 0;
                    if (dir === 'left' || dir === 'right') gameState.touchDir.x = 0;
                });
            });
            
            // Bouton action
            var actionBtn = document.getElementById('action-btn');
            actionBtn.addEventListener('touchstart', function(e) {
                if (e.cancelable) e.preventDefault();
                handleActionButton();
            }, { passive: false });
            
            actionBtn.addEventListener('mousedown', function(e) {
                handleActionButton();
            });
        }
        
        function handleActionButton() {
            if (gameState.inQuiz) {
                handleQuizAction();
            } else {
                handleInteraction();
            }
        }
        
        function handleMovement() {
            if (!gameState.started || !gameState.canMove || gameState.inDialog || gameState.inQuiz) return;
            
            var speed = 3;
            var dx = 0, dy = 0;
            
            // Clavier
            if (keys['arrowup'] || keys['z'] || keys['w']) { dy = -speed; gameState.playerDir = 'up'; }
            if (keys['arrowdown'] || keys['s']) { dy = speed; gameState.playerDir = 'down'; }
            if (keys['arrowleft'] || keys['q'] || keys['a']) { dx = -speed; gameState.playerDir = 'left'; }
            if (keys['arrowright'] || keys['d']) { dx = speed; gameState.playerDir = 'right'; }
            
            // Tactile
            if (gameState.touchDir.x !== 0 || gameState.touchDir.y !== 0) {
                dx = gameState.touchDir.x * speed;
                dy = gameState.touchDir.y * speed;
                if (gameState.touchDir.y < 0) gameState.playerDir = 'up';
                else if (gameState.touchDir.y > 0) gameState.playerDir = 'down';
                else if (gameState.touchDir.x < 0) gameState.playerDir = 'left';
                else if (gameState.touchDir.x > 0) gameState.playerDir = 'right';
            }
            
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
            
            // Mise a jour lieu
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
        
        // ===== DIALOGUES =====
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
        
        // ===== QUIZ =====
        function startQuiz(quiz, village) {
            gameState.inQuiz = true;
            gameState.currentQuiz = { quiz: quiz, village: village };
            gameState.selectedOption = 0;
            
            document.getElementById('quiz-panel').style.display = 'block';
            document.getElementById('quiz-title').textContent = 'ENIGME RETRO';
            document.getElementById('quiz-question').textContent = quiz.question;
            document.getElementById('quiz-controls-hint').style.display = 'block';
            
            var options = document.getElementById('quiz-options');
            options.innerHTML = '';
            
            quiz.options.forEach(function(opt, i) {
                var btn = document.createElement('button');
                btn.className = 'quiz-option' + (i === 0 ? ' selected' : '');
                btn.textContent = String.fromCharCode(65 + i) + '. ' + opt;
                btn.setAttribute('data-index', i);
                btn.onclick = function() { 
                    selectQuizOption(i);
                    setTimeout(function() { validateQuizOption(); }, 150);
                };
                options.appendChild(btn);
            });
            
            playSFX('dialog');
        }
        
        function selectQuizOption(index) {
            var options = document.querySelectorAll('.quiz-option');
            var maxIndex = options.length - 1;
            
            if (index < 0) index = maxIndex;
            if (index > maxIndex) index = 0;
            
            gameState.selectedOption = index;
            
            options.forEach(function(btn, i) {
                if (i === index) {
                    btn.classList.add('selected');
                } else {
                    btn.classList.remove('selected');
                }
            });
            
            playSFX('step');
        }
        
        function navigateQuiz(direction) {
            if (!gameState.inQuiz) return;
            var newIndex = gameState.selectedOption + direction;
            selectQuizOption(newIndex);
        }
        
        function validateQuizOption() {
            if (!gameState.inQuiz) return;
            var options = document.querySelectorAll('.quiz-option');
            if (options.length === 0) return;
            if (options[0].disabled) return; // Déjà validé
            
            checkAnswer(gameState.selectedOption);
        }
        
        function checkAnswer(index) {
            var quiz = gameState.currentQuiz.quiz;
            var village = gameState.currentQuiz.village;
            var buttons = document.querySelectorAll('.quiz-option');
            
            // Cacher le hint de contrôles
            document.getElementById('quiz-controls-hint').style.display = 'none';
            
            buttons.forEach(function(btn, i) {
                btn.disabled = true;
                btn.classList.remove('selected');
                if (i === quiz.correct) btn.classList.add('correct');
                else if (i === index) btn.classList.add('wrong');
            });
            
            if (index === quiz.correct) {
                playSFX('success');
                setTimeout(function() {
                    gameState.fragments++;
                    document.getElementById('quest-progress').textContent = 'Artefacts: ' + gameState.fragments + '/9';
                    gameState.inventory.push(village.artifact);
                    updateInventory();
                    
                    document.getElementById('quiz-title').textContent = 'ARTEFACT OBTENU !';
                    document.getElementById('quiz-question').innerHTML = '<span style="color:' + village.artifact.color + '; font-size: 20px;">' + village.artifact.icon + '</span><br><br><span style="color: #f1c40f;">' + village.artifact.name + '</span>';
                    document.getElementById('quiz-options').innerHTML = '<p style="font-size: 6px; color: #888; margin-top: 15px;">Appuyez sur ACTION pour continuer</p>';
                    
                    gameState.quizSuccess = true;
                    gameState.quizVillage = village;
                }, 1000);
            } else {
                playSFX('error');
                document.getElementById('quiz-title').textContent = 'MAUVAISE REPONSE !';
                document.getElementById('quiz-question').innerHTML = '<span style="color: #e74c3c;">Indice :</span><br><br>' + quiz.hint;
                document.getElementById('quiz-options').innerHTML = '<p style="font-size: 6px; color: #888; margin-top: 15px;">Appuyez sur ACTION pour reessayer</p>';
                
                gameState.quizSuccess = false;
            }
        }
        
        function closeQuiz() {
            gameState.inQuiz = false;
            gameState.quizSuccess = false;
            gameState.quizVillage = null;
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
        
        // ===== VICTOIRE =====
        function showVictory() {
            stopMusic();
            startIntroMusic();
            document.getElementById('victory-screen').classList.add('active');
            document.getElementById('touch-controls').style.display = 'none';
            
            var dbCanvas = document.getElementById('database-canvas');
            var dbCtx = dbCanvas.getContext('2d');
            dbCtx.imageSmoothingEnabled = false;
            
            var glitchFrame = 0;
            var sceneStep = 0;
            
            var dialogues = [
                { title: "CAVERNE DU GLITCH", text: "Les 9 artefacts legendaires brillent...<br><br>Le passage vers la Caverne s'ouvre !" },
                { title: "CAVERNE DU GLITCH", text: "Vous descendez dans les profondeurs...<br><br>Une silhouette grise emerge des tenebres..." },
                { title: "DATABASE", text: "Je suis <span style='color:#9b59b6'>DATABASE</span>, le Cheater Gris...<br><br>Gardien des codes oublies..." },
                { title: "DATABASE", text: "Le Rubis de Zelda... L'Anneau de Sonic...<br>Le Champignon... L'Etoile...<br><br>Vous avez reuni les reliques sacrees !" },
                { title: "DATABASE", text: "Cette disquette... E.T....<br><br>La <span style='color:#e74c3c'>MALEDICTION DE L'INJOUABILITE</span>...<br>Je connais les CHEAT CODES INTERDITS !" },
                { title: "RITUAL DU GLITCH", text: "<span style='color:#2ecc71'>IDDQD... IDKFA... NOCLIP...</span><br><span style='color:#3498db'>UP UP DOWN DOWN LEFT RIGHT B A...</span><br><br>La disquette tremble !" },
                { title: "MALEDICTION LEVEE !", text: "C'EST FAIT ! La malediction est brisee !<br><br>Les gamers pourront <span style='color:#f1c40f'>ENFIN TERMINER E.T.</span> !" },
                { title: "VICTOIRE !", text: "<span style='color:#f1c40f'>METAPIXL</span> a accompli l'impossible !<br><br><span style='color:#3498db'>Julien</span>, <span style='color:#e74c3c'>ORL</span>, <span style='color:#27ae60'>Gwana</span>, <span style='color:#9b59b6'>Joe</span><br>Et <span style='color:#9b59b6'>Database</span> le Cheater Gris...<br><br><span style='color:#f1c40f'>FIN</span>" }
            ];
            
            document.getElementById('victory-text-content').innerHTML = dialogues[0].text;
            
            function drawDatabase(frame) {
                dbCtx.fillStyle = '#0a0a14';
                dbCtx.fillRect(0, 0, 200, 150);
                
                // Glitch background
                for (var i = 0; i < 8; i++) {
                    dbCtx.fillStyle = 'rgba(' + Math.floor(Math.random()*50) + ',0,' + Math.floor(Math.random()*80) + ',0.5)';
                    dbCtx.fillRect(Math.random() * 200, Math.random() * 150, Math.random() * 40, 2);
                }
                
                // Caverne
                dbCtx.fillStyle = '#2c2c54';
                dbCtx.beginPath();
                dbCtx.moveTo(0, 40);
                dbCtx.lineTo(50, 15);
                dbCtx.lineTo(100, 5);
                dbCtx.lineTo(150, 15);
                dbCtx.lineTo(200, 40);
                dbCtx.lineTo(200, 150);
                dbCtx.lineTo(0, 150);
                dbCtx.fill();
                
                // Database
                var dbX = 80;
                var dbY = 50;
                var glitch = Math.sin(frame * 0.2) * 2;
                var float = Math.sin(frame * 0.05) * 3;
                
                // Aura
                dbCtx.fillStyle = 'rgba(155, 89, 182, ' + (0.3 + Math.sin(frame * 0.1) * 0.2) + ')';
                dbCtx.beginPath();
                dbCtx.arc(dbX + 20, dbY + 45 + float, 40 + Math.sin(frame * 0.15) * 5, 0, Math.PI * 2);
                dbCtx.fill();
                
                // Robe
                dbCtx.fillStyle = '#5d6d7e';
                dbCtx.beginPath();
                dbCtx.moveTo(dbX + 5 + glitch, dbY + 30 + float);
                dbCtx.lineTo(dbX + 35 + glitch, dbY + 30 + float);
                dbCtx.lineTo(dbX + 40 + glitch, dbY + 80 + float);
                dbCtx.lineTo(dbX + glitch, dbY + 80 + float);
                dbCtx.fill();
                
                // Tete
                dbCtx.fillStyle = '#95a5a6';
                dbCtx.fillRect(dbX + 10 + glitch, dbY + 15 + float, 20, 18);
                
                // Capuche
                dbCtx.fillStyle = '#4a4a4a';
                dbCtx.beginPath();
                dbCtx.moveTo(dbX + 20 + glitch, dbY + float);
                dbCtx.lineTo(dbX + 38 + glitch, dbY + 22 + float);
                dbCtx.lineTo(dbX + 2 + glitch, dbY + 22 + float);
                dbCtx.fill();
                
                // Yeux glitch
                var eyeColor = frame % 10 < 5 ? '#9b59b6' : '#3498db';
                dbCtx.fillStyle = eyeColor;
                dbCtx.fillRect(dbX + 13 + glitch, dbY + 22 + float, 5, 5);
                dbCtx.fillRect(dbX + 22 + glitch, dbY + 22 + float, 5, 5);
                
                // Codes flottants
                dbCtx.fillStyle = '#2ecc71';
                dbCtx.font = '8px monospace';
                var codes = ['0x', '{}', '[]', ';;', '##'];
                for (var c = 0; c < 5; c++) {
                    var cx = 15 + c * 40 + Math.sin(frame * 0.08 + c) * 10;
                    var cy = 25 + Math.cos(frame * 0.08 + c) * 12;
                    dbCtx.fillText(codes[c], cx, cy);
                }
                
                // Disquette si scene avancee
                if (sceneStep >= 4) {
                    dbCtx.fillStyle = '#2c3e50';
                    var diskY = dbY + 45 + Math.sin(frame * 0.3) * 5 + float;
                    dbCtx.fillRect(dbX + 50, diskY, 30, 30);
                    dbCtx.fillStyle = '#ecf0f1';
                    dbCtx.fillRect(dbX + 55, diskY + 3, 20, 12);
                    ctx.fillStyle = '#e74c3c';
                    dbCtx.fillRect(dbX + 62, diskY + 18, 10, 10);
                    
                    // Effet magique
                    dbCtx.strokeStyle = '#f1c40f';
                    dbCtx.lineWidth = 2;
                    for (var r = 0; r < 3; r++) {
                        dbCtx.beginPath();
                        dbCtx.arc(dbX + 65, diskY + 15, 25 + r * 12 + (frame % 25), 0, Math.PI * 2);
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
        
        // ===== PREVIEW PERSONNAGES =====
        function drawCharacterPreview(canvasId, char) {
            var c = document.getElementById(canvasId);
            if (!c) return;
            var cx = c.getContext('2d');
            cx.imageSmoothingEnabled = false;
            cx.clearRect(0, 0, 40, 40);
            
            var col = char.colors;
            var px = 4, py = 2;
            
            // Jambes
            cx.fillStyle = col.pants;
            cx.fillRect(px + 6, py + 22, 5, 8);
            cx.fillRect(px + 14, py + 22, 5, 8);
            
            // Corps
            cx.fillStyle = col.shirt;
            cx.fillRect(px + 4, py + 12, 17, 11);
            cx.fillStyle = col.shirtShade;
            cx.fillRect(px + 4, py + 12, 4, 11);
            
            // Bras
            cx.fillStyle = col.shirt;
            cx.fillRect(px + 1, py + 13, 4, 9);
            cx.fillRect(px + 20, py + 13, 4, 9);
            
            // Tete
            cx.fillStyle = col.skin;
            cx.fillRect(px + 6, py + 3, 13, 10);
            
            // Cheveux
            cx.fillStyle = col.hair;
            cx.fillRect(px + 4, py + 1, 17, 5);
            cx.fillRect(px + 4, py + 3, 3, 5);
            cx.fillRect(px + 18, py + 3, 3, 5);
            cx.fillStyle = col.hairLight;
            cx.fillRect(px + 8, py + 2, 6, 2);
            
            // Yeux
            cx.fillStyle = col.eyes || '#000';
            cx.fillRect(px + 8, py + 6, 3, 3);
            cx.fillRect(px + 14, py + 6, 3, 3);
            cx.fillStyle = '#fff';
            cx.fillRect(px + 9, py + 6, 1, 1);
            cx.fillRect(px + 15, py + 6, 1, 1);
        }
        
        // ===== BOUCLE PRINCIPALE =====
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
                
                // Dessiner villages et NPCs tries par Y
                var entities = [];
                VILLAGES.forEach(function(v, i) {
                    entities.push({ type: 'village', data: v, index: i, y: v.y });
                    entities.push({ type: 'npc', data: v, index: i, y: v.y + 0.5 });
                });
                entities.push({ type: 'team', y: gameState.playerY / TILE_SIZE });
                
                entities.sort(function(a, b) { return a.y - b.y; });
                
                entities.forEach(function(e) {
                    if (e.type === 'village') drawVillage(e.data, e.index);
                    else if (e.type === 'npc') drawNPC(e.data, e.index);
                    else if (e.type === 'team') drawTeam();
                });
                
                drawMinimap();
            }
            
            requestAnimationFrame(gameLoop);
        }
        
        // ===== INIT =====
        function init() {
            gameState.mapTiles = generateMap();
            updateInventory();
            setupTouchControls();
            
            Object.keys(CHARACTERS).forEach(function(key) {
                drawCharacterPreview('preview-' + key, CHARACTERS[key]);
            });
            
            // Intro
            var introSlides = [
                "Il y a bien longtemps, en <span class='highlight'>1982</span>...<br><br>Un jeu video fut cree dans la precipitation...<br><br>Un jeu si <span class='villain'>MAUDIT</span> que personne ne put jamais le terminer...",
                "<span class='villain'>E.T. L'EXTRA-TERRESTRE</span><br>sur Atari 2600<br><br>Developpe en 5 semaines...<br>Des millions de cartouches invendues...<br>Enterrees dans le desert du Nouveau-Mexique...",
                "La <span class='villain'>MALEDICTION DE L'INJOUABILITE</span><br>fut scellee a jamais...<br><br>Aucun gamer ne pouvait finir ce jeu...",
                "Mais une legende parlait d'un espoir...<br><br>Au coeur de la <span class='highlight'>LOZERE</span>, sous le Mont Aigoual...<br>Se cacherait la <span class='magic'>CAVERNE DU GLITCH</span>...",
                "Et dans cette caverne vivrait<br><span class='magic'>DATABASE, LE CHEATER GRIS</span><br><br>Gardien des codes oublies...<br>Lui seul pourrait lever la malediction !",
                "En 2024, quatre amis decident d'agir...<br><br><span class='highlight'>METAPIXL</span>",
                "<span class='character'>JULIEN</span> - L'Expert Linux<br><span class='character'>ORL</span> - Le Couteau Suisse du Retrogaming<br><span class='character'>GWANA</span> - Le Modeur Fou<br><span class='character'>JOE</span> - Le Collectionneur<br><br>Ils retrouvent une disquette maudite...",
                "Leur mission :<br><br>Traverser la <span class='highlight'>LOZERE</span><br>De <span class='highlight'>MARVEJOLS</span> au <span class='highlight'>MONT AIGOUAL</span><br><br>Collecter les <span class='magic'>9 ARTEFACTS LEGENDAIRES</span>",
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
                
                if (introTypeInterval) clearInterval(introTypeInterval);
                
                introTypeInterval = setInterval(function() {
                    if (i < text.length) {
                        tempText += text[i];
                        introText.innerHTML = tempText;
                        i++;
                    } else {
                        clearInterval(introTypeInterval);
                        introTyping = false;
                    }
                }, 30);
            }
            
            function advanceIntro() {
                if (introTyping) {
                    clearInterval(introTypeInterval);
                    document.getElementById('intro-text').innerHTML = introSlides[currentIntroSlide];
                    introTyping = false;
                    return;
                }
                
                currentIntroSlide++;
                if (currentIntroSlide < introSlides.length) {
                    typeIntroText(introSlides[currentIntroSlide]);
                } else {
                    stopIntroMusic();
                    document.getElementById('intro-screen').classList.add('hidden');
                    document.getElementById('menu-screen').classList.remove('hidden');
                }
            }
            
            typeIntroText(introSlides[0]);
            startIntroMusic();
            
            document.addEventListener('keydown', function(e) {
                if (!document.getElementById('intro-screen').classList.contains('hidden')) {
                    if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        advanceIntro();
                    }
                }
            });
            
            document.getElementById('intro-screen').onclick = advanceIntro;
            
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