class Enemy {

    public removed = false;
    public size = 50;
    public color = "#FFFFFFFF";
    public hp = 2;

    public vx: number = 0;
    public vy: number = 0;

    private accel = 0.1;

    constructor(public x: number, public y: number, private speed: number = 2) { }

    step(data: Data) {

        const dir = Util.dir(this.x, this.y, 0, 0)
        const maxVx = this.speed * Math.cos(dir);
        const maxVy = this.speed * Math.sin(dir);

        if (Math.abs(this.vx - maxVx) < this.accel) {
            this.vx = maxVx;
        } else if (this.vx < maxVx) {
            this.vx += this.accel;
        } else if (this.vx > maxVx) {
            this.vx -= this.accel;
        }

        if (Math.abs(this.vy - maxVy) < this.accel) {
            this.vy = maxVy;
        } else if (this.vy > maxVy) {
            this.vy -= this.accel;
        } else if (this.vy < maxVy) {
            this.vy += this.accel;
        }




        // const diffX = (this.maxVx - this.vx) / this.maxVx;
        // if (diffX > 0) this.vx = Util.lerp(this.vx, this.maxVx, diffX);

        // const diffY = (this.maxVy - this.vy) / this.maxVy;
        // if (diffY > 0) this.vy = Util.lerp(this.vy, this.maxVy, diffY);

        this.x += this.vx;
        this.y += this.vy;

        if (this.hp <= 0) {
            particleExplosion(data.x0 + this.x, data.y0 + this.y, this.color);
            this.removed = true;
        }
    }

    render(x0: number, y0: number): void {
        p5.tint(this.color);
        p5.drawImg("circle", x0 + this.x - this.size / 2, y0 + this.y - this.size / 2, this.size, this.size)
        p5.noTint();
    }

}