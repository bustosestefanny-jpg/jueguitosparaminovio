export default class GameScene4 extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene4' });
  }

  preload() {
    this.load.image('bg4', 'assets/backgrounds/scene4.jpg');
    this.load.image('boy', 'assets/characters/boy.png');
    this.load.image('flower', 'assets/items/flower.png');
    this.load.image('copa', 'assets/items/copa.png');
  }

  create() {
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    const { width, height } = this.scale;

    this.flowersPlanted = 0;
    this.maxFlowers = 5;
    this.isMoving = false;
    this.finalTriggered = false;
    this.targetX = 0;
    this.targetY = 0;

    this.add.image(width / 2, height / 2, 'bg4').setDisplaySize(width, height);

    this.player = this.physics.add.sprite(width / 2, height - 80, 'boy');
    this.player.setScale(0.12).setCollideWorldBounds(true);
    this.player.setBounce(0);

    // ESCUCHAR COLISIÓN CON EL MUNDO
    // Esto detecta si el personaje choca contra los bordes
    this.player.body.onWorldBounds = true;
    this.physics.world.on('worldbounds', () => {
      if (this.isMoving) {
        this.stopAndPlant();
      }
    });

    this.instructionText = this.add.text(width / 2, 40, 'Toca el suelo para plantar nuestro amor (0/5)', {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '12px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.flowerGroup = this.add.group();

    this.input.on('pointerdown', (pointer) => {
      if (this.flowersPlanted < this.maxFlowers && !this.isMoving && !this.finalTriggered) {
        this.targetX = pointer.x;
        this.targetY = pointer.y;
        this.isMoving = true;
        this.physics.moveTo(this.player, this.targetX, this.targetY, 250);
      }
    });
  }

  update() {
    if (this.isMoving) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.targetX, this.targetY);

      // Si llega al destino normal
      if (distance < 15) {
        this.stopAndPlant();
      }
    }
  }

  // Nueva función para centralizar la parada y la siembra
  stopAndPlant() {
    this.player.body.stop();
    this.isMoving = false;
    
    // Plantamos la flor en la posición ACTUAL del jugador por si chocó con un borde
    this.addFlower(this.player.x, this.player.y);
  }

  addFlower(x, y) {
    const flower = this.add.image(x, y, 'flower').setScale(0);
    this.flowerGroup.add(flower);

    this.tweens.add({
      targets: flower,
      scale: 0.05,
      duration: 600,
      ease: 'Back.easeOut'
    });

    this.flowersPlanted++;
    this.instructionText.setText(`Flores plantadas: ${this.flowersPlanted}/5`);

    if (this.flowersPlanted === this.maxFlowers) {
      this.time.delayedCall(800, () => this.showCup());
    }
  }

  showCup() {
    if (this.finalTriggered) return;
    this.finalTriggered = true;
    const { width, height } = this.scale;

    this.copa = this.physics.add.sprite(width / 2, -100, 'copa').setScale(0.20);
    this.copa.setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: this.copa,
      y: height / 2,
      duration: 1500,
      ease: 'Bounce.easeOut'
    });

    this.copa.on('pointerdown', () => this.showFinalLetter());
  }

  showFinalLetter() {
    const { width, height } = this.scale;
    const mensajeLargo = "Para mi amor, Julian:\n\nLlegaste al final, pero esto es solo el inicio de todo lo que quiero \nllegar a vivir contigo.\n En este poquito tiempo me has hecho inmensamente feliz. Gracias por cada risa y por elegirme.\n\nTe amo muchísimo. ¡Eres mi mejor premio! ❤️";

    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0).setDepth(100);
    
    const msgText = this.add.text(width / 2, height / 2 - 20, mensajeLargo, {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '11px',
      color: '#5a3e36',
      align: 'center',
      wordWrap: { width: width * 0.7 }
    }).setOrigin(0.5).setDepth(102);

    const bounds = msgText.getBounds();
    const padding = 30;

    const box = this.add.graphics().setDepth(101);
    box.fillStyle(0xfff5f8, 1);
    box.fillRoundedRect(
      (width - (bounds.width + padding*2)) / 2, 
      (height - (bounds.height + padding*4)) / 2, 
      bounds.width + padding*2, 
      bounds.height + padding*4, 
      20
    );

    const btn = this.add.text(width / 2, bounds.bottom + 30, "VOLVER A JUGAR", {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      backgroundColor: '#ff9bb3',
      color: '#ffffff',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(102);

    btn.on('pointerdown', () => this.scene.start('IntroScene'));
  }

}
