class Viewport {
	constructor(positionX=0, positionY=0) {
		this.x = positionX;
		this.y = positionY;
		this.speedX = 0;
		this.speedY = 0;

		this.acceleration = 5;
		this.resistance = 0.1;
		this.maxSpeed = (this.acceleration*(1-this.resistance))/this.resistance;
	}

	screenToWorld(screenX, screenY) {
		return [screenX+this.x-(canvas.width/2), (canvas.height/2)-screenY+this.y];
	}

	worldToScreen(worldX, worldY) {
		return [(canvas.width/2)+(worldX-this.x), (canvas.height/2)-(worldY-this.y)];
	}

	update() {
        this.speedX += (rightKey-leftKey)*this.acceleration;
		this.speedX *= (1-this.resistance);
        this.speedY += (upKey-downKey)*this.acceleration;
		this.speedY *= (1-this.resistance);

		let magnitude = Math.sqrt(this.speedX*this.speedX+this.speedY*this.speedY);
		if(magnitude > this.maxSpeed) {
			this.speedX *= (this.maxSpeed/magnitude)
			this.speedY *= (this.maxSpeed/magnitude)
		}
		
		this.x += this.speedX;
		this.y += this.speedY;
	}
}