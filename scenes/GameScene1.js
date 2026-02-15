export default class GameScene1 extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene1' });
  }

  preload() {
    this.load.image('bg1', 'assets/backgrounds/scene1.png');
    this.load.image('boy', 'assets/characters/boy.png');
    this.load.image('heart', 'assets/items/heart.png');
    this.load.image('door', 'assets/items/door.png');
  }

  create() {
    this.heartRead = false;
    this.messageActive = false;
    this.deZonesRead = new Set();
    this.transitioning = false;
    this.targetPosition = null;

    // Grupos
    this.tempMessageZones = this.physics.add.staticGroup(); 
    this.doorGroup = this.physics.add.group(); 

    const mapWidth = 1920;
    const mapHeight = 1080;
    const blockSize = 60; 

    const bg = this.add.image(0, 0, 'bg1').setOrigin(0);
    bg.setDisplaySize(mapWidth, mapHeight);
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

    this.walls = this.physics.add.staticGroup();
    const wallColor = 0x87CEEB; 
    const borderColor = 0x4682B4;

    const levelMap = [
      "11111111111111111111111111111111", 
      "1P010000001000001000001000000M01", 
      "10010000000000000000000000000001", 
      "10010001000001000001000000001111",
      "10010001111111111111111100000001", 
      "10010001000000000000000100000001", 
      "10010001000000000000C00100000001", 
      "10010001000000000000000100000001", 
      "10010001000011111111111100000001", 
      "10010001000000000000000000000001", 
      "10010001000000000000000000000001", 
      "10010001111111111111100011111111", 
      "10010000000000000000100010000001", 
      "1001000000000000000010001000S001", 
      "10011111111111110000100010000001", 
      "10000000000000000000100000000001", 
      "10000000000000000000100000000001", 
      "11111111111111111111111111111111"  
    ];

    levelMap.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const xPos = x * blockSize;
        const yPos = y * blockSize;
        const xCenter = xPos + (blockSize / 2);
        const yCenter = yPos + (blockSize / 2);

        if (row[x] === '1') {
          const r = this.add.rectangle(xPos, yPos, blockSize, blockSize, wallColor).setOrigin(0);
          r.setStrokeStyle(2, borderColor);
          this.physics.add.existing(r, true);
          this.walls.add(r);
        } 
        else if (row[x] === 'P') {
          this.player = this.physics.add.sprite(xCenter, yCenter, 'boy');
        } 
        else if (row[x] === 'C') {
          this.heart = this.physics.add.sprite(xCenter, yCenter, 'heart');
        } 
        else if (row[x] === 'S') {
          this.door = this.physics.add.sprite(xCenter, yCenter, 'door');
          this.door.setScale(0.18);
          this.doorGroup.add(this.door);
          this.door.body.setAllowGravity(false);
          this.door.body.setImmovable(true);
          // Hitbox ampliada para asegurar colisión
          this.door.body.setSize(this.door.width * 1.5, this.door.height * 1.5);
        }
        else if (row[x] === 'M') {
          const zone = this.add.zone(xCenter, yCenter, blockSize * 1.2, blockSize * 1.2);
          this.physics.world.enable(zone, 1);
          zone.name = `msg_${x}_${y}`;
          this.tempMessageZones.add(zone);
        }
      }
    });

    if (this.player) {
      this.player.setScale(0.12).setCollideWorldBounds(true);
      this.player.body.setSize(this.player.width * 0.5, this.player.height * 0.7);
      this.physics.add.collider(this.player, this.walls);
    }

    if (this.heart) {
      this.heart.setScale(0.08);
      this.physics.add.overlap(this.player, this.heart, () => {
        if (!this.heartRead && !this.messageActive) {
          this.showHeartMessage();
        }
      }, null, this);
    }

    this.physics.add.overlap(this.player, this.tempMessageZones, (player, zone) => {
      if (!this.deZonesRead.has(zone.name) && !this.messageActive) {
        this.stopPlayer();
        this.bouncePlayer();
        this.showGenericMessage('por aqui no es mi amor sjjsjs', 'CONTINUAR', () => {
          this.deZonesRead.add(zone.name);
        });
      }
    }, null, this);

    this.physics.add.overlap(this.player, this.doorGroup, () => {
      if (this.messageActive || this.transitioning) return;

      if (this.heartRead) {
        this.stopPlayer();
        this.goToNextScene();
      } else {
        this.stopPlayer();
        this.bouncePlayer();
        this.showGenericMessage('Te falta algo bb', 'CONTINUAR', () => {});
      }
    }, null, this);

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
    const dist = 70;
    if (this.player.body.velocity.x > 0) this.player.x -= dist;
    else if (this.player.body.velocity.x < 0) this.player.x += dist;
    if (this.player.body.velocity.y > 0) this.player.y -= dist;
    else if (this.player.body.velocity.y < 0) this.player.y += dist;
    this.player.body.stop();
  }

  showHeartMessage() {
    this.heartRead = true;
    this.stopPlayer();
    this.showGenericMessage(
      'Así de fácil es amarte.\n\nGracias por encontrar mi corazón <3.',
      'CONTINUAR',
      () => { if(this.heart) this.heart.destroy(); }
    );
  }

  showGenericMessage(text, btnText, onClose) {
    this.messageActive = true;
    this.stopPlayer();

    const { width, height } = this.scale;
    const scrollX = this.cameras.main.scrollX;
    const scrollY = this.cameras.main.scrollY;

    const overlay = this.add.rectangle(scrollX + width/2, scrollY + height/2, width, height, 0x000000, 0.65).setScrollFactor(0);
    const box = this.add.graphics().setScrollFactor(0);
    box.fillStyle(0xfff5f8, 0.97);
    box.fillRoundedRect(width*0.12, height*0.22, width*0.76, height*0.38, 28);
    box.lineStyle(3, 0xff9bb3, 0.8);
    box.strokeRoundedRect(width*0.12, height*0.22, width*0.76, height*0.38, 28);

    // LÍNEA MODIFICADA: FUENTE ORIGINAL
    const msgText = this.add.text(width/2, height*0.32, text, {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '15px',
      color: '#5a3e36',
      align: 'center',
      wordWrap: { width: width*0.6 }
    }).setOrigin(0.5).setScrollFactor(0);

    // LÍNEA MODIFICADA: BOTÓN ORIGINAL
    const btn = this.add.text(width/2, height*0.52, btnText, {
      fontFamily: '"Press Start 2P", cursive',
      fontSize: '13px',
      backgroundColor: '#ff9bb3',
      color: '#ffffff',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setInteractive({ useHandCursor: true });

    btn.on('pointerdown', () => {
      overlay.destroy(); box.destroy(); msgText.destroy(); btn.destroy();
      onClose();
      this.messageActive = false;
    });
  }

  goToNextScene() {
    if (this.transitioning) return;
    this.transitioning = true;
    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene2');
    });
  }

  update() {
    if (this.player && this.player.body && this.targetPosition) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.targetPosition.x, this.targetPosition.y);
      if (dist < 15) this.stopPlayer();
    }
  }
}