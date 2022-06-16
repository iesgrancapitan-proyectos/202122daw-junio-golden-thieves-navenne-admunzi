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
    this.stunned = false;
    this.tool = true;
    this.thief = data.thief;

    // colliders
    // scene.physics.add.collider(this, scene.wallsLayer);
    scene.physics.add.collider(this, scene.fallLayer);
    scene.physics.add.collider(this, scene.ores);
    scene.physics.add.collider(this, scene.interactable_objectsLayer);

    this.onWorldBounds = true;
    // this.setCollideWorldBounds(true);
    this.miningCount = 0;

    // range
    this.range = scene.add.sprite(this.x, this.y, "range");
    scene.physics.world.enable(this.range);
    this.range.setAlpha(0);
    this.range.body.setSize(this.width + 50, this.height + 50, -5, 0);

    //overlap ores
    scene.physics.add.overlap(this.range, scene.ores, this.checkNearOre, () => {}, this);
    
    //  overlap vote
    scene.physics.add.overlap(this.range, scene.voteObject, this.voteObjectInside, null, scene)    
    
    //  overlap anvil
    scene.physics.add.overlap(this.range, scene.anvilObject, this.anvilObjectInside, null, scene)    

    //  overlap minecartGeneral
    scene.physics.add.overlap(this.range, scene.minecartGeneralObject, this.minecartGeneralObjectInside, null, scene)    

    //  overlap minecartImpostor
    scene.physics.add.overlap(this.range, scene.minecartImpostorObject, this.minecartImpostorObjectInside, null, scene)    

    //  overlap buttom jail
    scene.physics.add.overlap(this.range, scene.buttonJailObject, this.buttonJailObjectInside, null, scene)    

    // size
    this.setScale(1.4);

    // player tool 
    this.tool = true;

    // player gold
    this.gold = 0;

    // mining
    this.on("animationcomplete-left_mine", () => {
      console.log(this.miningCount++);
    });
    this.on("animationcomplete-right_mine", () => {
      console.log(this.miningCount++);
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
    this.range.x = this.x;
    this.range.y = this.y;

    // if the player is thief
    if (this.thief) {
      this.scene.abilityBreakBt.setVisible(true);
      this.scene.abilityStunBt.setVisible(true);
      this.scene.abilityTransformBt.setVisible(true)
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

  stunnedUpdateTimer(scene){
    //finish counter
    --scene.player.stunnedCounter;
    if (scene.player.stunnedCounter == 0) {
      console.log("tiempo terminado");
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
      this.miningCount = 0;

      this.gold =+ 20;
    }
  }

  voteObjectInside(){
    this.voteObjectKeyEText.setVisible(true)

    if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
      this.socket.emit("vote panels");
      this.scene.launch('VoteScene',this);
    }
  }

  anvilObjectInside(){
    this.anvilObjectKeyEText.setVisible(true)

    if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
      console.log("Interactuas");
    }
  }

  minecartGeneralObjectInside(){
    this.minecartGeneralObjectKeyEText.setVisible(true)

    if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
      console.log("Interactuas");
    }
  }

  minecartImpostorObjectInside(){
    this.minecartImpostorObjectKeyEText.setVisible(true)

    if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
      console.log("Interactuas");
    }
  }
  
  minecartImpostorObjectInside(){
    this.minecartImpostorObjectKeyEText.setVisible(true)

    if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
      console.log("Interactuas");
    }
  }

  buttonJailObjectInside(){
    this.buttonJailObjectKeyEText.setVisible(true)

    if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
      console.log("Interactuas");
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
