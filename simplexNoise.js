class SimplexNoise {
    constructor(seed) {
        this.seed = seed;
        this.basePermutation = new Uint8Array(256);
        for (let i = 0; i < 256; i++) {
            this.basePermutation[i] = i;
        }

        let randomState = seed;
        for (let i = 255; i > 0; i--) {
            randomState = (randomState*9301+49297)%233280;
            let randomIndex = Math.floor((randomState/233280)*(i+1));
            
            [this.basePermutation[i], this.basePermutation[randomIndex]] = [this.basePermutation[randomIndex], this.basePermutation[i]];
        }

        this.permutationTable = new Uint8Array(512);
        for (let i = 0; i < 512; i++) {
            this.permutationTable[i] = this.basePermutation[i & 255];
        }

        this.gradientVectors = [];
        for(let i = 0; i < 360; i+=10) {
            let rad = i*(Math.PI/180);
            this.gradientVectors.push([Math.cos(rad), Math.sin(rad)]);
        }
        /*
        for(let i = 0; i < 360; i+=10) {
            let rad = i*(Math.PI/180);
            this.gradientVectors.push([Math.cos(rad)*0.5, Math.sin(rad)*0.5]);
        }
        for(let i = 0; i < 360; i+=10) {
            let rad = i*(Math.PI/180);
            this.gradientVectors.push([Math.cos(rad)*1.5, Math.sin(rad)*1.5]);
        }*/

        this.skewFactor = 0.5*(Math.sqrt(3)-1);
        this.unskewFactor = (1-1/Math.sqrt(3))/2;
        this.numGradients = this.gradientVectors.length;
    }

    sample(xInput, yInput, scale) {
        let temp0, temp1, temp2;
        xInput = xInput*scale;
        yInput = yInput*scale;

        temp0 = (xInput+yInput);
        let skewedX = xInput+temp0*this.skewFactor;
        let skewedY = yInput+temp0*this.skewFactor;

        let baseX = Math.floor(skewedX);
        let baseY = Math.floor(skewedY);

        let middleCornerX, middleCornerY;
        if((skewedX-baseX)<(skewedY-baseY)) {
            middleCornerX = 0;
            middleCornerY = 1;
        } else {
            middleCornerX = 1;
            middleCornerY = 0;
        }
        
        let baseInRangeX = baseX&255;
        let baseInRangeY = baseY&255;

        /*
        let gradient0 = this.gradientVectors[Math.floor(Math.random()*this.gradientVectors.length)];
        let gradient1 = this.gradientVectors[Math.floor(Math.random()*this.gradientVectors.length)];
        let gradient2 = this.gradientVectors[Math.floor(Math.random()*this.gradientVectors.length)];
        */
        let gradient0 = this.gradientVectors[this.permutationTable[this.permutationTable[baseInRangeY]+baseInRangeX]%this.numGradients];
        let gradient1 = this.gradientVectors[this.permutationTable[this.permutationTable[baseInRangeY+middleCornerY]+(baseInRangeX+middleCornerX)]%this.numGradients];
        let gradient2 = this.gradientVectors[this.permutationTable[this.permutationTable[baseInRangeY+1]+(baseInRangeX+1)]%this.numGradients];

        
        middleCornerX += baseX;
        middleCornerY += baseY;
        let lastCornerX = baseX+1;
        let lastCornerY = baseY+1;
        
        temp0 = (baseX+baseY);
        temp1 = (middleCornerX+middleCornerY);
        temp2 = (lastCornerX+lastCornerY);

        let rSquare = 0.5;

        let diffX0 = xInput-(baseX-temp0*this.unskewFactor);
        let diffY0 = yInput-(baseY-temp0*this.unskewFactor);
        temp0 = Math.max(0, rSquare-(diffX0*diffX0+diffY0*diffY0));
        temp0 = temp0*temp0*temp0*temp0;
        let contribution0 = temp0*(gradient0[0]*diffX0+gradient0[1]*diffY0);

        let diffX1 = xInput-(middleCornerX-temp1*this.unskewFactor);
        let diffY1 = yInput-(middleCornerY-temp1*this.unskewFactor);
        temp0 = Math.max(0, rSquare-(diffX1*diffX1+diffY1*diffY1));
        temp0 = temp0*temp0*temp0*temp0;
        let contribution1 = temp0*(gradient1[0]*diffX1+gradient1[1]*diffY1);

        let diffX2 = xInput-(lastCornerX-temp2*this.unskewFactor);
        let diffY2 = yInput-(lastCornerY-temp2*this.unskewFactor);
        temp0 = Math.max(0, rSquare-(diffX2*diffX2+diffY2*diffY2));
        temp0 = temp0*temp0*temp0*temp0;
        let contribution2 = temp0*(gradient2[0]*diffX2+gradient2[1]*diffY2);

        return 60*(contribution0+contribution1+contribution2);
    }
}