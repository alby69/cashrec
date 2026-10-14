export function createWorker() {
  const src = window.__CASHREC_WORKER_SOURCE__;
  if (typeof src === 'string') {
    const url = URL.createObjectURL(new Blob([src], { type: 'application/javascript' }));
    const worker = new Worker(url);
    worker.__blobUrl = url;
    return worker;
  }
  return new Worker('static/js/worker.js');
}
