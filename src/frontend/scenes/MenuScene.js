export default class MenuScene extends Phaser.Scene {
    constructor() {
      super("MenuScene");
    }

    init(data) {}
    preload() {
        this.load.image("background", "assets/MenuScene/Background.png")
        this.load.html('nameform', 'assets/MenuScene/text/nameform.html');
        this.load.bitmapFont("pixelFont", "fonts/pixel.png", "fonts/pixel.xml");
    }

    create() {
        const MenuScene = this;
        MenuScene.add.image(0, -80, 'background').setOrigin(0).setDepth(0);

        MenuScene.add.bitmapText(MenuScene.renderer.height / 2 - 90, MenuScene.renderer.height * 0.10, 'pixelFont', "Golden\nThieves", 100, 1)
        .setDropShadow(10, 10, "#000", 1);

        let playButtom = MenuScene.add.bitmapText(MenuScene.renderer.height / 2 + 65, MenuScene.renderer.height / 2 + 40, 'pixelFont', "Play", 50, 1)
        .setDropShadow(5, 5, "#000", 1).setAlpha(0.5);

        let howToPlayButtom = MenuScene.add.bitmapText(MenuScene.renderer.height / 2 + 40, MenuScene.renderer.height / 2 + 120, 'pixelFont', "How To\nPlay", 50, 1)
        .setDropShadow(5, 5, "#000", 1);
    
        playButtom.setInteractive();

        howToPlayButtom.setInteractive();
        howToPlayButtom.on("pointerup",()=>{
            console.log("How to play");
        })

        var text = this.add.text(MenuScene.renderer.height / 2 + 100, MenuScene.renderer.height -75, 'Please enter your name', { color: 'white', fontSize: '20px '});

        var element = MenuScene.add.dom(MenuScene.renderer.height, MenuScene.renderer.height -30).createFromCache('nameform');
        element.addListener('click');

        element.on('click', function (event) {
    
            if (event.target.name === 'playButton'){
                var inputText = this.getChildByName('nameField');

                //  Have they entered anything?
                if (inputText.value !== ''){
                    //  Turn off the click events
                    this.removeListener('click');

                    //  Hide the login element and prompt
                    this.setVisible(false);
                    text.setVisible(false);

                    //  PlayButtom remove alpha and add event
                    playButtom.setAlpha(1)
                    playButtom.on("pointerup",()=>{
                        MenuScene.scene.start("LobbyScene", inputText.value);
                    })
                }else{
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
  