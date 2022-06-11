export default class LobbyScene extends Phaser.Scene {
  constructor() {
    super("LobbyScene");
  }

  init(data) {
    this.socket = data.socket;
  }

  preload() {
    this.load.bitmapFont("pixelFont", "fonts/pixel.png", "fonts/pixel.xml");
  }

  create() {
    // set text waiting for players
    const x = this.renderer.width / 2;
    const y = this.renderer.height / 2;
    this.add.bitmapText(x, y, "pixelFont", "Waiting for players", 50, 1).setOrigin(0.5).setDropShadow(5, 5, "#000", 1);
  }

  update() {}
}
