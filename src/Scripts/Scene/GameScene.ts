import * as Phaser from "phaser";
import Shopee from "../Object/Shopee";
import FpsText from "../Object/FpsText";
import Bubble from "../Object/Bubble";
import BubbleGroup from "../Object/BubbleGroup";
import ScoreText from "../Object/ScoreText";

import { getResolution, getConfig } from "../Util/Util";

export default class GameScene extends Phaser.Scene {

  private fpsText: FpsText;
  private gameOver: boolean;
  private bubbleGroup: BubbleGroup;
  private isAdding = false;
  private currentBubble: Bubble;
  private nextBubble: Bubble;
  private arrow:Phaser.GameObjects.Sprite;
  private scoreText: ScoreText;
  constructor() {
    super({ key: "GameScene" });
  }

  preload(): void {

  }

  create(): void {
    // this.bubbleGroup = this.physics.add.group();
    
    this.arrow = this.physics.add.sprite(getResolution().width / 2, getResolution().height * 4 / 5, "arrow").setOrigin(0.5, 0.8);

    this.currentBubble = new Bubble(this, getResolution().width / 2, getResolution().height * 4 / 5, null, null, null, Phaser.Math.Between(0, 6));
    // this.currentBubble.setScale(0.66)
    this.currentBubble.setOrigin(0.5, 0.5)
    this.gameOver = false;
    this.bubbleGroup = new BubbleGroup(this, 8, 5, this.currentBubble);
    this.scoreText = new ScoreText(this);
    this.input.keyboard.on("keydown", () => {
      if (!this.isAdding) {
        this.isAdding = true;
        this.time.addEvent({
          delay: 500,
          loop: false,
          callback: () => {
            this.bubbleGroup.addRow();
            this.isAdding = false;
            this.checkGameover();
          },
        });
      }
    });
    this.input.on("pointerup", (pointer) => {
      if (!this.gameOver) {
        let angle = (Phaser.Math.Angle.Between(this.arrow.x, this.arrow.y, pointer.x, pointer.y) * 180 / Math.PI) + 90;
        if (angle <= 90) {
          this.physics.moveToObject(this.currentBubble, pointer, 2000);
          this.checkGameover();
        }
      }
    })
    this.input.on('pointermove', function (pointer) {
      if (!this.gameOver) {
        let angle = (Phaser.Math.Angle.Between(this.arrow.x, this.arrow.y, pointer.x, pointer.y) * 180 / Math.PI) + 90;
        if (angle > 90) this.arrow.setAngle(0); else this.arrow.setAngle(angle);
      }
    }, this);
    this.events.off("gameover");
    this.events.off("addscore")
    this.events.on("gameover", this.runGameOver, this);
    this.events.on("addscore", this.addScore, this);
  }

  update(time, delta): void {
    this.scoreText.update();
  }

  runGameOver(): void {
    console.log("gameover");
    this.add.rectangle(getResolution().width / 2, getResolution().height / 2, getResolution().width, getResolution().height, 0x000000, 0.5)
    this.gameOver = true;
    this.scoreText.setDepth(1);
    this.scoreText.y = getResolution().height / 2;
    this.scoreText.setFontSize(35);
    this.add.text(getResolution().width / 2, getResolution().height / 3, "Game Over", {fontSize: "45pt", color: "#ffffff"}).setOrigin(0.5, 0.5);
    let restartButton = this.add.sprite(getResolution().width / 2, getResolution().height * 3 / 4, "replay");
    restartButton.setInteractive();
    restartButton.on("pointerup", () => {
      this.scene.restart();
    }, this);
    // this.scene.restart();
  }

  addScore(addition): void {
    this.scoreText.add(addition)
  }

  checkGameover(): void {
    this.time.addEvent({
      delay: 500, loop: false,
      callback: () => {
        this.bubbleGroup.getRow(10).forEach((elm)=> {
          if (elm !== null) this.events.emit("gameover");
        })
      }
    })
  }
}
