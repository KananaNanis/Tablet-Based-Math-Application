import { combineReducers } from 'redux'
import {
  NUM_CREATE,
  NUM_SET_NAME,
  NUM_SET_POSITION,
  NUM_SET_OPACITY,
  NUM_SET_BLOCK_OPACITY,
  SET_SCALE_FACTOR,
  SET_KEYPAD_KIND,
  SET_BUTTON_HIGHLIGHT
} from './actionTypes'

// the following reducers control the various overall chunks of the store

function num_ids(state = [], action) {
  switch (action.type) {
    case NUM_CREATE:
      return [
        ...state,
        action.id,
      ]
    default:
      return state
  }
}

function num_name(state = {}, action) {
  switch (action.type) {
    case NUM_CREATE:
    case NUM_SET_NAME:
      return {
        ...state,
        [action.id] : action.name,
      }
    default:
      return state
  }
}

function num_position(state = {}, action) {
  switch (action.type) {
    case NUM_CREATE:
    case NUM_SET_POSITION:
      let newPosition = [action.position[0] || 0, 
                         action.position[1] || 0];
      return {
        ...state,
        [action.id] : newPosition
      }
    default:
      return state
  }
}

function num_style(state = {}, action) {
  switch (action.type) {
    case NUM_SET_OPACITY:
      let newStyle = { 'opacity' : action.opacity }
      if (action.id in state)
        newStyle = { ...state[action.id], ...newStyle }
      return Object.assign({}, state, {
        [action.id]: newStyle
      })
    default:
      return state
  }
}

function num_block_opacity(state = {}, action) {
  switch (action.type) {
    case NUM_SET_BLOCK_OPACITY:
      let new_opacity = state[action.id] ? state[action.id].slice() : [];
      new_opacity[action.index] = action.opacity;
      return {
        ...state,
        [action.id] : new_opacity
      }
    default:
      return state
  }
}


function num_misc(state = {}, action) {
  switch (action.type) {
    default:
      return state
  }
}

function scale_factor(state = 520, action) {
  switch (action.type) {
    case SET_SCALE_FACTOR:
      return action.val;
    default:
      return state
  }
}

function keypad_kind(state = 'decimal', action) {
  switch (action.type) {
    case SET_KEYPAD_KIND:
      return action.kind;
    default:
      return state
  }
}

function button_highlight(state = null, action) {
  switch (action.type) {
    case SET_BUTTON_HIGHLIGHT:
      return action.index;
    default:
      return state
  }
}

const suujiAppInner = combineReducers({
  num_ids,
  num_name,
  num_position,
  num_style,
  num_block_opacity,
  num_misc,
  scale_factor,
  keypad_kind,
  button_highlight
})

const initialState = {
  num_ids : ['t1', 't2'],
  num_name : {'t1' : [1, .2],
              't2' : [2, .1]},
  num_position : {'t1' : [20, 20],
              't2' : [200, 30]},
  num_style : {'t1' : {'opacity': 0.5},
              't2' : {}},
  num_block_opacity : {'t1': [null, 0.5]},
  num_misc : {'t1' : {'role': 'left_operand'},
              't2' : {}},
  scale_factor : 520,
  keypad_kind : 'decimal',
  button_highlight : null,
}

function suujiApp(state, action) {
  return state ? suujiAppInner(state, action) : initialState;
}

export default suujiApp
