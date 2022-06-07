export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, id, data) {
    super(scene, data.x, data.y, "player");
    scene.add.existing(this);

    // Enable Physics
    scene.physics.world.enable(this);

    scene.cameras.main.zoom = 1.5;

    this.setScale(1.5);
    this.setBodySize(15,10).setOffset(5,15);

    this.loginTime = data.loginTime;
    this.socketId = id;
    this.x = data.x;
    this.y = data.y;
    this.keydown = data.keydown;

    //Collides
    scene.physics.add.collider(this, scene.wallsLayer);
    scene.physics.add.collider(this, scene.fallLayer);
    scene.physics.add.collider(this, scene.ores);

    this.onWorldBounds = true;
    // this.setCollideWorldBounds(true);

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
      repeat: -1,
      frames: this.anims.generateFrameNames("player", {
        prefix: "right_idle_",
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
      repeat: -1,
      frames: this.anims.generateFrameNames("player", {
        prefix: "left_idle_",
        suffix: ".png",
        start: 1,
        end: 8,
      })
    });
  }
}
