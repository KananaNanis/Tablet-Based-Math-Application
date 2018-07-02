export const NUM_CREATE = 'NUM_CREATE';
export const NUM_SET_NAME = 'NUM_SET_NAME';
export const NUM_SET_POSITION = 'NUM_SET_POSITION';
export const NUM_SET_OPACITY = 'NUM_SET_OPACITY';

/*
{
  type : NUM_CREATE,
  id : 'num4',
  name : [],
  left : 20,
  bottom : 0
}
{
  type : NUM_SET_NAME,
  id : 'num4',
  name : ['u2'],
}
{
  type : NUM_SET_POSITION,
  id : 'num4',
  left : 30,
}
*/

export function numCreate(id, name, left, bottom) {
  return { type: NUM_CREATE, id, name, left, bottom }
}

export function numSetName(id, name) {
  return { type: NUM_SET_NAME, id, name }
}

export function numSetPosition(id, left, bottom) {
  return { type: NUM_SET_POSITION, id, left, bottom }
}

export function numSetOpacity(id, opacity) {
  return { type: NUM_SET_OPACITY, id, opacity }
}
