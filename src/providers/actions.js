export const NUM_CREATE = 'NUM_CREATE';
export const NUM_SET_NAME = 'NUM_SET_NAME';
export const NUM_SET_POSITION = 'NUM_SET_POSITION';
export const NUM_SET_OPACITY = 'NUM_SET_OPACITY';
export const NUM_SET_BLOCK_OPACITY = 'NUM_SET_BLOCK_OPACITY';
export const SET_SCALE_FACTOR = 'SET_SCALE_FACTOR';

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

export function numSetPosition(id, position) {
  return { type: NUM_SET_POSITION, id, position }
}

export function numSetOpacity(id, opacity) {
  return { type: NUM_SET_OPACITY, id, opacity }
}

export function numSetBlockOpacity(id, index, opacity) {
  return { type: NUM_SET_BLOCK_OPACITY, id, index, opacity }
}

export function setScaleFactor(val) {
  return { type: SET_SCALE_FACTOR, val }
}