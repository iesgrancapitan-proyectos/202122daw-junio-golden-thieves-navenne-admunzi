import "phaser";
import MainScene from "./scenes/MainScene";

const DEFAULT_WIDTH = 1024;
const DEFAULT_HEIGHT = 800;

const config = {
  backgroundColor: "#060B21",
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
      gravity: {
        y: 0,
      },
      debug: false,
    },
  },
};

window.addEventListener("load", () => {
  new Phaser.Game(config);
});
