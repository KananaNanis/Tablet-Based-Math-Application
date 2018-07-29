import * as AT from './actionTypes'

/*  example action objects
{
  type : AT.TOWER_CREATE,
  id : 'num4',
  name : [],
  position : [20, 0]
}
{
  type : AT.SET_NAME,
  id : 'num4',
  name : [2],
}
{
  type : AT.SET_POSITION,
  id : 'num4',
  position : [30, 0]
}
*/

export function towerCreate(id, name, position) {
  return { type: AT.TOWER_CREATE, id, name, position }
}

export function tileCreate(id, name, position) {
  return { type: AT.TILE_CREATE, id, name, position }
}

export function doorCreate(id, name, position) {
  return { type: AT.DOOR_CREATE, id, name, position }
}

export function towerDelete(id) {
  return { type: AT.TOWER_DELETE, id }
}

export function tileDelete(id, name, position) {
  return { type: AT.TILE_DELETE, id }
}

export function doorDelete(id, name, position) {
  return { type: AT.DOOR_DELETE, id }
}

export function setName(id, name) {
  return { type: AT.SET_NAME, id, name }
}

export function towerAddBlock(id, size, is_fiver) {
  return { type: AT.TOWER_ADD_BLOCK, id, size, is_fiver }
}

export function towerRemoveBlock(id) {
  return { type: AT.TOWER_REMOVE_BLOCK, id }
}

export function setPosition(id, position) {
  return { type: AT.SET_POSITION, id, position }
}

export function setOpacity(id, opacity) {
  return { type: AT.SET_OPACITY, id, opacity }
}

export function setAnimInfo(id, anim_info) {
  return { type: AT.SET_ANIM_INFO, id, anim_info }
}

export function towerSetWidth(id, width) {
  return { type: AT.TOWER_SET_WIDTH, id, width }
}

export function towerSetOverflow(id, overflow) {
  return { type: AT.TOWER_SET_OVERFLOW, id, overflow }
}

export function towerSetBlockOpacity(id, index, opacity) {
  return { type: AT.TOWER_SET_BLOCK_OPACITY, id, index, opacity }
}

export function setScaleFactor(val) {
  return { type: AT.SET_SCALE_FACTOR, val }
}

export function setKeypadKind(kind) {
  return { type: AT.SET_KEYPAD_KIND, kind }
}

export function setButtonDisplay(index, val) {
  return { type: AT.SET_BUTTON_DISPLAY, index, val }
}

export function setButtonHighlight(index) {
  return { type: AT.SET_BUTTON_HIGHLIGHT, index }
}

export function setFreezeDisplay(t) {
  return { type: AT.SET_FREEZE_DISPLAY, t }
}

export function setNumStars(n) {
  //console.log('setNumStars', n)
  return { type: AT.SET_NUM_STARS, n }
}

export function setConfigPath(c) {
  return { type: AT.SET_CONFIG_PATH, c }
}

export function setConfigIteration(n) {
  return { type: AT.SET_CONFIG_ITERATION, n }
}

export function setPrevConfigPath(c) {
  return { type: AT.SET_PREV_CONFIG_PATH, c }
}

export function setCenterText(text) {
  return { type: AT.SET_CENTER_TEXT, text }
}

export function setErrBox(info) {
  return { type: AT.SET_ERR_BOX, info }
}

export function resetAll() {
  return { type: AT.RESET_ALL }
}