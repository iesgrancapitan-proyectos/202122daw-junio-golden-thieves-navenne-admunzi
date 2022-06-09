import io from "socket.io-client";

export default class LobbyScene extends Phaser.Scene {
    constructor() {
      super("LobbyScene");
    }

    init(data) {
      console.log(data);
    }
    preload() {
      this.load.bitmapFont("pixelFont", "fonts/pixel.png", "fonts/pixel.xml");
    }

    create(){
      const LobbyScene = this;
      LobbyScene.add.bitmapText(LobbyScene.renderer.height / 2 - 100 , LobbyScene.renderer.height / 2 - 40, 'pixelFont', "Waiting players", 50, 1)
      .setDropShadow(5, 5, "#000", 1);


    }

    update(){

    }
}