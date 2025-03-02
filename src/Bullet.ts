class Bullet {

    public removed = false;
    private vx: number = 0;
    private vy: number = 0;
    private maxVx: number = 0;
    private maxVy: number = 0;

    constructor(
        private x: number,
        private y: number,
        private dir: number,
        speed: number,
        private size: number = 16,
        private damage: number = 1,
        private color: string = "#FF0000",
        private life: number = 1000,
    ) {
        this.maxVx = speed * Math.cos(dir);
        this.maxVy = speed * Math.sin(dir);
    }

    step(data: Data) {
        this.life--;
        if (this.life <= 0) this.removed = true;

        const diffX = (this.maxVx - this.vx) / this.maxVx;
        if (diffX > 0) this.vx = Util.lerp(this.vx, this.maxVx, diffX);

        const diffY = (this.maxVy - this.vy) / this.maxVy;
        if (diffY > 0) this.vy = Util.lerp(this.vy, this.maxVy, diffY);

        this.x += this.vx;
        this.y += this.vy;

        for (const e of data.enemies) {
            const dist = Util.dist(e.x, e.y, this.x, this.y)
            if (dist < this.size / 2 + e.size / 2) {
                this.removed = true;
                particleBurst(data.x0 + this.x, data.y0 + this.y, this.dir, this.color);
                e.hp -= this.damage;
                e.vx += this.vx;
                e.vy += this.vy;
                return;
            }
        }
    }

    render(x0: number, y0: number): void {
        p5.tint(this.color);
        p5.drawImg("bullet1", x0 + this.x - this.size / 2, y0 + this.y - this.size / 2, this.size, this.size);
        p5.noTint();
    }
}
