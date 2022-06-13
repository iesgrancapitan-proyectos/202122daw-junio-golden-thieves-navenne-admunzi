import io from "socket.io-client";

export default class VoteScene extends Phaser.Scene {
    constructor() {
      super("VoteScene");
    }

    init(mainScene) {
        console.log(mainScene.socket);
    }

    preload() {
        this.load.image("votePanelBackground", "assets/votePanel.png");

    }

    create(){
        const voteScene = this;

        this.add.image(this.renderer.width / 2, this.renderer.height / 2, 'votePanelBackground').setOrigin(0.5,0.5).setDepth(0).setScale(3.5);
    }

    update(){

    }
}