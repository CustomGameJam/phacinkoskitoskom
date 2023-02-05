import Phaser from 'phaser';
import Gamepad = Phaser.Input.Gamepad.Gamepad;

export default class Demo extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private platforms!: Phaser.Physics.Arcade.Group;
  private restrictedArea!: Phaser.Physics.Arcade.StaticGroup;
  private player!: Phaser.Physics.Arcade.Sprite;
  private gameOver!: boolean;
  private topScore: number = 0;
  private score!: number;
  private speed: number = 200;
  private triggerTimer: Phaser.Time.TimerEvent | undefined;
  private scoreText!: Phaser.GameObjects.Text;
  private topScoreText!: Phaser.GameObjects.Text;
  private pad!: Phaser.Input.Gamepad.Gamepad;
  private lastPauseToggled: number = 0;


  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('sky', 'public/assets/space3.png')
    this.load.image('green', 'public/assets/green.png')
    this.load.image('red', 'public/assets/red.png')
    this.load.image('bubble', 'public/assets/greenbubble.png')
    this.load.image('ground', 'public/assets/ground.png');
    this.load.image('restirictedArea', 'public/assets/restrictedArea.png');
  }

  create() {
    this.input.gamepad.enabled = true;
    this.input.gamepad.once('connected', (pad: Gamepad) => {
      this.pad = pad;
      this.physics.resume();
      this.time.paused = false;
    });
    console.log('FirstGameScene.create');
    this.triggerTimer = this.time.addEvent({
      callback: this.timerEvent,
      callbackScope: this,
      delay: 1000,
      loop: true
    });

    this.gameOver = false;
    this.score = 0;

    this.topScoreText = this.add.text(16, 6, 'Top: ' + this.topScore.toString());
    this.topScoreText.style.fontSize = '28px';
    this.topScoreText.setDepth(1);

    this.scoreText = this.add.text(16, 26, 'Score: 0');
    this.scoreText.style.fontSize = '32px';
    this.scoreText.style.setFill('rgb(17,255,83)');
    this.scoreText.setDepth(1);


    this.cursors = this.input.keyboard.createCursorKeys();
    this.add.image(400, 610, 'sky')

    const particlesRed = this.add.particles('red')
    const emitterRed = particlesRed.createEmitter({
      speed: 10,
      scale: {start: 0.5, end: 0},
      blendMode: 'ADD',
    })


    this.player = this.physics.add.sprite(400, 450, 'bubble')
    this.player.setCollideWorldBounds(true);
    this.player.setScale(0.5, 0.5)
    this.player.setBounce(.75)

    emitterRed.startFollow(this.player)
    this.platforms = this.physics.add.group();
    this.platforms.setVelocityY(0);

    this.restrictedArea = this.physics.add.staticGroup();
    this.restrictedArea.create(400, 800, 'restirictedArea').refreshBody();

    this.physics.add.collider(this.player, this.platforms, this.endGame, undefined, this);
    this.physics.add.collider(this.player, this.restrictedArea, this.endGame, undefined, this);
    this.physics.add.overlap(this.platforms, this.restrictedArea, this.collectPoint, undefined, this);

  }

  update(_t: number) {
    if (!this.pad) {
      this.physics.pause()
      this.time.paused = true;
    }

    const gravitySpeed = 0.4;

    if (this.pad && this.pad.leftStick) {
      if (Math.abs(this.pad.leftStick.x) > gravitySpeed) {
        this.player.setVelocityX(this.speed * this.pad.leftStick.x);
      }
      if (Math.abs(this.pad.leftStick.y) > gravitySpeed) {
        this.player.setVelocityY(this.speed * this.pad.leftStick.y);
      }
    }

    if (this.pad && this.time.paused && this.pad.A) {
      this.restartGame();
    }

    if (!this.gameOver && this.pad && this.pad.B && this.lastPauseToggled + 500 < _t) {
      if (!this.time.paused) {
        this.time.paused = true;
        this.physics.pause();
      } else {
        this.time.paused = false;
        this.physics.resume();
      }
      this.lastPauseToggled = _t;
    }
  }


  collectPoint() {
    this.score += 5;
    this.scoreText.setText('Score: ' + this.score);

    this.physics.world.gravity.y = 200 + (this.score / 10)
    if (this.score > this.topScore) {
      this.topScore = this.score;
      this.topScoreText.setText('Top: ' + this.topScore.toString());
    }
  }

  public timerEvent(): void {
    let random = Math.random() < 0.5;
    if (random) {
      this.platforms.create(Phaser.Math.Between(-200, 200), 0, 'ground').setMass(5);
    } else {
      this.platforms.create(Phaser.Math.Between(600, 1000), 0, 'ground').setMass(5);
    }

  }

  endGame(playerGO: Phaser.GameObjects.GameObject) {
    const player = playerGO as Phaser.Physics.Arcade.Sprite;
    this.physics.pause();
    this.time.paused = true;
    player.setTint(0xff0000);
    player.anims.play('turn');
    this.gameOver = true;
    this.scoreText.x = 250;
    this.scoreText.y = 350;
    this.scoreText.setFontSize(60);
    this.triggerTimer?.remove();
  }

  restartGame() {
    this.time.paused = false;
    this.registry.destroy();
    this.scene.restart();
  }
}
