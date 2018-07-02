import { combineReducers } from 'redux'
import {
  NUM_CREATE,
  NUM_SET_NAME,
  NUM_SET_POSITION,
  NUM_SET_OPACITY
} from './actions'

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

function num_misc(state = {}, action) {
  switch (action.type) {
    default:
      return state
  }
}

const suujiAppInner = combineReducers({
  num_ids,
  num_name,
  num_position,
  num_style,
  num_misc
})

const initialState = {
  num_ids : ['t1', 't2'],
  num_name : {'t1' : ['u1', 'z2'],
              't2' : ['u2', 'z1']},
  num_position : {'t1' : [20, 20],
              't2' : [200, 30]},
  num_style : {'t1' : {'opacity': 0.5},
              't2' : {}},
  num_misc : {'t1' : {'role': 'left_operand'},
              't2' : {}},
}

function suujiApp(state, action) {
  return state ? suujiAppInner(state, action) : initialState;
}

export default suujiApp
