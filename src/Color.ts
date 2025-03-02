interface Color {
    r: number;
    g: number;
    b: number;
    a: number;
}

function ColorHex(hex: string) {
    var result24 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result24) return {
        r: parseInt(result24[1], 16),
        g: parseInt(result24[2], 16),
        b: parseInt(result24[3], 16),
        a: 255,
    };
    var result32 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result32) return {
        r: parseInt(result32[1], 16),
        g: parseInt(result32[2], 16),
        b: parseInt(result32[3], 16),
        a: parseInt(result32[4], 16),
    };
    return { r: 0, g: 0, b: 0, a: 0 };
}

function Color(r: number, g: number, b: number, a: number): Color {
    return { r, g, b, a }
}
