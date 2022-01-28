import * as Phaser from "phaser";
import Bubble from "./Bubble";

import { getResolution } from "../Util/Util";

const neighborsoffsets = [[[1, 0], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1]], // Even row tiles
                        [[1, 0], [1, 1], [0, 1], [-1, 0], [0, -1], [1, -1]]];  // Odd row tiles
export default class BubbleGroup {
    public group: Array<Array<Bubble | null>>;
    private physicsGroup: Phaser.GameObjects.Group;
    private sizeX: number;
    private maxRow = 14;
    private isLongRowFirst: Boolean;
    private scene: Phaser.Scene;
    private playerBubble;

    constructor(scene, sizeX, sizeY, playerBubble) {
        this.sizeX = sizeX;
        this.scene = scene;
        this.group = [];
        this.isLongRowFirst = true;
        this.physicsGroup = this.scene.add.group({});
        this.playerBubble = playerBubble;
        for (let i = 0; i < this.maxRow; i++) {
            let row = [];
            for (let j = 0; j < (i % 2 ? sizeX - 1 : sizeX); j++) {
                let colorCode = Phaser.Math.Between(0, 7);
                if (i < sizeY) {
                    // let newBubble = new Bubble(scene, (j * 85) + (i % 2 ? 40 : 0), (i * 75) + 50, this, j, i, colorCode);
                    // this.physicsGroup.add(newBubble);
                    let newBubble = this.createBubble((j * 85) + (i % 2 ? 110 : 70), (i * 75) + 100, j, i, colorCode);
                    row.push(newBubble);

                    // this.scene.physics.add.overlap(newBubble, this.playerBubble, this.collide, null, this);
                } else {
                    row.push(null);
                }
            }
            this.group.push(row);
        }
    }
    collide(overlappedBubble, playerBubble: Bubble): void {
        let index = overlappedBubble ?
            this.getClosestNeighbor(overlappedBubble, playerBubble) :
            this.calculateIndex(playerBubble.x, playerBubble.y);
        if (overlappedBubble && overlappedBubble.getIsColliding()) return null
        if (index.x < 0) return null
        if (playerBubble.y >= (getResolution().height * 4 / 5) - 120  || playerBubble.active === false) return null;
        // overlappedBubble.setProcessed(true);
        const position = this.calculatePosition(index.x, index.y);
        // let newBubble = new Bubble(this.scene, position.x, position.y, this, index.x, index.y, playerBubble.getColorCode());
        let newBubble = this.createBubble(position.x, position.y, index.x, index.y, playerBubble.getColorCode());
        this.group[index.y][index.x] = newBubble;
        // this.scene.physics.add.overlap(newBubble, this.playerBubble, this.collide, null, this);
        playerBubble.setActive(false);
        newBubble.checkAround();
        playerBubble.setVisible(false);
        playerBubble.setX(1000);
        playerBubble.setY(1000);
        this.scene.time.addEvent({
            delay: 100, loop: false,
            callback: () => {
                playerBubble.x = getResolution().width / 2;
                playerBubble.y = getResolution().height * 4 / 5;
                playerBubble.setVelocity(0, 0);
                playerBubble.setVisible(true)
                playerBubble.setActive(true);
            }
        })
        this.updatePosition();
        // playerBubble.randomizeColor(this.group);
        this.scene.events.emit("nextmove");
        if (overlappedBubble) overlappedBubble.setIsColliding(false);
    }

    getClosestNeighbor(bubbleA, bubbleB) {
        const offset = (this.isLongRowFirst ? bubbleA.getIndex().y % 2 : (bubbleA.getIndex().y + 1) % 2)
        const bubbleBPos = {x: bubbleB.getCenter().x, y: bubbleB.getCenter().y};
        let nearestNeighbor = [];
        let shortestDistance = 3000;
        neighborsoffsets[offset].forEach((neighborOffset) => {
            let x = bubbleA.getIndex().x + neighborOffset[0];
            let y = bubbleA.getIndex().y + neighborOffset[1];
            if (!this.getBubble(x, y) && x >= 0 && y >= 0 && x < this.getRow(y).length) {
                let position = this.calculatePosition(x, y);
                let distance = Math.abs(bubbleBPos.y - position.y) + Math.abs(bubbleBPos.x - position.x);
                if (distance < shortestDistance) {
                    nearestNeighbor = neighborOffset;
                    shortestDistance = distance;
                }
            }
        });
        return ({x: bubbleA.getIndex().x + nearestNeighbor[0], y: bubbleA.getIndex().y + nearestNeighbor[1]})
    }

