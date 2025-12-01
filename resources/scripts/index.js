// Global variables
let currentGame = null;
let currentLevel = 1;
let score = 0;
let gameInstance = null;

// Initialize localStorage for games if not already set
function initializeLocalStorage() {
    if (!localStorage.getItem('gameProgress')) {
        const defaultProgress = {
            trace: { highestLevel: 1, scores: {} },
            catch: { highestLevel: 1, scores: {} },
            color: { highestLevel: 1, scores: {} },
            shapes: { highestLevel: 1, scores: {} },
            basket: { highestLevel: 1, scores: {} }
        };
        localStorage.setItem('gameProgress', JSON.stringify(defaultProgress));
    }
}

// Load game progress from localStorage
function getGameProgress() {
    return JSON.parse(localStorage.getItem('gameProgress'));
}

// Save game progress to localStorage
function saveGameProgress(progress) {
    localStorage.setItem('gameProgress', JSON.stringify(progress));
}

// Game state management
function showScreen(screenId) {
    const screens = ['menu-screen', 'level-screen', 'instruction-screen', 'game-screen', 'complete-screen'];
    
    // Hide all screens
    screens.forEach(screen => {
        document.getElementById(screen).style.display = 'none';
    });

    // Show the selected screen
    document.getElementById(screenId).style.display = 'block';

    // Show/hide the animated title based on the screen
    const animatedTitle = document.getElementById('animated-title');
    if (screenId === 'menu-screen') {
        animatedTitle.style.display = 'block'; // Show title on home page
    } else {
        animatedTitle.style.display = 'none'; // Hide title on other screens
    }
}
function startGame(gameName) {
    currentGame = gameName;
    const titles = {
        'trace': '✏️ Border Tracing',
        'catch': '🎯 Object Catching',
        'color': '🎨 Color Filling',
        'shapes': '🔷 Shape Matching',
        'basket': '🧺 Basket Toss'
    };
    document.getElementById('game-title').textContent = titles[gameName];
    showScreen('level-screen');
    updateLevelButtons();
}

function startLevel(level) {
    const progress = getGameProgress();
    if (level > progress[currentGame].highestLevel) {
        alert('You need to complete the previous level first!');
        return;
    }

    currentLevel = level;
    showInstructions();
}

function showInstructions() {
    const instructions = {
        'trace': {
            text: '<strong>How to Play Border Tracing:</strong><ul><li>Click the green start circle</li><li>Drag your mouse/finger along the path to the red end</li><li>Stay inside the borders!</li><li>Complete the path to win</li></ul>',
            video: 'videos/trace.mp4'
        },
        'catch': {
            text: '<strong>How to Play Object Catching:</strong><ul><li>Move the basket left and right using arrow keys or mouse</li><li>Catch the falling objects</li><li>Avoid the bad items!</li><li>Higher levels are faster</li></ul>',
            video: 'videos/catch.mp4'
        },
        'color': {
            text: '<strong>How to Play Color Filling:</strong><ul><li>Click a color at the bottom</li><li>Click on a shape to fill it</li><li>Match the sample above!</li><li>Correct = +100 points (only once)</li><li>Wrong = 0 points, but you can try again!</li></ul>',
            video: 'videos/color.mp4'
        },
        'shapes': {
            text: '<strong>How to Play Shape Matching:</strong><ul><li>Drag shapes to their matching outlines</li><li>Match all shapes correctly to win</li><li>Higher levels have more shapes</li><li>Be accurate with your placement!</li></ul>',
            video: 'videos/shapes.mp4'
        },
        'basket': {
            text: '<strong>How to Play Basket Toss:</strong><ul><li>Click and drag to aim</li><li>Release to throw the object</li><li>Get it into the basket!</li><li>Levels 3-4: Basket keeps moving after you throw!</li></ul>',
            video: 'videos/basket.mp4'
        }
    };

    // Set instructions text
    document.getElementById('instructions-text').innerHTML = instructions[currentGame].text;

    // Set video source
    const videoElement = document.getElementById('game-video');
    const noVideoMessage = document.getElementById('no-video-message');
    const videoPath = instructions[currentGame].video;

    if (videoPath) {
        videoElement.src = videoPath;
        videoElement.style.display = 'block';
        noVideoMessage.style.display = 'none';
    } else {
        videoElement.style.display = 'none';
        noVideoMessage.style.display = 'block';
    }

    showScreen('instruction-screen');
}

