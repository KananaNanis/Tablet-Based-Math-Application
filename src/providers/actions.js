import {
  SET_NAME,
  SET_POSITION,
  SET_OPACITY,
  TOWER_CREATE,
  TOWER_DELETE,
  TOWER_ADD_BLOCK,
  TOWER_REMOVE_BLOCK,
  TOWER_SET_WIDTH,
  TOWER_SET_OVERFLOW,
  TOWER_SET_BLOCK_OPACITY,
  TILE_CREATE,
  TILE_DELETE,
  LIFT_CREATE,
  LIFT_DELETE,
  SET_SCALE_FACTOR,
  SET_KEYPAD_KIND,
  SET_BUTTON_DISPLAY,
  SET_BUTTON_HIGHLIGHT,
  SET_NUM_STARS
} from './actionTypes'

/*  example action objects
{
  type : TOWER_CREATE,
  id : 'num4',
  name : [],
  position : [20, 0]
}
{
  type : SET_NAME,
  id : 'num4',
  name : [2],
}
{
  type : SET_POSITION,
  id : 'num4',
  position : [30, 0]
}
*/

export function towerCreate(id, name, position) {
  return { type: TOWER_CREATE, id, name, position }
}

export function tileCreate(id, name, position) {
  return { type: TILE_CREATE, id, name, position }
}

export function liftCreate(id, name, position) {
  return { type: LIFT_CREATE, id, name, position }
}

export function towerDelete(id) {
  return { type: TOWER_DELETE, id }
}

export function tileDelete(id, name, position) {
  return { type: TILE_DELETE, id }
}

export function liftDelete(id, name, position) {
  return { type: LIFT_DELETE, id }
}

export function setName(id, name) {
  return { type: SET_NAME, id, name }
}

export function towerAddBlock(id, size, is_fiver) {
  return { type: TOWER_ADD_BLOCK, id, size, is_fiver }
}

export function towerRemoveBlock(id) {
  return { type: TOWER_REMOVE_BLOCK, id }
}

export function setPosition(id, position) {
  return { type: SET_POSITION, id, position }
}

export function setOpacity(id, opacity) {
  return { type: SET_OPACITY, id, opacity }
}

export function towerSetWidth(id, width) {
  return { type: TOWER_SET_WIDTH, id, width }
}

export function towerSetOverflow(id, overflow) {
  return { type: TOWER_SET_OVERFLOW, id, overflow }
}

export function towerSetBlockOpacity(id, index, opacity) {
  return { type: TOWER_SET_BLOCK_OPACITY, id, index, opacity }
}

export function setScaleFactor(val) {
  return { type: SET_SCALE_FACTOR, val }
}

export function setKeypadKind(kind) {
  return { type: SET_KEYPAD_KIND, kind }
}

export function setButtonDisplay(index, val) {
  return { type: SET_BUTTON_DISPLAY, index, val }
}

export function setButtonHighlight(index) {
  return { type: SET_BUTTON_HIGHLIGHT, index }
}

export function setNumStars(n) {
  return { type: SET_NUM_STARS, n }
}