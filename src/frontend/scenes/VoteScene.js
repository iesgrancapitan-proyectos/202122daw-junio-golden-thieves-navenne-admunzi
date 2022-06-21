import { createText } from "../../utils/functions";
export default class VoteScene extends Phaser.Scene {
  constructor() {
    super("VoteScene");
  }

  init(data) {
    this.socket = data.socket;
    this.player = data.player;
    this.otherPlayers = data.otherPlayers;
    this.allPlayers = [this.player, ...this.otherPlayers.getChildren()];
  }

  preload() {
    this.load.image("votePanelBackground", "assets/votePanel.png");
    this.load.image("votedIcon", "assets/VoteScene/voted.png");
  }

  create() {
    const scene = this;

    this.votes = [];
    this.timerCounterText = createText(scene, 0.7, 0.29, "", 30, true, 3);

    const WIDTH = this.renderer.width;
    const HEIGHT = this.renderer.height;

    this.primaryText = createText(scene, 0.5, 0.2, "Vote to jail", 50, true, 5);
    this.resultText = createText(scene, 0.5, 0.1, "", 40, true, 5);

    this.add
      .image(WIDTH / 2, HEIGHT / 2, "votePanelBackground")
      .setOrigin(0.5, 0.5)
      .setDepth(0)
      .setScale(3);

    this.playersNotInJail = this.otherPlayers.getChildren().filter((player) => !player.inJail );
    let playerIndex = 0;
    let playerImages = [];

    this.socket.on("timer", function (timer) {
      if (scene.player.scene.scene.isActive("VoteScene")) {
        scene.updateTimer(timer);
      }
    });

    let timer = 10;

    const interval = setInterval(() => {
      timer--;
      if (timer > -1 && scene.player.scene.scene.isActive("VoteScene")) {
        this.updateTimer(timer);
      }
      if (timer == 0) clearInterval(interval);
    }, 1000);

    this.socket.on("count votes", function (socketId) {
      const vote = scene.votes.find((vote) => vote.socketId === socketId)
      if (vote) {
        vote.votes++;
      } else {
        scene.votes.push({ socketId: socketId, votes: 1 });
      }
    });

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        if (playerIndex == this.playersNotInJail.length) break;

        let widthFactor = (col + 1) / 12.8 + 0.308;
        let heightFactor = (row + 1) / 7.2 + 0.233;

        const player = scene.add
          .image(WIDTH * widthFactor, HEIGHT * heightFactor, "player", "right_idle_1.png")
          .setOrigin(0.5, 0.5)
          .setScale(2)
          .setTint(scene.playersNotInJail[playerIndex].color);

        player.socketId = this.playersNotInJail[playerIndex].socketId;
        playerImages.push(player);

        player.setInteractive({
          useHandCursor: true,
        });

        player.addListener("pointerdown", function () {
          scene.sendVote(player, playerImages);
        });

        createText(scene, widthFactor - 0.0048, heightFactor - 0.055, scene.playersNotInJail[playerIndex].name, 20, true, 2);

        ++playerIndex;
      }
    }
  }

  sendVote(player, playerImages) {
    const scene = this;
    playerImages.forEach((image) => {
      image.removeListener("pointerdown");
      image.input.enabled = false;
      image.input.enable = false;
    });
    this.socket.emit("vote", player.socketId);
    const vote = scene.votes.find((vote) => vote.socketId === player.socketId)
    if (vote) {
      vote.votes++;
    } else {
      scene.votes.push({ socketId: player.socketId, votes: 1 });
    }
    player.setAlpha(0.5);
    this.add.image(player.x, player.y, "votedIcon").setOrigin(0.5, 0.5);
  }

  updateTimer(timer) { 
    this.timerCounterText.setText(timer)
    if (timer == 0) {
      this.votingResults();
      setTimeout(() => {
        this.scene.stop("VoteScene");
        this.scene.resume("MainScene");
      }, 3000);
    }
  }

  votingResults() {
    //get max votes

    let maxVotes = 0;
    let selected = [];

    this.votes.forEach((vote) => {
      if (vote.votes == maxVotes) {
        selected.push(vote)
      } else if (vote.votes > maxVotes) {
        maxVotes = vote.votes;
        selected = []
        selected.push(vote)
      }
    });

    if (selected.length == 1) {
      const socketId = selected[0].socketId;

      const playerToJail = this.allPlayers.find((player) => player.socketId == socketId);

      this.resultText.setText(`${playerToJail.name} goes to jail`);
      
      const playerInJail = this.allPlayers.find((player)=> player.inJail == true )
      if (playerInJail) this.socket.emit("leave jail", playerInJail.socketId); 
      this.socket.emit("enter jail", socketId);
    
    } else {
      this.resultText.setText("No one goes to jail");
    }
  }
}
