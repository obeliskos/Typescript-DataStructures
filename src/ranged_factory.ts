/**
 * Ranged Index Factory and Comparator registry.
 */

/* global comparator hashmap... static registry rather than factory */
let ComparatorMap: IComparatorMap = {
   "js": CreateJavascriptComparator<any>(),
   "abstract": CreateAbstractComparator()
};

/* global rangedIndex factory hashmap */
let RangedIndexFactoryMap: IRangedIndexFactoryMap = {
   "avl": (name: string, comparator: IRangedComparer<any>) => { return new AvlIndex(name, comparator); }
};

function CreateJavascriptComparator<T>(): IRangedComparer<T> {
   return {
      compare(val: T, val2: T) {
         if (val === val2) return 0;
         if (val < val2) return -1;
         return 1;
      }
   };
}

function CreateAbstractComparator(): IRangedComparer<any> {
   return {
      compare(val: any, val2: any) {
         if (aeqHelper(val, val2)) return 0;
         if (ltHelper(val, val2, false)) return -1;
         return 1;
      }
   };
}

