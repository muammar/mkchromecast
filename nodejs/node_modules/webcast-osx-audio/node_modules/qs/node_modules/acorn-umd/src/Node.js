import {merge} from 'lodash';
import {Node} from 'acorn';

export default class NodeHelper extends Node {
  constructor(settings) {
    merge(this, settings);
  }
}