function startPlaying() {
    score = 0;
    document.getElementById('level-display').textContent = `Level ${currentLevel}`;
    document.getElementById('score-display').textContent = 'Score: 0';
    showScreen('game-screen');
    initP5Game();
}

function backToMenu() {
    if (gameInstance) {
        gameInstance.remove();
        gameInstance = null;
    }
    showScreen('menu-screen');
    updateLevelButtons(); // Refresh level buttons
}

function backToLevels() {
    showScreen('level-screen');
}

function pauseGame() {
    if (gameInstance && typeof gameInstance.isLooping === 'function') {
        if (gameInstance.isLooping()) {
            gameInstance.noLoop();
            alert('Game Paused! Click OK to continue.');
            gameInstance.loop();
        }
    }
}

function quitGame() {
    if (confirm('Are you sure you want to quit?')) {
        if (gameInstance) {
            gameInstance.remove();
            gameInstance = null;
        }
        backToMenu();
    }
}

function completeLevel(finalScore) {
    const progress = getGameProgress();

    // Update score for the current level
    progress[currentGame].scores[currentLevel] = finalScore;

    // Unlock the next level if applicable
    if (currentLevel >= progress[currentGame].highestLevel) {
        progress[currentGame].highestLevel = Math.min(currentLevel + 1, 4);
    }

    // Save updated progress
    saveGameProgress(progress);

    // Show completion screen
    score = finalScore;
    document.getElementById('final-score').textContent = `Your Score: ${finalScore} points! 🌟`;
    showScreen('complete-screen');
    updateLevelButtons(); // Refresh level buttons in case a new level was unlocked
}

function nextLevel() {
    if (currentLevel < 4) {
        currentLevel++;
        showInstructions();
    } else {
        alert('Congratulations! You completed all levels! 🎉');
        backToMenu();
    }
}

function retryLevel() {
    showInstructions();
}

function updateScore(points) {
    if (points > 0) {
        score += points;
        document.getElementById('score-display').textContent = `Score: ${score}`;
    }
}

function updateLevelButtons() {
    const progress = getGameProgress();
    const highestLevel = progress[currentGame].highestLevel;

    // Enable/disable level buttons
    for (let i = 1; i <= 4; i++) {
        const button = document.getElementById(`level-${i}`);
        if (button) {
            button.disabled = i > highestLevel;
            button.style.backgroundColor = i <= highestLevel ? '#4ECDC4' : '#ccc';
        }
    }
}

// P5.js Game Initialization
function initP5Game() {
    const container = document.getElementById('p5-canvas');
    container.innerHTML = '';

    const sketch = function(p) {
        switch (currentGame) {
            case 'trace':
                borderTracingGame(p, currentLevel);
                break;
            case 'catch':
                objectCatchingGame(p, currentLevel);
                break;
            case 'color':
                colorFillingGame(p, currentLevel);
                break;
            case 'shapes':
                shapeMatchingGame(p, currentLevel);
                break;
            case 'basket':
                basketTossGame(p, currentLevel);
                break;
        }
    };

    gameInstance = new p5(sketch, 'p5-canvas');
}

