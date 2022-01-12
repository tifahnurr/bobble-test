import * as Phaser from "phaser";
import Bubble from "./Bubble";

import { getResolution } from "../Util/Util";

const neighborsoffsets = [[[1, 0], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1]], // Even row tiles
                        [[1, 0], [1, 1], [0, 1], [-1, 0], [0, -1], [1, -1]]];  // Odd row tiles
export default class BubbleGroup {
    private group: Array<Array<Bubble>>;
    private physicsGroup: Phaser.GameObjects.Group;
    private sizeX: number;
    private sizeY: number;
    private maxRow = 14;
    private isLongRowFirst: Boolean;
    private scene: Phaser.Scene;
    private playerBubble;
    constructor(scene, sizeX, sizeY, playerBubble) {
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.scene = scene;
        this.group = [];
        this.isLongRowFirst = true;
        this.physicsGroup = new Phaser.GameObjects.Group(this.scene);
        this.playerBubble = playerBubble;
        for (let i = 0; i < this.maxRow; i++) {
            let row = [];
            for (let j = 0; j < (i % 2 ? sizeX - 1 : sizeX); j++) {
                let colorCode = Phaser.Math.Between(0, 7);
                if (i < sizeY) {
                    let newBubble = new Bubble(scene, (j * 80) + (i % 2 ? 40 : 0) + 20, (i * 70) + 50, this, j, i, colorCode);
                    this.physicsGroup.add(newBubble);
                    row.push(newBubble);

                    this.scene.physics.add.overlap(newBubble, this.playerBubble, this.collide, null, this);
                } else {
                    row.push(null);
                }
            }
            this.group.push(row);
        }
    }
    collide(overlappedBubble, playerBubble: Bubble): void {
        let index = this.getClosestNeighbor(overlappedBubble, playerBubble);
        // if(index.y >= 12) {
        //     console.log(index.y);
        //     // this.scene.events.emit("gameover");
        //     return null;
        // }
        // if (index.x < 0) {
        //     index.x = 0;
        //     if (this.getBubble(index.x, index.y)) {
        //         index.y += 1;
        //     }
        // }
        // else if (index.x >= this.group[index.y].length) {
        //     index.x = this.group[index.y].length - 1;
        //     if (this.getBubble(index.x, index.y)) {
        //         index.y += 1;
        //     }
        // }
        // // console.log(index.x);
        // // while (this.getBubble(index.x, index.y) !== null) {
        // //     index = this.calculateIndex(playerBubble.getTopCenter().x + (index.x >= this.group[index.y].length ? (-75) : Phaser.Math.Between(-40, 40)), playerBubble.getTopCenter().y + Phaser.Math.Between(-60, 60));
        // // }
        console.log(index);
        if (overlappedBubble.getIsColliding()) return null
        if (index.x < 0) return null
        if (playerBubble.y >= (getResolution().height * 4 / 5) - 100 ) return null;
        // overlappedBubble.setProcessed(true);
        const position = this.calculatePosition(index.x, index.y);
        let newBubble = new Bubble(this.scene, position.x, position.y, this, index.x, index.y, playerBubble.getColorCode());
        this.group[index.y][index.x] = newBubble;
        this.scene.physics.add.overlap(newBubble, this.playerBubble, this.collide, null, this);
        newBubble.checkAround();
        playerBubble.setVelocity(0, 0);
        playerBubble.x = getResolution().width / 2;
        playerBubble.y = getResolution().height * 4 / 5;
        this.updatePosition();
        playerBubble.randomizeColor(this.group);
        overlappedBubble.setIsColliding(false);
    }

    getClosestNeighbor(bubbleA, bubbleB) {
        console.log("closestNeighbor");
        const offset = (this.isLongRowFirst ? bubbleA.getIndex().y % 2 : (bubbleA.getIndex().y + 1) % 2)
        const bubbleBPos = {x: bubbleB.getLeftCenter().x, y: bubbleB.getLeftCenter().y};
        let nearestNeighbor = [];
        let shortestDistance = 3000;
        neighborsoffsets[offset].forEach((neighborOffset) => {
            let x = bubbleA.getIndex().x + neighborOffset[0];
            let y = bubbleA.getIndex().y + neighborOffset[1];
            console.log(this.getBubble(x, y));
            if (!this.getBubble(x, y) && x >= 0 && x < this.getRow(y).length) {
                console.log(x);
                console.log(y);
                let position = this.calculatePosition(x, y);
                console.log(position);
                let distance = Math.abs(bubbleBPos.y - position.y) + Math.abs(bubbleBPos.x - position.x)
                console.log("distance: " + distance);
                if (distance < shortestDistance) {
                    nearestNeighbor = neighborOffset;
                    shortestDistance = distance;
                }
            }
        });
        console.log({x: bubbleA.getIndex().x, y: bubbleA.getIndex().y})
        return ({x: bubbleA.getIndex().x + nearestNeighbor[0], y: bubbleA.getIndex().y + nearestNeighbor[1]})
    }

