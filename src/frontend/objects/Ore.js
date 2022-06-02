export default class Ore extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, data) {
      super(scene, data.x, data.y, "ore");
      scene.add.existing(this);
  
      this.setScale(2);

      this.x = data.x;
      this.y = data.y;
  
  
      // Animations
  
      // Break animation
      this.anims.create({
        key: "break",
        frameRate: 8,
        frames: this.anims.generateFrameNames("ore", {
          prefix: "gold_",
          suffix: ".png",
          start: 1,
          end: 7,
        })
      });
    }
  }
  