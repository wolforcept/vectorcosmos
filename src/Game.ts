const S = 100;

class Game {

    data: Data;
    modal: PickModal<any> | null = null;
    placing: Tower | null = null;
    isGrowingShip = 0;

    constructor() {
        this.data = new Data(S * 4, p5.height() / 2 - S / 2);

        // this.modal = new PickTowerModal(getRandomTowers(3), result => {
        //     this.placing = result
        //     this.modal = null;
        // });
        this.data.addSquare(new Pos(0, 0))
        this.data.addSquare(new Pos(1, 0))
        this.data.addSquare(new Pos(0, 1))
        this.data.addSquare(new Pos(1, 1))
        this.data.setSquare(new Pos(0, 0), getRandomTowers(1)[0])
        this.data.setSquare(new Pos(1, 0), getRandomTowers(1)[1])

    }

    onMousePressed(mx: number, my: number) {
        if (this.isGrowingShip) return;
        if (this.placing) return;

        const pos = this.getShipTurretUnderMouse(mx, my);

        if (pos !== null) {
            const tower = this.data.getTower(pos);
            if (tower !== null && tower !== undefined) {
                this.placing = tower;
                this.data.removeTower(pos);
            }
        }
    }

    onMouseWheel(mx: number, my: number, positive: boolean) {
        if (this.isGrowingShip) return;
        if (this.placing) return;

        const pos = this.getShipTurretUnderMouse(mx, my);

        if (pos !== null) {
            const tower = this.data.getTower(pos);
            if (tower !== null && tower !== undefined) {
                tower.affectingPoss = Util.rotate(tower.affectingPoss, positive);
                this.data.recalculateBuffs();
            }
        }
    }

    getShipTurretUnderMouse(mx: number, my: number): Pos | null {
        return this.data.findPos(pos =>
            Util.isInside(mx, my, this.data.x0 + pos.x * S, this.data.y0 + pos.y * S, S, S)
        );
    }

    onMouseReleased(mx: number, my: number) {

        if (this.modal != null) {
            this.modal.onClick(mx, my);
            return;
        }

        if (this.placing != null) {
            const x = Math.floor((mx - this.data.x0) / S);
            const y = Math.floor((my - this.data.y0) / S);
            const pos = new Pos(x, y);
            if (this.data.isAvailable(pos)) {
                this.data.setSquare(pos, this.placing);
                this.placing = null;
            }
            return;
        }

        if (this.isGrowingShip > 0) {
            const x = Math.floor((mx - this.data.x0) / S);
            const y = Math.floor((my - this.data.y0) / S);
            const poss = this.getAdjacentPosHashesToShip();
            if (poss.filter(pos => pos.x === x && pos.y === y).length > 0) {
                this.isGrowingShip--;

                this.data.addSquare(new Pos(x, y))
            }
        }
    }

    step() {

        if (this.modal != null) {
            this.modal.step();
            return;
        }

        if (Math.random() < .01) {
            this.data.addEnemy();
        }


        this.data.forEach((pos, tower) => {
            if (tower !== null && tower !== undefined && tower instanceof Turret) {
                tower.step(this.data, S * pos.x, S * pos.y);
            }
        });

        this.data.enemies.forEach(x => x.step(this.data))
        this.data.bullets.forEach(x => x.step(this.data))

        this.data.clearRemoved();
    }

    render() {

        this.data.forEach((pos, tower) => {
            const x = this.data.x0 + pos.x * S;
            const y = this.data.y0 + pos.y * S;
            if (tower == null) {
                p5.tint("#AAAAAAAA")
                p5.drawImg("square", x, y)
                p5.noTint()
            } else {
                p5.tint("#AAAAAAAA")
                tower.render(x, y)
                p5.noTint()
                if (Util.isInside(p5.mx(), p5.my(), x, y, S, S)) {
                    for (const pos of tower.affectingPoss) {
                        p5.tint("#FFFFFFFF")
                        p5.drawImg("square", x + pos.x * S + 5, y + pos.y * S + 5, S - 10, S - 10)
                        p5.noTint()
                    }
                }
            }

        });

        this.data.enemies.forEach(x => x.render(this.data.x0, this.data.y0));
        this.data.bullets.forEach(x => x.render(this.data.x0, this.data.y0));

        //
        //

        if (this.modal != null) {
            p5.fill(0, 0, 0, 200);
            p5.rect(0, 0, p5.width(), p5.height());
            this.modal.render();
        }

        if (this.placing != null) {
            p5.tint("#AAFFAAAA")
            this.data.forEach((pos, tower) => p5.drawImg("square", this.data.x0 + S * pos.x, this.data.y0 + S * pos.y));
            p5.noTint()
            this.placing.render(p5.mx() - S / 2, p5.my() - S / 2)
            return;
        }

        if (this.isGrowingShip > 0) {

            const text = this.isGrowingShip == 1 ?
                `Add 1 more square to the ship.` :
                `Add ${this.isGrowingShip} more squares to the ship.`;
            const tw = p5.textW(text);
            p5.fill(255, 255, 255, 255);
            p5.text(text, p5.width() / 2 - tw / 2, p5.height() - 100);

            p5.tint("#AAFFAAAA")
            this.getAdjacentPosHashesToShip().forEach(pos => {
                p5.drawImg("square", this.data.x0 + pos.x * S, this.data.y0 + pos.y * S)
            });
            p5.noTint()
        }
    }

    //
    //

    getAdjacentPosHashesToShip(): Array<Pos> {
        let poss: Array<Pos> = [];
        this.data.forEach(pos => {
            poss.push(new Pos(pos.x + 1, pos.y + 0));
            poss.push(new Pos(pos.x + 0, pos.y + 1));
            poss.push(new Pos(pos.x - 1, pos.y - 0));
            poss.push(new Pos(pos.x - 0, pos.y - 1));
        });
        poss = poss.filter(pos => this.data.getTower(pos) === undefined)
        return poss;
    }

}