"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var Buff = /** @class */ (function () {
    function Buff(type, value) {
        this.type = type;
        this.value = value;
    }
    return Buff;
}());
var Bullet = /** @class */ (function () {
    function Bullet(x, y, dir, speed, size, damage, color, life) {
        if (size === void 0) { size = 16; }
        if (damage === void 0) { damage = 1; }
        if (color === void 0) { color = "#FF0000"; }
        if (life === void 0) { life = 1000; }
        this.x = x;
        this.y = y;
        this.dir = dir;
        this.size = size;
        this.damage = damage;
        this.color = color;
        this.life = life;
        this.removed = false;
        this.vx = 0;
        this.vy = 0;
        this.maxVx = 0;
        this.maxVy = 0;
        this.maxVx = speed * Math.cos(dir);
        this.maxVy = speed * Math.sin(dir);
    }
    Bullet.prototype.step = function (data) {
        this.life--;
        if (this.life <= 0)
            this.removed = true;
        var diffX = (this.maxVx - this.vx) / this.maxVx;
        if (diffX > 0)
            this.vx = Util.lerp(this.vx, this.maxVx, diffX);
        var diffY = (this.maxVy - this.vy) / this.maxVy;
        if (diffY > 0)
            this.vy = Util.lerp(this.vy, this.maxVy, diffY);
        this.x += this.vx;
        this.y += this.vy;
        for (var _i = 0, _a = data.enemies; _i < _a.length; _i++) {
            var e = _a[_i];
            var dist = Util.dist(e.x, e.y, this.x, this.y);
            if (dist < this.size / 2 + e.size / 2) {
                this.removed = true;
                particleBurst(data.x0 + this.x, data.y0 + this.y, this.dir, this.color);
                e.hp -= this.damage;
                e.vx += this.vx;
                e.vy += this.vy;
                return;
            }
        }
    };
    Bullet.prototype.render = function (x0, y0) {
        p5.tint(this.color);
        p5.drawImg("bullet1", x0 + this.x - this.size / 2, y0 + this.y - this.size / 2, this.size, this.size);
        p5.noTint();
    };
    return Bullet;
}());
function ColorHex(hex) {
    var result24 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result24)
        return {
            r: parseInt(result24[1], 16),
            g: parseInt(result24[2], 16),
            b: parseInt(result24[3], 16),
            a: 255,
        };
    var result32 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result32)
        return {
            r: parseInt(result32[1], 16),
            g: parseInt(result32[2], 16),
            b: parseInt(result32[3], 16),
            a: parseInt(result32[4], 16),
        };
    return { r: 0, g: 0, b: 0, a: 0 };
}
function Color(r, g, b, a) {
    return { r: r, g: g, b: b, a: a };
}
var Pos = /** @class */ (function () {
    function Pos(x, y) {
        this.x = x;
        this.y = y;
        this.hash = this.x + "," + this.y;
    }
    Pos.fromHash = function (hash) {
        var parts = hash.split(",");
        return new Pos(Number(parts[0]), Number(parts[1]));
    };
    return Pos;
}());
var Data = /** @class */ (function () {
    function Data(x0, y0) {
        this.x0 = x0;
        this.y0 = y0;
        this.bullets = [];
        this.enemies = [];
        this.ship = {
            "0,0": null
        };
    }
    Data.prototype.forEach = function (callback) {
        var _this = this;
        Object.keys(this.ship).forEach(function (posHash) {
            callback(Pos.fromHash(posHash), _this.ship[posHash]);
        });
    };
    Data.prototype.getTower = function (pos) {
        if (Object.keys(this.ship).includes(pos.hash))
            return this.ship[pos.hash];
        return undefined;
    };
    Data.prototype.removeTower = function (pos) {
        this.ship[pos.hash] = null;
        this.recalculateBuffs();
    };
    Data.prototype.recalculateBuffs = function () {
        var _this = this;
        this.forEach(function (pos, tower) {
            if (tower !== null)
                tower.receiveBuffs = _this.getBuffsForPos(pos);
        });
    };
    Data.prototype.getBuffsForPos = function (pos2) {
        var buffs = [];
        this.forEach(function (pos1, tower) {
            if (tower !== null && tower.affects(pos1, pos2)) {
                buffs = buffs.concat(tower.getGiveBuffs());
            }
        });
        return buffs;
    };
    Data.prototype.findPos = function (callback) {
        for (var posHash in this.ship) {
            if (callback(Pos.fromHash(posHash)))
                return Pos.fromHash(posHash);
        }
        return null;
    };
    Data.prototype.addEnemy = function () {
        var dir = -0.5 + Math.random();
        var dist = 1000 + Math.random() * 500;
        var x = dist * Math.cos(dir);
        var y = dist * Math.sin(dir);
        this.enemies.push(new Enemy(x, y));
    };
    Data.prototype.addBullet = function (bullet) {
        this.bullets.push(bullet);
    };
    Data.prototype.isAvailable = function (pos) {
        return this.ship[pos.hash] === null;
    };
    Data.prototype.addSquare = function (pos) {
        if (this.ship[pos.hash] === undefined)
            this.ship[pos.hash] = null;
    };
    Data.prototype.setSquare = function (pos, tower) {
        if (this.isAvailable(pos)) {
            this.ship[pos.hash] = tower;
            this.recalculateBuffs();
        }
    };
    Data.prototype.clearRemoved = function () {
        this.enemies = this.enemies.filter(function (x) { return !x.removed; });
        this.bullets = this.bullets.filter(function (x) { return !x.removed; });
    };
    return Data;
}());
var EmptySquare = /** @class */ (function () {
    function EmptySquare() {
    }
    EmptySquare.prototype.name = function () {
        return "Empty Square";
    };
    EmptySquare.prototype.getImage = function () {
        return "square";
    };
    EmptySquare.prototype.getColor = function () {
        return "#FFFFFF";
    };
    EmptySquare.prototype.render = function (x, y) {
        p5.drawImg("square", x, y);
    };
    EmptySquare.prototype.getMaxAttackCooldown = function () {
        throw new Error("Method not implemented.");
    };
    EmptySquare.prototype.step = function (data, x, y) {
        throw new Error("Method not implemented.");
    };
    return EmptySquare;
}());
var Enemy = /** @class */ (function () {
    function Enemy(x, y, speed) {
        if (speed === void 0) { speed = 2; }
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.removed = false;
        this.size = 50;
        this.color = "#FFFFFFFF";
        this.hp = 2;
        this.vx = 0;
        this.vy = 0;
        this.accel = 0.1;
    }
    Enemy.prototype.step = function (data) {
        var dir = Util.dir(this.x, this.y, 0, 0);
        var maxVx = this.speed * Math.cos(dir);
        var maxVy = this.speed * Math.sin(dir);
        if (Math.abs(this.vx - maxVx) < this.accel) {
            this.vx = maxVx;
        }
        else if (this.vx < maxVx) {
            this.vx += this.accel;
        }
        else if (this.vx > maxVx) {
            this.vx -= this.accel;
        }
        if (Math.abs(this.vy - maxVy) < this.accel) {
            this.vy = maxVy;
        }
        else if (this.vy > maxVy) {
            this.vy -= this.accel;
        }
        else if (this.vy < maxVy) {
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
    };
    Enemy.prototype.render = function (x0, y0) {
        p5.tint(this.color);
        p5.drawImg("circle", x0 + this.x - this.size / 2, y0 + this.y - this.size / 2, this.size, this.size);
        p5.noTint();
    };
    return Enemy;
}());
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
var S = 100;
var Game = /** @class */ (function () {
    function Game() {
        this.modal = null;
        this.placing = null;
        this.isGrowingShip = 0;
        this.data = new Data(S * 4, p5.height() / 2 - S / 2);
        // this.modal = new PickTowerModal(getRandomTowers(3), result => {
        //     this.placing = result
        //     this.modal = null;
        // });
        this.data.addSquare(new Pos(0, 0));
        this.data.addSquare(new Pos(1, 0));
        this.data.addSquare(new Pos(0, 1));
        this.data.addSquare(new Pos(1, 1));
        this.data.setSquare(new Pos(0, 0), getRandomTowers(1)[0]);
        this.data.setSquare(new Pos(1, 0), getRandomTowers(1)[1]);
    }
    Game.prototype.onMousePressed = function (mx, my) {
        if (this.isGrowingShip)
            return;
        if (this.placing)
            return;
        var pos = this.getShipTurretUnderMouse(mx, my);
        if (pos !== null) {
            var tower = this.data.getTower(pos);
            if (tower !== null && tower !== undefined) {
                this.placing = tower;
                this.data.removeTower(pos);
            }
        }
    };
    Game.prototype.onMouseWheel = function (mx, my, positive) {
        if (this.isGrowingShip)
            return;
        if (this.placing)
            return;
        var pos = this.getShipTurretUnderMouse(mx, my);
        if (pos !== null) {
            var tower = this.data.getTower(pos);
            if (tower !== null && tower !== undefined) {
                tower.affectingPoss = Util.rotate(tower.affectingPoss, positive);
                this.data.recalculateBuffs();
            }
        }
    };
    Game.prototype.getShipTurretUnderMouse = function (mx, my) {
        var _this = this;
        return this.data.findPos(function (pos) {
            return Util.isInside(mx, my, _this.data.x0 + pos.x * S, _this.data.y0 + pos.y * S, S, S);
        });
    };
    Game.prototype.onMouseReleased = function (mx, my) {
        if (this.modal != null) {
            this.modal.onClick(mx, my);
            return;
        }
        if (this.placing != null) {
            var x = Math.floor((mx - this.data.x0) / S);
            var y = Math.floor((my - this.data.y0) / S);
            var pos = new Pos(x, y);
            if (this.data.isAvailable(pos)) {
                this.data.setSquare(pos, this.placing);
                this.placing = null;
            }
            return;
        }
        if (this.isGrowingShip > 0) {
            var x_1 = Math.floor((mx - this.data.x0) / S);
            var y_1 = Math.floor((my - this.data.y0) / S);
            var poss = this.getAdjacentPosHashesToShip();
            if (poss.filter(function (pos) { return pos.x === x_1 && pos.y === y_1; }).length > 0) {
                this.isGrowingShip--;
                this.data.addSquare(new Pos(x_1, y_1));
            }
        }
    };
    Game.prototype.step = function () {
        var _this = this;
        if (this.modal != null) {
            this.modal.step();
            return;
        }
        if (Math.random() < .01) {
            this.data.addEnemy();
        }
        this.data.forEach(function (pos, tower) {
            if (tower !== null && tower !== undefined && tower instanceof Turret) {
                tower.step(_this.data, S * pos.x, S * pos.y);
            }
        });
        this.data.enemies.forEach(function (x) { return x.step(_this.data); });
        this.data.bullets.forEach(function (x) { return x.step(_this.data); });
        this.data.clearRemoved();
    };
    Game.prototype.render = function () {
        var _this = this;
        this.data.forEach(function (pos, tower) {
            var x = _this.data.x0 + pos.x * S;
            var y = _this.data.y0 + pos.y * S;
            if (tower == null) {
                p5.tint("#AAAAAAAA");
                p5.drawImg("square", x, y);
                p5.noTint();
            }
            else {
                p5.tint("#AAAAAAAA");
                tower.render(x, y);
                p5.noTint();
                if (Util.isInside(p5.mx(), p5.my(), x, y, S, S)) {
                    for (var _i = 0, _a = tower.affectingPoss; _i < _a.length; _i++) {
                        var pos_1 = _a[_i];
                        p5.tint("#FFFFFFFF");
                        p5.drawImg("square", x + pos_1.x * S + 5, y + pos_1.y * S + 5, S - 10, S - 10);
                        p5.noTint();
                    }
                }
            }
        });
        this.data.enemies.forEach(function (x) { return x.render(_this.data.x0, _this.data.y0); });
        this.data.bullets.forEach(function (x) { return x.render(_this.data.x0, _this.data.y0); });
        //
        //
        if (this.modal != null) {
            p5.fill(0, 0, 0, 200);
            p5.rect(0, 0, p5.width(), p5.height());
            this.modal.render();
        }
        if (this.placing != null) {
            p5.tint("#AAFFAAAA");
            this.data.forEach(function (pos, tower) { return p5.drawImg("square", _this.data.x0 + S * pos.x, _this.data.y0 + S * pos.y); });
            p5.noTint();
            this.placing.render(p5.mx() - S / 2, p5.my() - S / 2);
            return;
        }
        if (this.isGrowingShip > 0) {
            var text = this.isGrowingShip == 1 ?
                "Add 1 more square to the ship." :
                "Add ".concat(this.isGrowingShip, " more squares to the ship.");
            var tw = p5.textW(text);
            p5.fill(255, 255, 255, 255);
            p5.text(text, p5.width() / 2 - tw / 2, p5.height() - 100);
            p5.tint("#AAFFAAAA");
            this.getAdjacentPosHashesToShip().forEach(function (pos) {
                p5.drawImg("square", _this.data.x0 + pos.x * S, _this.data.y0 + pos.y * S);
            });
            p5.noTint();
        }
    };
    //
    //
    Game.prototype.getAdjacentPosHashesToShip = function () {
        var _this = this;
        var poss = [];
        this.data.forEach(function (pos) {
            poss.push(new Pos(pos.x + 1, pos.y + 0));
            poss.push(new Pos(pos.x + 0, pos.y + 1));
            poss.push(new Pos(pos.x - 1, pos.y - 0));
            poss.push(new Pos(pos.x - 0, pos.y - 1));
        });
        poss = poss.filter(function (pos) { return _this.data.getTower(pos) === undefined; });
        return poss;
    };
    return Game;
}());
var PickModal = /** @class */ (function () {
    function PickModal(towers, callback) {
        this.towers = towers;
        this.callback = callback;
        this.textHeight = 100;
        this.grow = towers.map(function () { return 0; });
        this.border = 0.1 * p5.width() / this.towers.length;
    }
    PickModal.prototype.step = function () {
    };
    PickModal.prototype.onClick = function (mx, my) {
        var _this = this;
        var w = this.width();
        var h = this.height();
        var textHeight = 100;
        this.towers.forEach(function (o, i) {
            p5.fill(255, 255, 255, 20 + _this.grow[i]);
            var x = _this.border + _this.border * i + w * i;
            var y = _this.border + textHeight;
            if (Util.isInside(mx, my, x, y, w, h)) {
                _this.callback(o);
            }
        });
    };
    PickModal.prototype.render = function () {
        var _this = this;
        var w = this.width();
        var h = this.height();
        var th = this.textHeight;
        this.towers.forEach(function (o, i) {
            p5.fill(255, 255, 255, 20 + _this.grow[i]);
            var x = _this.border + _this.border * i + w * i;
            var y = _this.border + th;
            if (Util.isInside(p5.mx(), p5.my(), x, y, w, h)) {
                if (_this.grow[i] < 15)
                    _this.grow[i]++;
            }
            else {
                if (_this.grow[i] > 0)
                    _this.grow[i]--;
            }
            p5.rect(x, y, w, h);
            // p5.rect(x - this.grow[i], y - this.grow[i], w + this.grow[i] * 2, h + this.grow[i] * 2)
            _this.renderSingle(x, y, o);
        });
    };
    PickModal.prototype.width = function () {
        return (p5.width() - this.border * (this.towers.length + 1)) / this.towers.length;
    };
    PickModal.prototype.height = function () {
        // return p5.height() - this.border * 2;
        return this.width();
    };
    return PickModal;
}());
var PickTowerModal = /** @class */ (function (_super) {
    __extends(PickTowerModal, _super);
    function PickTowerModal() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PickTowerModal.prototype.renderSingle = function (x, y, o) {
        o.render(x + this.width() / 2 - S / 2, y + 20);
        var textW = p5.textW(o.name());
        p5.fill(255, 255, 255, 255);
        p5.text(o.name(), x + this.width() / 2 - textW / 2, y - 40);
    };
    return PickTowerModal;
}(PickModal));
// class FloorPickModal extends PickModal<FloorPick> {
//     renderSingle(x: number, y: number, o: FloorPick): void {
//         o.render(x + this.width() / 2 - o.width() / 2, y + 20)
//         const textW = p5.textW(o.name())
//         p5.fill(255, 255, 255, 255);
//         p5.text(o.name(), x + this.width() / 2 - textW / 2, y - 40);
//     }
// }
var Tower = /** @class */ (function () {
    function Tower(img, color, affectingPoss) {
        var buffs = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            buffs[_i - 3] = arguments[_i];
        }
        this.img = img;
        this.color = color;
        // BUFFS
        this.addedHealth = 0;
        this.receiveBuffs = [];
        this.giveBuffs = buffs;
        this.affectingPoss = affectingPoss;
    }
    //
    Tower.prototype.name = function () {
        return this.img.replace("-", " ");
    };
    Tower.prototype.getImage = function () {
        return this.img;
    };
    Tower.prototype.getColor = function () {
        return "#FFFFFF";
    };
    Tower.prototype.render = function (x, y) {
        var border = 4;
        p5.tint(this.color);
        p5.drawImg("box", x, y);
        p5.drawImg(this.img, x + border, y + border, S - 2 * border, S - 2 * border);
        p5.noTint();
    };
    //
    Tower.prototype.getGiveBuffs = function () {
        return __spreadArray([], this.giveBuffs, true);
    };
    Tower.prototype.sumBuffsOfType = function (type) {
        return this.receiveBuffs.filter(function (x) { return x.type === type; }).reduce(function (partialSum, a) { return partialSum + a.value; }, 0);
    };
    Tower.prototype.affects = function (pos1, pos2) {
        return this.affectingPoss.map(function (p) { return new Pos(pos1.x + p.x, pos1.y + p.y); }).filter(function (p) { return pos2.x === p.x && pos2.y === p.y; }).length > 0;
        // return pos1.y == pos2.y;
        // return Math.abs(pos1.x - pos2.x) <= 1 && Math.abs(pos1.y - pos2.y) <= 1;
    };
    return Tower;
}());
var Turret = /** @class */ (function (_super) {
    __extends(Turret, _super);
    function Turret() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.attackCooldown = 0;
        return _this;
    }
    Turret.prototype.step = function (data, x, y) {
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }
        else {
            var tar = this.getNextTarget(data, x, y);
            if (tar != null)
                this.tryShootEnemy(data, x, y, tar);
        }
    };
    Turret.prototype.tryShootEnemy = function (data, x, y, tar) {
        var bulletX = x + S / 2;
        var bulletY = y + S / 2;
        var dir = Util.dir(bulletX, bulletY, tar.x, tar.y);
        var bullet = new Bullet(bulletX, bulletY, dir, 5);
        data.addBullet(bullet);
        this.attackCooldown = this.getMaxAttackCooldown();
    };
    Turret.prototype.getNextTarget = function (data, x, y) {
        var enemy = null;
        var maxDist = this.getMaxRange();
        data.enemies.forEach(function (e) {
            var dist = Util.dist(x, y, e.x, e.y);
            if (dist < maxDist) {
                maxDist = dist;
                enemy = e;
            }
        });
        return enemy;
    };
    Turret.prototype.getMaxAttackCooldown = function () {
        return Math.max(1, 50 - this.sumBuffsOfType("attackSpeed"));
    };
    Turret.prototype.getMaxRange = function () {
        return 800 + this.sumBuffsOfType("range");
    };
    return Turret;
}(Tower));
/// <reference path="Turret.ts" />
function b(type, value) {
    return new Buff(type, value);
}
function p(x, y) {
    return new Pos(x, y);
}
var none = function () { return []; };
var cross = function () { return [p(1, 0), p(0, 1), p(-1, 0), p(0, -1),]; };
var spike = function () { return [p(1, 0), p(2, 0), p(3, 0),]; };
var square = function () { return __spreadArray(__spreadArray([], cross(), true), [p(1, 1), p(1, -1), p(-1, 1), p(-1, -1)], false); };
var Towers = {
    turret_1: new Turret("test", "#FF0000", none()),
    turret_2: new Turret("lucifer-cannon", "#ff8170", none()),
    // turret_3: new Turret("skull-bolt", "#2f975e"),
    tower_1: new Tower("skull-bolt", "#2f975e", spike(), b("attackSpeed", 25)),
};
function getRandomTowers(n) {
    return [
        Towers.turret_1,
        Towers.tower_1,
        Towers.turret_3,
    ];
}
var ParticleColor = /** @class */ (function () {
    function ParticleColor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    return ParticleColor;
}());
var ParticleSystem = /** @class */ (function () {
    function ParticleSystem() {
        this.particles = [];
    }
    ParticleSystem.prototype.step = function (p5) {
        var _a, _b, _c;
        for (var i = 0; i < this.particles.length; i++) {
            var particle = this.particles[i];
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
                i--;
            }
            else {
                if (particle.image) {
                    p5.tint(p5.color(particle.color.r, particle.color.g, particle.color.b, particle.color.a));
                    var w = 4 * particle.image.width * ((_a = particle.size) !== null && _a !== void 0 ? _a : 1);
                    var h = 4 * particle.image.height * ((_b = particle.size) !== null && _b !== void 0 ? _b : 1);
                    p5.image(particle.image, particle.x, particle.y, w, h);
                    p5.noTint();
                }
                else {
                    p5.noStroke();
                    p5.fill(p5.color(particle.color.r, particle.color.g, particle.color.b, particle.color.a));
                    p5.square(particle.x, particle.y, (_c = particle.size) !== null && _c !== void 0 ? _c : 4);
                }
                particle.life--;
                particle.x += particle.vx;
                particle.y += particle.vy;
                if (particle.ax)
                    particle.vx += particle.ax;
                if (particle.ay)
                    particle.vy += particle.ay;
                if (particle.compute)
                    particle.compute(particle);
            }
        }
    };
    ParticleSystem.prototype.add = function (particle) {
        this.particles.push(particle);
    };
    return ParticleSystem;
}());
var Util = /** @class */ (function () {
    function Util() {
    }
    Util.dir = function (x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    };
    Util.dist = function (x1, y1, x2, y2) {
        return Math.hypot(x1 - x2, y1 - y2);
    };
    Util.isInside = function (mouseX, mouseY, x, y, w, h) {
        return mouseX >= x && mouseY >= y && mouseX <= x + w && mouseY <= y + h;
    };
    Util.randomInt = function (min, max) {
        return Math.floor(min + Math.random() * (max + 1 - min));
    };
    Util.toDegrees = function (radians) {
        return radians * (180 / Math.PI);
    };
    Util.toRadians = function (degrees) {
        return degrees * (Math.PI / 180);
    };
    Util.lerp = function (a, b, alpha) {
        return a + alpha * (b - a);
    };
    Util.rotate = function (points, positive) {
        return positive
            ? points.map(function (p) { return (new Pos(-p.y, p.x)); })
            : points.map(function (p) { return (new Pos(p.y, -p.x)); });
    };
    return Util;
}());
var P5 = /** @class */ (function () {
    function P5(p) {
        this.p = p;
        this.images = {
            "box": null,
            "square": null,
            "square2": null,
            "test": null,
            // TURRETS
            // NODES
            "circle": null,
            "aerial-signal": null,
            "alien-bug": null,
            "amplitude": null,
            "android-mask": null,
            "architect-mask": null,
            "black-hole-bolas": null,
            "claws": null,
            "cog": null,
            "computer-fan": null,
            "explosion-rays": null,
            "fangs": null,
            "heavy-bullets": null,
            "hunger": null,
            "laser-gun": null,
            "lucifer-cannon": null,
            "metal-hand": null,
            "metroid": null,
            "microchip": null,
            "molecule": null,
            "movement-sensor": null,
            "portal": null,
            "processor": null,
            "radar-dish": null,
            "radioactive": null,
            "robot-antennas": null,
            "robot-helmet": null,
            "round-knob": null,
            "skull-bolt": null,
            "skull-stripe": null,
            "sly": null,
            "target": null,
            "tire-iron-cross": null,
            "trap-mask": null,
            "trefoil-shuriken": null,
            "vile-fluid": null,
            "vortex": null,
            // BULLETS
            "bullet1": null,
            // ENEMIES
            "cracked-mask": null,
            "devil-mask": null,
            "alien-skull": null,
            "skull-mask": null,
            "tribal-mask": null,
            "surprised-skull": null,
        };
    }
    P5.prototype.loadImages = function () {
        var _this = this;
        Object.keys(this.images).forEach(function (img) { return _this.loadImage(img); });
    };
    P5.prototype.loadImage = function (id) {
        var path = "assets/".concat(id, ".svg");
        console.log("loading image " + path);
        this.images[id] = this.p.loadImage(path);
    };
    P5.prototype.width = function () {
        return this.p.width;
    };
    P5.prototype.height = function () {
        return this.p.height;
    };
    P5.prototype.drawImg = function (id, x, y, w, h) {
        if (w === void 0) { w = S; }
        if (h === void 0) { h = S; }
        if (!this.images[id]) {
            console.log("could not find image " + id);
            this.p.fill(255, 0, 255, 255);
            this.p.rect(x, y, w, h);
        }
        else {
            this.p.image(this.images[id], x, y, w, h);
        }
    };
    P5.prototype.tint = function (color) {
        this.p.tint(color);
    };
    P5.prototype.noTint = function () {
        this.p.noTint();
    };
    P5.prototype.mx = function () {
        return this.p.mouseX;
    };
    P5.prototype.my = function () {
        return this.p.mouseY;
    };
    P5.prototype.fill = function (r, g, b, a) {
        this.p.fill(r, g, b, a);
    };
    P5.prototype.rect = function (r, g, b, a) {
        this.p.rect(r, g, b, a);
    };
    P5.prototype.text = function (text, x, y) {
        this.p.text(text, x, y);
    };
    P5.prototype.textW = function (text) {
        return this.p.textWidth(text);
    };
    return P5;
}());
var p5;
var particleSystem;
var particleImage;
function addParticle(x, y) {
    particleSystem.add({
        x: x,
        y: y,
        vx: -1 + 20 * Math.random(),
        vy: -1 + 20 * Math.random(),
        life: Math.random() * 100,
        size: .25,
        color: { r: 255, g: 255, b: 0, a: 255 },
        compute: function (p) { return p.color.a *= .99; },
        image: particleImage,
    });
}
function particleBurst(x, y, dir, color) {
    for (var i = 0; i < 10; i++)
        particleSystem.add({
            x: x - 16, y: y - 16,
            vx: Math.random() * 8 * Math.cos(dir - .2 + .4 * Math.random()),
            vy: Math.random() * 8 * Math.sin(dir - .2 + .4 * Math.random()),
            life: Math.random() * 100,
            size: .1 + Math.random() * .1,
            color: ColorHex(color),
            compute: function (p) { return p.color.a *= .84; },
            image: particleImage,
        });
}
function particleExplosion(x, y, color) {
    for (var i = 0; i < 20; i++)
        particleSystem.add({
            x: x - 16, y: y - 16,
            vx: -2 + Math.random() * 4,
            vy: -2 + Math.random() * 4,
            life: Math.random() * 100,
            size: .25 + Math.random() * .1,
            color: ColorHex(color),
            compute: function (p) { return p.color.a *= .8; },
            image: particleImage,
        });
}
var sketch = function (p) {
    p5 = new P5(p);
    particleSystem = new ParticleSystem();
    var font;
    var game;
    p.preload = function () {
        font = p.loadFont('assets/font.ttf');
        particleImage = p.loadImage('assets/particle.png');
        p5.loadImages();
    };
    p.setup = function () {
        // p.frameRate(144);
        p.createCanvas(p.windowWidth, p.windowHeight);
        // p.noSmooth();
        p.textFont(font);
        p.textSize(32);
        p.textLeading(24);
        game = new Game();
    };
    p.draw = function () {
        p.fill(0, 0, 0, 50);
        p.rect(0, 0, p.width, p.height);
        game.step();
        game.render();
        particleSystem.step(p);
    };
    p.windowResized = function () {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
    p.mousePressed = function () {
        game.onMousePressed(p.mouseX, p.mouseY);
    };
    p.mouseReleased = function () {
        game.onMouseReleased(p.mouseX, p.mouseY);
    };
    p.mouseWheel = function (e) {
        game.onMouseWheel(p.mouseX, p.mouseY, e.delta > 0);
    };
};
