importScripts("simplexNoise.js");

class WorldGenerator {
    constructor() {
        this.noiseFunction = new SimplexNoise(156);
    }

    sample(x, y) {
        if(y>this.noiseFunction.sample(x, 0, 0.001)*500) {
            return -1;
        }
        return Math.abs((this.noiseFunction.sample(x, y, 0.002)+this.noiseFunction.sample(x, y, 0.0002)+this.noiseFunction.sample(x, y, 0.00002))/3)-0.09-(y/100000);
    }
}