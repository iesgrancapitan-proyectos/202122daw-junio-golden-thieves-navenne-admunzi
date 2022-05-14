export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, id, data) {
    super(scene, data.x, data.y, "player");
    scene.add.existing(this);

    scene.physics.world.enable(this);
    this.loginTime = data.loginTime;
    this.socketId = id;
    this.x = data.x;
    this.y = data.y;
    this.keydown = data.keydown;

    // Animations
    this.anims.create({
      key: "right",
      frames: [{ key: "player", frame: 0 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "idle",
      frames: [{ key: "player", frame: 1 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "left",
      frames: [{ key: "player", frame: 2 }],
      frameRate: 20,
    });
  }

}
