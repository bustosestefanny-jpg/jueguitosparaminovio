export default class MessageScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MessageScene' });
  }

  preload() {
    this.load.image('love_maze', 'assets/backgrounds/love_maze.jpg');
    this.load.image('girl', 'assets/characters/girl.png');
  }

  create() {
    const { width, height } = this.scale;

    // 1. Fondo
    const bg = this.add.image(width / 2, height / 2, 'love_maze');
    bg.setDisplaySize(width, height);

    // 2. Cuadro de texto
    const box = this.add.graphics();
    box.fillStyle(0xffffff, 0.92);
    box.fillRoundedRect(width * 0.1, height * 0.1, width * 0.8, height * 0.4, 20);

    // 3. Mensaje de Estefanny
    this.add.text(
      width / 2,
      height * 0.15,
      'Hola gordito, hoy es 14 de febrero o nuestro primer mes juntos.\n\n' +
      'No sé cuándo estés jugando esto, pero este laberinto de emociones\n' +
      'que hemos tenido juntos fue hecho con mucho amor y tiene algo\n' +
      'que decirte.\n\n— Estefanny',
      {
        fontFamily: '"Press Start 2P", cursive',
        fontSize: '12px',
        color: '#5a3e36',
        align: 'center',
        wordWrap: { width: width * 0.7 }
      }
    ).setOrigin(0.5, 0);

    // 4. Personaje de la chica
    const girl = this.add.image(width * 0.2, height * 0.75, 'girl');
    girl.setScale(0.4);

    // 5. Botón CONTINUAR (Esquina inferior derecha)
    const btnContinuar = this.add.text(
      width - 20, 
      height - 20, 
      'CONTINUAR >', 
      {
        fontFamily: '"Press Start 2P", cursive',
        fontSize: '14px',
        backgroundColor: '#ff9bb3',
        color: '#ffffff',
        padding: { x: 15, y: 10 }
      }
    )
    .setOrigin(1, 1) // Alineado a la derecha y abajo
    .setInteractive({ useHandCursor: true });

    // --- EVENTOS PARA AVANZAR ---

    // Al hacer clic en el botón
    btnContinuar.on('pointerdown', () => this.startGame());

    // Al hacer TAP en cualquier parte de la pantalla
    this.input.on('pointerdown', (pointer) => {
      // Evitamos que se active dos veces si se pisa el botón
      if (pointer.x < width - 150 || pointer.y < height - 50) {
        this.startGame();
      }
    });
  }

  startGame() {
    // Vamos directo a la GameScene1 (o TransitionScene si prefieres el efecto)
    this.scene.start('GameScene1');
  }
}
