import IntroScene from './scenes/IntroScene.js';
import MessageScene from './scenes/MessageScene.js'; 
import GameScene1 from './scenes/GameScene1.js';
import GameScene2 from './scenes/GameScene2.js';
import GameScene3 from './scenes/GameScene3.js';
import GameScene4 from './scenes/GameScene4.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: [
    IntroScene,
    MessageScene,
    GameScene1,
    GameScene2,
    GameScene3,
    GameScene4,
  ]
};

new Phaser.Game(config);