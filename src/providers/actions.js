import {
  NUM_CREATE,
  NUM_SET_NAME,
  NUM_ADD_BLOCK,
  NUM_REMOVE_BLOCK,
  NUM_SET_POSITION,
  NUM_SET_OPACITY,
  NUM_SET_TOWER_WIDTH,
  NUM_SET_TOWER_OVERFLOW,
  NUM_SET_BLOCK_OPACITY,
  SET_SCALE_FACTOR,
  SET_KEYPAD_KIND,
  SET_BUTTON_HIGHLIGHT
} from './actionTypes';

/*  example action objects
{
  type : NUM_CREATE,
  id : 'num4',
  name : [],
  position : [20, 0]
}
{
  type : NUM_SET_NAME,
  id : 'num4',
  name : [2],
}
{
  type : NUM_SET_POSITION,
  id : 'num4',
  position : [30, 0]
}
*/

export function numCreate(id, name, position) {
  return { type: NUM_CREATE, id, name, position }
}

export function numSetName(id, name) {
  return { type: NUM_SET_NAME, id, name }
}

export function numAddBlock(id, size, is_fiver) {
  return { type: NUM_ADD_BLOCK, id, size, is_fiver }
}

export function numRemoveBlock(id) {
  return { type: NUM_REMOVE_BLOCK, id }
}

export function numSetPosition(id, position) {
  return { type: NUM_SET_POSITION, id, position }
}

export function numSetOpacity(id, opacity) {
  return { type: NUM_SET_OPACITY, id, opacity }
}

export function numSetTowerWidth(id, width) {
  return { type: NUM_SET_TOWER_WIDTH, id, width }
}

export function numSetTowerOverflow(id, overflow) {
  return { type: NUM_SET_TOWER_OVERFLOW, id, overflow }
}

export function numSetBlockOpacity(id, index, opacity) {
  return { type: NUM_SET_BLOCK_OPACITY, id, index, opacity }
}

export function setScaleFactor(val) {
  return { type: SET_SCALE_FACTOR, val }
}

export function setKeypadKind(kind) {
  return { type: SET_KEYPAD_KIND, kind }
}

export function setButtonHighlight(index) {
  return { type: SET_BUTTON_HIGHLIGHT, index }
}
