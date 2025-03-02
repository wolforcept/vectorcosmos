/// <reference path="Turret.ts" />

function b(type: BuffType, value: number): Buff {
    return new Buff(type, value);
}
function p(x: number, y: number): Pos {
    return new Pos(x, y);
}

const none = () => []
const cross = () => [p(1, 0), p(0, 1), p(-1, 0), p(0, -1),]
const spike = () => [p(1, 0), p(2, 0), p(3, 0),]
const square = () => [...cross(), p(1, 1), p(1, -1), p(-1, 1), p(-1, -1)]

const Towers: { [key: string]: Tower } = {

    turret_1: new Turret("test", "#FF0000", none()),
    turret_2: new Turret("lucifer-cannon", "#ff8170", none()),
    // turret_3: new Turret("skull-bolt", "#2f975e"),
    tower_1: new Tower("skull-bolt", "#2f975e", spike(), b("attackSpeed", 25)),
}

function getRandomTowers(n: number): Array<Tower> {
    return [
        Towers.turret_1,
        Towers.tower_1,
        Towers.turret_3,
    ]
}