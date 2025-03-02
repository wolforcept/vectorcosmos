type BuffType = "attackSpeed" | "rotationSpeed" | "health" | "damage" | "range"
class Buff {
    constructor(public type: BuffType, public value: number) { }
}