import Player from "../objects/Player";
import Ore from "../objects/Ore";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  init(data) {
    this.socket = data.socket;
  }
  preload() {
    this.load.bitmapFont("pixelFont", "fonts/pixel.png", "fonts/pixel.xml");

    this.load.atlas("player", "assets/player.png", "assets/player.json");
    this.load.image("tiles", "assets/base-colour.png")
    this.load.image("tilesUnderBridge", "assets/base-colour-under-bridge.png")
    this.load.image("tilesOreVegetables", "assets/ores-vegetables-colour.png")
    this.load.image("tilesMiscObjects", "assets/misc-objects.png")
    this.load.tilemapTiledJSON("mine", "tiled/terrain.json")
    this.load.atlas("ore", "assets/ores.png", "assets/ores.json");
    this.load.image("fov1", "assets/fov-1.png")
    this.load.image("abilityBreak", "assets/abilityBreak.png")
    this.load.image("abilityStun", "assets/abilityStun.png")
    this.load.image("abilityTransform", "assets/abilityTransform.png")
    this.load.bitmapFont("pixelFont", "fonts/pixel.png", "fonts/pixel.xml");
    this.load.image("guiGold", "assets/guiGold.png")

  }

  abilityBreakUpdateTimer(scene){
    scene.abilityBreakText.setText(--scene.abilityBreakCounter);
    if (scene.abilityBreakCounter == 0) {
      scene.abilityBreakBt.setInteractive();
      scene.abilityBreakText.setVisible(false);
      scene.abilityBreakBt.clearTint();
    }
  }

  abilityStunUpdateTimer(scene){
    scene.abilityStunText.setText(--scene.abilityStunCounter);
    if (scene.abilityStunCounter == 0) {
      scene.abilityStunBt.setInteractive();
      scene.abilityStunText.setVisible(false);
      scene.abilityStunBt.clearTint();
    }
  }

  abilityTransformUpdateTimer(scene){
    scene.abilityTransformText.setText(--scene.abilityTransformCounter);
    if (scene.abilityTransformCounter == 0) {
      scene.abilityTransformBt.setInteractive();
      scene.abilityTransformText.setVisible(false);
      scene.abilityTransformBt.clearTint();
    }
  }

  create() {
    const scene = this;

    //  tilemap
     this.map = this.make.tilemap({ key: 'mine'})
    const tileset = this.map.addTilesetImage('base-colour', 'tiles')
    const tilesetUnderBridge = this.map.addTilesetImage('base-colour-under-bridge', 'tilesUnderBridge')
    const tilesetMiscObjects = this.map.addTilesetImage('misc-objects', 'tilesMiscObjects')

    this.groundLayer = this.map.createLayer('ground', tileset)
    this.map.createLayer('outline-ground', tileset)
    this.map.createLayer('under-bridge', tilesetUnderBridge)
    this.map.createLayer('bridge', tileset)

    this.ores = this.physics.add.group({
      classType: Ore,
    });

    this.fallLayer = this.map.createLayer('fall', tileset).setCollisionByProperty({ collides: true});
    this.wallsLayer = this.map.createLayer('walls', tileset).setCollisionByProperty({ collides: true});
    this.interactable_objectsLayer = this.map.createLayer('interactable-objects', tilesetMiscObjects).setCollisionByProperty({ collides: true});
    this.playerLayer = this.add.layer();
    // gui gold
    this.add.image(230,130,"guiGold").setScrollFactor(0).setDepth(1);
    this.goldPlayerGui = this.add.bitmapText(190,81, 'pixelFont', "", 25, 1).setDropShadow(4, 4, "#000", 1).setScrollFactor(0).setDepth(2);
    this.goldTeamNormalGui = this.add.bitmapText(170,117, 'pixelFont', "", 25, 1).setDropShadow(4, 4, "#000", 1).setScrollFactor(0).setDepth(2);
    this.goldTeamImpostorGui = this.add.bitmapText(170,154, 'pixelFont', "", 25, 1).setDropShadow(4, 4, "#000", 1).setScrollFactor(0).setDepth(2);

    // console.log(this.oreLayer) // give an array of sprites
    const ORES_AMOUNT = 600;
    let oresList = Array.from({length: ORES_AMOUNT});
    
    // area dont spawn ores
    let areaMainSpawn = new Phaser.Geom.Rectangle(2820, 1920, 450, 300);

    oresList.forEach(value => {
      let x = -1;
      let y = -1;

      while (!this.groundLayer.getTileAtWorldXY(x, y) || areaMainSpawn.contains(x, y)) {
        x = Phaser.Math.Between(0, 6000);
        y = Phaser.Math.Between(0, 4000);
      }

      let ore = this.ores.create(x, y, "ore");
      ore.body.setImmovable();
      ore.body.setAllowGravity(false);
    });

    // create vote object
    this.voteObject = this.add.sprite(3016, 2000, "voteObject");
    this.physics.world.enable(this.voteObject);
    this.voteObject.setAlpha(0);
    this.voteObjectKeyEText = this.add.bitmapText(3006, 1935, 'pixelFont', "E", 35, 1).setDropShadow(4, 4, "#000", 1).setVisible(false);

    // create anvil object
    this.anvilObject = this.add.sprite(2880, 2065, "anvil");
    this.physics.world.enable(this.anvilObject);
    this.anvilObject.setAlpha(0);
    this.anvilObjectKeyEText = this.add.bitmapText(2870, 2015, 'pixelFont', "E", 35, 1).setDropShadow(4, 4, "#000", 1).setVisible(false);
    
    // create minecartGeneral object
    this.minecartGeneralObject = this.add.sprite(3070, 2125, "minecartGeneral");
    this.physics.world.enable(this.minecartGeneralObject);
    this.minecartGeneralObject.setAlpha(0);
    this.minecartGeneralObjectKeyEText = this.add.bitmapText(3060, 2078, 'pixelFont', "E", 35, 1).setDropShadow(4, 4, "#000", 1).setVisible(false);
    
    // create minecartImpostor object
    this.minecartImpostorObject = this.add.sprite(3390, 2030, "minecartImpostor");
    this.physics.world.enable(this.minecartImpostorObject);
    this.minecartImpostorObject.setAlpha(0);
    this.minecartImpostorObjectKeyEText = this.add.bitmapText(3380, 1985, 'pixelFont', "E", 35, 1).setDropShadow(4, 4, "#000", 1).setVisible(false);

    // create button jail object
    this.buttonJailObject = this.add.sprite(2950, 2185, "buttonJailObject");
    this.physics.world.enable(this.buttonJailObject);
    this.buttonJailObject.setAlpha(0);
    this.buttonJailObjectKeyEText = this.add.bitmapText(2940, 2145, 'pixelFont', "E", 35, 1).setDropShadow(4, 4, "#000", 1).setVisible(false);
    
    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    //FOV
     const width = this.groundLayer.width
    const height = this.groundLayer.height

    // make a RenderTexture that is the size of the screen
    this.rtFOV = this.make.renderTexture({
      width,
      height
    }, true)

    console.log("entra");
    
    // fill it with black
    this.rtFOV.fill(0x000000, 1)

    // draw the floorLayer into it
    this.rtFOV.draw(this.groundLayer)

    // set a dark blue tint
    this.rtFOV.setTint(0x0a2948)

    // draw ability buttom and text
    this.abilityBreakText = this.add.bitmapText(543, 585, 'pixelFont', "", 30, 1).setDropShadow(3, 3, "#000", 1).setScrollFactor(0).setDepth(2);
    this.abilityBreakBt = this.add.image(560, 600 , 'abilityBreak').setScrollFactor(0).setScale(1.65).setInteractive().setDepth(1).setVisible(false);

    // add event click to abilityBreakBt
    this.abilityBreakBt.on("pointerup",()=>{
      this.abilityBreakCounter = 30;
      this.abilityBreakBtTimer = this.time.addEvent({ delay: 1000, repeat: 29, callback: this.abilityBreakUpdateTimer, args: [this]})
      this.abilityBreakBt.setTint(0x363636).removeInteractive();
      this.abilityBreakText.setVisible(true);

      // functionality overlap players
      this.otherPlayers.children.each(function(player) {
        if(this.checkOverlapPlayers(this.player.range, player, this)){
          this.socket.emit("breakTool player", player.socketId);
          return false;
        }
      }, this);
    })

    // draw ability buttom and text
    this.abilityStunText = this.add.bitmapText(623, 585, 'pixelFont', "", 30, 1).setDropShadow(3, 3, "#000", 1).setScrollFactor(0).setDepth(2);
    this.abilityStunBt = this.add.image(640, 600 , 'abilityStun').setScrollFactor(0).setScale(1.65).setInteractive().setDepth(1).setVisible(false);

    // add event click abilityStunBt
    this.abilityStunBt.on("pointerup",()=>{
      this.abilityStunCounter = 30;
      this.abilityStunBtTimer = this.time.addEvent({ delay: 1000, repeat: 29, callback: this.abilityStunUpdateTimer, args: [this]})
      this.abilityStunBt.setTint(0x363636).removeInteractive();
      this.abilityStunText.setVisible(true);

      //overlap players
      this.otherPlayers.children.each(function(player) {
        if(this.checkOverlapPlayers(this.player.range, player, this)){
          this.socket.emit("stun player", player.socketId);
          return false;
        }
      }, this);
    })

    // draw ability Transform buttom and text
    this.abilityTransformText = this.add.bitmapText(703, 585, 'pixelFont', "", 30, 1).setDropShadow(3, 3, "#000", 1).setScrollFactor(0).setDepth(2);
    this.abilityTransformBt = this.add.image(720, 600 , 'abilityTransform').setScrollFactor(0).setScale(1.65).setInteractive().setDepth(1).setVisible(false);

    // add event click ability Transform
    this.abilityTransformBt.on("pointerup",()=>{
      this.abilityTransformCounter = 30;
      this.abilityTransformBtTimer = this.time.addEvent({ delay: 1000, repeat: 29, callback: this.abilityTransformUpdateTimer, args: [this]})
      this.abilityTransformBt.setTint(0x363636).removeInteractive();
      this.abilityTransformText.setVisible(true);

    })
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
    this.cursors = this.input.keyboard.addKeys({ up: "W", left: "A", down: "S", right: "D" , interact: "E"});
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

    this.socket.on("disconnected", (roomInfo) => {
      scene.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (roomInfo.socketId === otherPlayer.socketId) {
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

    this.socket.on("vote panel", function (playerData) {
      scene.otherPlayers.getChildren().forEach(function (otherPlayer) {
        scene.scene.launch('VoteScene',this);

      });
    });

    this.socket.on("i am stunned", function () {
      console.log("aturdido");
      scene.player.stunned = true;
      scene.player.stunnedCounter = 9;
      scene.physics.world.disable(scene.player);
      scene.player.stunnedTimer = scene.time.addEvent({ delay: 1000, repeat: 9, callback: scene.player.stunnedUpdateTimer, args: [scene]})
    });

    this.socket.on("broken tool", function () {
      if (!scene.player.thief) {
        scene.player.tool = false;
      }
    });

    // when the goldTeamNormalGui is uptaded
    this.socket.on("All update goldTeamNormalGui", function (gold) {
      scene.goldTeamNormalGui.setText(gold);
    });
    
    // when the goldTeamImpostorGui is uptaded
    this.socket.on("All update goldTeamImpostorGui", function (gold) {
      scene.goldTeamImpostorGui.setText(gold);
    });

    this.socket.emit("ready");
  }

  update() {
    const scene = this;

    if (this.player) {
      this.playerLabel.x = this.player.x;
      this.playerLabel.y = this.player.y - 40;

      this.player.update();

      // check if player leave vote area
      this.player.checkVoteObjectOverlap(scene,this.player,scene.voteObject); 
  
      // check if player leave anvil
      this.player.checkAnvilObjectOverlap(scene,this.player,scene.anvilObject);

      // check if player leave minecart General
      this.player.checkminecartGeneralObjectOverlap(scene,this.player,scene.minecartGeneralObject); 

      // check if player leave minecart Impostor
      this.player.checkminecartImpostorObjectOverlap(scene,this.player,scene.minecartImpostorObject); 

      // check if player leave minecart Impostor
      this.player.checkButtonJailObjectOverlap(scene,this.player,scene.buttonJailObject); 

      //Update vision when player move
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
  }

  // add any additional players
  addOtherPlayers(id, playerData) {
    this.otherPlayer = new Player(this, id, playerData);
    this.otherPlayer.anims.play("right_idle", true);
    this.otherPlayer.setTint(0x7cc78f);
    this.otherPlayers.add(this.otherPlayer);
  }

  abilitieStun(){
    console.log("Tira habilidad");
  }

  checkOverlapPlayers(range, otherPlayer, scene) {
    let rectangleArea = new Phaser.Geom.Rectangle(range.x, range.y, range.width+45, range.height+45, 0x6666ff);
    let rectanglePlayer = new Phaser.Geom.Rectangle(otherPlayer.x, otherPlayer.y, otherPlayer.width+10, otherPlayer.height+20, 0x2222ff);
    return Phaser.Geom.Intersects.RectangleToRectangle(rectangleArea, rectanglePlayer);
  }
}
