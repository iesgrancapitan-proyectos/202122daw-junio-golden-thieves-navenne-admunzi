import createText from "../functions";
export default class MenuScene extends Phaser.Scene {
    constructor() {
      super("MenuScene");
    }

    init(data) {}
    preload() {
        this.load.image("background", "assets/MenuScene/background.png")
        this.load.html('nameform', 'assets/MenuScene/nameform.html');
        this.load.bitmapFont("pixelFont", "fonts/pixel.png", "fonts/pixel.xml");
        this.load.atlas("player", "assets/player.png", "assets/player.json");
    }

    create() {
        const MenuScene = this;
        const WIDTH = this.renderer.width;
        const HEIGHT = this.renderer.height;
        const FONT_SIZE_LARGE = 100;
        const FONT_SIZE_MED = 50;
        const FONT_SIZE_SMALL = 25;

        this.add.image(WIDTH / 2, HEIGHT / 2, 'background').setDepth(0);

        createText(this, 0.2, "Golden\nThieves", FONT_SIZE_LARGE, true, 10)

        const playButton = createText(this, 0.7, "Play", FONT_SIZE_MED, true, 5).setAlpha(0.7);
        const howToPlayButton = createText(this, 0.8, "How To Play", FONT_SIZE_MED, true, 5)
    
        playButton.setInteractive({ useHandCursor: true  });
        howToPlayButton.setInteractive({ useHandCursor: true  });

        howToPlayButton.on("pointerover", function() {
            this.setScale(1.1);
        });

        howToPlayButton.on("pointerout", function(){
            this.setScale(1);
        });

        howToPlayButton.on("pointerup", function() {
            console.log("How to play"); // to do 
        })

        const text = createText(this, 0.42, 'Please enter your name', FONT_SIZE_SMALL, false);

        const nameForm = this.add.dom(WIDTH / 2, HEIGHT * 0.5).createFromCache('nameform');
        nameForm.addListener('click');

        nameForm.on('click', function (event) {
    
            if (event.target.name === 'sendButton'){
                var inputText = this.getChildByName('nameField');

                //  Have they entered anything?
                if (inputText.value !== ''){
                    //  Turn off the click events
                    this.removeListener('click');

                    //  Hide the login element and prompt
                    this.setVisible(false);
                    text.setVisible(false);

                    // replacement text
                    let miner = MenuScene.add.sprite(WIDTH / 2, HEIGHT / 2 + 40, "player").setScale(2);
                    miner.anims.create({
                        key: "left_mine",
                        frameRate: 8,
                        repeat: -1,
                        frames: miner.anims.generateFrameNames("player", {
                          prefix: "left_mine_",
                          suffix: ".png",
                          start: 1,
                          end: 8,
                        }),
                      });
                      miner.anims.play("left_mine");
                      createText(MenuScene, 0.42, `Hey ${inputText.value}\n let's get some gold...`, FONT_SIZE_SMALL, false);

                    //  playButton flash and add event
                    this.scene.tweens.add({
                        targets: playButton,
                        alpha: 0.2,
                        duration: 350,
                        ease: 'Power3',
                        yoyo: true
                    });
                    playButton.setAlpha(1);

                    playButton.on("pointerover", function() {
                        this.setScale(1.1);
                    });

                    playButton.on("pointerout", function() {
                        this.setScale(1);
                    });

                    playButton.on("pointerup", function() {
                        MenuScene.scene.start("LobbyScene", { name: inputText.value });
                    });

                } else {
                    //  Flash the prompt
                    this.scene.tweens.add({
                        targets: text,
                        alpha: 0.2,
                        duration: 250,
                        ease: 'Power3',
                        yoyo: true
                    });                
                }
            }
        });
    }
  
    update() {

    }
}
  