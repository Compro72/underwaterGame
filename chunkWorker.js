importScripts("worldGenerator.js");

//   7-------2-------6
//   |               |
//   |               |
//   3               1
//   |               |
//   |               |
//   4-------0-------5

const marchingSquaresStates = [
    [],
    [[4, 0, 3]],
    [[5, 0, 1]],
    [[4, 3, 1, 5]],
    [[6, 1, 2]],
    [[4, 0, 3], [6, 1, 2]],
    [[5, 6, 2, 0]],
    [[4, 3, 2, 6, 5]],
    [[7, 2, 3]],
    [[4, 0, 2, 7]],
    [[5, 0, 1], [7, 2, 3]],
    [[4, 5, 1, 2, 7]],
    [[1, 3, 7, 6]],
    [[4, 0, 1, 6, 7]],
    [[0, 3, 7, 6, 5]],
    [[4, 5, 6, 7]]
];

class ChunkWorker {
	constructor(gridCoordX, gridCoordY, noiseScale, seed, isoLevel, chunkSize, chunkResolution) {
		this.gridCoordX = gridCoordX;
		this.gridCoordY = gridCoordY;

		this.worldX = this.gridCoordX*chunkSize*chunkResolution;
		this.worldY = this.gridCoordY*chunkSize*chunkResolution;

		this.isoLevel = isoLevel;
		this.chunkSize = chunkSize;
		this.chunkResolution = chunkResolution;
        this.noiseSize = (chunkSize+1);

		this.noiseData = new Float32Array(this.noiseSize*this.noiseSize);
        this.worldGenerator = new WorldGenerator();
        this.shapeData = new Float32Array(this.chunkSize*this.chunkSize*18);
		this.nextEmptyShapeData = 0;

		this.generateNoise();
        this.generateGeometry();
	}

    generateNoise() {
        for (let x = 0; x <= this.chunkSize; x++) {
            for (let y = 0; y <= this.chunkSize; y++) {
                this.noiseData[x*this.noiseSize+y] = this.worldGenerator.sample(this.worldX+(x*this.chunkResolution), this.worldY+(y*this.chunkResolution)); 
            }
        }
    }

	generateGeometry() {
		for (let x = 0; x < this.chunkSize; x++) {
			for (let y = 0; y < this.chunkSize; y++) {
				this.generateCell(x, y); 
			}
		}
	}

	generateCell(cellX, cellY) {
		let index = 0;

        let corner0 = this.noiseData[cellX*this.noiseSize+cellY];
        let corner1 = this.noiseData[(cellX+1)*this.noiseSize+cellY];
        let corner2 = this.noiseData[(cellX+1)*this.noiseSize+(cellY+1)];
        let corner3 = this.noiseData[cellX*this.noiseSize+(cellY+1)];

		let stateIndex = 1*(corner0>this.isoLevel)+2*(corner1>this.isoLevel)+4*(corner2>this.isoLevel)+8*(corner3>this.isoLevel);

		let baseX = cellX*this.chunkResolution;
		let baseY = cellY*this.chunkResolution;

        let polygons = marchingSquaresStates[stateIndex];
        for(let i = 0; i < polygons.length; i++) {
                this.shapeData[this.nextEmptyShapeData] = 0;
				this.nextEmptyShapeData++;
                this.shapeData[this.nextEmptyShapeData] = this.getPointX(polygons[i][0], corner0, corner1, corner2, corner3, baseX);
				this.nextEmptyShapeData++;
                this.shapeData[this.nextEmptyShapeData] = this.getPointY(polygons[i][0], corner0, corner1, corner2, corner3, baseY);
				this.nextEmptyShapeData++;

            for (let j = 1; j < polygons[i].length; j++) {
                this.shapeData[this.nextEmptyShapeData] = 1;
				this.nextEmptyShapeData++;
                this.shapeData[this.nextEmptyShapeData] = this.getPointX(polygons[i][j], corner0, corner1, corner2, corner3, baseX);
				this.nextEmptyShapeData++;
                this.shapeData[this.nextEmptyShapeData] = this.getPointY(polygons[i][j], corner0, corner1, corner2, corner3, baseY);
				this.nextEmptyShapeData++;
            }

            this.shapeData[this.nextEmptyShapeData] = 2;
			this.nextEmptyShapeData++;
            this.shapeData[this.nextEmptyShapeData] = 0;
			this.nextEmptyShapeData++;
            this.shapeData[this.nextEmptyShapeData] = 0;
			this.nextEmptyShapeData++;
        }
	}

	interpolate(corner0, corner1) {
		//return 0.5;
		return (this.isoLevel-corner0)/(corner1-corner0);
	}

	getPointX(id, corner0, corner1, corner2, corner3, baseX) {
		if(id==0) {
			return baseX+this.chunkResolution*this.interpolate(corner0, corner1);
		} else if(id==1) {
			return baseX+this.chunkResolution;
		} else if(id==2) {
			return baseX+this.chunkResolution*this.interpolate(corner3, corner2);
		} else if(id==3) {
			return baseX;
		} else if(id==4) {
			return baseX;
		} else if(id==5) {
			return baseX+this.chunkResolution;
		} else if(id==6) {
			return baseX+this.chunkResolution;
		} else if(id==7) {
			return baseX;
		}
	}

	getPointY(id, corner0, corner1, corner2, corner3, baseY) {
		if(id==0) {
			return -(baseY);
		} else if(id==1) {
			return -(baseY+this.chunkResolution*this.interpolate(corner1, corner2));
		} else if(id==2) {
			return -(baseY+this.chunkResolution);
		} else if(id==3) {
			return -(baseY+this.chunkResolution*this.interpolate(corner0, corner3));
		} else if(id==4) {
			return -baseY;
		} else if(id==5) {
			return -baseY;
		} else if(id==6) {
			return -(baseY+this.chunkResolution);
		} else if(id==7) {
			return -(baseY+this.chunkResolution);
		}
	}
}

self.onmessage = function(e) {
    let {gridCoordX, gridCoordY, noiseScale, seed, isoLevel, chunkSize, chunkResolution} = e.data;

    let chunkWorker = new ChunkWorker(gridCoordX, gridCoordY, noiseScale, seed, isoLevel, chunkSize, chunkResolution);
    
    self.postMessage(chunkWorker.shapeData);
};