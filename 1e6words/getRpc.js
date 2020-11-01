import { Rpc } from "./rpc.js";

let waitSingal;
const waitPromise = new Promise(d => (waitSingal = d));

const rpc = new Rpc();
rpc.addMethods({
  workerReady() {
		console.log("workerReady");
		waitSingal({ rpc });
  },
  informProgress(info) {
		console.log("informProgress", info);
  }
});

const worker = new Worker("./worker.js");
worker.onmessage = ({ data }) => rpc.getIn()(data);
rpc.setOut(msg => worker.postMessage(msg));
globalThis.rpc = rpc;
globalThis.worker=worker

console.log(worker)

async function getRpc() {
  return waitPromise;
}

export { getRpc };
