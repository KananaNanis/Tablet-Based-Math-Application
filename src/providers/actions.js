import * as AT from './actionTypes'
import { List, fromJS } from 'immutable'
import { global_constant } from '../App';

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
  return { type: AT.TOWER_CREATE, id, name: fromJS(name), position: fromJS(position) }
}

export function tileCreate(id, name, position) {
  return { type: AT.TILE_CREATE, id, name, position: fromJS(position) }
}

export function doorCreate(id, name, position) {
  return { type: AT.DOOR_CREATE, id, name: fromJS(name), position: fromJS(position) }
}

export function portalCreate(id, name, position) {
  return { type: AT.PORTAL_CREATE, id, name: fromJS(name), position: fromJS(position) }
}

export function towerDelete(id) {
  return { type: AT.TOWER_DELETE, id }
}

export function tileDelete(id) {
  return { type: AT.TILE_DELETE, id }
}

export function doorDelete(id) {
  return { type: AT.DOOR_DELETE, id }
}

export function portalDelete(id) {
  return { type: AT.PORTAL_DELETE, id }
}

export function setName(id, name) {
  return { type: AT.SET_NAME, id, name: fromJS(name) }
}

export function towerAddBlock(id, size, is_fiver) {
  return { type: AT.TOWER_ADD_BLOCK, id, size, is_fiver }
}

export function towerRemoveBlock(id) {
  return { type: AT.TOWER_REMOVE_BLOCK, id }
}

export function setPosition(id, position) {
  return { type: AT.SET_POSITION, id, position: fromJS(position) }
}

export function addObjStyle(id, key, value) {
  return { type: AT.ADD_OBJ_STYLE, id, key, value: fromJS(value) }
}

export function addObjMisc(id, key, value) {
  return { type: AT.ADD_OBJ_MISC, id, key, value: fromJS(value) }
}

export function setAnimInfo(id, anim_info) {
  return { type: AT.SET_ANIM_INFO, id, anim_info: fromJS(anim_info) }
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
  //console.log('setButtonDisplay', index, val)
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

export function setConfigIteration(n) {
  return { type: AT.SET_CONFIG_ITERATION, n }
}

export function setSkipSubmit(g) {
  return { type: AT.SET_SKIP_SUBMIT, g }
}

export function setSkipInBetween(g) {
  return { type: AT.SET_SKIP_IN_BETWEEN, g }
}

export function setGotoIteration(n) {
  return { type: AT.SET_GOTO_ITERATION, n }
}

export function setCenterText(text) {
  return { type: AT.SET_CENTER_TEXT, text }
}

export function setTopRightText(text) {
  return { type: AT.SET_TOP_RIGHT_TEXT, text }
}

export function clearEventHandling() {
  return { type: AT.CLEAR_EVENT_HANDLING }
}

export function setEventHandlingParam(key, val) {
  return { type: AT.SET_EVENT_HANDLING_PARAM, key, val }
}

export function setErrBox(info) {
  //console.log('setErrBox ', info)
  return { type: AT.SET_ERR_BOX, info: fromJS(info) }
}

/*
export function setConfigPath(c) {
  return { type: AT.SET_CONFIG_PATH, c: fromJS(c) }
}

export function setPrevConfigPath(c) {
  return { type: AT.SET_PREV_CONFIG_PATH, c: fromJS(c) }
}

export function setGotoPath(g) {
  return { type: AT.SET_GOTO_PATH, g: fromJS(g) }
}
*/

export function setPath(key, value) {
  if (!global_constant.path_types.includes(key))
    console.error("Warning:  unrecognized path key", key)
  return { type: AT.SET_PATH, key, value: fromJS(value) }
}

export function addLogEntry(time, info) {
  return { type: AT.ADD_LOG_ENTRY, time, info: fromJS(info) }
}

export function resetAll() {
  return { type: AT.RESET_ALL }
}