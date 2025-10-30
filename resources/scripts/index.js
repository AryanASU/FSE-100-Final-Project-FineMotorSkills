// Global variables
let currentGame = null;
let currentLevel = 1;
let score = 0;
let gameInstance = null;

// Game state management
function showScreen(screenId) {
    const screens = ['menu-screen', 'level-screen', 'instruction-screen', 'game-screen', 'complete-screen'];
    screens.forEach(screen => {
        document.getElementById(screen).style.display = 'none';
    });
    document.getElementById(screenId).style.display = 'block';
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
}

function startLevel(level) {
    currentLevel = level;
    showInstructions();
}

function showInstructions() {
    const instructions = {
        'trace': {
            text: '<strong>How to Play Border Tracing:</strong><ul><li>Follow the dotted line with your mouse or finger</li><li>Stay inside the borders!</li><li>Complete the path to win</li><li>Higher levels have trickier paths</li></ul>',
        },
        'catch': {
            text: '<strong>How to Play Object Catching:</strong><ul><li>Move the basket left and right using arrow keys or mouse</li><li>Catch the falling objects</li><li>Avoid the bad items!</li><li>Higher levels are faster</li></ul>',
        },
        'color': {
            text: '<strong>How to Play Color Filling:</strong><ul><li>Click on the colors at the bottom</li><li>Click on the image areas to fill them</li><li>Match the sample image!</li><li>Complete all areas to win</li></ul>',
        },
        'shapes': {
            text: '<strong>How to Play Shape Matching:</strong><ul><li>Drag shapes to their matching outlines</li><li>Match all shapes correctly to win</li><li>Higher levels have more shapes</li><li>Be accurate with your placement!</li></ul>',
        },
        'basket': {
            text: '<strong>How to Play Basket Toss:</strong><ul><li>Click and drag to aim</li><li>Release to throw the object</li><li>Get it into the basket!</li><li>Higher levels have moving baskets</li></ul>',
        }
    };
    
    document.getElementById('instructions-content').innerHTML = instructions[currentGame].text;
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
}

function backToLevels() {
    showScreen('level-screen');
}

