import * as Phaser from "phaser";
import Shopee from "../Object/Shopee";
import FpsText from "../Object/FpsText";
import Bubble from "../Object/Bubble";
import BubbleGroup from "../Object/BubbleGroup";
import ScoreText from "../Object/ScoreText";
import GuideLine from "../Object/GuideLine";

import { getResolution, getConfig } from "../Util/Util";

export default class GameScene extends Phaser.Scene {

  private fpsText: FpsText;
  private gameOver: boolean;
  private win: boolean;
  private bubbleGroup: BubbleGroup;
  private currentBubble: Bubble;
  private nextBubble: Bubble;
  private arrow:Phaser.GameObjects.Sprite;
  private scoreText: ScoreText;
  private guideLine: GuideLine;
  private bg;
  constructor() {
    super({ key: "GameScene" });
  }

  preload(): void {
    this.bg = this.sound.add("bg")
    this.bg.loop = true;
    if (!this.bg.isPlaying) {
      this.bg.play();
    }
  }

  create(): void {
    // this.bubbleGroup = this.physics.add.group();
    this.add.tileSprite(getResolution().width / 2, getResolution().height / 2, getResolution().width, getResolution().height, "background").setScale(0.9);
    this.guideLine = new GuideLine(this, getResolution().width / 2, getResolution().height * 4 / 5)
    this.arrow = this.physics.add.sprite(getResolution().width / 2, getResolution().height * 4 / 5, "arrow").setOrigin(0.5, 0.8);
    this.time.timeScale = 1;
    this.currentBubble = new Bubble(this, getResolution().width / 2, getResolution().height * 4 / 5, null, null, null, Phaser.Math.Between(0, 6));
    this.nextBubble = new Bubble(this, getResolution().width * 4 / 5, getResolution().height * 4 / 5, null, null, null, Phaser.Math.Between(0, 6));
    // this.currentBubble.setScale(0.66)
    this.currentBubble.setOrigin(0.5, 0.5)
    this.gameOver = false;
    this.win = false;
    console.log(this.bubbleGroup);
    this.bubbleGroup = new BubbleGroup(this, 8, 5, this.currentBubble);
    
    this.scoreText = new ScoreText(this);
    this.fpsText = new FpsText(this);
    this.input.off("pointerup");
    this.input.off("pointermove");
    this.input.on("pointerup", (pointer) => {
      if (!this.gameOver) {
        let angle = (Phaser.Math.Angle.Between(this.arrow.x, this.arrow.y, pointer.x, pointer.y) * 180 / Math.PI) + 90;
        if (angle <= 86 && this.currentBubble.body.velocity.x === 0 && this.currentBubble.body.velocity.y === 0) {
          this.physics.moveToObject(this.currentBubble, pointer, 2000);
          this.checkGameover();
        } else if (this.currentBubble.body.velocity.x === 0 && this.currentBubble.body.velocity.y === 0) {
          this.exchangeBubble();
        }
      }
    })
    this.input.on('pointermove', function (pointer) {
      if (!this.gameOver) {
        let angle = (Phaser.Math.Angle.Between(this.arrow.x, this.arrow.y, pointer.x, pointer.y) * 180 / Math.PI) + 90;
        if (angle > 87) {
          this.arrow.setAngle(0);
          this.guideLine.onPointerMove({x: getResolution().width / 2, y: 0});
        }
        else {
          this.arrow.setAngle(angle);
          this.guideLine.onPointerMove(pointer);
        }
      }
    }, this);

    this.currentBubble.randomizeColor(this.bubbleGroup.getReachableCluster());
    this.nextBubble.randomizeColor(this.bubbleGroup.getReachableCluster());
    this.time.addEvent({
      delay: 25000, loop: true,
      callback: () => {
        if (!this.gameOver) {
          this.bubbleGroup.addRow();
        }
      }
    })
    this.events.once("gameover", this.runGameOver, this);
    this.events.on("addscore", this.addScore, this);
    this.events.on("nextmove", this.nextMove, this);
    this.events.on("randomizebubble", this.randomizeColor, this);
  }

  update(): void {
    this.fpsText.update();
    this.scoreText.update();
    if (!this.gameOver) {
      this.checkGameover();
    }
    if (this.currentBubble.y <= 100 ) {
      this.bubbleGroup.collide(null, this.currentBubble);
    }
  }

  runGameOver(): void {
    console.log("gameover");
    this.events.off("gameover");
    this.events.off("addscore");
    this.events.off("nextmove");
    this.events.off("randomizebubble");
    this.time.timeScale = 0
    this.add.rectangle(getResolution().width / 2, getResolution().height / 2, getResolution().width, getResolution().height, 0x000000, 0.5)
    this.gameOver = true;
    this.scoreText.setDepth(1);
    this.scoreText.y = getResolution().height / 2;
    this.scoreText.setFontSize(35);
    this.add.text(getResolution().width / 2, getResolution().height / 3, this.win ? "You win" : "Game Over", {fontSize: "45pt", color: "#ffffff"}).setOrigin(0.5, 0.5);
    let restartButton = this.add.sprite(getResolution().width / 2, getResolution().height * 3 / 4, "replay");
    restartButton.setInteractive();
    restartButton.on("pointerup", () => {
      this.bubbleGroup.destroy();
      delete this.bubbleGroup;
      this.bg.stop();
      this.registry.destroy();
      this.sound.removeAll();
      this.scene.start("GameScene");
    }, this);
    // this.scene.restart();
  }

  addScore(addition): void {
    this.scoreText.add(addition)
  }

  exchangeBubble(): void {
    const currentBubbleColor = this.currentBubble.getColorCode();
    this.currentBubble.setColor(this.nextBubble.getColorCode());
    this.nextBubble.setColor(currentBubbleColor);
  }

  nextMove(): void {
    this.currentBubble.setColor(this.nextBubble.getColorCode());
    this.nextBubble.randomizeColor(this.bubbleGroup.getReachableCluster(), true);
  }

  randomizeColor(): void {
    this.currentBubble.randomizeColor(this.bubbleGroup.group);
    this.nextBubble.randomizeColor(this.bubbleGroup.group);
  }

  checkGameover(): void {
    this.time.addEvent({
      delay: 1000, loop: false,
      callback: () => {
        let bubbleExists = false;
        if (this.bubbleGroup.isEmpty()) {
          this.win = true;
          this.events.emit("gameover");
        }
          this.bubbleGroup.getRow(10).forEach((elm)=> {
          if (elm !== null) this.events.emit("gameover");
        })
      }
    })
  }
}
