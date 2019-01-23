//import React from 'react'
//import {Iterable} from 'immutable'
import {connect} from 'react-redux'
import {add_offset} from '../components/render_geoms'
import {toJS} from './to_js'
import Num from '../components/Num'
import {height2tower_name} from '../providers/query_tower'

/*
generic version seems to work for this one?!
const toJS_num = WrappedComponent => wrappedComponentProps => {
  const KEY = 0
  const VALUE = 1

  const propsJS = Object.entries(
    wrappedComponentProps
  ).reduce((newProps, wrappedComponentProp) => {
    newProps[wrappedComponentProp[KEY]] = Iterable.isIterable(
      wrappedComponentProp[VALUE]
    )
      ? wrappedComponentProp[VALUE].toJS()
      : wrappedComponentProp[VALUE]
    return newProps
  }, {})

  // should be generic, but I get an error with the recommended approach!
  return <Num {...propsJS} />
}
*/

const mapStateToProps = (state, ownProps) => {
	let {id, name, offset_x = 0, just_grey = false} = ownProps
	if (!name) name = state.getIn(['name', id])
	if ('number' === typeof name) {
		// this name is not canonical, yet
		name = height2tower_name(name)
	}

	const verbose = false
	if (verbose) {
		let misc = state.getIn(['misc', id])
		console.log(
			'NumContainer id',
			id,
			'name',
			name,
			'misc',
			misc ? misc.toJS() : null,
			'block_opacity',
			state.getIn(['block_opacity', id]),
		)
	}

	return {
		id,
		name,
		position: add_offset(state.getIn(['position', id]), offset_x),
		style: state.getIn(['style', id]),
		anim_info: state.getIn(['anim_info', id]),
		misc: state.getIn(['misc', id]),
		keypad_column: state.getIn(['event_handling', 'keypad_column']),
		target: state.getIn(['event_handling', 'target']),
		tower_style: state.getIn(['tower_style', id]),
		block_opacity: state.getIn(['block_opacity', id]),
		block_anim_info: state.getIn(['block_anim_info', id]),
		scale_factor: state.getIn(['prop', 'scale_factor']),
		just_grey,
	}
}
export default connect(mapStateToProps)(toJS(Num))
