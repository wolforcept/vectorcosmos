type Ship = { [key: string]: Tower | null };

class Pos {

    static fromHash(hash: string): Pos {
        const parts = hash.split(",");
        return new Pos(Number(parts[0]), Number(parts[1]));
    }

    hash: string;

    constructor(public x: number, public y: number) {
        this.hash = this.x + "," + this.y;
    }

}

class Data {

    public bullets: Array<Bullet> = [];
    public enemies: Array<Enemy> = [];
    private ship: Ship = {
        "0,0": null
    }

    constructor(public x0: number, public y0: number) { }

    forEach(callback: (pos: Pos, tower: Tower | null) => void) {
        Object.keys(this.ship).forEach(posHash => {
            callback(Pos.fromHash(posHash), this.ship[posHash])
        });
    }

    getTower(pos: Pos): Tower | null | undefined {
        if (Object.keys(this.ship).includes(pos.hash))
            return this.ship[pos.hash];
        return undefined;
    }

    removeTower(pos: Pos): void {
        this.ship[pos.hash] = null;
        this.recalculateBuffs();
    }

    recalculateBuffs() {
        this.forEach((pos, tower) => {
            if (tower !== null) tower.receiveBuffs = this.getBuffsForPos(pos)
        })
    }

    getBuffsForPos(pos2: Pos): Buff[] {
        let buffs: Array<Buff> = []
        this.forEach((pos1, tower) => {
            if (tower !== null && tower.affects(pos1, pos2)) {
                buffs = buffs.concat(tower.getGiveBuffs())
            }
        });
        return buffs;
    }

    findPos(callback: (pos: Pos) => boolean): Pos | null {
        for (const posHash in this.ship) {
            if (callback(Pos.fromHash(posHash)))
                return Pos.fromHash(posHash);
        }
        return null;
    }

    addEnemy() {
        const dir = -0.5 + Math.random();
        const dist = 1000 + Math.random() * 500;
        const x = dist * Math.cos(dir);
        const y = dist * Math.sin(dir);
        this.enemies.push(new Enemy(x, y))
    }

    addBullet(bullet: Bullet) {
        this.bullets.push(bullet)
    }

    isAvailable(pos: Pos): boolean {
        return this.ship[pos.hash] === null;
    }

    addSquare(pos: Pos) {
        if (this.ship[pos.hash] === undefined)
            this.ship[pos.hash] = null;
    }

    setSquare(pos: Pos, tower: Tower) {
        if (this.isAvailable(pos)) {
            this.ship[pos.hash] = tower;
            this.recalculateBuffs();
        }
    }

    clearRemoved(): void {
        this.enemies = this.enemies.filter(x => !x.removed)
        this.bullets = this.bullets.filter(x => !x.removed)
    }
}