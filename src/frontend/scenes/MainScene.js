import io from "socket.io-client";
import Player from "../objects/Player";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  init(data) {}
  preload() {
    this.load.atlas("player", "assets/player.png", "assets/player.json");
  }

  create() {
    const scene = this;

    this.playerLabel = this.add.text(-50, -50, "this is you").setOrigin(0.5, 1);
    this.playersConnectedText = this.add.text(20, 20, "");
    this.physics.world.setBounds(0, 0, 1024, 750);

    this.otherPlayers = this.physics.add.group();
    this.cursors = this.input.keyboard.addKeys({ up: "W", left: "A", down: "S", right: "D" });
    this.input.mouse.disableContextMenu();

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

    this.socket.emit("ready");
  }

  update() {
    const scene = this;

    if (this.player) {
      this.playerLabel.x = this.player.x;
      this.playerLabel.y = this.player.y - 40;

      const VELOCITY = 160;

      // idle
      this.player.setVelocity(0);
      let leftOrRight = ["left", "left_idle", "up", "down"].includes(scene.player.keydown)
        ? "left_idle"
        : "right_idle";
      this.player.keydown = leftOrRight;

      // horizontal movement
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-VELOCITY);
        this.player.anims.play("left", true);
        this.player.keydown = "left";
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(VELOCITY);
        this.player.anims.play("right", true);
        this.player.keydown = "right";
      }

      // vertical movement
      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-VELOCITY);
        let leftOrRight = ["left", "left_idle", "up", "down"].includes(scene.player.keydown)
          ? "left"
          : "right";
        this.player.anims.play(leftOrRight, true);
        this.player.keydown = leftOrRight;
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(VELOCITY);
        let leftOrRight = ["left", "left_idle", "up", "down"].includes(scene.player.keydown)
          ? "left"
          : "right";
        this.player.anims.play(leftOrRight, true);
        this.player.keydown = leftOrRight;
      }
      
      // idle animation
      if (this.player.body.velocity.x == 0 && this.player.body.velocity.y == 0 && !this.input.activePointer.leftButtonDown()) {
        this.player.anims.play(leftOrRight, true);
      }

      // mining
      if (this.input.activePointer.leftButtonDown()) {
        let leftOrRight = ["left", "left_idle", "up", "down"].includes(scene.player.keydown)
          ? "left"
          : "right";
        this.player.anims.play(`${leftOrRight}_mine`, true);
      }

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