// === BORDER TRACING GAME ===
function borderTracingGame(p, level) {
    let path = [];
    let currentSegment = 0;
    let progress = 0;
    let isTracing = false;
    let pathWidth = Math.max(20, 40 - (level * 5));
    let completed = false;
    let gameScore = 0;
    let totalSegments;

    p.setup = function() {
        p.createCanvas(700, 500);
        generatePath(level);
        totalSegments = path.length - 1;
    };

    function generatePath(level) {
        path = [];
        let numPoints = 5 + level * 2;

        path.push(p.createVector(50, p.height / 2));

        for (let i = 1; i < numPoints - 1; i++) {
            let x = 50 + (p.width - 100) * (i / (numPoints - 1));
            let y = p.height / 2 + p.sin(i * 0.8) * 100 * (level * 0.3 + 0.5);
            path.push(p.createVector(x, y));
        }

        path.push(p.createVector(p.width - 50, p.height / 2));
    }

    p.draw = function() {
        p.background(255, 250, 240);

        if (completed) {
            p.textSize(40);
            p.textAlign(p.CENTER);
            p.fill(0);
            p.stroke(255);
            p.strokeWeight(4);
            p.text('Complete! 🎉', p.width / 2, p.height / 2);
            p.noStroke();
            return;
        }

        p.noFill();
        p.strokeWeight(pathWidth);
        p.stroke(220, 220, 220);
        p.beginShape();
        for (let pt of path) {
            p.curveVertex(pt.x, pt.y);
        }
        p.endShape();

        p.strokeWeight(3);
        p.stroke(100, 100, 255);
        p.drawingContext.setLineDash([10, 10]);
        p.beginShape();
        for (let pt of path) {
            p.curveVertex(pt.x, pt.y);
        }
        p.endShape();
        p.drawingContext.setLineDash([]);

        p.fill(76, 209, 55);
        p.noStroke();
        p.circle(path[0].x, path[0].y, 30);
        p.fill(231, 76, 60);
        p.circle(path[path.length - 1].x, path[path.length - 1].y, 30);

        if (isTracing || completed) {
            p.noFill();
            p.strokeWeight(pathWidth - 4);
            p.stroke(76, 209, 55);
            p.beginShape();
            let currentX, currentY;
            if (currentSegment < totalSegments) {
                let p1 = path[currentSegment];
                let p2 = path[currentSegment + 1];
                currentX = p.lerp(p1.x, p2.x, progress);
                currentY = p.lerp(p1.y, p2.y, progress);
                for (let i = 0; i <= currentSegment; i++) {
                    p.curveVertex(path[i].x, path[i].y);
                }
                p.curveVertex(currentX, currentY);
            } else {
                for (let pt of path) {
                    p.curveVertex(pt.x, pt.y);
                }
            }
            p.endShape();
        }

        if (isTracing) {
            let currentX, currentY;
            if (currentSegment < totalSegments) {
                let p1 = path[currentSegment];
                let p2 = path[currentSegment + 1];
                currentX = p.lerp(p1.x, p2.x, progress);
                currentY = p.lerp(p1.y, p2.y, progress);
            } else {
                currentX = path[path.length - 1].x;
                currentY = path[path.length - 1].y;
            }

            p.fill(255, 200, 0);
            p.circle(p.mouseX, p.mouseY, 20);

            let minDist = Infinity;
            for (let i = 0; i < totalSegments; i++) {
                let d = distToSegment(p.mouseX, p.mouseY, path[i], path[i + 1]);
                if (d < minDist) minDist = d;
            }

            if (minDist > pathWidth / 2) {
            } else {
                let totalDist = 0;
                for (let i = 0; i < totalSegments; i++) {
                    totalDist += p5.Vector.dist(path[i], path[i + 1]);
                }

                let bestDist = 0;
                let bestSeg = 0;
                let bestProg = 0;

                let cumulativeDist = 0;
                for (let i = 0; i < totalSegments; i++) {
                    let p1 = path[i];
                    let p2 = path[i + 1];
                    let segVec = p5.Vector.sub(p2, p1);
                    let mouseVec = p5.Vector.sub(p.createVector(p.mouseX, p.mouseY), p1);
                    let segLen = segVec.mag();
                    if (segLen === 0) continue;
                    segVec.normalize();
                    let proj = p5.Vector.dot(mouseVec, segVec);
                    proj = p.constrain(proj, 0, segLen);
                    let distAlong = cumulativeDist + proj;
                    let pointOnSeg = p5.Vector.add(p1, p5.Vector.mult(segVec, proj));
                    let dToMouse = p5.Vector.dist(pointOnSeg, p.createVector(p.mouseX, p.mouseY));

                    if (dToMouse < pathWidth / 2 && distAlong > bestDist) {
                        bestDist = distAlong;
                        bestSeg = i;
                        bestProg = proj / segLen;
                    }
                    cumulativeDist += segLen;
                }

                if (bestSeg > currentSegment || (bestSeg === currentSegment && bestProg > progress)) {
                    currentSegment = bestSeg;
                    progress = bestProg;
                    let newScore = Math.floor((currentSegment + progress) * 10);
                    if (newScore > gameScore) {
                        let diff = newScore - gameScore;
                        gameScore = newScore;
                        updateScore(diff);
                    }
                }

                if (currentSegment >= totalSegments - 1 && progress >= 0.95) {
                    completed = true;
                    let finalPoints = 500 + level * 100;
                    if (gameScore < finalPoints) {
                        updateScore(finalPoints - gameScore);
                        gameScore = finalPoints;
                    }
                    setTimeout(() => completeLevel(gameScore), 1500);
                }
            }
        }

        p.fill(0);
        p.noStroke();
        p.textSize(16);
        p.textAlign(p.LEFT);
        p.text('Click green circle and drag along the path!', 10, 30);
    };

    function distToSegment(px, py, v1, v2) {
        let x1 = v1.x,
            y1 = v1.y;
        let x2 = v2.x,
            y2 = v2.y;
        let dx = x2 - x1,
            dy = y2 - y1;
        let lenSq = dx * dx + dy * dy;
        let t = lenSq ? ((px - x1) * dx + (py - y1) * dy) / lenSq : -1;
        t = Math.max(0, Math.min(1, t));
        let projX = x1 + t * dx;
        let projY = y1 + t * dy;
        return Math.hypot(px - projX, py - projY);
    }

    p.mousePressed = function() {
        let d = p.dist(p.mouseX, p.mouseY, path[0].x, path[0].y);
        if (d < 30) {
            isTracing = true;
            currentSegment = 0;
            progress = 0;
        }
    };

    p.mouseReleased = function() {
        isTracing = false;
    };
}

