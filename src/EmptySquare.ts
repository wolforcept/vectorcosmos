class EmptySquare {

    name(): string {
        return "Empty Square";
    }

    getImage(): string {
        return "square";
    }

    getColor(): string {
        return "#FFFFFF";
    }

    render(x: number, y: number): void {
        p5.drawImg("square", x, y);
    }

    getMaxAttackCooldown() {
        throw new Error("Method not implemented.");

    }

    step(data: Data, x: number, y: number): void {
        throw new Error("Method not implemented.");
    }

}
