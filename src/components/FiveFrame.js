import React from 'react'
import {StyleSheet, View, Text, Animated} from 'react-native'
import {start_anim} from './Workspace'

const squareSide = 220
const borderWidth = 10

const FiveFrameSquare = ({empty, id}) => {
	let inside = empty ? null : <View style={styles.dot} />
	const vert = {bottom: id * (squareSide - borderWidth)}
	return <View style={[styles.oneSquare, vert]}>{inside}</View>
}

class FiveFrame extends React.Component {
	state = {
		fadeAnim: new Animated.Value(1),
	}

	render() {
		let {name, position, style, anim_info, misc} = this.props
		const extra_scale =
			misc && 'undefined' !== typeof misc.extra_scale ? misc.extra_scale : 1

		let pos_info = {
			left: position[0],
			bottom: position[1],
			transformOrigin: 'bottom left',
			transform: [{scale: extra_scale}],
		}
		let style_text = [styles.text, pos_info, style]
		let style_frame = [styles.frame, pos_info, style]
		if (anim_info && anim_info.hasOwnProperty('fade_duration')) {
			start_anim(this.state.fadeAnim, 0, anim_info.fade_duration)
			style_text.push({opacity: this.state.fadeAnim})
			style_frame.push({opacity: this.state.fadeAnim})
		}
		if (misc && 'undefined' !== typeof misc.just_text) {
			return <Text style={style_text}>{name}</Text>
		}
		let squares = []
		for (let i = 0; i < 5; ++i) {
			squares.push(<FiveFrameSquare key={i} empty={i >= name} id={i} />)
		}
		return <Animated.View style={style_frame}>{squares}</Animated.View>
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