// === COLOR FILLING GAME ===
function colorFillingGame(p, level) {
    let regions = [];
    let colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'];
    let selectedColor = null;
    let completed = false;
    let gameScore = 0;

    p.setup = function() {
        p.createCanvas(700, 500);
        generateRegions(level);
    };

    function generateRegions(level) {
        let numRegions = 3 + level;
        regions = [];

        for (let i = 0; i < numRegions; i++) {
            let region = {
                x: 100 + (i % 3) * 180,
                y: 100 + Math.floor(i / 3) * 180,
                w: 100,
                h: 100,
                type: ['rect', 'circle', 'triangle'][Math.floor(p.random(3))],
                filled: false,
                correct: false,
                locked: false,
                color: null,
                targetColor: colors[Math.floor(p.random(colors.length))]
            };
            regions.push(region);
        }
    }

    p.draw = function() {
        p.background(255);

        if (completed) {
            p.fill(46, 204, 113);
            p.textSize(40);
            p.textAlign(p.CENTER);
            p.text('Perfect! 🎉', p.width / 2, p.height / 2);
            return;
        }

        p.fill(0);
        p.textSize(14);
        p.textAlign(p.LEFT);
        p.text('Match these colors:', 10, 20);

        for (let i = 0; i < regions.length; i++) {
            p.fill(regions[i].targetColor);
            p.noStroke();
            drawShape(p, regions[i].type, 50 + i * 70, 40, 40, 40);
        }

        for (let region of regions) {
            if (!region.correct && !region.locked) {
                p.strokeWeight(5);
                p.stroke(255, 0, 0);
                p.fill(region.filled ? region.color : 240);
            } else {
                p.strokeWeight(3);
                p.stroke(0);
                p.fill(region.color);
            }

            drawShape(p, region.type, region.x, region.y, region.w, region.h);
        }

        p.textSize(14);
        p.fill(0);
        p.text('Pick a color:', 10, p.height - 60);

        for (let i = 0; i < colors.length; i++) {
            p.fill(colors[i]);
            if (selectedColor === colors[i]) {
                p.strokeWeight(5);
                p.stroke(255, 215, 0);
            } else {
                p.strokeWeight(2);
                p.stroke(0);
            }
            p.rect(20 + i * 60, p.height - 50, 50, 40, 5);
        }

        let allCorrect = regions.every(r => r.correct);
        if (allCorrect && !completed) {
            completed = true;
            let bonus = 500;
            updateScore(bonus);
            gameScore += bonus;
            setTimeout(() => completeLevel(gameScore), 1500);
        }
    }

    function drawShape(p, type, x, y, w, h) {
        if (type === 'rect') {
            p.rect(x, y, w, h, 10);
        } else if (type === 'circle') {
            p.circle(x + w / 2, y + h / 2, Math.min(w, h));
        } else if (type === 'triangle') {
            p.triangle(x + w / 2, y, x, y + h, x + w, y + h);
        }
    }

    p.mousePressed = function() {
        for (let i = 0; i < colors.length; i++) {
            if (p.mouseX > 20 + i * 60 && p.mouseX < 70 + i * 60 &&
                p.mouseY > p.height - 50 && p.mouseY < p.height - 10) {
                selectedColor = colors[i];
                return;
            }
        }

        if (selectedColor) {
            for (let region of regions) {
                if (isInside(p, region, p.mouseX, p.mouseY)) {
                    if (!region.locked) {
                        region.filled = true;
                        region.color = selectedColor;

                        if (region.color === region.targetColor) {
                            if (!region.correct) {
                                region.correct = true;
                                region.locked = true;
                                gameScore += 100;
                                updateScore(100);
                            }
                        } else {
                            region.correct = false;
                        }
                    }
                    break;
                }
            }
        }
    }

    function isInside(p, region, mx, my) {
        if (region.type === 'rect') {
            return mx > region.x && mx < region.x + region.w &&
                   my > region.y && my < region.y + region.h;
        } else if (region.type === 'circle') {
            let d = p.dist(mx, my, region.x + region.w / 2, region.y + region.h / 2);
            return d < Math.min(region.w, region.h) / 2;
        } else if (region.type === 'triangle') {
            return p5.Vector.dist(p.createVector(mx, my), p.createVector(region.x + region.w / 2, region.y + region.h / 3)) < 60;
        }
        return false;
    }
}