function pauseGame() {
    if (gameInstance) {
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
    score = finalScore;
    document.getElementById('final-score').textContent = `Your Score: ${finalScore} points! 🌟`;
    if (gameInstance) {
        gameInstance.remove();
        gameInstance = null;
    }
    showScreen('complete-screen');
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
    score += points;
    document.getElementById('score-display').textContent = `Score: ${score}`;
}

// P5.js Game Initialization
function initP5Game() {
    const container = document.getElementById('p5-canvas');
    container.innerHTML = '';
    
    const sketch = function(p) {
        switch(currentGame) {
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

// Game 1: Border Tracing
function borderTracingGame(p, level) {
    let path = [];
    let currentPoint = 0;
    let isTracing = false;
    let pathWidth = 40 - (level * 5);
    let completed = false;
    let gameScore = 0;
    
    p.setup = function() {
        p.createCanvas(700, 500);
        generatePath(level);
    };
    
    function generatePath(level) {
        path = [];
        let complexity = level + 2;
        let segmentLength = p.width / complexity;
        
        path.push(p.createVector(50, p.height / 2));
        
        for (let i = 1; i < complexity; i++) {
            let x = 50 + segmentLength * i;
            let y = p.random(100, p.height - 100);
            path.push(p.createVector(x, y));
        }
        
        path.push(p.createVector(p.width - 50, p.height / 2));
    }
    
    p.draw = function() {
        p.background(255, 250, 240);
        
        if (completed) {
            p.fill(46, 204, 113);
            p.textSize(40);
            p.textAlign(p.CENTER);
            p.text('Complete! 🎉', p.width/2, p.height/2);
            return;
        }
        
        // Draw path
        p.noFill();
        p.strokeWeight(pathWidth);
        p.stroke(220, 220, 220);
        p.beginShape();
        for (let pt of path) {
            p.curveVertex(pt.x, pt.y);
        }
        p.endShape();
        
        // Draw center line (dotted)
        p.strokeWeight(3);
        p.stroke(100, 100, 255);
        p.drawingContext.setLineDash([10, 10]);
        p.beginShape();
        for (let pt of path) {
            p.curveVertex(pt.x, pt.y);
        }
        p.endShape();
        p.drawingContext.setLineDash([]);
        
        // Draw start and end
        p.fill(76, 209, 55);
        p.noStroke();
        p.circle(path[0].x, path[0].y, 30);
        p.fill(231, 76, 60);
        p.circle(path[path.length-1].x, path[path.length-1].y, 30);
        
        // Draw cursor
        if (isTracing) {
            p.fill(255, 200, 0);
            p.circle(p.mouseX, p.mouseY, 20);
            
            // Check if on path
            let onPath = false;
            for (let i = 0; i < path.length - 1; i++) {
                let d = distanceToLineSegment(p.mouseX, p.mouseY, path[i], path[i+1]);
                if (d < pathWidth / 2) {
                    onPath = true;
                    break;
                }
            }
            
            if (!onPath) {
                gameScore = Math.max(0, gameScore - 1);
                updateScore(-1);
            } else {
                gameScore++;
                updateScore(1);
            }
            
            // Check if reached end
            let distToEnd = p.dist(p.mouseX, p.mouseY, path[path.length-1].x, path[path.length-1].y);
            if (distToEnd < 30) {
                completed = true;
                setTimeout(() => completeLevel(gameScore), 1500);
            }
        }
        
        // Instructions
        p.fill(0);
        p.textSize(16);
        p.textAlign(p.LEFT);
        p.text('Click the green circle and trace to the red circle!', 10, 30);
    };
    
    function distanceToLineSegment(px, py, v1, v2) {
        let x1 = v1.x, y1 = v1.y;
        let x2 = v2.x, y2 = v2.y;
        let A = px - x1;
        let B = py - y1;
        let C = x2 - x1;
        let D = y2 - y1;
        let dot = A * C + B * D;
        let lenSq = C * C + D * D;
        let param = lenSq !== 0 ? dot / lenSq : -1;
        let xx, yy;
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        let dx = px - xx;
        let dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    p.mousePressed = function() {
        let distToStart = p.dist(p.mouseX, p.mouseY, path[0].x, path[0].y);
        if (distToStart < 30) {
            isTracing = true;
        }
    };
    
    p.mouseReleased = function() {
        if (isTracing && !completed) {
            alert('Keep tracing! Don\'t let go!');
            isTracing = false;
            gameScore = Math.max(0, gameScore - 50);
            updateScore(-50);
        }
    };
}

// Game 2: Object Catching
function objectCatchingGame(p, level) {
    let basket;
    let fallingObjects = [];
    let gameScore = 0;
    let gameTime = 30000; // 30 seconds
    let startTime;
    let speed = level * 1.5;
    let spawnRate = Math.max(30, 60 - level * 10);
    let frameCounter = 0;
    
    p.setup = function() {
        p.createCanvas(700, 500);
        basket = { x: p.width/2, y: p.height - 50, w: 100 - level * 10, h: 30 };
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
            p.text('Time Up! 🎉', p.width/2, p.height/2);
            p.textSize(24);
            p.text(`Final Score: ${gameScore}`, p.width/2, p.height/2 + 50);
            setTimeout(() => completeLevel(gameScore), 2000);
            p.noLoop();
            return;
        }
        
        // Draw ground
        p.fill(101, 67, 33);
        p.rect(0, p.height - 30, p.width, 30);
        
        // Spawn objects
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
        
        // Update and draw falling objects
        for (let i = fallingObjects.length - 1; i >= 0; i--) {
            let obj = fallingObjects[i];
            obj.y += speed;
            
            p.textSize(30);
            p.text(obj.emoji, obj.x, obj.y);
            
            // Check collision with basket
            if (obj.y > basket.y && obj.y < basket.y + basket.h &&
                obj.x > basket.x - basket.w/2 && obj.x < basket.x + basket.w/2) {
                if (obj.good) {
                    gameScore += 10;
                    updateScore(10);
                } else {
                    gameScore -= 5;
                    updateScore(-5);
                }
                fallingObjects.splice(i, 1);
            } else if (obj.y > p.height) {
                fallingObjects.splice(i, 1);
            }
        }
        
        // Draw basket
        p.fill(139, 69, 19);
        p.arc(basket.x, basket.y, basket.w, basket.h, 0, p.PI);
        p.rect(basket.x - basket.w/2, basket.y - basket.h/2, basket.w, basket.h/2);
        
        // Move basket with mouse
        basket.x = p.constrain(p.mouseX, basket.w/2, p.width - basket.w/2);
        
        // UI
        p.fill(0);
        p.textSize(16);
        p.textAlign(p.LEFT);
        p.text(`Time: ${Math.ceil(remaining/1000)}s`, 10, 30);
        p.text(`Score: ${gameScore}`, 10, 50);
    };
}

// Game 3: Color Filling
function colorFillingGame(p, level) {
    let regions = [];
    let colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'];
    let selectedColor = null;
    let targetColors = [];
    let completed = false;
    let gameScore = 0;
    
    p.setup = function() {
        p.createCanvas(700, 500);
        generateRegions(level);
    };
    
    function generateRegions(level) {
        let numRegions = 3 + level;
        regions = [];
        targetColors = [];
        
        for (let i = 0; i < numRegions; i++) {
            let region = {
                x: p.random(50, p.width - 150),
                y: p.random(50, p.height - 150),
                w: p.random(60, 100),
                h: p.random(60, 100),
                type: ['rect', 'circle', 'triangle'][Math.floor(p.random(3))],
                filled: false,
                color: null
            };
            let targetColor = colors[Math.floor(p.random(colors.length))];
            region.targetColor = targetColor;
            targetColors.push(targetColor);
            regions.push(region);
        }
    }
    
    p.draw = function() {
        p.background(255);
        
        if (completed) {
            p.fill(46, 204, 113);
            p.textSize(40);
            p.textAlign(p.CENTER);
            p.text('Perfect! 🎉', p.width/2, p.height/2);
            return;
        }
        
        // Draw target sample
        p.fill(0);
        p.textSize(14);
        p.textAlign(p.LEFT);
        p.text('Match these colors:', 10, 20);
        
        for (let i = 0; i < regions.length; i++) {
            let region = regions[i];
            p.fill(region.targetColor);
            p.noStroke();
            drawShape(region, 50 + i * 70, 40, 40, 40);
        }
        
        // Draw regions
        for (let region of regions) {
            if (region.filled) {
                p.fill(region.color);
            } else {
                p.fill(240);
            }
            p.stroke(0);
            p.strokeWeight(3);
            drawShape(region, region.x, region.y, region.w, region.h);
        }
        
        // Draw color palette
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
        
        // Check completion
        let allFilled = regions.every((r, i) => r.filled && r.color === r.targetColor);
        if (allFilled && !completed) {
            completed = true;
            gameScore = 1000;
            updateScore(1000);
            setTimeout(() => completeLevel(gameScore), 1500);
        }
    };
    
    function drawShape(region, x, y, w, h) {
        if (region.type === 'rect') {
            p.rect(x, y, w, h, 10);
        } else if (region.type === 'circle') {
            p.circle(x + w/2, y + h/2, Math.min(w, h));
        } else if (region.type === 'triangle') {
            p.triangle(x + w/2, y, x, y + h, x + w, y + h);
        }
    }
    
    p.mousePressed = function() {
        // Check color palette
        for (let i = 0; i < colors.length; i++) {
            if (p.mouseX > 20 + i * 60 && p.mouseX < 70 + i * 60 &&
                p.mouseY > p.height - 50 && p.mouseY < p.height - 10) {
                selectedColor = colors[i];
                return;
            }
        }
        
        // Check regions
        if (selectedColor) {
            for (let region of regions) {
                if (isInside(region, p.mouseX, p.mouseY)) {
                    region.filled = true;
                    region.color = selectedColor;
                    if (region.color === region.targetColor) {
                        gameScore += 100;
                        updateScore(100);
                    } else {
                        gameScore -= 20;
                        updateScore(-20);
                    }
                    break;
                }
            }
        }
    };
    
    function isInside(region, mx, my) {
        if (region.type === 'rect') {
            return mx > region.x && mx < region.x + region.w &&
                   my > region.y && my < region.y + region.h;
        } else if (region.type === 'circle') {
            let d = p.dist(mx, my, region.x + region.w/2, region.y + region.h/2);
            return d < Math.min(region.w, region.h) / 2;
        } else if (region.type === 'triangle') {
            // Simple bounding box check
            return mx > region.x && mx < region.x + region.w &&
                   my > region.y && my < region.y + region.h;
        }
        return false;
    }
}

// Game 4: Shape Matching
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
        
        let shapeTypes = ['circle', 'square', 'triangle', 'star', 'heart'];
        let usedTypes = [];
        
        for (let i = 0; i < numShapes; i++) {
            let type = shapeTypes[i % shapeTypes.length];
            usedTypes.push(type);
            
            // Create slot
            slots.push({
                x: 100 + (i % 3) * 200,
                y: 100 + Math.floor(i / 3) * 150,
                type: type,
                filled: false
            });
        }
        
        // Shuffle and create draggable shapes
        usedTypes.sort(() => Math.random() - 0.5);
        for (let i = 0; i < numShapes; i++) {
            shapes.push({
                x: 100 + i * 100,
                y: 400,
                type: usedTypes[i],
                placed: false,
                offsetX: 0,
                offsetY: 0
            });
        }
    }
    
    p.draw = function() {
        p.background(255, 250, 240);
        
        if (completed) {
            p.fill(46, 204, 113);
            p.textSize(40);
            p.textAlign(p.CENTER);
            p.text('All Matched! 🎉', p.width/2, p.height/2);
            return;
        }
        
        // Draw slots (outlines)
        p.strokeWeight(3);
        p.stroke(150);
        p.noFill();
        for (let slot of slots) {
            drawShape(slot.type, slot.x, slot.y, 60, true);
        }
        
        // Draw shapes
        p.strokeWeight(2);
        p.stroke(0);
        for (let shape of shapes) {
            if (!shape.placed) {
                p.fill(shape === dragging ? '#FFD93D' : '#4ECDC4');
                drawShape(shape.type, shape.x, shape.y, 50, false);
            }
        }
        
        // Instructions
        p.fill(0);
        p.textSize(16);
        p.textAlign(p.LEFT);
        p.noStroke();
        p.text('Drag shapes to matching outlines!', 10, 30);
        
        // Check completion
        let allPlaced = shapes.every(s => s.placed);
        if (allPlaced && !completed) {
            completed = true;
            gameScore = 1000;
            updateScore(1000);
            setTimeout(() => completeLevel(gameScore), 1500);
        }
    };
    
    function drawShape(type, x, y, size, outline) {
        if (type === 'circle') {
            p.circle(x, y, size);
        } else if (type === 'square') {
            p.rectMode(p.CENTER);
            p.rect(x, y, size, size, 5);
            p.rectMode(p.CORNER);
        } else if (type === 'triangle') {
            p.triangle(x, y - size/2, x - size/2, y + size/2, x + size/2, y + size/2);
        } else if (type === 'star') {
            drawStar(x, y, size/3, size/2, 5);
        } else if (type === 'heart') {
            drawHeart(x, y, size);
        }
    }
    
    function drawStar(x, y, radius1, radius2, npoints) {
        let angle = p.TWO_PI / npoints;
        let halfAngle = angle / 2.0;
        p.beginShape();
        for (let a = -p.PI/2; a < p.TWO_PI - p.PI/2; a += angle) {
            let sx = x + p.cos(a) * radius2;
            let sy = y + p.sin(a) * radius2;
            p.vertex(sx, sy);
            sx = x + p.cos(a + halfAngle) * radius1;
            sy = y + p.sin(a + halfAngle) * radius1;
            p.vertex(sx, sy);
        }
        p.endShape(p.CLOSE);
    }
    
    function drawHeart(x, y, size) {
        p.beginShape();
        for (let a = 0; a < p.TWO_PI; a += 0.1) {
            let xh = size * 16 * Math.pow(Math.sin(a), 3);
            let yh = -size * (13 * Math.cos(a) - 5 * Math.cos(2*a) - 2 * Math.cos(3*a) - Math.cos(4*a));
            p.vertex(x + xh/20, y + yh/20);
        }
        p.endShape(p.CLOSE);
    }
    
    p.mousePressed = function() {
        for (let shape of shapes) {
            if (!shape.placed) {
                let d = p.dist(p.mouseX, p.mouseY, shape.x, shape.y);
                if (d < 30) {
                    dragging = shape;
                    shape.offsetX = shape.x - p.mouseX;
                    shape.offsetY = shape.y - p.mouseY;
                    break;
                }
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
            // Check if dropped on correct slot
            for (let slot of slots) {
                let d = p.dist(dragging.x, dragging.y, slot.x, slot.y);
                if (d < 40) {
                    if (dragging.type === slot.type && !slot.filled) {
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
            }
            dragging = null;
        }
    };
}

// Game 5: Basket Toss
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
        
        // Draw ground
        p.fill(101, 67, 33);
        p.rect(0, p.height - 50, p.width, 50);
        
        // Move basket (levels 2+)
        if (level > 1 && !ball.thrown) {
            basket.x += basketSpeed * basketDirection;
            if (basket.x < 200 || basket.x > p.width - 100) {
                basketDirection *= -1;
            }
        }
        
        // Draw basket
        p.fill(139, 69, 19);
        p.stroke(0);
        p.strokeWeight(3);
        p.arc(basket.x, basket.y, basket.w, basket.h, 0, p.PI);
        p.line(basket.x - basket.w/2, basket.y, basket.x - basket.w/2, basket.y + basket.h/2);
        p.line(basket.x + basket.w/2, basket.y, basket.x + basket.w/2, basket.y + basket.h/2);
        
        // Draw ball
        if (isDragging) {
            p.stroke(255, 0, 0);
            p.strokeWeight(2);
            p.line(ball.x, ball.y, p.mouseX, p.mouseY);
            
            // Draw arrow
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
        
        // Update ball physics
        if (ball.thrown) {
            ball.vx *= 0.99;
            ball.vy += 0.5; // gravity
            ball.x += ball.vx;
            ball.y += ball.vy;
            
            // Check basket collision
            if (ball.y > basket.y - basket.h/2 && ball.y < basket.y + basket.h/2 &&
                ball.x > basket.x - basket.w/2 && ball.x < basket.x + basket.w/2) {
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
            
            // Check if ball went off screen
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
        
        // UI
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