/// <reference path="./src/avl_index.ts"/>
/// <reference path="./src/ranged_factory.ts"/>

let crypt = require("crypto"); // for less 'leaky' random string generation


class Benchmark {

   constructor() {

   }

   private generateRandomString(): string {
      return crypt.randomBytes(50).toString('hex');
   }

   private shuffle(array: any[]): any[] {
      let currentIndex = array.length, temporaryValue, randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {

         // Pick a remaining element...
         randomIndex = Math.floor(Math.random() * currentIndex);
         currentIndex -= 1;

         // And swap it with the current element.
         temporaryValue = array[currentIndex];
         array[currentIndex] = array[randomIndex];
         array[randomIndex] = temporaryValue;
      }

      return array;
   }

   public cleanup() {
      if (global.gc) {
         global.gc();
      }
      else {
         console.log("run with --expose-gc flag for more accurate results")
      }
   }

   public profileLookups(count: number) {
      this.cleanup();

      let index: IRangedIndex<string> = RangedIndexFactoryMap["avl"]("last", ComparatorMap["js"]);
      let start: [number, number], end: [number, number];
      let totalTimes = [];
      let totalMS: number = 0.0;
      let rnd: string = "";
      let valbuf: string[] = [];

      for (let idx = 1; idx <= count; idx++) {
         rnd = this.generateRandomString();
         index.insert(idx, rnd);
         valbuf.push(rnd);
      }

      //valbuf = this.shuffle(valbuf);

      let result: number[] = [];

      for (let idx = 0; idx < count; idx++) {
         start = process.hrtime();
         result = index.rangeRequest({ op: "$eq", val: valbuf[idx] });
         end = process.hrtime(start);
         totalTimes.push(end);
         if (result.length !== 1) {
            throw new Error("Did not find previously inserted value");
         }
      }

      for (var idx = 0; idx < totalTimes.length; idx++) {
         totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
      }

      let rate = count * 1000 / totalMS;
      console.log("rangeRequest (lookups) : " + totalMS.toFixed(2) + "ms (" + rate.toFixed(2) + ") ops/s (" + count + " documents)");
   }

   public profileInsertion(count: number) {
      this.cleanup();

      let index: IRangedIndex<string> = RangedIndexFactoryMap["avl"]("last", ComparatorMap["js"]);
      let start: [number, number], end: [number, number];
      let totalTimes = [];
      let totalMS: number = 0.0;
      let rnd: string = "";

      for (let idx = 1; idx <= count; idx++) {
         rnd = this.generateRandomString();
         start = process.hrtime();
         index.insert(idx, rnd);
         end = process.hrtime(start);
         totalTimes.push(end);
      }

      for (var idx = 0; idx < totalTimes.length; idx++) {
         totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
      }

      let rate = count * 1000 / totalMS;
      console.log("load (individual inserts) : " + totalMS.toFixed(2) + "ms (" + rate.toFixed(2) + ") ops/s (" + count + " documents)");
   }

   public profileUpdates(count: number): void {
      this.cleanup();

      let index: IRangedIndex<string> = RangedIndexFactoryMap["avl"]("last", ComparatorMap["js"]);
      let start: [number, number], end: [number, number];
      let totalTimes = [];
      let totalMS: number = 0.0;
      let rnd: string = "";

      // initial insertion
      for (let idx = 0; idx < count; idx++) {
         rnd = this.generateRandomString();
         index.insert(idx + 1, rnd);
      }

      let idbuf = index.rangeRequest();
      idbuf = this.shuffle(idbuf);

      let newValue: string = "";

      for (let idx = 0; idx < count; idx++) {
         newValue = this.generateRandomString();

         start = process.hrtime();
         index.update(idbuf[idx], newValue);
         end = process.hrtime(start);
         totalTimes.push(end);
      }

      for (var idx = 0; idx < totalTimes.length; idx++) {
         totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
      }

      let rate = count * 1000 / totalMS;
      console.log("update : " + totalMS.toFixed(2) + "ms (" + rate.toFixed(2) + ") ops/s (" + count + " documents)");
   }

   public profileRemoves(count: number): void {
      this.cleanup();

      let index: IRangedIndex<string> = RangedIndexFactoryMap["avl"]("last", ComparatorMap["js"]);
      let start: [number, number], end: [number, number];
      let totalTimes = [];
      let totalMS: number = 0.0;
      let rnd: string = "";

      // initial insertion
      for (let idx = 0; idx < count; idx++) {
         rnd = this.generateRandomString();
         index.insert(idx + 1, rnd);
      }

      let idbuf = index.rangeRequest();
      idbuf = this.shuffle(idbuf);

      for (let idx = 0; idx < count; idx++) {
         start = process.hrtime();
         index.remove(idbuf[idx]);
         end = process.hrtime(start);
         totalTimes.push(end);
      }

      for (var idx = 0; idx < totalTimes.length; idx++) {
         totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
      }

      let rate = count * 1000 / totalMS;
      console.log("remove : " + totalMS.toFixed(2) + "ms (" + rate.toFixed(2) + ") ops/s (" + count + " documents)");
   }
}

function execSteps(steps: Function[]) {
   if (steps.length === 0) {
      return;
   }

   let s = steps.shift();
   if (!s) return;
   s();

   setTimeout(() => { execSteps(steps); }, 1);
}

var bench = new Benchmark();

let steps: Function[] = [
   () => bench.cleanup(),
   () => bench.profileLookups(100000),
   () => bench.profileInsertion(100000),
   () => bench.profileUpdates(100000),
   () => bench.profileRemoves(100000)
];

execSteps(steps);
