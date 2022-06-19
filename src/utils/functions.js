function createText(scene, widthFactor, heightFactor, text, fontSize, shadow, shadowOffset) {
    let bitmapText = scene.add.bitmapText(scene.renderer.width * widthFactor, scene.renderer.height * heightFactor, 'pixelFont', text, fontSize, 1).setOrigin(0.5).setLetterSpacing(2);
    if (shadow) {
        bitmapText.setDropShadow(shadowOffset, shadowOffset, "#000", 1);
    }
    return bitmapText;
}

function getColor(numPlayer) {
    const colors = [0xfcba03, 0xe60505, 0xdae605, 0x75e605, 0x12660f, 0x05e6b9, 0x0514e6, 0xce80ff, 0x7105e6, 0xe605cf, 0xf7056e, 0xffffff];
    return colors[numPlayer - 1];
}

export {
    createText,
    getColor
}