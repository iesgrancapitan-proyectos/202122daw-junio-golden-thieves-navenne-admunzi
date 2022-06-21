export default class Ore extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key, frame) {
      super(scene, x, y, key, frame);

      this.x = x;
      this.y = y;
      
      this.frames = this.anims.generateFrameNames("ore", {
        prefix: "ore_",
        suffix: ".png",
        start: 1,
        end: 7,
      });

      // enable physics
      scene.physics.world.enable(this);

      this.setScale(1.5);

      scene.add.existing(this);
  
      // Animations
  
      // Break animation
      this.anims.create({
        key: "break",
        frameRate: 8,
        frames: this.frames,
      });
    }
  }
  