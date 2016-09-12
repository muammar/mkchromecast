// samples borrowed from http://www.2ality.com/2014/09/es6-modules-final.html

// Default exports and named exports
import theDefault, {   named1, named2   } from 'src/mylib';
import theDefault from 'src/mylib';
import {   named1, named2   } from 'src/mylib';

// Renaming: import named1 as myNamed1
import {   named1 as myNamed1, named2   } from 'src/mylib';

// Importing the module as an object
// (with one property per named export)
import * as mylib from 'src/mylib';

// Only load the module, don’t import anything
import 'src/mylib';

export var myVar1 = 123;
export let myVar2 = 'foo';
export const MY_CONST = 'BAR';

export function myFunc() {
  return 'myfunc';
}

export function* myGeneratorFunc() {
  return yield someStuff();
}
export class MyClass {
  constructor() {
    this.name = 'exports test';
  }
}

export default 123;
export default function (x) {
  return x
}
export default x => x;
export default class {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

export {   MY_CONST, myFunc   };
export {   MY_CONST as THE_CONST, myFunc as theFunc   };

export * from 'src/other_module';
export {   foo, bar   } from 'src/other_module';
export {   foo as myFoo, bar   } from 'src/other_module';
