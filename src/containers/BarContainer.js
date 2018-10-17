import React from 'react'
import {Iterable} from 'immutable'
import {connect} from 'react-redux'
//import { toJS } from './to_js'
import Bar from '../components/Bar'

const toJS_bar = _ => wrappedComponentProps => {
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
	return <Bar {...propsJS} />
}

const mapStateToProps = (state, ownProps) => {
	let {id, name} = ownProps
	if (!name) name = state.getIn(['name', id])
	return {
		id,
		name,
		position: state.getIn(['position', id]),
		style: state.getIn(['style', id]),
		anim_info: state.getIn(['anim_info', id]),
		misc: state.getIn(['misc', id]),
	}
}
export default connect(mapStateToProps)(toJS_bar(Bar))
