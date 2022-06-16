export default class Map extends Phaser.Tilemaps.Tilemap {
  constructor(scene, mapData) {
    super(scene, mapData);
  }

  createLayers() {
    this.tileset = this.addTilesetImage('base-colour', 'tiles');
    this.tilesetUnderBridge = this.addTilesetImage('base-colour-under-bridge', 'tilesUnderBridge');
    this.groundLayer = this.createBlankLayer('ground', this.tileset)

    console.log(this.tileset);
    console.log(this);
    this.createLayer('outline-ground', this.tileset)
    this.createLayer('under-bridge', this.tilesetUnderBridge)
    this.createLayer('bridge', this.tileset)
    this.fallLayer = this.createLayer('fall', this.tileset).setCollisionByProperty({ collides: true});
    this.wallsLayer = this.createLayer('walls', this.tileset).setCollisionByProperty({ collides: true});
  }

  createOres() {
    this.ORES_AMOUNT = 600;
    this.oresList = Array.from({length: this.ORES_AMOUNT});

    this.oresList.forEach(value => {
      let x = -1;
      let y = -1;

      while (!this.groundLayer.getTileAtWorldXY(x, y)) {
        x = Phaser.Math.Between(0, 6000);
        y = Phaser.Math.Between(0, 4000);
      }

      let ore = this.scene.ores.create(x, y, "ore");
      ore.body.setImmovable();
      ore.body.setAllowGravity(false);
    });
  }
}