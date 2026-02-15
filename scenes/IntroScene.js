export default class IntroScene extends Phaser.Scene {
  constructor() {
    super('IntroScene');
  }

  preload() {
    this.load.image('intro_bg', 'assets/backgrounds/intro_bg.png');

    // 🎵 Música de fondo
    this.load.audio('bg_music', 'assets/audio/fondo.mp3');
  }

  create() {
    const { width, height } = this.scale;

    // 🎵 Reproducir música SOLO si no está sonando
    if (!this.sound.get('bg_music')) {
      const music = this.sound.add('bg_music', {
        loop: true,
        volume: 0.4
      });
      music.play();
    }

    // Fondo
    const bg = this.add.image(width / 2, height / 2, 'intro_bg');
    bg.setDisplaySize(width, height);

    // Título
    this.add.text(
      width / 2,
      height * 0.25,
      'MINIJUEGOS\nDE AMOR',
      {
        fontFamily: '"Press Start 2P"',
        fontSize: '26px',
        color: '#ffffff',
        align: 'center'
      }
    ).setOrigin(0.5);

    // Botón INICIAR
    const startBtn = this.add.text(
      width / 2,
      height * 0.65,
      'INICIAR',
      {
        fontFamily: '"Press Start 2P"',
        fontSize: '18px',
        backgroundColor: '#ff9bb3',
        color: '#ffffff',
        padding: { x: 20, y: 12 }
      }
    )
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

    startBtn.on('pointerdown', () => {
      this.scene.start('MessageScene');
    });
  }
}
