class Util {

    static dir(x1: number, y1: number, x2: number, y2: number) {
        return Math.atan2(y2 - y1, x2 - x1)
    }

    static dist(x1: number, y1: number, x2: number, y2: number) {
        return Math.hypot(x1 - x2, y1 - y2);
    }

    static isInside(mouseX: any, mouseY: any, x: number, y: number, w: number, h: number) {
        return mouseX >= x && mouseY >= y && mouseX <= x + w && mouseY <= y + h;
    }

    static randomInt(min: number, max: number): number {
        return Math.floor(min + Math.random() * (max + 1 - min));
    }

    static toDegrees(radians: number): number {
        return radians * (180 / Math.PI);
    }

    static toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    static lerp(a: number, b: number, alpha: number) {
        return a + alpha * (b - a);
    }

    static rotate(points: Array<Pos>, positive: boolean): Array<Pos> {
        return positive
            ? points.map(p => (new Pos(-p.y, p.x)))
            : points.map(p => (new Pos(p.y, -p.x)));
    }
}