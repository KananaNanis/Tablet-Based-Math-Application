import React from 'react'
import {connect} from 'react-redux'
import {Iterable} from 'immutable'
import Keypad from '../components/Keypad'

const toJS_keypad = _ => wrappedComponentProps => {
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
	return <Keypad {...propsJS} />
}

const mapStateToProps = (state, ownProps) => {
	const keypad_column = state.getIn(['event_handling', 'keypad_column'])
	return {
		...ownProps,
		keypad_column,
	}
}

export default connect(mapStateToProps)(toJS_keypad(Keypad))
