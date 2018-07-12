import { combineReducers } from 'redux'
import {
  SET_POSITION,
  SET_OPACITY,
  SET_NAME,
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
import { add_block_to_name, remove_block_from_name } from '../components/Block'

// the following reducers control the various overall chunks of the store

function handle_create_delete(state = [], action) {
  switch (action.type) {
    case TOWER_CREATE:
    case TILE_CREATE:
    case LIFT_CREATE:
      return [
        ...state,
        action.id,
      ]
    case TOWER_DELETE:
    case TILE_DELETE:
    case LIFT_DELETE:
      const index = state.indexOf(action.id);
      if (index > -1) {
        let cpy = [...state]
        cpy.splice(index, 1);
        return cpy
      }
    default:
      return state
  }
}

function tower_ids(state = [], action) {
  return handle_create_delete(state, action)
}

function tile_ids(state = [], action) {
  return handle_create_delete(state, action)
}

function lift_ids(state = [], action) {
  return handle_create_delete(state, action)
}

function name(state = {}, action) {
  switch (action.type) {
    case TOWER_CREATE:
    case TILE_CREATE:
    case SET_NAME:
      return {
        ...state,
        [action.id]: action.name,
      }
    case TOWER_ADD_BLOCK:
      return {
        ...state,
        [action.id]: add_block_to_name(action.size, action.is_fiver, state[action.id])
      }
    case TOWER_REMOVE_BLOCK:
      return {
        ...state,
        [action.id]: remove_block_from_name(state[action.id])
      }
    default:
      return state
  }
}

function position(state = {}, action) {
  switch (action.type) {
    case TOWER_CREATE:
    case TILE_CREATE:
    case SET_POSITION:
      let newPosition = [action.position[0] || 0,
      action.position[1] || 0]
      return {
        ...state,
        [action.id]: newPosition
      }
    default:
      return state
  }
}

function style(state = {}, action) {
  switch (action.type) {
    case SET_OPACITY:
      let newStyle = { 'opacity': action.opacity }
      if (action.id in state)
        newStyle = { ...state[action.id], ...newStyle }
      return Object.assign({}, state, {
        [action.id]: newStyle
      })
    default:
      return state
  }
}

function tower_style(state = {}, action) {
  let newStyle = {}
  switch (action.type) {
    case TOWER_SET_WIDTH:
      newStyle = { 'width': action.width }
      if (action.id in state)
        newStyle = { ...state[action.id], ...newStyle }
      return Object.assign({}, state, {
        [action.id]: newStyle
      })
    case TOWER_SET_OVERFLOW:
      newStyle = { 'overflow': action.overflow }
      if (action.id in state)
        newStyle = { ...state[action.id], ...newStyle }
      return Object.assign({}, state, {
        [action.id]: newStyle
      })
    default:
      return state
  }
}

function block_opacity(state = {}, action) {
  switch (action.type) {
    case TOWER_SET_BLOCK_OPACITY:
      let new_opacity = state[action.id] ? state[action.id].slice() : []
      new_opacity[action.index] = action.opacity
      return {
        ...state,
        [action.id]: new_opacity
      }
    default:
      return state
  }
}


function misc(state = {}, action) {
  switch (action.type) {
    default:
      return state
  }
}

function scale_factor(state = 520, action) {
  switch (action.type) {
    case SET_SCALE_FACTOR:
      return action.val
    default:
      return state
  }
}

function keypad_kind(state = 'decimal', action) {
  switch (action.type) {
    case SET_KEYPAD_KIND:
      return action.kind
    default:
      return state
  }
}

function button_display(state = null, action) {
  switch (action.type) {
    case SET_BUTTON_DISPLAY:
      return { ...state, [action.index]: action.val }
    default:
      return state
  }
}

function button_highlight(state = null, action) {
  switch (action.type) {
    case SET_BUTTON_HIGHLIGHT:
      return action.index
    default:
      return state
  }
}

function num_stars(state = 3, action) {
  switch (action.type) {
    case SET_NUM_STARS:
      return action.n
    default:
      return state
  }
}

const suujiAppInner = combineReducers({
  tower_ids,
  tile_ids,
  lift_ids,
  name,
  position,
  style,
  tower_style,
  block_opacity,
  misc,
  scale_factor,
  keypad_kind,
  button_display,
  button_highlight,
  num_stars
})

const initialState = {
  // general info on towers, tiles, and lifts
  tower_ids: ['t1', 't2'],
  tile_ids: ['a1'],
  lift_ids: ['l1'],
  name: {
    //'t1' : [1, .1, .05, .01],
    //'t1': [.5, .2, .05, .05, .04],
    't1': [],
    //'t1' : [100, 50, 50, 10, 5, 5, 4],
    't2': [.5, .1],
    'a1': 'kitty'
  },
  position: {
    't1': [5, 0],
    't2': [180, 0],
    'a1': [-300, 0]
  },
  style: { 't2': { 'opacity': 0.5 } },
  misc: {
    't1': { 'role': 'left_operand' },
    't2': {}
  },

  // tower info
  tower_style: { 't1': { 'width': 150, 'overflow': 'hidden' } },
  block_opacity: { 't1': [null, 0.5] },

  // keypad info
  keypad_kind: 'buildTower',
  button_display: {
    'submit': true, 'delete': true,
    '0': false, '1': false, '3': false, '8': false, '9': false
  },
  button_highlight: null,

  // other info
  num_stars: 3,
  scale_factor: 520,
  //scale_factor : 2,
}

function suujiApp(state, action) {
  return state ? suujiAppInner(state, action) : initialState
}

export default suujiApp