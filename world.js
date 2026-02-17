class World {
	constructor() {
		this.mainViewport = null;
        this.chunks = new Map();
		this.noiseScale = 0.001;
		this.seed = 1;
		this.isoLevel = 0;
	}

	attachViewport(viewport) {
		this.mainViewport = viewport;
	}

	updateChunks(viewportBuffer) {
		let chunkStart = [Math.floor((this.mainViewport.x-(canvas.width/2+viewportBuffer))/(chunkSize*chunkResolution)), Math.floor((this.mainViewport.y-(canvas.height/2+viewportBuffer))/(chunkSize*chunkResolution))]
		let chunkEnd = [Math.floor((this.mainViewport.x+(canvas.width/2+viewportBuffer))/(chunkSize*chunkResolution)), Math.floor((this.mainViewport.y+(canvas.height/2+viewportBuffer))/(chunkSize*chunkResolution))]

		let newChunks = new Map();
		for(let x = chunkStart[0]; x <= chunkEnd[0]; x++) {
			for(let y = chunkStart[1]; y <= chunkEnd[1]; y++) {
				let key = x+","+y;
				if(this.chunks.has(key)) {
					newChunks.set(key, this.chunks.get(key));
				} else {
					newChunks.set(key, new Chunk(x, y, this.noiseScale, this.seed, this.isoLevel));
				}
			}
		}
		
		for (let [key, chunk] of this.chunks) {
			if (!newChunks.has(key)) {
				if (chunk.chunkWorker) {
					chunk.chunkWorker.terminate();
				}
			}
    	}

		this.chunks = newChunks;
	}

	render() {
		this.mainViewport.update();
		this.updateChunks(1000);
		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		this.chunks.forEach(chunk => {
			chunk.render(this.mainViewport);
		});
	}
}