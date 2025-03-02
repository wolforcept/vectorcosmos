// class FloorPick {

//     constructor(
//         private nameString: string,
//         private poss: Array<string>,
//     ) { }

//     render(x: number, y: number) {
//         this.poss.forEach(pos => {
//             p5.drawImg("square", x + S * pos.x, y + S * pos.y)
//         });
//     }

//     width(): number {
//         return S * (Math.max(...this.poss.map(pos => x(pos))) + 1);
//     }

//     name(): string {
//         return this.nameString;
//     }
// }

// // const floorPicks: { [key: string]: FloorPick } = {}
// const floorPicks: Array<FloorPick> = [
//     new FloorPick("Small Column", ["0,0", "0,1"]),
//     new FloorPick("Medium Column", ["0,0", "0,1", "0,2"]),
//     new FloorPick("Corner Shape", ["0,0", "0,1", "1,1"]),
//     new FloorPick("Square", ["0,0", "0,1", "1,1", "1,0"]),
// ]

// function getRandomFloorPick(n: number): Array<FloorPick> {
//     return [floorPicks[0], floorPicks[1], floorPicks[2]];
// }
