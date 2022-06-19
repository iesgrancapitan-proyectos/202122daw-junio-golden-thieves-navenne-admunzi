import {
    createText
} from "../../utils/functions";
export default class VoteScene extends Phaser.Scene {
    constructor() {
        super("VoteScene");
    }

    init(data) {
        this.socket = data.socket;
        this.player = data.player;
        this.otherPlayers = data.otherPlayers;
    }

    preload() {
        this.load.image("votePanelBackground", "assets/votePanel.png");
        this.load.image("votedIcon", "assets/VoteScene/voted.png")
    }

    create() {
        const scene = this;

        this.timerCounter = 30;

        this.timerCounterText = createText(scene, 0.7, 0.29, this.timerCounter, 30, true, 3);

        const WIDTH = this.renderer.width;
        const HEIGHT = this.renderer.height;

        createText(scene, 0.5, 0.2, "Vote to jail", 50, true, 5);
        this.add.image(WIDTH / 2, HEIGHT / 2, 'votePanelBackground').setOrigin(0.5, 0.5).setDepth(0).setScale(3);

        this.players = this.otherPlayers.getChildren();
        let playerIndex = 0;
        let playerImages = [];
        console.log(this.players);
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 4; col++) {
                if (playerIndex == this.players.length) break
                let widthFactor = (((col + 1) / 12.8) + 0.308);
                let heightFactor = (((row + 1) / 7.2) + 0.233);
                const player = scene.add.image(WIDTH * widthFactor, HEIGHT * heightFactor, 'player', 'right_idle_1.png').setOrigin(0.5, 0.5).setScale(2).setTint(scene.players[playerIndex].color);
                player.socketId = this.players[playerIndex].socketId;
                playerImages.push(player);
                player.setInteractive({ useHandCursor: true  });
                player.addListener('pointerdown', function () {
                    scene.sendVote(player, playerImages);
                });
                
                createText(scene, widthFactor - 0.0048, heightFactor - 0.055, scene.players[playerIndex].name, 20, true, 2);
                ++playerIndex;
            }
        }
        this.time.addEvent({
            delay: 1000,
            repeat: 29,
            callback: this.updateTimer,
            args: [this]
        })


    }

    update() {

    }

    sendVote(player, playerImages) {
        
        playerImages.forEach(image => {
            image.removeListener('pointerdown');
            image.input.enabled = false;
        });
        this.socket.emit('vote', player.socketId);
        player.setAlpha(0.5);
        this.add.image(player.x, player.y, 'votedIcon').setOrigin(0.5, 0.5);
    }

    updateTimer(scene) {
        scene.timerCounterText.setText(--scene.timerCounter);
        if (scene.timerCounter == 0) {
            scene.scene.stop("VoteScene");
            scene.scene.resume("MainScene");
        }
    }
}