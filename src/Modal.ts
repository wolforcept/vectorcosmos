abstract class PickModal<T> {

    grow: Array<number>;
    border: number;
    textHeight = 100;

    constructor(
        private towers: Array<T>,
        private callback: (o: T) => void
    ) {
        this.grow = towers.map(() => 0);
        this.border = 0.1 * p5.width() / this.towers.length;
    }

    step() {
    }

    onClick(mx: number, my: number) {
        const w = this.width();
        const h = this.height();
        const textHeight = 100;

        this.towers.forEach((o, i) => {
            p5.fill(255, 255, 255, 20 + this.grow[i])
            const x = this.border + this.border * i + w * i;
            const y = this.border + textHeight;
            if (Util.isInside(mx, my, x, y, w, h)) {
                this.callback(o);
            }
        });
    }

    render() {
        const w = this.width();
        const h = this.height();
        const th = this.textHeight;

        this.towers.forEach((o, i) => {
            p5.fill(255, 255, 255, 20 + this.grow[i])
            const x = this.border + this.border * i + w * i;
            const y = this.border + th;
            if (Util.isInside(p5.mx(), p5.my(), x, y, w, h)) {
                if (this.grow[i] < 15) this.grow[i]++;
            } else {
                if (this.grow[i] > 0) this.grow[i]--;
            }
            p5.rect(x, y, w, h)
            // p5.rect(x - this.grow[i], y - this.grow[i], w + this.grow[i] * 2, h + this.grow[i] * 2)
            this.renderSingle(x, y, o);
        })

    }

    width(): number {
        return (p5.width() - this.border * (this.towers.length + 1)) / this.towers.length;
    }

    height(): number {
        // return p5.height() - this.border * 2;
        return this.width();
    }

    abstract renderSingle(x: number, y: number, o: T): void;

}

class PickTowerModal extends PickModal<Tower> {
    renderSingle(x: number, y: number, o: Tower): void {
        o.render(x + this.width() / 2 - S / 2, y + 20)
        const textW = p5.textW(o.name())
        p5.fill(255, 255, 255, 255);
        p5.text(o.name(), x + this.width() / 2 - textW / 2, y - 40);
    }

}

// class FloorPickModal extends PickModal<FloorPick> {
//     renderSingle(x: number, y: number, o: FloorPick): void {
//         o.render(x + this.width() / 2 - o.width() / 2, y + 20)
//         const textW = p5.textW(o.name())
//         p5.fill(255, 255, 255, 255);
//         p5.text(o.name(), x + this.width() / 2 - textW / 2, y - 40);
//     }
// }