function setupVisuals(score) {
    if (score >= 80) {
        return new PraiseAnimation();
    } else if (score >= 50) {
        return new EncouragementAnimation();
    } else {
        return new MotivationAnimation();
    }
}

class PraiseAnimation {
    constructor() {
        this.alpha = 255;
    }

    display() {
        fill(0, this.alpha);
        textSize(48);
        textAlign(CENTER, CENTER);
        text("Excellent Work!", width / 2, height / 2);
        this.alpha -= 5;
    }

    isFinished() {
        return this.alpha <= 0;
    }
}

class EncouragementAnimation {
    constructor() {
        this.alpha = 255;
    }

    display() {
        fill(0, this.alpha);
        textSize(48);
        textAlign(CENTER, CENTER);
        text("Keep it Up!", width / 2, height / 2);
        this.alpha -= 5;
    }

    isFinished() {
        return this.alpha <= 0;
    }
}

class MotivationAnimation {
    constructor() {
        this.alpha = 255;
    }

    display() {
        fill(0, this.alpha);
        textSize(48);
        textAlign(CENTER, CENTER);
        text("Don't Give Up!", width / 2, height / 2);
        this.alpha -= 5;
    }

    isFinished() {
        return this.alpha <= 0;
    }
}