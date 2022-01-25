import * as Phaser from "phaser";
import { getResolution, getConfig } from "../Util/Util";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
    console.log("PreloadScene");
  }

  preload(): void {
    console.log("preload");
    var progressBar = this.add.graphics();
    var progressBox = this.add.graphics();
    let self = this;
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(
      getResolution().width / 2 - 160,
      getResolution().height / 2 - 25,
      320,
      50
    );
    this.load.on("progress", function (value) {
      console.log(value);
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(
        getResolution().width / 2 - 150,
        getResolution().height / 2 - 15,
        300 * value,
        30
      );
    });
    this.load.on("fileprogress", function (file) {
      console.log(file.src);
    });
    this.load.on("complete", () => {
      console.log("complete");
      self.scene.start("GameScene");
    });
    this.load.setPath("src/Assets");
    this.load.spritesheet("bubble", "bubblesprite.png", {
      frameWidth: 180,
      frameHeight: 180,
    });
    this.load.image("arrow", "arrow.png");
    this.load.image("replay", "Replay.png");
    this.load.image("background", "background.png");
    this.load.audio("pop", "sounds/pop.wav");
    this.load.audio("collision", "sounds/snap.wav");
    this.load.audio("bg", "sounds/bg.wav");
  }

  create(): void {
    console.log("created");
  }
}
