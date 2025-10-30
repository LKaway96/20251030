function setupCursorEffects() {
    let cursorEffect = createGraphics(100, 100);
    cursorEffect.noStroke();
    cursorEffect.fill(255, 100, 100, 150);
    cursorEffect.ellipse(50, 50, 80, 80);
    
    return cursorEffect;
}

function drawCursorEffect(cursorEffect, x, y) {
    image(cursorEffect, x - 50, y - 50);
}

function setupSelectionEffects() {
    let selectionEffect = createGraphics(200, 50);
    selectionEffect.noStroke();
    selectionEffect.fill(100, 255, 100, 150);
    selectionEffect.rect(0, 0, 200, 50, 10);
    
    return selectionEffect;
}

function drawSelectionEffect(selectionEffect, x, y) {
    image(selectionEffect, x, y);
}

function mouseMoved() {
    // Update cursor effect position
    drawCursorEffect(cursorEffect, mouseX, mouseY);
}

function mousePressed() {
    // Check if an option is selected and draw selection effect
    if (isOptionSelected()) {
        drawSelectionEffect(selectionEffect, mouseX, mouseY);
    }
}

let cursorEffect;
let selectionEffect;

function setup() {
    createCanvas(windowWidth, windowHeight);
    cursorEffect = setupCursorEffects();
    selectionEffect = setupSelectionEffects();
}

function draw() {
    background(220);
    // Other drawing logic...
}