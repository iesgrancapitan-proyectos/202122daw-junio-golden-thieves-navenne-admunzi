export default function createText(scene, heightFactor, text, fontSize, shadow, shadowOffset) {
    let bitmapText = scene.add.bitmapText(scene.renderer.width / 2, scene.renderer.height * heightFactor, 'pixelFont', text, fontSize, 1).setOrigin(0.5).setLetterSpacing(2);
    if (shadow) {
        bitmapText.setDropShadow(shadowOffset, shadowOffset, "#000", 1);
    }
    return bitmapText;
}