    calculateIndex(posX, posY): any {
        let y = Math.floor((posY - 50) / 70);
        let x = Math.floor((posX - 20 - (this.isLongRowFirst? (y % 2 ? 40 : 0) : (y % 2 ? 0 : 40))) / 80);
        return {x: x, y: y};
    }

    remove(x, y): void {
        this.group[y][x] = null
    }

    getBubble(x, y): Bubble {
        if (y >= this.group.length || y < 0) return null;
        if (x >= this.group[y].length || x < 0) return null;
        return this.group[y][x];
    }

    calculatePosition(x, y): any {
        const posX = (x * 80) + (this.isLongRowFirst? (y % 2 ? 40 : 0) : (y % 2 ? 0 : 40)) + 20;
        const posY = (y * 70) + 50;
        return ({x: posX, y: posY})
    }

    updatePosition(): void {
        this.group.forEach((row, i) => {
            row.forEach((bubble, j) => {
                const position = this.calculatePosition(j, i);
                if (!bubble) return null;
                if (bubble.getIsPopped()) return null;
                // this.scene.physics.add.overlap(bubble, this.playerBubble, this.collide, null, this);
                bubble.setX(position.x);
                bubble.setY(position.y);
                bubble.setIndex(j, i);
            })
        })
    }

    addRow(): void {
        let row = [];
        this.isLongRowFirst = !this.isLongRowFirst;
        for (let i = 0; i < (this.isLongRowFirst ? this.sizeX : this.sizeX - 1); i++) {
            let colorCode = Phaser.Math.Between(0, 6);
            let position = this.calculatePosition(i, 0);
            let newBubble = new Bubble(this.scene, position.x, position.y, this, i, 0, colorCode);
            this.physicsGroup.add(newBubble);
            this.scene.physics.add.overlap(newBubble, this.playerBubble, this.collide, null, this);
            row.push(newBubble);
        }
        this.group.unshift(row);
        this.group.pop();
        this.updatePosition();
        this.sizeY += 1;
        console.log(this.group);
    }

    checkAround(indexX, indexY, colorCode = null): Array<Bubble> {
        console.log("checkaround");
        let offset = (this.isLongRowFirst ? indexY % 2 : (indexY + 1) % 2)
        let totalSimilarNeighbor = 1;
        let bubble = this.getBubble(indexX, indexY);
        let neighbors = [bubble];
        bubble.setProcessed(true);
        neighborsoffsets[offset].forEach((neighborOffset) => {
            let currentBubble = this.getBubble(indexX + neighborOffset[0], indexY + neighborOffset[1])
            if (currentBubble && ((colorCode !== null && currentBubble.getColorCode() === colorCode) || colorCode === null) && !currentBubble.getProcessed() && !currentBubble.getIsPopped()) {
                neighbors = neighbors.concat(this.checkAround(indexX + neighborOffset[0], indexY + neighborOffset[1], colorCode))
                // totalSimilarNeighbor += this.checkAround(indexX + neighborOffset[0], indexY + neighborOffset[1], colorCode).length;
            }
        })
        return neighbors;
    }

    resetProcessed(): void {
        this.group.forEach((row) => {
            row.forEach((bubble) => {
                if (!bubble) return;
                if (bubble.getIsPopped()) return;
                bubble.setProcessed(false);
            })
        })
    }

    checkFloating(): any {
        let clusters = []
        this.group.forEach((row, indexY) => {
            row.forEach((element, indexX) => {
                if (element && !element.getProcessed()) {
                    let neighbors = this.checkAround(indexX, indexY);
                    clusters.push(neighbors);
                }
            })
        })
        let fallingClusters = [];
        if (clusters.length > 1) {
            clusters.forEach((row) => {
                let stickToCeiling = false;
                row.forEach((element) => {
                    if (element && element.getRowIndex() === 0) {
                        stickToCeiling = true;
                    }
                })
                if (!stickToCeiling) fallingClusters.push(row);
            })
        }
        return fallingClusters;
    }

    getRow(y): any {
        return this.group[y]
    }

}