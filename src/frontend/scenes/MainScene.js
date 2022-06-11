import io from "socket.io-client";
import Player from "../objects/Player";
import Ore from "../objects/Ore";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  init(data) {
    
  }
  preload() {
    this.load.atlas("player", "assets/player.png", "assets/player.json");
    this.load.image("tiles", "assets/base-colour.png")
    this.load.image("tilesUnderBridge", "assets/base-colour-under-bridge.png")
    this.load.image("tilesOreVegetables", "assets/ores-vegetables-colour.png")
    this.load.tilemapTiledJSON("mine", "tiled/terrain.json")
    this.load.atlas("ore", "assets/ores.png", "assets/ores.json");
    this.load.image("fov1", "assets/fov-1.png")
    this.load.image("abilityBreak", "assets/abilityBreak.png")
    this.load.image("abilityStun", "assets/abilityStun.png")
  }

  create() {
    const scene = this;

    // socket connection
    this.socket = io();

    // launch lobby
    this.scene.launch("LobbyScene", {socket: scene.socket});

    //  tilemap
    /* this.map = this.make.tilemap({ key: 'mine'})
    const tileset = this.map.addTilesetImage('base-colour', 'tiles')
    const tilesetUnderBridge = this.map.addTilesetImage('base-colour-under-bridge', 'tilesUnderBridge')

    this.groundLayer = this.map.createLayer('ground', tileset)
    this.map.createLayer('outline-ground', tileset)
    this.map.createLayer('under-bridge', tilesetUnderBridge)
    this.map.createLayer('bridge', tileset)

    this.ores = this.physics.add.group({
      classType: Ore,
    });

    const ORES_AMOUNT = 600;
    let oresList = Array.from({length: ORES_AMOUNT});

    oresList.forEach(value => {
      let x = -1;
      let y = -1;

      while (!this.groundLayer.getTileAtWorldXY(x, y)) {
        x = Phaser.Math.Between(0, 6000);
        y = Phaser.Math.Between(0, 4000);
      }

      let ore = this.ores.create(x, y, "ore");
      ore.body.setImmovable();
      ore.body.setAllowGravity(false);
    });

    this.fallLayer = this.map.createLayer('fall', tileset).setCollisionByProperty({ collides: true});
    this.wallsLayer = this.map.createLayer('walls', tileset).setCollisionByProperty({ collides: true});
 */

    //FOV
/*     const width = this.groundLayer.width
    const height = this.groundLayer.height

    // make a RenderTexture that is the size of the screen
    this.rtFOV = this.make.renderTexture({
      width,
      height
    }, true)

    // fill it with black
    this.rtFOV.fill(0x000000, 1)

    // draw the floorLayer into it
    this.rtFOV.draw(this.groundLayer)

    // set a dark blue tint
    this.rtFOV.setTint(0x0a2948) */

    //CHECK COLLIDES WALLS
      // const debugGraphicsWALLS = this.add.graphics().setAlpha(0.75);
      // this.wallsLayer.renderDebug(debugGraphicsWALLS, {
      //   tileColor: null, // Color of non-colliding tiles
      //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
      //   faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
      // });

    //CHECK COLLIDES FALLS
      // const debugGraphicsFALLS = this.add.graphics().setAlpha(0.75);
      // this.fallLayer.renderDebug(debugGraphicsFALLS, {
      //   tileColor: null, // Color of non-colliding tiles
      //   collidingTileColor: new Phaser.Display.Color(154, 239, 48, 255), // Color of colliding tiles
      //   faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
      // });

    //this.physics.world.setBounds(0, 0, this.wallsLayer.width, this.wallsLayer.height);
    this.otherPlayers = this.physics.add.group();
    this.cursors = this.input.keyboard.addKeys({ up: "W", left: "A", down: "S", right: "D" });
    this.playerLabel = this.add.text(-50, -50, "this is you").setOrigin(0.5, 1);
    this.playersConnectedText = this.add.text(20, 20, "");
    this.physics.world.setBounds(0, 0, 1024, 750);
    this.input.mouse.disableContextMenu();

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

      // update vision when player moves
      if (this.vision){
        this.vision.x = this.player.x
        this.vision.y = this.player.y
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
    // this.player.setCollideWorldBounds(true);
  }

  // add any additional players
  addOtherPlayers(id, playerData) {
    this.otherPlayer = new Player(this, id, playerData);
    this.otherPlayer.anims.play("right_idle", true);
    this.otherPlayer.setTint(0x7cc78f);
    this.otherPlayers.add(this.otherPlayer);
  }

}
