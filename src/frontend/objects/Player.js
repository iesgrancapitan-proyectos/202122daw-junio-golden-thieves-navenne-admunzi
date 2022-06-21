export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, id, data) {
    super(scene, data.x, data.y, "player");
    scene.playerLayer.add(this);
 
    // enable physics
    scene.physics.world.enable(this);

    scene.cameras.main.zoom = 1.2;

    this.setScale(1.5);
    this.setBodySize(15,10).setOffset(5,15);

    // data
    this.loginTime = data.loginTime;
    this.socketId = id;
    this.x = data.x;
    this.y = data.y;
    this.keydown = data.keydown;
    this.name = data.name;
    this.color = data.color;
    this.stunned = false;
    this.tool = true;
    this.thief = data.thief;
    this.inJail = data.inJail;

    // colliders
    scene.physics.add.collider(this, scene.wallsLayer);
    scene.physics.add.collider(this, scene.fallLayer);
    scene.physics.add.collider(this, scene.ores);
    scene.physics.add.collider(this, scene.interactable_objectsLayer);

    this.onWorldBounds = true;
    // this.setCollideWorldBounds(true);
    this.miningCount = 0;

    // size
    this.setScale(1.4);

    // name
    this.label = this.scene.add.text(-50, -50, this.name).setOrigin(0.5, 1);

    scene.playerLayer.add(this.label);

    // color
    this.setTint(this.color);

    // mining
    this.on("animationcomplete-left_mine", () => {
      this.miningCount++
    });
    this.on("animationcomplete-right_mine", () => {
      this.miningCount++
    });

    //FOV
      scene.vision = scene.make.image({
      x: this.x,
      y: this.y,
      key: 'fov1',
      add: false
    })
    scene.vision.scale = 10
    scene.rtFOV.mask = new Phaser.Display.Masks.BitmapMask(scene, scene.vision)
    scene.rtFOV.mask.invertAlpha = true  

    scene.goldPlayerGui.setText("0");
    scene.goldTeamNormalGui.setText("0");
    scene.goldTeamImpostorGui.setText("0");

    scene.socket.on("check player stunned", function (origin) {
      if (scene.player.stunned) {
        scene.socket.emit("i am on the floor",origin)
      }
    });

    scene.socket.on("on the floor", function () {
      scene.voteButtom.clearTint().setInteractive();
      scene.voteButtomCounter = 3;
      if (scene.voteButtomTimer) {
        scene.voteButtomTimer.remove(false);
      }
      scene.voteButtomTimer = scene.time.addEvent({ delay: 1000, repeat: 3, callback: scene.voteButtomUpdateTimer, args: [scene]})  
    });

    // Animations

    // Right
    this.anims.create({

      key: "right",
      frameRate: 8,
      frames: this.anims.generateFrameNames("player", {
        prefix: "right_walk_",
        suffix: ".png",
        start: 1,
        end: 8,
      })
    });

    this.anims.create({
      key: "right_idle",
      frameRate: 3,
      frames: this.anims.generateFrameNames("player", {
        prefix: "right_idle_",
        suffix: ".png",
        start: 1,
        end: 8,
      }),
    });

    this.anims.create({
      key: "right_mine",
      frameRate: 8,
      frames: this.anims.generateFrameNames("player", {
        prefix: "right_mine_",
        suffix: ".png",
        start: 1,
        end: 8,
      }),
    });

    // Left
    this.anims.create({
      key: "left",
      frameRate: 8,
      frames: this.anims.generateFrameNames("player", {
        prefix: "left_walk_",
        suffix: ".png",
        start: 1,
        end: 8,
      })
    });

    this.anims.create({
      key: "left_idle",
      frameRate: 3,
      frames: this.anims.generateFrameNames("player", {
        prefix: "left_idle_",
        suffix: ".png",
        start: 1,
        end: 8,
      }),
    });

    this.anims.create({
      key: "left_mine",
      frameRate: 8,
      frames: this.anims.generateFrameNames("player", {
        prefix: "left_mine_",
        suffix: ".png",
        start: 1,
        end: 8,
      }),
    });
  }

  update() {
    this.label.x = this.x;
    this.label.y = this.y - 38;


    this.overlap = this.scene.physics.overlapRect(this.x - 25, this.y - 25, this.width + 50, this.height + 50);


    // if the player is thief
    if (this.thief) {
      this.scene.abilityBreakBt.setVisible(true);
      this.scene.abilityStunBt.setVisible(true);
      this.scene.abilityTransformBt.setVisible(true)
    }

    if (this.overlap.includes(this.scene.minecartGeneralObject.body)) {
      this.minecartGeneralObjectInside();
    }
    if (this.overlap.includes(this.scene.voteObject.body)) {
      this.voteObjectInside();
    }
    if (this.overlap.includes(this.scene.minecartImpostorObject.body)) {
      this.minecartImpostorObjectInside();
    }
    if (this.overlap.includes(this.scene.anvilObject.body)) {
      this.anvilObjectInside();
    }
    if (this.overlap.find(body => body.gameObject.texture.key === "ore" && body.enable)) {
      this.checkNearOre(null, this.overlap.find(body => body.gameObject.texture.key === "ore").gameObject);
    }
      
    //overlap players to check if there is stunned player
    const objective = this.checkOverlapPlayers()
    if (objective) {
      this.scene.socket.emit("player stunned", {origin: this.socketId, objective: objective.gameObject.socketId});    
    }

    //Camera Follow
    this.scene.cameras.main.startFollow(this, true, 0.05, 0.05);

    // const VELOCITY = 160; //ORIGINAL
    const VELOCITY = 300; //DEV

    // idle
    this.setVelocity(0);
    let leftOrRight = this.checkDirection();
    this.keydown = `${leftOrRight}_idle`;

    // horizontal movement
    if (this.scene.cursors.left.isDown) {
      this.setVelocityX(-VELOCITY);
      this.anims.play("left", true);
      this.keydown = "left";
    } else if (this.scene.cursors.right.isDown) {
      this.setVelocityX(VELOCITY);
      this.anims.play("right", true);
      this.keydown = "right";
    }

    // vertical movement
    if (this.scene.cursors.up.isDown) {
      this.setVelocityY(-VELOCITY);
      let leftOrRight = this.checkDirection();
      this.anims.play(leftOrRight, true);
      this.keydown = leftOrRight;
    } else if (this.scene.cursors.down.isDown) {
      this.setVelocityY(VELOCITY);
      let leftOrRight = this.checkDirection();
      this.anims.play(leftOrRight, true);
      this.keydown = leftOrRight;
    }

    // mining
    if (this.scene.input.activePointer.leftButtonDown() && this.stunned == false && this.tool) {
      let leftOrRight = this.checkDirection();
      this.anims.play(`${leftOrRight}_mine`, true);
    }

    if (this.scene.input.activePointer.leftButtonReleased()) {
      this.miningCount = 0;
    } 

    // idle animation
    if (this.body.velocity.x == 0 && this.body.velocity.y == 0 && !this.scene.input.activePointer.leftButtonDown()) {
      this.anims.play(`${leftOrRight}_idle`, true);
    }
  }

  checkOverlapPlayers(){
    return this.overlap.find(body => body.gameObject.texture.key === "player" && body.gameObject.socketId !== this.socketId);
  }

  stunClosePlayer(){
    const closePlayer = this.checkOverlapPlayers();
    if (closePlayer) this.scene.socket.emit("stun player", closePlayer.gameObject.socketId);
  }

  breakToolClosePlayer(){
    const closePlayer = this.checkOverlapPlayers();
    if (closePlayer) this.scene.socket.emit("breakTool player", closePlayer.gameObject.socketId);
  }

  stealClosePlayer(id){
    const closePlayer = this.checkOverlapPlayers();
    if (closePlayer) this.scene.socket.emit("steal player", {objective: closePlayer.gameObject.socketId, origin: id});
  }

  stunnedUpdateTimer(scene){
    //finish counter
    --scene.player.stunnedCounter;
    if (scene.player.stunnedCounter == 0) {
      scene.player.stunned = false;
      scene.physics.world.enable(scene.player);
    }
  }

  checkDirection() {
    return ["left", "left_idle", "up", "down"].includes(this.keydown) ? "left" : "right";
  }

  checkNearOre(range, ore) {
    if (this.miningCount > 2) {
      ore.disableBody(true, true);
      this.scene.socket.emit("disable ore", ore);
      
      this.miningCount = 0;
      
      this.scene.goldPlayerGui.setText(parseInt(this.scene.goldPlayerGui._text, 10) + Phaser.Math.Between(5, 40));
    }
  }

  voteObjectInside(){
    this.scene.voteObjectKeyEText.setVisible(true)

    if (Phaser.Input.Keyboard.JustDown(this.scene.keyE) && this.scene.votingPanelEnabled) {
      this.scene.socket.emit("vote panels");
      this.scene.socket.emit("start timer");
      this.scene.scene.pause('MainScene');
      this.scene.scene.launch('VoteScene', { socket: this.scene.socket, player: this, otherPlayers: this.scene.otherPlayers});
      this.scene.votingPanelEnabled = false;
      this.scene.socket.emit("voting panel disabled");
      setTimeout(() => {
        this.scene.votingPanelEnabled = true;
        this.scene.socket.emit("voting panel enabled");
      }, 25000);
    }
  }

  anvilObjectInside(){
    this.scene.anvilObjectKeyEText.setVisible(true)

    if (Phaser.Input.Keyboard.JustDown(this.scene.keyE)) {
      if (!this.tool) {
        let costTool = 20;
        let total = parseInt(this.scene.goldTeamNormalGui._text, 10) - costTool;
        if (parseInt(this.scene.goldTeamNormalGui._text, 10) >  costTool) {
          this.tool = true;
          this.scene.brokenToolImage.setVisible(false);
          this.scene.socket.emit("update goldTeamNormalGui", total);
          this.scene.goldTeamNormalGui.setText(total);
        }  
      }
    }
  }

  minecartGeneralObjectInside(){
    this.scene.minecartGeneralObjectKeyEText.setVisible(true)

    if (Phaser.Input.Keyboard.JustDown(this.scene.keyE)) {
      let gold = parseInt(this.scene.goldPlayerGui._text, 10) + parseInt(this.scene.goldTeamNormalGui._text, 10)
      this.scene.socket.emit("update goldTeamNormalGui",gold);
      this.scene.goldTeamNormalGui.setText(gold);
      this.scene.goldPlayerGui.setText("0");
    }
  }

  minecartImpostorObjectInside(){
    if (this.thief) {
      this.scene.minecartImpostorObjectKeyEText.setVisible(true)

      if (Phaser.Input.Keyboard.JustDown(this.scene.keyE)) {
        let gold = parseInt(this.scene.goldPlayerGui._text, 10) + parseInt(this.scene.goldTeamImpostorGui._text, 10)
        this.scene.socket.emit("update goldTeamImpostorGui",gold);
        this.scene.goldTeamImpostorGui.setText(gold);
        this.scene.goldPlayerGui.setText("0");
  
      }
    }
  }
  
  buttonJailObjectInside(){
    if (this.thief) {
      this.scene.buttonJailObjectKeyEText.setVisible(true)

      if (Phaser.Input.Keyboard.JustDown(this.scene.keyE)) {
        console.log("Interactuas buttonJail");

        // functionality overlap players with jail
        this.scene.otherPlayers.children.each(function(player) {
          if(this.scene.checkOverlapJail(player.range, this.scene.areaJail)){
            this.scene.socket.emit("leave jail", player.socketId);
            player.inJail = false;
            this.scene.socket.emit("update players", { socketId: player.socketId, inJail: player.inJail });
            player.x = 3050;
            player.y = 2080;
          }
        }, this);
      }
  
    }
  }

  checkVoteObjectOverlap(scene, player, voteObject) {
    if (!Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), voteObject.getBounds())) {
      scene.voteObjectKeyEText.setVisible(false)
    }
  }

  checkAnvilObjectOverlap(scene, player, anvilObject) {
    if (!Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), anvilObject.getBounds())) {
      scene.anvilObjectKeyEText.setVisible(false)
    }
  }

  checkminecartGeneralObjectOverlap(scene, player, minecartGeneralObject) {
    if (!Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), minecartGeneralObject.getBounds())) {
      scene.minecartGeneralObjectKeyEText.setVisible(false)
    }
  }

  checkminecartImpostorObjectOverlap(scene, player, minecartImpostorObject) {
    if (!Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), minecartImpostorObject.getBounds())) {
      scene.minecartImpostorObjectKeyEText.setVisible(false)
    }
  }
  
  checkButtonJailObjectOverlap(scene, player, buttonJailObject) {
    if (!Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), buttonJailObject.getBounds())) {
      scene.buttonJailObjectKeyEText.setVisible(false)
    }
  }

}
