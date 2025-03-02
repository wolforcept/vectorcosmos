class P5 {

    public font: any;
    public images: { [key: string]: any } = {
        "box": null,
        "square": null,
        "square2": null,
        "test": null,
        // TURRETS
        // NODES
        "circle": null,
        "aerial-signal": null,
        "alien-bug": null,
        "amplitude": null,
        "android-mask": null,
        "architect-mask": null,
        "black-hole-bolas": null,
        "claws": null,
        "cog": null,
        "computer-fan": null,
        "explosion-rays": null,
        "fangs": null,
        "heavy-bullets": null,
        "hunger": null,
        "laser-gun": null,
        "lucifer-cannon": null,
        "metal-hand": null,
        "metroid": null,
        "microchip": null,
        "molecule": null,
        "movement-sensor": null,
        "portal": null,
        "processor": null,
        "radar-dish": null,
        "radioactive": null,
        "robot-antennas": null,
        "robot-helmet": null,
        "round-knob": null,
        "skull-bolt": null,
        "skull-stripe": null,
        "sly": null,
        "target": null,
        "tire-iron-cross": null,
        "trap-mask": null,
        "trefoil-shuriken": null,
        "vile-fluid": null,
        "vortex": null,
        // BULLETS
        "bullet1": null,
        // ENEMIES
        "cracked-mask": null,
        "devil-mask": null,
        "alien-skull": null,
        "skull-mask": null,
        "tribal-mask": null,
        "surprised-skull": null,
    };

    constructor(private p: any) { }

    loadImages() {
        Object.keys(this.images).forEach(img => this.loadImage(img))
    }

    loadImage(id: string) {
        const path = `assets/${id}.svg`;
        console.log("loading image " + path);
        this.images[id] = this.p.loadImage(path);
    }

    width(): number {
        return this.p.width;
    }

    height(): number {
        return this.p.height;
    }

    drawImg(id: string, x: number, y: number, w: number = S, h: number = S): void {
        if (!this.images[id]) {
            console.log("could not find image " + id);
            this.p.fill(255, 0, 255, 255);
            this.p.rect(x, y, w, h);
        } else {
            this.p.image(this.images[id], x, y, w, h);
        }
    }

    tint(color: string): void {
        this.p.tint(color);
    }

    noTint(): void {
        this.p.noTint();
    }

    mx(): number {
        return this.p.mouseX;
    }

    my(): number {
        return this.p.mouseY;
    }

    fill(r: number, g: number, b: number, a: number): void {
        this.p.fill(r, g, b, a);
    }

    rect(r: number, g: number, b: number, a: number): void {
        this.p.rect(r, g, b, a);
    }

    text(text: string, x: number, y: number) {
        this.p.text(text, x, y);
    }

    textW(text: string) {
        return this.p.textWidth(text);
    }
}

var p5: P5;
var particleSystem: ParticleSystem;
var particleImage: any;

function addParticle(x: number, y: number) {
    particleSystem.add({
        x, y,
        vx: -1 + 20 * Math.random(),
        vy: -1 + 20 * Math.random(),
        life: Math.random() * 100,
        size: .25,
        color: { r: 255, g: 255, b: 0, a: 255 },
        compute: p => p.color.a *= .99,
        image: particleImage,
    })
}

function particleBurst(x: number, y: number, dir: number, color: string) {
    for (let i = 0; i < 10; i++)
        particleSystem.add({
            x: x - 16, y: y - 16,
            vx: Math.random() * 8 * Math.cos(dir - .2 + .4 * Math.random()),
            vy: Math.random() * 8 * Math.sin(dir - .2 + .4 * Math.random()),
            life: Math.random() * 100,
            size: .1 + Math.random() * .1,
            color: ColorHex(color),
            compute: p => p.color.a *= .84,
            image: particleImage,
        })
}

function particleExplosion(x: number, y: number, color: string) {
    for (let i = 0; i < 20; i++)
        particleSystem.add({
            x: x - 16, y: y - 16,
            vx: -2 + Math.random() * 4,
            vy: -2 + Math.random() * 4,
            life: Math.random() * 100,
            size: .25 + Math.random() * .1,
            color: ColorHex(color),
            compute: p => p.color.a *= .8,
            image: particleImage,
        })
}

const sketch = function (p: any) {

    p5 = new P5(p);
    particleSystem = new ParticleSystem();
    let font: any;
    let game: Game;

    p.preload = function () {
        font = p.loadFont('assets/font.ttf');
        particleImage = p.loadImage('assets/particle.png')
        p5.loadImages();
    }

    p.setup = function () {
        // p.frameRate(144);
        p.createCanvas(p.windowWidth, p.windowHeight);
        // p.noSmooth();
        p.textFont(font);
        p.textSize(32);
        p.textLeading(24);
        game = new Game()
    };

    p.draw = function () {
        p.fill(0, 0, 0, 50)
        p.rect(0, 0, p.width, p.height)
        game.step();
        game.render();
        particleSystem.step(p);
    };

    p.windowResized = function () {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    }

    p.mousePressed = function () {
        game.onMousePressed(p.mouseX, p.mouseY);
    }

    p.mouseReleased = function () {
        game.onMouseReleased(p.mouseX, p.mouseY);
    }

    p.mouseWheel = function (e: any) {
        game.onMouseWheel(p.mouseX, p.mouseY, e.delta > 0);
    }

};
