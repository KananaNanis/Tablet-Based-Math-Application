import React from 'react'
import {StyleSheet, Animated} from 'react-native'
import {global_constant} from '../App'
import {
	global_screen_width,
	global_workspace_height,
} from '../components/Workspace'
import {query_prop} from '../providers/query_store'

export function option_geometry(i) {
	const width = (global_screen_width - global_constant.prompt_width) / 4
	const height = global_workspace_height
	const position = [global_constant.prompt_width + i * width, 0]
	return {position, width, height}
}

class OptionBackground extends React.Component {
	state = {
		fadeAnim: new Animated.Value(1), // Initial value for opacity: 1
		loopAnim: new Animated.Value(0),
	}

	componentDidUpdate() {
		let {misc} = this.props
		if (misc && misc.hasOwnProperty('blink')) {
		} else this.state.loopAnim.setValue(0)
	}

	render() {
		let {i, button_highlight, style, misc, anim_info} = this.props
		//console.log('button_highlight', button_highlight)
		let extra_style = {}
		if ('option_' + i == button_highlight) {
			extra_style.backgroundColor = query_prop('freeze_display')
				? 'red'
				: 'white'
		} else if (button_highlight && button_highlight.startsWith('option_')) {
			extra_style.backgroundColor = '#777'
			extra_style.opacity = 0.1
		}
		if (anim_info && anim_info.hasOwnProperty('fade_duration')) {
			start_anim(this.state.fadeAnim, 0, anim_info.fade_duration)
			extra_style.opacity = this.state.fadeAnim
		}
		if (misc && 'undefined' !== typeof misc.blink) {
			start_anim_loop(this.state.loopAnim)
			extra_style.opacity = this.state.loopAnim.interpolate({
				inputRange: [0, 1],
				outputRange: [misc.blink.target, 1],
			})
		}
		const {position, width, height} = option_geometry(i)
		//console.log('OptionBackground i', i, 'position', position, 'width', width, 'height', height)
		let pos_info = {bottom: position[1]}
		pos_info.left = position[0]
		//console.log('Tile name', name, ' style', style)
		return (
			<Animated.View
				style={[
					styles.bg,
					style,
					pos_info,
					extra_style,
					{
						width: width,
						height: height,
					},
				]}
			>
				{this.props.children}
			</Animated.View>
		)
	}
}

const styles = StyleSheet.create({
	bg: {
		position: 'absolute',
		backgroundColor: '#eee',
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
})

export default OptionBackground