// === BASKET TOSS GAME ===
function basketTossGame(p, level) {
    let ball;
    let basket;
    let isDragging = false;
    let dragStart;
    let attempts = 10;
    let gameScore = 0;
    let basketSpeed = level * 0.5;
    let basketDirection = 1;

    p.setup = function() {
        p.createCanvas(700, 500);
        resetBall();
        basket = { x: p.width - 150, y: p.height - 100, w: 80, h: 60 };
    };

    function resetBall() {
        ball = {
            x: 100,
            y: p.height - 100,
            vx: 0,
            vy: 0,
            r: 20,
            thrown: false
        };
    }

    p.draw = function() {
        p.background(173, 216, 230);
        p.fill(101, 67, 33);
        p.rect(0, p.height - 50, p.width, 50);

        if (level >= 3) {
            basket.x += basketSpeed * basketDirection;
            if (basket.x < 200 || basket.x > p.width - 100) {
                basketDirection *= -1;
            }
        } else {
            if (!ball.thrown) {
                basket.x += basketSpeed * basketDirection;
                if (basket.x < 200 || basket.x > p.width - 100) {
                    basketDirection *= -1;
                }
            }
        }

        p.fill(139, 69, 19);
        p.stroke(0);
        p.strokeWeight(3);
        p.arc(basket.x, basket.y, basket.w, basket.h, 0, p.PI);
        p.line(basket.x - basket.w / 2, basket.y, basket.x - basket.w / 2, basket.y + basket.h / 2);
        p.line(basket.x + basket.w / 2, basket.y, basket.x + basket.w / 2, basket.y + basket.h / 2);

        if (isDragging) {
            p.stroke(255, 0, 0);
            p.strokeWeight(2);
            p.line(ball.x, ball.y, p.mouseX, p.mouseY);
            p.fill(255, 0, 0);
            p.noStroke();
            let angle = p.atan2(ball.y - p.mouseY, ball.x - p.mouseX);
            p.push();
            p.translate(ball.x, ball.y);
            p.rotate(angle);
            p.triangle(20, 0, 10, -5, 10, 5);
            p.pop();
        }

        p.fill(255, 100, 100);
        p.stroke(0);
        p.strokeWeight(2);
        p.circle(ball.x, ball.y, ball.r * 2);

        if (ball.thrown) {
            ball.vx *= 0.99;
            ball.vy += 0.5;
            ball.x += ball.vx;
            ball.y += ball.vy;

            if (ball.y > basket.y - basket.h / 2 && ball.y < basket.y + basket.h / 2 &&
                ball.x > basket.x - basket.w / 2 && ball.x < basket.x + basket.w / 2) {
                gameScore += 100;
                updateScore(100);
                attempts--;
                if (attempts > 0) {
                    setTimeout(resetBall, 500);
                } else {
                    setTimeout(() => completeLevel(gameScore), 1000);
                    p.noLoop();
                }
                ball.thrown = false;
            }

            if (ball.y > p.height + 50 || ball.x < -50 || ball.x > p.width + 50) {
                attempts--;
                if (attempts > 0) {
                    resetBall();
                } else {
                    setTimeout(() => completeLevel(gameScore), 1000);
                    p.noLoop();
                }
            }
        }

        p.fill(0);
        p.noStroke();
        p.textSize(18);
        p.textAlign(p.LEFT);
        p.text(`Attempts: ${attempts}`, 10, 30);
        p.text(`Score: ${gameScore}`, 10, 55);
        p.textSize(14);
        p.text('Click and drag to aim, release to throw!', 10, p.height - 60);
    };

    p.mousePressed = function() {
        let d = p.dist(p.mouseX, p.mouseY, ball.x, ball.y);
        if (d < ball.r && !ball.thrown) {
            isDragging = true;
            dragStart = p.createVector(p.mouseX, p.mouseY);
        }
    };

    p.mouseReleased = function() {
        if (isDragging && !ball.thrown) {
            let dragEnd = p.createVector(p.mouseX, p.mouseY);
            let force = p5.Vector.sub(dragStart, dragEnd);
            force.mult(0.2);
            ball.vx = force.x;
            ball.vy = force.y;
            ball.thrown = true;
            isDragging = false;
        }
    };
}

