class Tower {

    // BUFFS
    public addedHealth = 0;

    private giveBuffs: Array<Buff>;
    public receiveBuffs: Array<Buff> = [];
    public affectingPoss: Array<Pos>;

    constructor(private img: string, private color: string, affectingPoss: Array<Pos>, ...buffs: Array<Buff>) {
        this.giveBuffs = buffs;
        this.affectingPoss = affectingPoss;
    }

    //

    name(): string {
        return this.img.replace("-", " ");
    }

    getImage(): string {
        return this.img;
    }

    getColor(): string {
        return "#FFFFFF";
    }

    render(x: number, y: number): void {
        const border = 4;
        p5.tint(this.color);
        p5.drawImg("box", x, y);
        p5.drawImg(this.img, x + border, y + border, S - 2 * border, S - 2 * border);
        p5.noTint();
    }

    //

    getGiveBuffs(): Array<Buff> {
        return [...this.giveBuffs];
    }

    sumBuffsOfType(type: BuffType) {
        return this.receiveBuffs.filter(x => x.type === type).reduce((partialSum, a) => partialSum + a.value, 0);
    }

    affects(pos1: Pos, pos2: Pos) {
        return this.affectingPoss.map(p => new Pos(pos1.x + p.x, pos1.y + p.y)).filter(p => pos2.x === p.x && pos2.y === p.y).length > 0;
        // return pos1.y == pos2.y;
        // return Math.abs(pos1.x - pos2.x) <= 1 && Math.abs(pos1.y - pos2.y) <= 1;
    }

}

class Turret extends Tower {

    private attackCooldown = 0;

    step(data: Data, x: number, y: number) {
        if (this.attackCooldown > 0) {
            this.attackCooldown--
        } else {
            const tar: Enemy | null = this.getNextTarget(data, x, y);
            if (tar != null) this.tryShootEnemy(data, x, y, tar);
        }
    }

    tryShootEnemy(data: Data, x: number, y: number, tar: Enemy) {
        const bulletX = x + S / 2;
        const bulletY = y + S / 2;
        const dir = Util.dir(bulletX, bulletY, tar.x, tar.y);
        const bullet = new Bullet(bulletX, bulletY, dir, 5)
        data.addBullet(bullet)
        this.attackCooldown = this.getMaxAttackCooldown();
    }

    getNextTarget(data: Data, x: number, y: number): Enemy | null {
        let enemy = null;
        let maxDist = this.getMaxRange();
        data.enemies.forEach(e => {
            const dist = Util.dist(x, y, e.x, e.y);
            if (dist < maxDist) {
                maxDist = dist;
                enemy = e;
            }
        })

        return enemy;
    }

    getMaxAttackCooldown(): number {
        return Math.max(1, 50 - this.sumBuffsOfType("attackSpeed"));
    }

    getMaxRange(): number {
        return 800 + this.sumBuffsOfType("range");
    }

}