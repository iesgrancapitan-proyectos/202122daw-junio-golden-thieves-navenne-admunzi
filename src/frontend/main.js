import "phaser";
import MainScene from "./scenes/MainScene";
import RandomPlacePlugin from 'phaser3-rex-plugins/plugins/randomplace-plugin.js';

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
      // gravity: {
      //   y: 0,
      // },
      debug: false,
    },
  },
};

window.addEventListener("load", () => {
  new Phaser.Game(config);
});
