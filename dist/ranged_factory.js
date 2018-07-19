"use strict";
/**
 * Rough, Initial interfaces for creation of various implementations of ranged indexes.
 * Not sure how these might change or where they might be relocated to.
 */
/* import { BinaryTreeIndex } from "./btree_index"; */
/* global (for now) comparator hashmap... static registry rather than factory */
let ComparatorMap = {
    "js": CreateJavascriptComparator(),
    "abstract": CreateAbstractComparator()
};
/* global rangedIndex factory hashmap */
let RangedIndexFactoryMap = {
    "avl": (name, comparator) => { return new BinaryTreeIndex(name, comparator); }
};
function CreateJavascriptComparator() {
    return {
        compare(val, val2) {
            if (val === val2)
                return 0;
            if (val < val2)
                return -1;
            return 1;
        }
    };
}
function CreateAbstractComparator() {
    return {
        compare(val, val2) {
            if (aeqHelper(val, val2))
                return 0;
            if (ltHelper(val, val2, false))
                return -1;
            return 1;
        }
    };
}
//# sourceMappingURL=ranged_factory.js.map