// === OBJECT CATCHING GAME ===
function objectCatchingGame(p, level) {
    let basket;
    let fallingObjects = [];
    let gameScore = 0;
    let gameTime = 30000;
    let startTime;
    let speed = level * 1.5;
    let spawnRate = Math.max(30, 60 - level * 10);
    let frameCounter = 0;

    p.setup = function() {
        p.createCanvas(700, 500);
        basket = { x: p.width / 2, y: p.height - 50, w: 100 - level * 10, h: 30 };
        startTime = p.millis();
    };

    p.draw = function() {
        p.background(135, 206, 235);
        let elapsed = p.millis() - startTime;
        let remaining = Math.max(0, gameTime - elapsed);

        if (remaining === 0) {
            p.fill(46, 204, 113);
            p.textSize(40);
            p.textAlign(p.CENTER);
            p.text('Time Up! 🎉', p.width / 2, p.height / 2);
            p.textSize(24);
            p.text(`Final Score: ${gameScore}`, p.width / 2, p.height / 2 + 50);
            setTimeout(() => completeLevel(gameScore), 2000);
            p.noLoop();
            return;
        }

        p.fill(101, 67, 33);
        p.rect(0, p.height - 30, p.width, 30);

        frameCounter++;
        if (frameCounter > spawnRate) {
            frameCounter = 0;
            let isGood = p.random() > 0.2;
            fallingObjects.push({
                x: p.random(20, p.width - 20),
                y: -20,
                good: isGood,
                emoji: isGood ? ['🍎', '🍊', '🍌', '🍇'][Math.floor(p.random(4))] : '💣'
            });
        }

        for (let i = fallingObjects.length - 1; i >= 0; i--) {
            let obj = fallingObjects[i];
            obj.y += speed;
            p.textSize(30);
            p.text(obj.emoji, obj.x, obj.y);

            if (obj.y > basket.y && obj.y < basket.y + basket.h &&
                obj.x > basket.x - basket.w / 2 && obj.x < basket.x + basket.w / 2) {
                if (obj.good) {
                    gameScore += 10;
                    updateScore(10);
                } else {
                    gameScore -= 5;
                    document.getElementById('score-display').textContent = `Score: ${gameScore}`;
                }
                fallingObjects.splice(i, 1);
            } else if (obj.y > p.height) {
                fallingObjects.splice(i, 1);
            }
        }

        p.fill(139, 69, 19);
        p.arc(basket.x, basket.y, basket.w, basket.h, 0, p.PI);
        p.rect(basket.x - basket.w / 2, basket.y - basket.h / 2, basket.w, basket.h / 2);
        basket.x = p.constrain(p.mouseX, basket.w / 2, p.width - basket.w / 2);

        p.fill(0);
        p.textSize(16);
        p.textAlign(p.LEFT);
        p.text(`Time: ${Math.ceil(remaining / 1000)}s`, 10, 30);
        p.text(`Score: ${gameScore}`, 10, 50);
    };
}

