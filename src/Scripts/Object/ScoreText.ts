import * as Phaser from "phaser";

import { getResolution } from "../Util/Util";
export default class ScoreText extends Phaser.GameObjects.Text {
    private score;
    constructor(scene: Phaser.Scene) {
      super(scene, getResolution().width / 2, getResolution().height - 100, "", {
        color: "white",
        fontSize: "28px",
      });
      scene.add.existing(this);
      this.setOrigin(0.5, 0);
      this.score = 0;
    }
  
    update() {
      this.setText(`Score: ${Math.floor(this.score)}`);
    }
  
    add(addition) {
      this.score += addition;
      console.log(this.score);
    }
  
    reset() {
      this.score = 0;
    }
}