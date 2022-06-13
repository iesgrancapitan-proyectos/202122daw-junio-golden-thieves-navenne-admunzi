import createText from "../functions";
import io from "socket.io-client";
export default class LobbyScene extends Phaser.Scene {
  constructor() {
    super("LobbyScene");
  }

  init(data) {
    this.playerName = data.name;
  }

  preload() {
    this.load.bitmapFont("pixelFont", "fonts/pixel.png", "fonts/pixel.xml");
  }

  create() {
    const scene = this;

    this.nameList = [];

    // socket connection
    this.socket = io();

    // launch room menu
    this.scene.launch("RoomScene", { socket: scene.socket, playerName: scene.playerName });

    this.socket.on("setState", function (data) {
      createText(scene, 0.1, "Lobby", 50, true, 5);
    });

    this.socket.on("currentPlayers", function (data) {
        scene.updateList(data);
    });

    this.socket.on("newPlayer", function (data) {
        scene.updateList(data);
    });

    this.socket.on("disconnected", function (data) {
        scene.updateList(data);
    });
  }

  update() {}

  updateList(data) {
    let heightFactor = 0.25;
    this.nameList.forEach(function (name) {
        name.destroy();
    });
    for (const player in data.players) {
    let name = createText(this, heightFactor, data.players[player].name, 30, true, 3);
    this.nameList.push(name);
    heightFactor += 0.05;
    }
  }
}