// === SHAPE MATCHING GAME ===
function shapeMatchingGame(p, level) {
    let shapes = [];
    let slots = [];
    let dragging = null;
    let completed = false;
    let gameScore = 0;

    p.setup = function() {
        p.createCanvas(700, 500);
        generateShapes(level);
    };

    function generateShapes(level) {
        let numShapes = 3 + level;
        shapes = [];
        slots = [];
        let shapeTypes = ['circle', 'square', 'triangle', 'star'];
        let usedTypes = [];

        for (let i = 0; i < numShapes; i++) {
            let type = shapeTypes[i % shapeTypes.length];
            usedTypes.push(type);
            slots.push({ x: 100 + (i % 3) * 200, y: 100 + Math.floor(i / 3) * 150, type: type, filled: false });
        }

        usedTypes.sort(() => Math.random() - 0.5);
        for (let i = 0; i < numShapes; i++) {
            shapes.push({ x: 100 + i * 100, y: 400, type: usedTypes[i], placed: false, offsetX: 0, offsetY: 0 });
        }
    }

    p.draw = function() {
        p.background(255, 250, 240);
        if (completed) {
            p.fill(46, 204, 113);
            p.textSize(40);
            p.textAlign(p.CENTER);
            p.text('All Matched! 🎉', p.width / 2, p.height / 2);
            return;
        }

        p.strokeWeight(3);
        p.stroke(150);
        p.noFill();
        for (let slot of slots) drawShape(p, slot.type, slot.x, slot.y, 60, true);

        p.strokeWeight(2);
        p.stroke(0);
        for (let shape of shapes) {
            if (!shape.placed) {
                p.fill(shape === dragging ? '#FFD93D' : '#4ECDC4');
                drawShape(p, shape.type, shape.x, shape.y, 50, false);
            }
        }

        p.fill(0);
        p.textSize(16);
        p.textAlign(p.LEFT);
        p.noStroke();
        p.text('Drag shapes to matching outlines!', 10, 30);

        if (shapes.every(s => s.placed) && !completed) {
            completed = true;
            gameScore = 1000;
            updateScore(1000);
            setTimeout(() => completeLevel(gameScore), 1500);
        }
    };

    function drawShape(p, type, x, y, size, outline) {
        if (type === 'circle') p.circle(x, y, size);
        else if (type === 'square') {
            p.rectMode(p.CENTER);
            p.rect(x, y, size, size, 5);
            p.rectMode(p.CORNER);
        } else if (type === 'triangle')
            p.triangle(x, y - size / 2, x - size / 2, y + size / 2, x + size / 2, y + size / 2);
        else if (type === 'star') {
            let angle = p.TWO_PI / 5,
                half = angle / 2;
            p.beginShape();
            for (let a = -p.PI / 2; a < p.TWO_PI - p.PI / 2; a += angle) {
                p.vertex(x + p.cos(a) * size / 2, y + p.sin(a) * size / 2);
                p.vertex(x + p.cos(a + half) * size / 3, y + p.sin(a + half) * size / 3);
            }
            p.endShape(p.CLOSE);
        }
    }

    p.mousePressed = function() {
        for (let shape of shapes) {
            if (!shape.placed && p.dist(p.mouseX, p.mouseY, shape.x, shape.y) < 30) {
                dragging = shape;
                shape.offsetX = shape.x - p.mouseX;
                shape.offsetY = shape.y - p.mouseY;
                break;
            }
        }
    };

    p.mouseDragged = function() {
        if (dragging) {
            dragging.x = p.mouseX + dragging.offsetX;
            dragging.y = p.mouseY + dragging.offsetY;
        }
    };

    p.mouseReleased = function() {
        if (dragging) {
            for (let slot of slots) {
                if (p.dist(dragging.x, dragging.y, slot.x, slot.y) < 40 && dragging.type === slot.type && !slot.filled) {
                    dragging.x = slot.x;
                    dragging.y = slot.y;
                    dragging.placed = true;
                    slot.filled = true;
                    gameScore += 100;
                    updateScore(100);
                    dragging = null;
                    return;
                }
            }
            dragging = null;
        }
    };
}

function completeLevel(finalScore) {
    const progress = getGameProgress();

    // Update score for the current level
    progress[currentGame].scores[currentLevel] = finalScore;

    // Unlock the next level if applicable
    if (currentLevel >= progress[currentGame].highestLevel) {
        progress[currentGame].highestLevel = Math.min(currentLevel + 1, 4);
    }

    // Save updated progress
    saveGameProgress(progress);

    // Show confetti!
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3']
    });

    // Show completion screen
    score = finalScore;
    document.getElementById('final-score').textContent = `Your Score: ${finalScore} points! 🌟`;
    showScreen('complete-screen');
    updateLevelButtons(); // Refresh level buttons in case a new level was unlocked
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeLocalStorage();
    showScreen('menu-screen');
    updateLevelButtons();
});