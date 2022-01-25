import * as Phaser from "phaser";

import { getResolution } from "../Util/Util";

export default class GuideLine {
  private line: Phaser.Geom.Line;
  private graphics: Phaser.GameObjects.Graphics;
  private origin;
  private rightBoundary: Phaser.Geom.Line;
  private leftBoundary: Phaser.Geom.Line;
  private reflection: Phaser.Geom.Line;

  constructor(scene, x, y) {
    this.graphics = scene.add.graphics({
      lineStyle: { width: 4, color: 0x0000aa },
    });
    this.origin = { x: x, y: y };
    this.line = new Phaser.Geom.Line(x, y, x, 0);
    this.rightBoundary = new Phaser.Geom.Line(
      getResolution().width,
      0,
      getResolution().width,
      getResolution().height
    );
    this.leftBoundary = new Phaser.Geom.Line(0, 0, 0, getResolution().height);
    this.reflection = new Phaser.Geom.Line(0, 0, 0, 0);
    this.graphics.strokeLineShape(this.line);
  }

  onPointerMove(pointer): void {
    this.graphics.clear();
    this.line.x2 = pointer.x;
    this.line.y2 = pointer.y;
    let intersection = Phaser.Geom.Intersects.GetLineToLine(
      this.line,
      this.rightBoundary
    );
    if (intersection) {
      let reflectionAngle = Phaser.Geom.Line.ReflectAngle(
        this.line,
        this.rightBoundary
      );
      Phaser.Geom.Line.SetToAngle(
        this.reflection,
        intersection.x,
        intersection.y,
        reflectionAngle,
        1000
      );
    } else {
      intersection = Phaser.Geom.Intersects.GetLineToLine(
        this.line,
        this.leftBoundary
      );
      if (intersection) {
        let reflectionAngle = Phaser.Geom.Line.ReflectAngle(
          this.line,
          this.leftBoundary
        );
        Phaser.Geom.Line.SetToAngle(
          this.reflection,
          intersection.x,
          intersection.y,
          reflectionAngle,
          1000
        );
      } else {
        this.reflection.setTo(0, 0, 0, 0);
      }
    }
    // console.log("reflect right: " + Phaser.Geom.Line.ReflectAngle(this.line, this.rightBoundary));
    Phaser.Geom.Line.SetToAngle(
      this.line,
      this.origin.x,
      this.origin.y,
      Phaser.Math.Angle.Between(
        this.origin.x,
        this.origin.y,
        pointer.x,
        pointer.y
      ),
      1000
    );
    this.graphics.strokeLineShape(this.line);
    // this.graphics.strokeLineShape(this.rightBoundary);
    // this.graphics.strokeLineShape(this.leftBoundary);
    this.graphics.strokeLineShape(this.reflection);
  }
}
