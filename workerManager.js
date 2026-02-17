class WorkerManager {
  constructor() {
    this.currentWorkCount = 0;
    this.worker = new Worker("chunkWorker.js");
  }

  
}
