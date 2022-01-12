import * as Phaser from "phaser";
import Shopee from "../Object/Shopee";
import FpsText from "../Object/FpsText";
import Bubble from "../Object/Bubble";
import BubbleGroup from "../Object/BubbleGroup";

import { getResolution, getConfig } from "../Util/Util";

export default class GameScene extends Phaser.Scene {

  private fpsText: FpsText;
  private bubbleGroup: BubbleGroup;
  private isAdding = false;
  private currentBubble: Bubble;
  private nextBubble: Bubble;
  constructor() {
    super({ key: "GameScene" });
  }

  preload(): void {

  }

  create(): void {
    // this.bubbleGroup = this.physics.add.group();
    
    this.currentBubble = new Bubble(this, getResolution().width / 2, getResolution().height * 4 / 5, null, null, null, Phaser.Math.Between(0, 6));
    // this.currentBubble.setScale(0.66)
    this.currentBubble.setOrigin(0.5, 0.5)

    this.bubbleGroup = new BubbleGroup(this, 8, 6, this.currentBubble);
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
    this.input.on("pointerdown", (pointer) => {
      this.physics.moveToObject(this.currentBubble, pointer, 2000);
      this.checkGameover();
    })
    this.events.off("gameover");
    this.events.on("gameover", this.runGameOver, this);
  }

  update(time, delta): void {
    
  }

  runGameOver(): void {
    console.log("gameover");
    this.scene.restart();
  }

  addScore(addition): void {
  }

  checkGameover(): void {
    this.bubbleGroup.getRow(10).forEach((elm)=> {
      if (elm !== null) this.events.emit("gameover");
    })
  }
}
