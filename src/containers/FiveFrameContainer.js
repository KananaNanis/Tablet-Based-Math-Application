import React from 'react'
import {Iterable} from 'immutable'
import {connect} from 'react-redux'
//import {add_offset} from '../components/render_geoms'
//import { toJS } from './to_js'
import FiveFrame from '../components/FiveFrame'

const toJS_ff = _ => wrappedComponentProps => {
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
	return <FiveFrame {...propsJS} />
}

const mapStateToProps = (state, ownProps) => {
	let {id, name} = ownProps
	if (!name) name = state.getIn(['name', id])
	// console.log('name', name)
	//if (name) name = name.toJS()

	const verbose = false
	if (verbose) {
		let misc = state.getIn(['misc', id])
		console.log(
			'FiveFrameContainer id',
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
		//position: add_offset(state.getIn(['position', id]), offset_x),
		position: state.getIn(['position', id]),
		style: state.getIn(['style', id]),
		anim_info: state.getIn(['anim_info', id]),
		misc: state.getIn(['misc', id]),
	}
}
export default connect(mapStateToProps)(toJS_ff(FiveFrame))
