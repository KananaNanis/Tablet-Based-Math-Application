import React from 'react'
import {Iterable} from 'immutable'
import {connect} from 'react-redux'
import {add_offset} from '../components/render_geoms'
import Tile from '../components/Tile'

const toJS_tile = WrappedComponent => wrappedComponentProps => {
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
	return <Tile {...propsJS} />
}

const mapStateToProps = (state, ownProps) => {
	let {id, offset_x = 0, just_grey = false} = ownProps
	return {
		id,
		name: state.getIn(['name', id]),
		position: add_offset(state.getIn(['position', id]), offset_x),
		style: state.getIn(['style', id]),
		anim_info: state.getIn(['anim_info', id]),
		misc: state.getIn(['misc', id]),
		scale_factor: state.getIn(['prop', 'scale_factor']),
		just_grey,
	}
}
export default connect(mapStateToProps)(toJS_tile(Tile))
