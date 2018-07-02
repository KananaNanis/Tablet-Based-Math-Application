export const NUM_CREATE = 'NUM_CREATE';
export const NUM_SET_NAME = 'NUM_SET_NAME';
export const NUM_SET_POSITION = 'NUM_SET_POSITION';
export const NUM_SET_OPACITY = 'NUM_SET_OPACITY';

/*
{
  type : NUM_CREATE,
  ID : 'num4',
  name : [],
  left : 20,
  bottom : 0
}
{
  type : NUM_SET_NAME,
  ID : 'num4',
  name : ['u2'],
}
{
  type : NUM_SET_POSITION,
  ID : 'num4',
  left : 30,
}
*/

export function numCreate(ID, name, left, bottom) {
  return { type: NUM_CREATE, ID, name, left, bottom }
}

export function numSetName(ID, name) {
  return { type: NUM_SET_NAME, ID, name }
}

export function numSetPosition(ID, left, bottom) {
  return { type: NUM_SET_POSITION, ID, left, bottom }
}

export function numSetOpacity(ID, opacity) {
  return { type: NUM_SET_OPACITY, ID, opacity }
}