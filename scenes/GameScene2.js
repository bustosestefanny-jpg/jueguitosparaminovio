export default class GameScene2 extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene2' });
  }

  preload() {
    // Fondos e Items
    this.load.image('bg2', 'assets/backgrounds/scene2.png');
    this.load.image('boy', 'assets/characters/boy.png'); 
    this.load.image('gema', 'assets/items/letter.png'); // Cargamos la gema con el asset de carta
    this.load.image('tree', 'assets/items/tree.png');
    this.load.image('roca', 'assets/items/roca.png');
    this.load.image('arbusto', 'assets/items/arbusto.png');
    this.load.image('door2', 'assets/items/door.png'); 
  }

  create() {
    // Variables de estado
    this.gemsCollected = 0;
    this.totalGems = 3;
    this.messageActive = false;
    this.transitioning = false;
    this.targetPosition = null;

    const mapWidth = 1920;
    const mapHeight = 1080;
    const blockSize = 80; 

    // Fondo
    const bg = this.add.image(0, 0, 'bg2').setOrigin(0);
    bg.setDisplaySize(mapWidth, mapHeight);
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

    // Grupos
    this.obstacles = this.physics.add.staticGroup();
    this.gemsGroup = this.physics.add.group();
    this.exitGroup = this.physics.add.group();

    // Mapa del Bosque
    const levelMap = [
      "111111111111111111111111",
      "1P0000010000000000000001",
      "1003000100G0000222000001",
      "100000011111000000003001",
      "102200000000000000000001",
      "1000000111100G0000111001",
      "103000010000000000001001",
      "111100010022220030001001",
      "1G0000000000000000001001",
      "100030000000000000000001",
      "1000001111111100000000S1",
      "111111111111111111111111"
    ];

    levelMap.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const xCenter = x * blockSize + blockSize / 2;
        const yCenter = y * blockSize + blockSize / 2;

        if (row[x] === '1') this.obstacles.create(xCenter, yCenter, 'tree').setScale(0.2).refreshBody();
        else if (row[x] === '2') this.obstacles.create(xCenter, yCenter, 'roca').setScale(0.15).refreshBody();
        else if (row[x] === '3') this.obstacles.create(xCenter, yCenter, 'arbusto').setScale(0.12).refreshBody();
        else if (row[x] === 'G') {
          const gema = this.gemsGroup.create(xCenter, yCenter, 'gema');
          gema.setScale(0.1).body.setAllowGravity(false);
        }
        else if (row[x] === 'P') this.player = this.physics.add.sprite(xCenter, yCenter, 'boy');
        else if (row[x] === 'S') {
          this.door = this.exitGroup.create(xCenter, yCenter, 'door2');
          this.door.setScale(0.2).body.setAllowGravity(false).setImmovable(true);
        }
      }
    });

    // Configuración Jugador
    if (this.player) {
      this.player.setScale(0.10).setCollideWorldBounds(true);
      this.player.body.setSize(this.player.width * 0.5, this.player.height * 0.7);
      this.physics.add.collider(this.player, this.obstacles);
    }

    // Colisión con Gemas (Cartas)
    this.physics.add.overlap(this.player, this.gemsGroup, (player, gema) => {
      if (this.messageActive) return;
      gema.destroy();
      this.gemsCollected++;
      this.stopPlayer();
      
      let frase = "";
      if(this.gemsCollected === 1) frase = "Desde el primer momento supe que algo especial iba a pasar. ¡No fue casualidad, fue destino!";
      if(this.gemsCollected === 2) frase = "En poco tiempo lograste algo grande: hacerme sentir tranquila, amada y feliz solo con ser tú.";
      if(this.gemsCollected === 3) frase = "No necesito saber hasta dónde llegamos, solo sé que hoy te elijo y eso me basta.\n\nSe ha abierto la puerta.";

      this.showGenericMessage(frase, 'CONTINUAR', () => {});
    });

    // Colisión con Salida
    this.physics.add.overlap(this.player, this.exitGroup, () => {
      if (this.messageActive || this.transitioning) return;

      if (this.gemsCollected >= this.totalGems) {
        this.stopPlayer();
        const finalMsg = "Este mes contigo me enseñó que el amor no siempre llega despacio… a veces llega fuerte y sincero.\n\nGracias por estar, por cuidarme y por elegirme. Si este es solo el comienzo, quiero seguir jugando contigo..";
        this.showGenericMessage(finalMsg, "AVANZAR", () => {
          this.goToNextScene();
        });
      } else {
        this.stopPlayer();
        this.bouncePlayer();
        this.showGenericMessage(`Aún te faltan ${this.totalGems - this.gemsCollected} cartitas mi amor jsjsjs.`, "BUSCAR", () => {});
      }
    });

    // Movimiento
    this.input.on('pointerdown', pointer => {
      if (this.messageActive || this.transitioning) return;
      this.targetPosition = { x: pointer.worldX, y: pointer.worldY };
      this.physics.moveTo(this.player, pointer.worldX, pointer.worldY, 250);
    });

    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    if (this.player) this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
  }

  stopPlayer() {
    if (this.player && this.player.body) this.player.body.stop();
    this.targetPosition = null;
  }

  bouncePlayer() {
    const dist = 40;
    if (this.player.body.velocity.x > 0) this.player.x -= dist;
    else if (this.player.body.velocity.x < 0) this.player.x += dist;
    if (this.player.body.velocity.y > 0) this.player.y -= dist;
    else if (this.player.body.velocity.y < 0) this.player.y += dist;
    this.player.body.stop();
  }

  showGenericMessage(text, btnText, onClose) {
    this.messageActive = true;
    this.stopPlayer();
    const { width, height } = this.scale;

    // Overlay oscuro
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.65)
      .setOrigin(0).setScrollFactor(0).setDepth(10);

    // Texto (para medirlo)
    const msgText = this.add.text(width / 2, height / 2 - 30, text, {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '12px',
      color: '#5a3e36',
      align: 'center',
      wordWrap: { width: width * 0.65 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(12);

    // Medidas dinámicas
    const textBounds = msgText.getBounds();
    const padding = 35;
    const boxWidth = textBounds.width + padding * 2;
    const boxHeight = textBounds.height + padding * 3 + 30;

    // Gráfico del cuadro
    const box = this.add.graphics().setScrollFactor(0).setDepth(11);
    box.fillStyle(0xfff5f8, 0.97);
    box.fillRoundedRect((width - boxWidth) / 2, (height - boxHeight) / 2, boxWidth, boxHeight, 20);
    box.lineStyle(3, 0xff9bb3, 0.8);
    box.strokeRoundedRect((width - boxWidth) / 2, (height - boxHeight) / 2, boxWidth, boxHeight, 20);

    // Botón
    const btn = this.add.text(width / 2, textBounds.bottom + padding, btnText, {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '10px',
      backgroundColor: '#ff9bb3',
      color: '#ffffff',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true }).setDepth(12);

    btn.on('pointerdown', () => {
      overlay.destroy(); box.destroy(); msgText.destroy(); btn.destroy();
      this.messageActive = false;
      onClose();
    });
  }

  goToNextScene() {
    if (this.transitioning) return;
    this.transitioning = true;
    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene3');
    });
  }

  update() {
    if (this.player && this.player.body && this.targetPosition) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.targetPosition.x, this.targetPosition.y);
      if (dist < 15) this.stopPlayer();
    }
  }
}