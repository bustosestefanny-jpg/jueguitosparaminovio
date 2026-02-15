export default class GameScene3 extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene3' });
  }

  preload() {
    this.load.image('bg3', 'assets/backgrounds/scene3.jpg');
    this.load.image('boy', 'assets/characters/boy.png');
    this.load.image('gema', 'assets/items/gema.png'); 
    this.load.image('rayo', 'assets/items/cloud.png'); 
  }

  create() {
    this.cameras.main.fadeIn(800, 0, 0, 0);
    this.score = 0;
    this.targetScore = 15;
    this.gameEnded = false;
    const { width, height } = this.scale;

    this.add.image(width / 2, height / 2, 'bg3').setDisplaySize(width, height);
    this.player = this.physics.add.sprite(width / 2, height - 70, 'boy').setScale(0.12).setCollideWorldBounds(true);

    this.gems = this.physics.add.group();
    this.rays = this.physics.add.group();

    this.scoreText = this.add.text(20, 20, `Gemas: 0 / ${this.targetScore}`, { 
        fontFamily: '"Press Start 2P", cursive', 
        fontSize: '14px', 
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4
    });

    // Spawn de Gemas
    this.time.addEvent({ delay: 1000, callback: () => {
      if (this.gameEnded) return;
      const x = Phaser.Math.Between(50, width - 50);
      this.gems.create(x, -20, 'gema').setScale(0.1).setVelocityY(Phaser.Math.Between(150, 250));
    }, loop: true });

    // Spawn de Rayos
    this.time.addEvent({ delay: 1500, callback: () => {
      if (this.gameEnded) return;
      const x = Phaser.Math.Between(50, width - 50);
      this.rays.create(x, -20, 'rayo').setScale(0.06).setVelocityY(Phaser.Math.Between(200, 300)).setTint(0xffcc00);
    }, loop: true });

    this.physics.add.overlap(this.player, this.gems, (p, gem) => {
      gem.destroy();
      this.score++;
      this.scoreText.setText(`Gemas: ${this.score} / ${this.targetScore}`);
      if (this.score >= this.targetScore) this.winGame();
    });

    this.physics.add.overlap(this.player, this.rays, (p, ray) => {
      ray.destroy();
      this.cameras.main.shake(200, 0.01);
      if (this.score > 0) this.score--;
      this.scoreText.setText(`Gemas: ${this.score} / ${this.targetScore}`);
    });
  }

  winGame() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.physics.pause();

    const { width, height } = this.scale;

    // 1. Fondo oscurecido
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7)
      .setOrigin(0).setDepth(20);

    // 2. Texto final (Estilo Minecraft)
    const finalText = "¡INCREÍBLE!\n\nHas recolectado todas las protogemas de mi corazón.\n\ Listo para la sorpresa final?";
    const msg = this.add.text(width / 2, height / 2 - 20, finalText, {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '12px',
      color: '#000000', // Letras negras
      align: 'center',
      wordWrap: { width: width * 0.6 }
    }).setOrigin(0.5).setDepth(22);

    // 3. Medidas para el cuadro celeste
    const bounds = msg.getBounds();
    const padding = 30;
    const boxWidth = bounds.width + padding * 2;
    const boxHeight = bounds.height + padding * 3 + 40;

    // 4. Dibujar cuadro celeste
    const box = this.add.graphics().setDepth(21);
    box.fillStyle(0x00d2ff, 1); // Celeste vibrante
    box.fillRoundedRect((width - boxWidth) / 2, (height - boxHeight) / 2, boxWidth, boxHeight, 15);
    box.lineStyle(4, 0x008bb2, 1); // Borde azul más oscuro
    box.strokeRoundedRect((width - boxWidth) / 2, (height - boxHeight) / 2, boxWidth, boxHeight, 15);

    // 5. Botón de acción
    const btn = this.add.text(width / 2, bounds.bottom + padding, "VER EL FINAL", {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '10px',
      backgroundColor: '#000000',
      color: '#00d2ff',
      padding: { x: 15, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(22);

    btn.on('pointerdown', () => {
      this.cameras.main.fadeOut(1000, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene4');
      });
    });
  }

  update() {
    if (this.gameEnded) return;
    if (this.input.activePointer.isDown) {
      this.physics.moveTo(this.player, this.input.activePointer.worldX, this.player.y, 400);
    } else {
      this.player.setVelocityX(0);
    }
  }
}