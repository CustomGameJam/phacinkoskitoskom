import Phaser from 'phaser';
import GamepadPlugin = Phaser.Input.Gamepad.GamepadPlugin;

export default {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#000000',
  scale: {
    width: 800,
    height: 800,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y: 200},
    },
  },
  input: {
    gamepad: true
  },
};
