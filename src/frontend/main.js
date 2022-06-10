import "phaser";
import LobbyScene from "./scenes/LobbyScene";
import MainScene from "./scenes/MainScene";
import MenuScene from "./scenes/MenuScene";

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;

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
  dom: {
    createContainer: true
  },
};

window.addEventListener("load", () => {
  new Phaser.Game(config);
});
