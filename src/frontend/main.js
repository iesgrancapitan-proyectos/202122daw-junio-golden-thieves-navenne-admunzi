import "phaser";
import MainScene from "./scenes/MainScene";

const DEFAULT_WIDTH = 2048;
const DEFAULT_HEIGHT = 900;

const config = {
  backgroundColor: "#080e16",
  scale: {
    parent: "phaser-game",
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  },
  scene: [MainScene],
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
};

window.addEventListener("load", () => {
  new Phaser.Game(config);
});
