class Chunk {
	constructor(gridCoordX, gridCoordY, noiseScale, seed, isoLevel) {
		this.gridCoordX = gridCoordX;
		this.gridCoordY = gridCoordY;

		this.worldX = this.gridCoordX*chunkSize*chunkResolution;
		this.worldY = this.gridCoordY*chunkSize*chunkResolution;

        this.path = new Path2D();

        this.chunkWorker = new Worker("chunkWorker.js");

        this.chunkWorker.postMessage({
            gridCoordX: gridCoordX,
            gridCoordY: gridCoordY,
            noiseScale: noiseScale,
            seed: seed,
            isoLevel: isoLevel,
            chunkSize: chunkSize,
            chunkResolution: chunkResolution,
        });

        this.chunkWorker.onmessage = (e) => {
            this.bake(e.data);

            this.chunkWorker.terminate();
        };

        this.bakedImage;
	}
    
    bake(rawShapeData) {
        for(let i = 0; i < rawShapeData.length; i += 3) {
            let command = rawShapeData[i];
            let pointX = rawShapeData[i+1];
            let pointY = rawShapeData[i+2];

            if(command==0) {
                this.path.moveTo(pointX, pointY);
            } else if(command==1) {
                this.path.lineTo(pointX, pointY);
            } else if(command==2) {
                this.path.closePath();
            }
        }

        let chunkCanvas = document.createElement('canvas');
        chunkCanvas.width = chunkSize*chunkResolution;
        chunkCanvas.height = chunkSize*chunkResolution;
        let bCtx = chunkCanvas.getContext('2d');

        bCtx.translate(0, chunkSize*chunkResolution);

        bCtx.fillStyle = "#00ff00";
        bCtx.fill(this.path);

        createImageBitmap(chunkCanvas).then(bitmap => {
            this.bakedImage = bitmap;
            this.isLoaded = true;
            this.path = null; 
        });
    }

    
	render(viewport) {
        if (!this.isLoaded) return;

        const screenPos = viewport.worldToScreen(this.worldX, this.worldY);
        
        ctx.drawImage(this.bakedImage, screenPos[0], screenPos[1]-chunkResolution*chunkSize);
	}
}