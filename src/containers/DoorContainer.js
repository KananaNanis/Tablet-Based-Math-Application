import React from 'react'
import {Iterable} from 'immutable'
import {connect} from 'react-redux'
import {add_offset} from '../components/render_geoms'
//import { toJS } from './to_js'
import Door from '../components/Door'

const toJS_door = _ => wrappedComponentProps => {
	const KEY = 0
	const VALUE = 1

	const propsJS = Object.entries(wrappedComponentProps).reduce(
		(newProps, wrappedComponentProp) => {
			newProps[wrappedComponentProp[KEY]] = Iterable.isIterable(
				wrappedComponentProp[VALUE],
			)
				? wrappedComponentProp[VALUE].toJS()
				: wrappedComponentProp[VALUE]
			return newProps
		},
		{},
	)

	// should be generic, but I get an error with the recommended approach!
	return <Door {...propsJS} />
}

const mapStateToProps = (state, ownProps) => {
	let {
		id,
		name,
		tower_ids,
		tile_ids,
		door_ids,
		offset_x = 0,
		just_grey = false,
	} = ownProps
	if (!name) name = state.getIn(['name', id])
	// console.log('name', name)
	//if (name) name = name.toJS()

	const verbose = false
	if (verbose) {
		let misc = state.getIn(['misc', id])
		console.log(
			'DoorContainer id',
			id,
			'name',
			name,
			'misc',
			misc ? misc.toJS() : null,
		)
	}

	return {
		id,
		name,
		position: add_offset(state.getIn(['position', id]), offset_x),
		style: state.getIn(['style', id]),
		anim_info: state.getIn(['anim_info', id]),
		misc: state.getIn(['misc', id]),
		tower_ids, // these are for portals
		tile_ids,
		door_ids,
		scale_factor: state.getIn(['prop', 'scale_factor']),
		just_grey,
		freeze_display: state.getIn(['prop', 'freeze_display']),
	}
}
export default connect(mapStateToProps)(toJS_door(Door))
