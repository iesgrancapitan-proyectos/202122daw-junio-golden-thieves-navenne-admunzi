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

        const players = this.otherPlayers.getChildren();
        let playerIndex = 0;
        let playerImages = [];
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 4; col++) {
                if (playerIndex == players.length) break
                let widthFactor = (((col + 1) / 12.8) + 0.308);
                let heightFactor = (((row + 1) / 7.2) + 0.233);
                const player = scene.add.image(WIDTH * widthFactor, HEIGHT * heightFactor, 'player', 'right_idle_1.png').setOrigin(0.5, 0.5).setScale(2).setTint(players[playerIndex].color);
                playerImages.push(player);
                player.setInteractive({ useHandCursor: true  });
                player.once('pointerdown', sendVote, this);
                function sendVote() {
                    scene.socket.emit('vote', players[playerIndex-1].socketId);
                    player.setAlpha(0.5);
                    scene.add.image(player.x, player.y, 'votedIcon').setOrigin(0.5, 0.5);
                    playerImages.forEach(image => {
                        image.input.enable = false;
                        image.input.enabled = false;
                    });
                }
                createText(scene, widthFactor - 0.0048, heightFactor - 0.055, players[playerIndex].name, 20, true, 2);
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

    updateTimer(scene) {
        scene.timerCounterText.setText(--scene.timerCounter);
        if (scene.timerCounter == 0) {
            scene.scene.stop("VoteScene");
            scene.scene.resume("MainScene");
        }
    }
}