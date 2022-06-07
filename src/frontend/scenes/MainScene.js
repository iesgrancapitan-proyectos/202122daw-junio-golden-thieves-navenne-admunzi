import io from "socket.io-client";
import Player from "../objects/Player";
import Ore from "../objects/Ore";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  init(data) {}
  preload() {
    this.load.atlas("player", "assets/player.png", "assets/player.json");
    this.load.atlas("ore", "assets/ores.png", "assets/ores.json");
  }

  create() {
    const scene = this;

    this.playerLabel = this.add.text(-50, -50, "this is you").setOrigin(0.5, 1);
    this.playersConnectedText = this.add.text(20, 20, "");
    this.physics.world.setBounds(0, 0, 1024, 750);
    this.otherPlayers = this.physics.add.group();
    this.cursors = this.input.keyboard.addKeys({ up: "W", left: "A", down: "S", right: "D" });
    this.input.mouse.disableContextMenu();

    this.ores = this.physics.add.group({
      classType: Ore,
    });

    this.ores.create(100, 100, "ore");
    console.log(this.ores);

    // socket connection
    this.socket = io();

    this.socket.on("greeting", (currentPlayers) => {
      Object.keys(currentPlayers).forEach(function (id) {
        if (id === scene.socket.id) {
          scene.addPlayer(id, currentPlayers[id]);
        } else {
          scene.addOtherPlayers(id, currentPlayers[id]);
        }
      });
    });

    this.socket.on("new player", (id, playerData) => {
      scene.addOtherPlayers(id, playerData);
    });

    this.socket.on("remove player", (id) => {
      scene.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (id === otherPlayer.socketId) {
          otherPlayer.destroy();
        }
      });
    });

    this.socket.on("player moved", function (playerData) {
      scene.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerData.socketId === otherPlayer.socketId) {
          otherPlayer.anims.play(playerData.keydown, true);
          otherPlayer.setPosition(playerData.x, playerData.y);
        }
      });
    });

    this.socket.on("player mined", function (playerData) {
      scene.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerData.socketId === otherPlayer.socketId) {
          let direction = ["left", "left_idle", "up", "down"].includes(playerData.keydown) ? "left" : "right";
          otherPlayer.anims.play(`${direction}_mine`, true);
        }
      });
    });

    this.socket.on("player mine stopped", function (playerData) {
      scene.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerData.socketId === otherPlayer.socketId) {
          let direction = ["left", "left_idle", "up", "down"].includes(playerData.keydown) ? "left" : "right";
          if (!otherPlayer.anims.isPlaying) {
          otherPlayer.anims.play(`${direction}_idle`, true);
          }
        }
      });
    });



    this.socket.emit("ready");
  }

  update() {
    const scene = this;

    if (this.player) {
      this.playerLabel.x = this.player.x;
      this.playerLabel.y = this.player.y - 40;

      this.player.update();

      // tell the server about movement
      let x = this.player.x;
      let y = this.player.y;
      if (this.player.oldPosition && (x !== this.player.oldPosition.x || y !== this.player.oldPosition.y)) {
        this.socket.emit("player movement", {
          x: scene.player.x,
          y: scene.player.y,
          keydown: scene.player.keydown,
        });
      }

      if (this.input.activePointer.leftButtonDown()) {
        this.socket.emit("player mining");
      }

      if (this.input.activePointer.leftButtonReleased()) {
        this.socket.emit("player stop mining");
      }

      // save old position
      this.player.oldPosition = {
        x: this.player.x,
        y: this.player.y,
        keydown: this.player.keydown,
      };
    }
  }

  // add the player
  addPlayer(id, playerData) {
    this.player = new Player(this, id, playerData);
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
  }

  // add any additional players 
  addOtherPlayers(id, playerData) {
    this.otherPlayer = new Player(this, id, playerData);
    this.otherPlayer.anims.play("right_idle", true);
    this.otherPlayer.setTint(0x7cc78f);
    this.otherPlayers.add(this.otherPlayer);
  }
}
