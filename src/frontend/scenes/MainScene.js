import io from "socket.io-client";
import Player from "../objects/Player";

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
    this.load.image("tilesOreVegetables", "assets/mena-vegetables-colour.png")
    this.load.tilemapTiledJSON("mine", "tiled/terreno.json")

    this.load.image("ore1", "assets/oregold/ore1.png")
    this.load.image("ore2", "assets/oregold/ore2.png")
    this.load.image("ore3", "assets/oregold/ore3.png")
    this.load.image("ore4", "assets/oregold/ore4.png")
    this.load.image("ore5", "assets/oregold/ore5.png")
    this.load.image("ore6", "assets/oregold/ore6.png")
    this.load.image("ore7", "assets/oregold/ore7.png")

    this.load.image("fov1", "assets/fov-1.png")

    this.load.image("abilityBreak", "assets/abilityBreak.png")
    this.load.image("abilityStun", "assets/abilityStun.png")
  }

  create() {
    const scene = this;

    //Tiles Sets
    this.map = this.make.tilemap({ key: 'mine'})
    const tileset = this.map.addTilesetImage('base-colour', 'tiles')
    const tilesetUnderBridge = this.map.addTilesetImage('base-colour-under-bridge', 'tilesUnderBridge')

    this.groundLayer = this.map.createLayer('ground', tileset)
    this.map.createLayer('outline-ground', tileset)
    this.map.createLayer('under-bridge', tilesetUnderBridge)
    this.map.createLayer('bridge', tileset)

    // console.log(this.oreLayer) // give an array of sprites
    const AMOUNT_ORE = 600;
    let items = [];
  
    for (var i = 1; i <= AMOUNT_ORE; i++) {
      items.push(this.add.image(0, 0, 'ore' + Math.floor((Math.random() * (7 - 1 + 1)) + 1)))
    }

    items.forEach(element => {
      do {
        element.x = Math.floor(Math.random() * 6000);
        element.y = Math.floor(Math.random() * 4000);

      } while (!this.groundLayer.getTileAtWorldXY(element.x, element.y));
    });

    this.ores = this.physics.add.staticGroup(items)

    this.fallLayer = this.map.createLayer('fall', tileset)
    this.fallLayer.setCollisionByProperty({ collides: true})

    this.wallsLayer = this.map.createLayer('walls', tileset)
    this.wallsLayer.setCollisionByProperty({ collides: true})

    //FOV
    const width = this.groundLayer.width
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
    this.rtFOV.setTint(0x0a2948)

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

    this.physics.world.setBounds(0, 0, this.wallsLayer.width, this.wallsLayer.height);

    this.playerLabel = this.add.text(-50, -50, "this is you").setOrigin(0.5, 1);
    this.playersConnectedText = this.add.text(20, 20, "");

    this.otherPlayers = this.physics.add.group();
    this.cursors = this.input.keyboard.addKeys({ up: "W", left: "A", down: "S", right: "D" });

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

      //Update vision when player move
      if (this.vision){
        this.vision.x = this.player.x
        this.vision.y = this.player.y
      }

      //Camera Follow
      this.cameras.main.startFollow(scene.player, true, 0.05, 0.05);


      // const VELOCITY = 160; ORIGINAL
      const VELOCITY = 300; //DEV

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
      if (this.player.body.velocity.x == 0 && this.player.body.velocity.y == 0) {
        this.player.anims.play(leftOrRight, true);
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
