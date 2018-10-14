import React from 'react'
import {StyleSheet, Animated} from 'react-native'
import {global_constant} from '../App'
import {
	global_screen_width,
	global_workspace_height,
} from '../components/Workspace'
import {query_prop, query_option_values} from '../providers/query_store'
import * as Anim from '../event/animation'

export function option_geometry(i) {
	const n = query_option_values().size
	const width = (global_screen_width - global_constant.prompt_width) / n
	const height = global_workspace_height
	const position = [global_constant.prompt_width + i * width, 0]
	return {position, width, height}
}

class OptionBackground extends React.Component {
	state = {
		time_value: new Animated.Value(0),
	}

	componentDidMount() {
		Anim.init_anim(this.props.anim_info, this.state.time_value)
	}

	componentDidUpdate(prev_props) {
		Anim.update_anim(
			this.props.anim_info,
			this.state.time_value,
			prev_props.anim_info,
		)
	}

	render() {
		let {i, button_highlight, style, anim_info} = this.props
		//console.log('button_highlight', button_highlight)
		//if (style && style.size > 0) style = style.toJS()  // should use HOC!
		// console.log('OptionBackground style', style)

		let animated_style = {}
		if (Anim.has_timer(anim_info)) {
			Anim.interpolate_anim_attr(
				anim_info,
				this.state.time_value,
				animated_style,
			)
		}

		let extra_style = {}
		if ('option_' + i === button_highlight) {
			const correct = query_prop('answer_is_correct')
			const frozen = query_prop('freeze_display')
			extra_style.backgroundColor = frozen
				? correct
					? '#9f9'
					: 'red'
				: 'white'
			// console.log('answer_is_correct', query_prop('answer_is_correct'))
		} else if (button_highlight && button_highlight.startsWith('option_')) {
			extra_style.backgroundColor = i % 2 ? '#111' : '#555'
			extra_style.opacity = 0.1
		} else if (i % 2) {
			extra_style.backgroundColor = '#e8e8e8'
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
					pos_info,
					extra_style,
					style,
					{
						width: width,
						height: height,
					},
					animated_style,
				]}
			>
				{this.props.children}
			</Animated.View>
		)
	}
}

const almostWhite = '#eee'
const styles = StyleSheet.create({
	bg: {
		position: 'absolute',
		backgroundColor: almostWhite,
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
})

export default OptionBackground
