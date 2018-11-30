/// <reference path="./src/avl_index.ts"/>
/// <reference path="./src/ranged_factory.ts"/>

let crypt = require("crypto"); // for less 'leaky' random string generation


class Benchmark {

   constructor() {

   }

   /**
    * Generate random string using node 'cryto' library for less memory 'leaky' string generation
    */
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

   /**
    * Garbage collection to run between benchmarks
    */
   public cleanup() {
      if (global.gc) {
         global.gc();
      }
      else {
         console.log("run with --expose-gc flag for more accurate results")
      }
   }

   /**
    * Benchmark single object (string value) lookups from our avl index
    * @param count 
    */
   public profileStringLookups(count: number) {
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

      let result: RangedIndexer[] = [];

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
      console.log("rangeRequest lookups (string value) : " + totalMS.toFixed(2) + "ms (" + rate.toFixed(2) + ") ops/s (" + count + " documents)");
   }

   /**
    * Benchmark single object (number value) lookups from our avl index
    * @param count 
    */
   public profileNumberLookups(count: number) {
      let index: IRangedIndex<number> = RangedIndexFactoryMap["avl"]("last", ComparatorMap["js"]);
      let start: [number, number], end: [number, number];
      let totalTimes = [];
      let totalMS: number = 0.0;
      let rnd: number;
      let valbuf: number[] = [];

      // insert into index
      for (let idx = 1; idx <= count; idx++) {
         rnd = count - idx;
         index.insert(idx, rnd);
         valbuf.push(rnd);
      }

      //valbuf = this.shuffle(valbuf);

      let result: RangedIndexer[] = [];

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
      console.log("rangeRequest lookups (number value) : " + totalMS.toFixed(2) + "ms (" + rate.toFixed(2) + ") ops/s (" + count + " documents)");
   }

   /**
    * Benchmark insert rates with string values
    * @param count 
    */
   public profileStringInsertion(count: number) {
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
      console.log("insert (string value) : " + totalMS.toFixed(2) + "ms (" + rate.toFixed(2) + ") ops/s (" + count + " documents)");
   }

   /**
    * Benchmark insert rates with number values
    * @param count 
    */
   public profileNumberInsertion(count: number) {
      let index: IRangedIndex<number> = RangedIndexFactoryMap["avl"]("last", ComparatorMap["js"]);
      let start: [number, number], end: [number, number];
      let totalTimes = [];
      let totalMS: number = 0.0;
      let rnd: number;

      for (let idx = 1; idx <= count; idx++) {
         rnd = count - idx;
         start = process.hrtime();
         index.insert(idx, rnd);
         end = process.hrtime(start);
         totalTimes.push(end);
      }

      for (var idx = 0; idx < totalTimes.length; idx++) {
         totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
      }

      let rate = count * 1000 / totalMS;
      console.log("insert (number value) : " + totalMS.toFixed(2) + "ms (" + rate.toFixed(2) + ") ops/s (" + count + " documents)");
   }

   /**
    * Benchmark update rates with string values
    * @param count 
    */
   public profileStringUpdates(count: number): void {
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
      console.log("update (string value) : " + totalMS.toFixed(2) + "ms (" + rate.toFixed(2) + ") ops/s (" + count + " documents)");
   }

   /**
    * Benchmark update rates with number values
    * @param count 
    */
   public profileNumberUpdates(count: number): void {
      let index: IRangedIndex<number> = RangedIndexFactoryMap["avl"]("last", ComparatorMap["js"]);
      let start: [number, number], end: [number, number];
      let totalTimes = [];
      let totalMS: number = 0.0;
      let rnd: number;

      // initial insertion
      for (let idx = 0; idx < count; idx++) {
         rnd = count - idx;
         index.insert(idx + 1, rnd);
      }

      let idbuf = index.rangeRequest();
      idbuf = this.shuffle(idbuf);

      let newValue: number;

      for (let idx = 0; idx < count; idx++) {
         newValue = count * 2 - idx;

         start = process.hrtime();
         index.update(idbuf[idx], newValue);
         end = process.hrtime(start);
         totalTimes.push(end);
      }

      for (var idx = 0; idx < totalTimes.length; idx++) {
         totalMS += totalTimes[idx][0] * 1e3 + totalTimes[idx][1] / 1e6;
      }

      let rate = count * 1000 / totalMS;
      console.log("update (number value) : " + totalMS.toFixed(2) + "ms (" + rate.toFixed(2) + ") ops/s (" + count + " documents)");
   }

   /**
    * Benchmark removal rates with string values
    * @param count 
    */
   public profileStringRemoves(count: number): void {
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
      console.log("remove (string value) : " + totalMS.toFixed(2) + "ms (" + rate.toFixed(2) + ") ops/s (" + count + " documents)");
   }

   /**
    * Benchmark removal rates with number values
    * @param count 
    */
   public profileNumberRemoves(count: number): void {
      let index: IRangedIndex<number> = RangedIndexFactoryMap["avl"]("last", ComparatorMap["js"]);
      let start: [number, number], end: [number, number];
      let totalTimes = [];
      let totalMS: number = 0.0;
      let rnd: number;

      // initial insertion
      for (let idx = 0; idx < count; idx++) {
         rnd = count - idx;
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
      console.log("remove (number value) : " + totalMS.toFixed(2) + "ms (" + rate.toFixed(2) + ") ops/s (" + count + " documents)");
   }
}

/**
 * Asynchronously run each benchmark
 * @param steps 
 */
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
   () => bench.profileNumberLookups(100000),
   () => bench.cleanup(),
   () => bench.profileNumberInsertion(100000),
   () => bench.cleanup(),
   () => bench.profileNumberUpdates(100000),
   () => bench.cleanup(),
   () => bench.profileNumberRemoves(100000),
   () => bench.cleanup(),
   () => bench.profileStringLookups(100000),
   () => bench.cleanup(),
   () => bench.profileStringInsertion(100000),
   () => bench.cleanup(),
   () => bench.profileStringUpdates(100000),
   () => bench.cleanup(),
   () => bench.profileStringRemoves(100000)
];

execSteps(steps);
