export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, id, data) {
    super(scene, data.x, data.y, "player");
    scene.add.existing(this);

    // enable physics
    scene.physics.world.enable(this);

    scene.cameras.main.zoom = 1.5;

    this.setScale(1.5);
    this.setBodySize(15,10).setOffset(5,15);

    // data
    this.loginTime = data.loginTime;
    this.socketId = id;
    this.x = data.x;
    this.y = data.y;
    this.keydown = data.keydown;

    // colliders
    scene.physics.add.collider(this, scene.wallsLayer);
    scene.physics.add.collider(this, scene.fallLayer);
    scene.physics.add.collider(this, scene.ores);

    this.onWorldBounds = true;
    // this.setCollideWorldBounds(true);
    this.miningCount = 0;

    // range
    this.range = scene.add.sprite(this.x, this.y, "range");
    scene.physics.world.enable(this.range);
    scene.physics.add.overlap(this.range, scene.ores, this.checkNear, () => {}, this);
    this.range.setAlpha(0);
    this.range.body.setSize(this.width + 50, this.height + 50, -5, 0);

    // size
    this.setScale(2);

    // mining
    this.on("animationcomplete-left_mine", () => {
      console.log(this.miningCount++);
    });
    this.on("animationcomplete-right_mine", () => {
      console.log(this.miningCount++);
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
    this.range.x = this.x;
    this.range.y = this.y;

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
    if (this.scene.input.activePointer.leftButtonDown()) {
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

  checkDirection() {
    return ["left", "left_idle", "up", "down"].includes(this.keydown) ? "left" : "right";
  }

  checkNear(range, ore) {
    if (this.miningCount > 2) {
      ore.disableBody(true, true);
    }
  }
}
