import { createText } from "../../utils/functions";
export default class RoomScene extends Phaser.Scene {
  constructor() {
    super("RoomScene");
  }

  init(data) {
    this.socket = data.socket;
    this.playerName = data.playerName;
  }

  preload() {
    this.load.image("background-room", "assets/RoomScene/background.png")
    this.load.bitmapFont("pixelFont", "fonts/pixel.png", "fonts/pixel.xml");
    this.load.html('roomform', 'assets/RoomScene/roomform.html');
    this.load.css('form_stylesheet', 'assets/form_stylesheet.css');
  }

  create() {
    const scene = this;

    const WIDTH = this.renderer.width;
    const HEIGHT = this.renderer.height;

    this.add.image(WIDTH / 2, HEIGHT / 2, 'background-room').setDepth(0).setScale(1.3);

    this.popUp = this.add.graphics();
    this.buttons = this.add.graphics();

    this.popUp.lineStyle(5, 0xffffff);
    this.buttons.lineStyle(3, 0xffffff);

    // popup window
    this.popUp.strokeRect(WIDTH / 2 - 200, 50, 400, HEIGHT - 100);
    this.popUp.fillStyle(0x5B3928, 0.5);
    this.popUp.fillRect(WIDTH / 2 - 200, 50, 400, HEIGHT - 100);

    // title
    this.title = createText(this, 0.5, 0.15, "Rooms", 50, true, 5);

    // get room key button
    this.getKeyButton = createText(this, 0.5, 0.4, "Get room key", 40, true, 3);

    // enter code button
    createText(this, 0.5, 0.55, "Enter room key", 20, true, 3);
    this.roomForm = this.add.dom(WIDTH / 2, HEIGHT * 0.62).createFromCache("roomform");
    this.roomForm.addListener("click");
    this.roomForm.on("click", function (event) {
      if (event.target.name === "enterRoom") {
        const input = scene.roomForm.getChildByName("roomForm");

        scene.socket.emit("isKeyValid", input.value);
      }
    });

    this.getKeyButton.setInteractive({ useHandCursor: true  });

    this.getKeyButton.on("pointerover", function() {
      this.setScale(1.1);
    });

    this.getKeyButton.on("pointerout", function() {
        this.setScale(1);
    });

    this.getKeyButton.on("pointerdown", () => {
      scene.socket.emit("getRoomCode");
    });

    scene.notValidText = createText(scene, 0.5, 0.7, '', 25, true, 3);
    scene.roomKeyText = createText(scene, 0.5, 0.45, '', 30, true, 3);

    this.socket.on("roomCreated", function (roomKey) {
      scene.roomKey = roomKey;
      scene.roomKeyText.setText(scene.roomKey);
      scene.roomForm.getChildByName("roomForm").value = scene.roomKey;
    });

    this.socket.on("keyNotValid", function () {
      scene.notValidText.setText("Invalid room key");
    });

    this.socket.on("keyIsValid", function (roomKey) {
      scene.socket.emit("joinRoom", { roomKey: roomKey, playerName: scene.playerName });
      scene.scene.stop("RoomScene");
    });
  }

  update() {}
}
