import Ore from "../objects/Ore"
import { createText } from "../../utils/functions";
import io from "socket.io-client";
export default class LobbyScene extends Phaser.Scene {
  constructor() {
    super("LobbyScene");
  }

  init(data) {
    this.playerName = data.name;
  }

  preload() {
    this.load.bitmapFont("pixelFont", "fonts/pixel.png", "fonts/pixel.xml");
    this.load.tilemapTiledJSON("mine", "tiled/terrain.json")
    this.load.image("tiles", "assets/base-colour.png")
    this.load.image("tilesUnderBridge", "assets/base-colour-under-bridge.png")
    this.load.image("tilesOreVegetables", "assets/ores-vegetables-colour.png")
    this.load.image("tilesMiscObjects", "assets/misc-objects.png")
    this.load.atlas("ore", "assets/ores.png", "assets/ores.json");
  }

  create() {
    const scene = this;

    this.nameList = [];

    // socket connection
    this.socket = io();

    // launch room menu
    this.scene.launch("RoomScene", { socket: scene.socket, playerName: scene.playerName });

    this.socket.on("setState", function (roomInfo) {
      createText(scene, 0.5, 0.1, "Lobby", 50, true, 5);
      createText(scene, 0.85, 0.105, `room: ${roomInfo.roomKey}`, 30, true, 5);
      scene.ores = scene.scene.get('MainScene').physics.add.group({
        classType: Ore,
      });
      scene.roomKey = roomInfo.roomKey;
      scene.players = roomInfo.players;
      scene.numPlayers = roomInfo.numPlayers;
    });

    this.socket.on("currentPlayers", function (data) {

      if (data.numPlayers == 1) {

        // create map
        scene.map = scene.createMap(false);

        // add start button to first player only
        scene.startButton = createText(scene, 0.5, 0.9, "Start", 40, true, 4);
        scene.startButton.setInteractive({ useHandCursor: true  });
        scene.startButton.on("pointerover", function() {
          this.setScale(1.1);
        });

        scene.startButton.on("pointerout", function(){
            this.setScale(1);
        });


        scene.startButton.on("pointerdown", function(){
          scene.socket.emit("choose thieves");
          scene.socket.emit("start game", { roomKey: scene.roomKey, oresList: scene.map.ores });
        });
      }
        scene.updateList(data);
    });

    this.socket.on("newPlayer", function (data) {
        scene.updateList(data);
    });

    this.socket.on("disconnected", function (data) {
        scene.updateList(data);
    });

    this.socket.on("start scene", function(oresList) {
      scene.map = scene.createMap(oresList)
      scene.scene.start("MainScene", {
        socket: scene.socket,
        roomKey: scene.roomKey,
        players: scene.players,
        map: scene.map,
        ores: scene.ores,
      });
    });
  }

  update() {}

  updateList(data) {
    let heightFactor = 0.25;
    this.nameList.forEach(function (name) {
        name.destroy();
    });
    for (const player in data.players) {
      let name = createText(this, 0.5, heightFactor, data.players[player].name, 30, true, 3);
      this.nameList.push(name);
      heightFactor += 0.05;
    }
  }

  createMap(oresList) {
    const map = this.scene.get('MainScene').make.tilemap({ key: 'mine'})
    const tileset = map.addTilesetImage('base-colour', 'tiles')
    const tilesetUnderBridge = map.addTilesetImage('base-colour-under-bridge', 'tilesUnderBridge')
    const tilesetMiscObjects = map.addTilesetImage('misc-objects', 'tilesMiscObjects')

    map.groundLayer = map.createLayer('ground', tileset)
    map.createLayer('outline-ground', tileset)
    map.createLayer('under-bridge', tilesetUnderBridge)
    map.createLayer('bridge', tileset)

    const ORES_AMOUNT = 600;
    if (!oresList) {
      map.oresList = Array.from({length: ORES_AMOUNT});
      map.ores = []; 

      // area dont spawn ores
      let areaMainSpawn = new Phaser.Geom.Rectangle(2820, 1920, 450, 300);
      
      map.oresList.forEach(value => {
        let x = -1;
        let y = -1;
  
        while (!map.groundLayer.getTileAtWorldXY(x, y) || areaMainSpawn.contains(x, y)) {
          x = Phaser.Math.Between(0, 6000);
          y = Phaser.Math.Between(0, 4000);
        }
  
        const frame = Phaser.Math.Between(1, 7);
        let ore = this.ores.create(x, y, "ore", `ore_${frame}.png`);
        ore.body.setImmovable();
        ore.body.setAllowGravity(false);
        map.ores.push({x, y, frame})
      }
      
      );
    } else {
      oresList.forEach((ore)=>{
        let ore2 = this.ores.create(ore.x, ore.y, "ore", `ore_${ore.frame}.png`)
        ore2.body.setImmovable()
        ore2.body.setAllowGravity(false)
      })
    }
  

    map.createLayer('fall', tileset).setCollisionByProperty({ collides: true});
    map.createLayer('walls', tileset).setCollisionByProperty({ collides: true});
    map.createLayer('interactable-objects', tilesetMiscObjects).setCollisionByProperty({ collides: true});

    return map;
  }
}
