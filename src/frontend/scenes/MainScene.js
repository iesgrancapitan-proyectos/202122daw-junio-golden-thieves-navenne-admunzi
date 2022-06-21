import Player from "../objects/Player";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  init(data) {
    this.socket = data.socket;
    this.map = data.map;
    this.ores = data.ores;
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
    this.load.image("abilitySteal", "assets/abilitySteal.png")
    this.load.image("voteButton", "assets/voteButton.png")
    this.load.image("brokenTool", "assets/brokenTool.png")
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
    if (scene.abilityStunCounter == 23) {
      scene.abilityStealBt.setVisible(false);
    }
  }

  abilityTransformUpdateTimer(scene){
    scene.abilityTransformText.setText(--scene.abilityTransformCounter);
    if (scene.abilityTransformCounter == 0) {
      scene.abilityTransformBt.setInteractive();
      scene.abilityTransformText.setVisible(false);
      scene.abilityTransformBt.clearTint();
    }
    if (scene.abilityTransformCounter == 20) {
      scene.socket.emit("transform player", {origin:scene.player, color: scene.player.color, name: scene.player.name})
      scene.player.setTint(scene.player.color)
      scene.player.label.setText(scene.player.name)
    }
  }

  voteButtomUpdateTimer(scene){
    --scene.voteButtomCounter
    if (scene.voteButtomCounter == 0) {
      scene.voteButtom.removeInteractive().setTint(0x363636);
    }
  }
  create() {
    const scene = this;

    this.playerLayer = this.add.layer();
    this.votingPanelEnabled = true;
    
    // Goals
    this.goldGoalNormal = 2000;
    this.goldGoalThieves = 2000;

    // gui gold
    this.add.image(230,130,"guiGold").setScrollFactor(0).setDepth(1);
    this.goldPlayerGui = this.add.bitmapText(170,81, 'pixelFont', "", 25, 1).setDropShadow(4, 4, "#000", 1).setScrollFactor(0).setDepth(2);
    this.goldTeamNormalGui = this.add.bitmapText(170,117, 'pixelFont', "", 25, 1).setDropShadow(4, 4, "#000", 1).setScrollFactor(0).setDepth(2);
    this.goldGoalTeamNormalGui = this.add.bitmapText(240,117, 'pixelFont', "/ " + this.goldGoalNormal, 25, 1).setDropShadow(4, 4, "#000", 1).setScrollFactor(0).setDepth(2);
    this.goldTeamImpostorGui = this.add.bitmapText(170,154, 'pixelFont', "", 25, 1).setDropShadow(4, 4, "#000", 1).setScrollFactor(0).setDepth(2);
    this.goldGoalThievesGui = this.add.bitmapText(240,154, 'pixelFont', "/ " +this.goldGoalThieves, 25, 1).setDropShadow(4, 4, "#000", 1).setScrollFactor(0).setDepth(2);

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
    this.areaJail = new Phaser.Geom.Rectangle(3165, 2050, 50, 50);

    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    //FOV
     const width = this.map.groundLayer.width
    const height = this.map.groundLayer.height

    // make a RenderTexture that is the size of the screen
    this.rtFOV = this.make.renderTexture({
      width,
      height
    }, true)

    // fill it with black
    this.rtFOV.fill(0x000000, 1)

    // draw the floorLayer into it
    this.rtFOV.draw(this.map.groundLayer)

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
      this.player.breakToolClosePlayer()
      
    })

    // draw ability buttom and text
    this.abilityStunText = this.add.bitmapText(623, 585, 'pixelFont', "", 30, 1).setDropShadow(3, 3, "#000", 1).setScrollFactor(0).setDepth(2).setAlpha(0.5);
    this.abilityStunBt = this.add.image(640, 600 , 'abilityStun').setScrollFactor(0).setScale(1.65).setInteractive().setDepth(1).setVisible(false);
    this.abilityStealBt = this.add.image(640, 600 , 'abilitySteal').setScrollFactor(0).setScale(1.65).setInteractive().setDepth(1).setVisible(false);

    // add event click abilityStunBt
    this.abilityStunBt.on("pointerup",()=>{
      this.abilityStunCounter = 30;
      this.abilityStunBtTimer = this.time.addEvent({ delay: 1000, repeat: 29, callback: this.abilityStunUpdateTimer, args: [this]})
      this.abilityStunBt.setTint(0x363636).setVisible(false);
      this.abilityStunText.setVisible(true);
      this.abilityStunBt.removeInteractive();
      this.abilityStealBt.setVisible(true);

      //overlap players
      this.player.stunClosePlayer()
      
    })

    this.abilityStealBt.on("pointerup",()=>{

      // overlap players

      this.player.stealClosePlayer(this.socket.id)
      
      this.abilityStunText.setAlpha(1)
      this.abilityStealBt.setVisible(false);
      this.abilityStunBt.setVisible(true);
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

      // player to change tint
      let player = this.otherPlayers.getChildren()[Phaser.Math.Between(0, this.otherPlayers.getChildren().length - 1)];
      this.socket.emit("transform player", {origin:this.player, color: player.color, name: player.name})
      this.player.setTint(player.color);
      this.player.label.setText(player.name);
    })

    this.brokenToolImage = this.add.image(720, 600, "brokenTool").setScrollFactor(0).setScale(1.65).setDepth(1).setVisible(false);

    this.voteButtom = this.add.image(800, 600 , 'voteButton').setScrollFactor(0).setScale(1.65).setDepth(1).setVisible(true).setTint(0x363636);
    
    // add event click vote buttom
    this.voteButtom.on("pointerup",()=>{
      this.socket.emit("vote panels");
      this.socket.emit("start timer");
      this.scene.pause('MainScene');
      this.scene.launch('VoteScene', { socket: this.socket, player: this.player, otherPlayers: this.otherPlayers});
    })
    
    this.otherPlayers = this.physics.add.group();

    this.cursors = this.input.keyboard.addKeys({ up: "W", left: "A", down: "S", right: "D" , interact: "E"});

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
          otherPlayer.label.x = playerData.x;
          otherPlayer.label.y = playerData.y - 38;

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

    this.socket.on("delete ore", function (delete_ore) {
      let ore_to_delete = scene.ores.getChildren().filter((ore) => ore.x == delete_ore.x && ore.y == delete_ore.y)
      ore_to_delete.forEach((ore)=>{
        ore.disableBody(true, true);
      })
    });

    this.socket.on("vote panel", function () {
      if (!scene.player.inJail) {
        scene.scene.pause('MainScene');
        scene.scene.launch('VoteScene', { socket: scene.socket, player: scene.player, otherPlayers: scene.otherPlayers});
      }
    });

    this.socket.on("i am stunned", function () {
      scene.player.stunned = true;
      scene.player.stunnedCounter = 9;
      scene.physics.world.disable(scene.player);
      scene.player.stunnedTimer = scene.time.addEvent({ delay: 1000, repeat: 9, callback: scene.player.stunnedUpdateTimer, args: [scene]})
    });

    this.socket.on("broken tool", function () {
      if (!scene.player.thief) {
        scene.player.tool = false;
        scene.brokenToolImage.setVisible(true);
      }
    });

    this.socket.on("i am out jail", function () {
      scene.player.x = 3050;
      scene.player.y = 2080;
      scene.player.inJail = false;
      scene.socket.emit("update players", { socketId: scene.player.socketId, inJail: scene.player.inJail });
    });
    
    this.socket.on("i am in jail", function () {
      scene.player.x = 3160;
      scene.player.y = 2040;
      scene.player.inJail = true;
      scene.socket.emit("update players", { socketId: scene.player.socketId, inJail: scene.player.inJail });
    });

    this.socket.on("update inJail", function (player) {
      scene.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (player.socketId === otherPlayer.socketId) {
          otherPlayer.inJail = player.inJail;
        }
      }); 
    });
    
    this.socket.on("stolen player", function (data) {
      data.gold = parseInt(scene.goldPlayerGui._text, 10)
      scene.goldPlayerGui.setText("0");
      scene.socket.emit('send money stolen', data);
    });
    
    this.socket.on("save stolen money", function (data) {
      let total = parseInt(scene.goldPlayerGui._text, 10) + data.gold;
      scene.goldPlayerGui.setText(total)
    });

    // when the goldTeamNormalGui is uptaded
    this.socket.on("All update goldTeamNormalGui", function (gold) {
      scene.goldTeamNormalGui.setText(gold);
    });
    
    // when the goldTeamImpostorGui is uptaded
    this.socket.on("All update goldTeamImpostorGui", function (gold) {
      scene.goldTeamImpostorGui.setText(gold);
    });

    this.socket.on("transformed player", function (aData) {
      scene.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (aData[0].socketId === otherPlayer.socketId) {
          otherPlayer.setTint(aData[1].color)
          otherPlayer.label.setText(aData[1].name)
        }
      });
    });

    this.socket.on("disable voting panel", function () {
      scene.votingPanelEnabled = false;
    });

    this.socket.on("enable voting panel", function () {
      scene.votingPanelEnabled = true;
    });

    this.socket.emit("ready");
  }

  update() {
    const scene = this;

    if (this.player) {

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
        this.player.miningCount = 0;
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
    if (!this.otherPlayers.getChildren().find((otherPlayer) => id == otherPlayer.socketId)) {
      this.otherPlayer = new Player(this, id, playerData);
      this.otherPlayer.label.x = playerData.x;
      this.otherPlayer.label.y = playerData.y - 38;
      this.otherPlayer.anims.play("right_idle", true);
      this.otherPlayers.add(this.otherPlayer);  
    }
  }

  checkOverlapJail(range, areaJail, scene) {
    let rectangleArea = new Phaser.Geom.Rectangle(range.x, range.y, range.width+45, range.height+45, 0x6666ff);
    return Phaser.Geom.Intersects.RectangleToRectangle(rectangleArea, areaJail);
  }
}
