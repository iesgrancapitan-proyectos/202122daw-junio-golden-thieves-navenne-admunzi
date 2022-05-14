import io from "socket.io-client";
import Player from "../objects/Player";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  init(data) {}
  preload() {
    this.load.spritesheet("player", "assets/player.png", {
      frameWidth: 37,
      frameHeight: 64,
    });
  }

  create() {

    const scene = this;

    this.playerLabel = this.add.text(-50, -50, "this is you").setOrigin(0.5, 1);
    this.playersConnectedText = this.add.text(20, 20, "");
    this.physics.world.setBounds(0, 0, 1024, 750);

    this.otherPlayers = this.physics.add.group();
    this.cursors = this.input.keyboard.addKeys({ up: "W", left: "A", down: "S", right: "D" });

    // Socket connection
    this.socket = io();

    this.socket.on("greeting", (currentPlayers) => {
      Object.keys(currentPlayers).forEach(function (id) {
        if (id === scene.socket.id) {
          addPlayer(scene, id, currentPlayers[id]);
        } else {
          addOtherPlayers(scene, id, currentPlayers[id]);
        }
      });
    });

    this.socket.on("new player", (id, playerData) => {
      addOtherPlayers(scene, id, playerData);
    });

    this.socket.on("remove player", (id) => {
      scene.otherPlayers.getChildren().forEach(function (otherPlayer) {
        //console.log(playerId);
        //console.log(otherPlayer);
        if (id === otherPlayer.socketId) {
          otherPlayer.destroy();
        }
      });
    });

    this.socket.on("player moved", function (playerData) {
      scene.otherPlayers.getChildren().forEach(function (otherPlayer) {
        console.log(playerData)
        if (playerData.socketId === otherPlayer.socketId) {
          otherPlayer.anims.play(playerData.keydown, true);
          otherPlayer.setPosition(playerData.x, playerData.y);
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

      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-160);
        this.player.anims.play("left", true);
        this.player.keydown = "left";
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(160);
        this.player.anims.play("right", true);
        this.player.keydown = "right";
      } else if (this.cursors.up.isDown) {
        this.player.setVelocityY(-160);
        this.player.anims.play("idle", true);
        this.player.keydown = "up";
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(160);
        this.player.anims.play("idle", true);
        this.player.keydown = "down";
      } else {
        this.player.setVelocity(0);
        this.player.anims.play("idle");
        this.player.keydown = "idle";
      }

      // Tell the server about your movement
      let x = this.player.x;
      let y = this.player.y;
      if (this.player.oldPosition && (x !== this.player.oldPosition.x || y !== this.player.oldPosition.y)) {
        this.socket.emit("player movement", {
          x: scene.player.x,
          y: scene.player.y,
          keydown: scene.player.keydown,
        });
      }

      // Save old position
      this.player.oldPosition = {
        x: this.player.x,
        y: this.player.y,
        keydown: this.player.keydown
      };
    }
  }
}

  // Add the player object
  function addPlayer(scene, id, playerData) {
    scene.player = new Player(scene, id, playerData);
    scene.player.setBounce(0.2);
    scene.player.setCollideWorldBounds(true);
  }

  // Add any additional players
  function addOtherPlayers(scene, id, playerData) {
    scene.otherPlayer = new Player(scene, id, playerData);

    scene.otherPlayer.setTint(0x7cc78f);
    scene.otherPlayers.add(scene.otherPlayer);
  }