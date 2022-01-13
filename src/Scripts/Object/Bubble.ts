import * as Phaser from "phaser";

const colorMapping = [0xe74c3c, 0xc39bd3, 0x7fb3d5, 0x138d75, 0x79e79f, 0xe59866, 0x000000]
export default class Bubble extends Phaser.Physics.Arcade.Sprite {
    private colorCode;
    private isPopped = false;
    private indexX;
    private indexY;
    private group;
    private processed = false;
    public isColliding = false;
    constructor(scene:Phaser.Scene, x, y, group, indexX, indexY, colorCode) {
        super(scene, x, y, 'bubble');
        this.indexX = indexX;
        this.indexY = indexY;
        this.group = group;
        this.scene.add.existing(this);
        this.setOrigin(0, 0)
        this.colorCode = colorCode;
        this.setTint(colorMapping[colorCode]);
        this.setInteractive();
        scene.physics.add.existing(this);
        this.setScale(0.7)
        this.setCollideWorldBounds(true);
        this.setBounce(1, 1);
        this.setSize(100, 100);
        this.setOffset(40, 40);
        this.setImmovable();
        this.anims.create({
            key: "pop",
            frames: this.anims.generateFrameNumbers("bubble", {
              start: 0,
              end: 5
            }),
            frameRate: 20,
            repeat: 0,
          });

        //   this.on("pointerdown", function () {
        //     this.checkAround();
        //   });
        // this.scene.add.sprite(x, y, "bubble");
    }
    setIndex(x, y): void {
        this.indexX = x;
        this.indexY = y;
    }
    pop(): void {
        this.anims.play("pop");
        this.isPopped = true;
        this.scene.events.emit("addscore", 50);
        this.on("animationcomplete", () => {
            this.kill();
        });
    }
    getIsPopped() : Boolean {
        return this.isPopped;
    }
    fall(): void {
        this.isPopped = true;
        this.setVelocityY(Phaser.Math.Between(900, 1300));
        this.setCollideWorldBounds(false);
        this.scene.events.emit("addscore", 50);
        this.scene.time.addEvent({
            delay: 1500, loop: false,
            callback: () => {
                this.kill();
            }
        });
    }
    getColorCode(): any {
        return this.colorCode;
    }
    checkAround(): void {
        let around = this.group.checkAround(this.indexX, this.indexY, this.colorCode)
        // console.log(around);
        if (around.length >= 3) {
            around.forEach((bubble) => {
                bubble.pop();
            })
        }
        this.group.resetProcessed();
        let fallingClusters = this.group.checkFloating();
        fallingClusters.forEach((row)=> {
            row.forEach((element) => {
                element.fall();
            })
        })
        this.group.resetProcessed();
    }
    setProcessed(status): void {
        this.processed = status;
    }
    getProcessed(): Boolean {
        return this.processed;
    }
    kill(): void {
        this.setX(-100);
        this.setY(-100);
        this.setVelocity(0, 0);
        this.destroy();
        this.group.remove(this.indexX, this.indexY);
    }
    getRowIndex(): number {
        return this.indexY;
    }
    randomizeColor(group = this.group): void {
        let existingColor = [];
        console.log(group);
        group.forEach((row) => {
            row.forEach((bubble: Bubble) => {
                    if (bubble !== null) {
                    const color = bubble.getColorCode();
                    if (!existingColor.includes(color)) {
                        existingColor.push(color);
                    }
                }
            })
        })
        let randomColor = existingColor[Phaser.Math.Between(0, existingColor.length - 1)]
        this.colorCode = randomColor;
        this.setTint(colorMapping[this.colorCode]);

    }
    getIndex(): any {
        return {x: this.indexX, y: this.indexY};
    }
    getIsColliding(): any {
        return this.isColliding;
    }
    setIsColliding(status): any {
        this.isColliding = status;
    }
}