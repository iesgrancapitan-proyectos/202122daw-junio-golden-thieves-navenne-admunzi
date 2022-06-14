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

    this.socket.on("setState", function (roomInfo) {
      createText(scene, 0.1, "Lobby", 50, true, 5);
      scene.roomKey = roomInfo.roomKey;
      scene.players = roomInfo.players;
    });

    this.socket.on("currentPlayers", function (data) {
      if (data.numPlayers == 1) {
        scene.startButton = createText(scene, 0.9, "Start", 40, true, 4);
        scene.startButton.setInteractive({ useHandCursor: true  });
        scene.startButton.on("pointerover", function() {
          this.setScale(1.1);
        });

        scene.startButton.on("pointerout", function(){
            this.setScale(1);
        });

        scene.startButton.on("pointerdown", function(){
          scene.socket.emit("start game", scene.roomKey);
        });
      }
        scene.updateList(data);
    });

    this.socket.on("newPlayer", function (data) {
        scene.updateList(data);
    });

    this.socket.on("disconnected", function (data) {
        scene.updateList(data);
    });

    this.socket.on("start scene", function() {
      scene.scene.start("MainScene", {
        socket: scene.socket,
        roomKey: scene.roomKey,
        players: scene.players
      });
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
