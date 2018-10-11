import React from 'react'
import {StyleSheet, Animated} from 'react-native'
import {start_anim} from '../event/animation'

class ErrBox extends React.Component {
	state = {
		animTime: new Animated.Value(0),
	}

	render() {
		let {position, width, height, style, anim_info, misc} = this.props
		//console.log('ErrBox render position', position)
		//console.log('ErrBox render misc', misc)
		let as_baggage = true
		let use_anim = false
		const is_thin = misc && misc.hasOwnProperty('is_thin_height')
		let leftR, bottomR, widthR, heightR
		if (anim_info && anim_info.hasOwnProperty('position')) {
			//console.log('anim_info.position ', anim_info.position)
			leftR = [anim_info.position[0], position[0]]
			bottomR = [anim_info.position[1], position[1]]
			widthR = [anim_info.width, width]
			heightR = [anim_info.height, height]
			start_anim(this.state.animTime, 1, anim_info.duration, anim_info.delay)
			use_anim = true
		}
		//console.log('bottomR', bottomR)
		//console.log('style', style)
		let err_style = [
			styles.err_box,
			as_baggage ? {backgroundColor: 'brown'} : {},
			is_thin ? styles.is_thin : {},
			style,
			{
				width,
				height,
				left: position[0],
				bottom: position[1],
			},
			use_anim
				? {
						left: this.state.animTime.interpolate({
							inputRange: [0, 1],
							outputRange: leftR,
						}),
						bottom: this.state.animTime.interpolate({
							inputRange: [0, 1],
							outputRange: bottomR,
						}),
						width: this.state.animTime.interpolate({
							inputRange: [0, 1],
							outputRange: widthR,
						}),
						height: this.state.animTime.interpolate({
							inputRange: [0, 1],
							outputRange: heightR,
						}),
				  }
				: {},
		]
		return <Animated.View style={err_style} />
	}
}

const red = 'red'
const orange = 'orange'
const styles = StyleSheet.create({
	err_box: {
		position: 'absolute',
		backgroundColor: red,
	},
	is_thin: {
		backgroundColor: orange,
		opacity: 0.5,
	},
})

export default ErrBox
