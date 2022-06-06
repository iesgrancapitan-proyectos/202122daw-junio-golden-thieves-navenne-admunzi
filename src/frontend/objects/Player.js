export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, id, data) {
    super(scene, data.x, data.y, "player");
    scene.add.existing(this);

    // Enable Physics
    scene.physics.world.enable(this);

    this.setScale(2);

    this.loginTime = data.loginTime;
    this.socketId = id;
    this.x = data.x;
    this.y = data.y;
    this.keydown = data.keydown;


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
      })
    });

    this.anims.create({
      key: "right_mine",
      frameRate: 8,
      frames: this.anims.generateFrameNames("player", {
        prefix: "right_mine_",
        suffix: ".png",
        start: 1,
        end: 8,
      })
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
      })
    });

    this.anims.create({
      key: "left_mine",
      frameRate: 8,
      frames: this.anims.generateFrameNames("player", {
        prefix: "left_mine_",
        suffix: ".png",
        start: 1,
        end: 8,
      })
    });
  }

  playAnimation() {

    const VELOCITY = 160;

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

    // idle animation
    if (this.body.velocity.x == 0 && this.body.velocity.y == 0 && !this.scene.input.activePointer.leftButtonDown()) {
      this.anims.play(`${leftOrRight}_idle`, true);
    }
  }

  checkDirection() {
    return ["left", "left_idle", "up", "down"].includes(this.keydown) ? "left" : "right";
  } 
}