    calculateIndex(posX, posY): any {
        let y = Math.floor((posY - 50) / 75);
        let x = Math.floor((posX - (this.isLongRowFirst? (y % 2 ? 40 : 0) : (y % 2 ? 0 : 40))) / 85);
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
        const posX = (x * 85) + (this.isLongRowFirst? (y % 2 ? 110 : 70) : (y % 2 ? 70 : 110));
        const posY = (y * 75) + 100;
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
            let newBubble = this.createBubble(position.x, position.y, i, 0, colorCode);
            // let newBubble = new Bubble(this.scene, position.x, position.y, this, i, 0, colorCode);
            // this.physicsGroup.add(newBubble);
            // this.scene.physics.add.overlap(newBubble, this.playerBubble, this.collide, null, this);
            row.push(newBubble);
        }
        this.group.unshift(row);
        this.group.pop();
        this.updatePosition();
    }

    checkAround(indexX, indexY, colorCode = null, checkNull = false): Array<Bubble> {
        let offset = (this.isLongRowFirst ? indexY % 2 : (indexY + 1) % 2)
        let bubble = this.getBubble(indexX, indexY);
        let neighbors = [bubble];
        bubble.setProcessed(true);
        neighborsoffsets[offset].forEach((neighborOffset) => {
            let currentBubble = this.getBubble(indexX + neighborOffset[0], indexY + neighborOffset[1]);
            if (currentBubble && ((colorCode !== null && currentBubble.getColorCode() === colorCode) || colorCode === null) 
                && !currentBubble.getProcessed() && !currentBubble.getIsPopped()) {
                neighbors = neighbors.concat(this.checkAround(indexX + neighborOffset[0], indexY + neighborOffset[1], colorCode))
                // totalSimilarNeighbor += this.checkAround(indexX + neighborOffset[0], indexY + neighborOffset[1], colorCode).length;
            }
        })
        return neighbors;
    }

    getPossibleColor(): Array<Bubble> {
      let clusters = [];
      this.group.forEach((row, indexY) => {
        row.forEach((element, indexX) => {
            if (element && !element.getProcessed()) {
                let neighbors = this.checkAround(indexX, indexY, element.getColorCode());
                clusters.push(neighbors);
            }
        })
      })
      this.resetProcessed();
      let lowestCluster = [];
      let lowestIndex = [];
      clusters.forEach((cluster) => {
        cluster.forEach((element) => {
          let index = element.getIndex();
          if (lowestIndex[index.x]) {
            if (index.y > lowestIndex[index.x]) {
              lowestIndex[index.x] = index.y;
              lowestCluster[index.x] = cluster;
            }
          } else {
            lowestIndex[index.x] = index.y;
            lowestCluster[index.x] = cluster;
          }
        })
      })
      const lengths = lowestCluster.map(a=>a.length);
      const maxLength = Math.max(...lengths);
      if (maxLength > 1) {
        let possibleCluster = [];
        lowestCluster.forEach((cluster) => {
          if (cluster.length > 1) {
            possibleCluster.push(cluster);
          }
        })
        return possibleCluster;
      } else {
        return lowestCluster;
      }
    }

    getReachableCluster(): any {
      let groupCopy = [];
      this.group.forEach((row, rowIndex) => {
        groupCopy.push([]);
        row.forEach((element) => {
          if (element) {
            groupCopy[rowIndex].push(2);
          } else {
            groupCopy[rowIndex].push(null);
          }
        })
      })
      let index = groupCopy.length - 1;
      let bubbleNeighbor = [];
      this.checkAroundNull(0, index, groupCopy, bubbleNeighbor);
      let clusters = [];
      bubbleNeighbor.forEach((bubble) => {
        clusters.push(this.checkAround(bubble.getIndex().x, bubble.getIndex().y, bubble.getColorCode()));
      })
      this.resetProcessed();
      return clusters;
    }

    checkAroundNull(indexX, indexY, groupCopy, bubbleNeighbor): any {
      let offset = (this.isLongRowFirst ? indexY % 2 : (indexY + 1) % 2)
      // let bubble = this.getBubble(indexX, indexY);
      let neighbors = [{x: indexX, y: indexY}];
      groupCopy[indexY][indexX] = 1;
      neighborsoffsets[offset].forEach((neighborOffset) => {
        let currentIndexX = indexX + neighborOffset[0];
        let currentIndexY = indexY + neighborOffset[1];
        if (currentIndexY >= 0 && currentIndexY < this.maxRow  && currentIndexX < groupCopy[currentIndexY].length && currentIndexX >= 0) {
          let currentBubble = groupCopy[indexY + neighborOffset[1]][indexX + neighborOffset[0]];
          // this.getBubble(indexX + neighborOffset[0], indexY + neighborOffset[1]);
          if (currentBubble === null) {
            neighbors.concat(this.checkAroundNull(indexX + neighborOffset[0], indexY + neighborOffset[1], groupCopy, bubbleNeighbor));
          } else if (currentBubble === 2) {
            groupCopy[currentIndexY][currentIndexX] = 3
            bubbleNeighbor.push(this.getBubble(indexX + neighborOffset[0], indexY + neighborOffset[1]));
          }
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
      });
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
        clusters.forEach((row) => {
            let stickToCeiling = false;
            row.forEach((element) => {
                if (element && element.getRowIndex() === 0) {
                    stickToCeiling = true;
                }
            })
            if (!stickToCeiling) fallingClusters.push(row);
        })
        return fallingClusters;
    }

    getRow(y): any {
        return this.group[y]
    }
    
    isEmpty(): Boolean {
        let bubbleExists = false;
        let i = 0;
        // console.log(this.group);
        while (!bubbleExists && i < this.group.length) {
            let row = this.getRow(i);
            let j = 0;
            while (!bubbleExists && j < row.length) {
                // console.log(row[j]);
                if (row[j] !== null) {
                    bubbleExists = true;
                }
                j++;
            }
            i++;
        }
        return (!bubbleExists);
    }

    createBubble(posX, posY, indexX, indexY, colorCode): Bubble {
        let currentBubble:Bubble = this.physicsGroup.getFirstDead(false);
        if (currentBubble) {
            console.log("recycle");
            currentBubble.revive(posX, posY, indexX, indexY, colorCode);
        } else {
            console.log("new bubble");
            currentBubble = new Bubble(this.scene, posX, posY, this, indexX, indexY, colorCode);
            this.scene.physics.add.overlap(currentBubble, this.playerBubble, this.collide, null, this);
            this.physicsGroup.add(currentBubble);
        }
        // this.group[indexY][indexX] = currentBubble;
        return(currentBubble);
    }

    killAndHide(bubble: Bubble): void {
        this.physicsGroup.killAndHide(bubble);
    }
    destroy(): void {
        this.physicsGroup.getChildren().forEach((elmt) => {
            elmt.destroy();
        });
        this.physicsGroup.destroy();
    }
}