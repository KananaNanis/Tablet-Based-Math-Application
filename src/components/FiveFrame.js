import React from 'react'
import {StyleSheet, View, Text, Animated} from 'react-native'
import * as Anim from '../event/animation'

const squareSide = 220
const borderWidth = 10

const FiveFrameSquare = ({empty, id}) => {
	let inside = empty ? null : <View style={styles.dot} />
	const vert = {bottom: id * (squareSide - borderWidth)}
	return <View style={[styles.oneSquare, vert]}>{inside}</View>
}

class FiveFrame extends React.Component {
	state = {
		time_value: new Animated.Value(0),
	}

	componentDidMount() {
		Anim.init_anim(this.props.anim_info, this.state.time_value)
	}

	componentDidUpdate(prev_props) {
		// console.log('componentDidUpdate prev_props', prev_props, 'props', this.props)
		Anim.update_anim(
			this.props.anim_info,
			this.state.time_value,
			prev_props.anim_info,
		)
	}

	render() {
		let {name, position, style, anim_info, misc} = this.props
		const extra_scale =
			misc && 'undefined' !== typeof misc.extra_scale ? misc.extra_scale : 1

		let animated_style = {}
		if (Anim.has_timer(anim_info)) {
			Anim.interpolate_anim_attr(
				anim_info,
				this.state.time_value,
				animated_style,
			)
		}

		let pos_info = {
			left: position[0],
			bottom: position[1],
			transformOrigin: 'bottom left',
			transform: [{scale: extra_scale}],
		}
		let style_text = [styles.text, pos_info, style]
		let style_frame = [styles.frame, pos_info, style]
		if (misc && 'undefined' !== typeof misc.just_text) {
			return <Text style={[style_text, animated_style]}>{name}</Text>
		}
		let squares = []
		for (let i = 0; i < 5; ++i) {
			squares.push(<FiveFrameSquare key={i} empty={i >= name} id={i} />)
		}
		return (
			<Animated.View style={[style_frame, animated_style]}>
				{squares}
			</Animated.View>
		)
	}
}

const black = 'black'
const styles = StyleSheet.create({
	frame: {
		position: 'absolute',
	},
	oneSquare: {
		position: 'absolute',
		width: squareSide,
		height: squareSide,
		borderColor: black,
		borderWidth: borderWidth,
	},
	dot: {
		position: 'absolute',
		left: squareSide / 4 - borderWidth,
		bottom: squareSide / 4 - borderWidth,
		width: squareSide / 2,
		height: squareSide / 2,
		backgroundColor: black,
		borderRadius: '50%',
	},
	text: {
		position: 'absolute',
		fontSize: 400,
	},
})

export default FiveFrame
