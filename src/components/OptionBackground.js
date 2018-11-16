import React from 'react'
import {StyleSheet, Animated} from 'react-native'
import {global_constant} from '../App'
import {
	global_screen_width,
	global_workspace_height,
} from '../components/Workspace'
import {
	query_prop,
	query_obj_misc,
	query_option_values,
} from '../providers/query_store'
import * as Anim from '../event/animation'
import Button from './Button'

export function get_option_button_geom(i) {
	let pos = i.startsWith('top_') ? [10, 820] : [10, 720]
	let geom = {
		position: pos,
		width: 100,
		height: 100,
	}
	return geom
}

export function get_option_button_offset(iFull) {
	let i = Number(iFull.charAt(iFull.length - 1))
	const option_width = 120 // HELP!  Should not be hard-coded!
	return [i * option_width, 0]
}

export function option_geometry(i, option_obj) {
	const n = query_option_values().size
	let width = (global_screen_width - global_constant.prompt_width) / n
	let left_offset = global_constant.prompt_width
	if (option_obj) {
		const m = query_obj_misc(option_obj)
		if (m) {
			const w2 = m.get('option_width')
			if ('undefined' !== typeof w2) width = w2
			const l2 = m.get('option_offset')
			if ('undefined' !== typeof l2) left_offset = l2
		}
	}
	const height = global_workspace_height
	const position = [left_offset + i * width, 0]
	return {position, width, height}
}

class OptionBackground extends React.Component {
	state = {
		timer: Anim.new_timer(),
	}

	componentDidMount() {
		Anim.init_anim(this.props.id, this.props.anim_info, this.state.timer)
	}

	componentDidUpdate(prev_props) {
		Anim.update_anim(
			this.props.id,
			this.props.anim_info,
			this.state.timer,
			prev_props.anim_info,
		)
	}

	render() {
		let {
			i,
			button_highlight,
			style,
			anim_info,
			option_obj,
			option_button_choice,
		} = this.props
		//console.log('button_highlight', button_highlight)
		//if (style && style.size > 0) style = style.toJS()  // should use HOC!
		// console.log('OptionBackground style', style)

		let animated_style = {}
		if (anim_info) {
			Anim.interpolate_anim_attr(
				'option' + i,
				anim_info,
				this.state.timer,
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
		const obj_misc = query_obj_misc(option_obj)
		if (obj_misc && obj_misc.get('hide_overflow')) {
			extra_style.overflow = 'hidden'
		}
		const {position, width, height} = option_geometry(i, option_obj)
		//console.log('OptionBackground i', i, 'position', position, 'width', width, 'height', height)
		let pos_info = {bottom: position[1]}
		pos_info.left = position[0]
		let option_buttons = []
		if (null !== option_button_choice) {
			let extra_button = [null, null],
				extra_button_label = [null, null]
			let option_button_state = ['untouched', 'untouched']
			if (1 === option_button_choice) {
				option_button_state = ['chosen', 'notchosen']
			}
			if (2 === option_button_choice) {
				option_button_state = ['notchosen', 'chosen']
			}

			let suffix = ['top', 'bottom']
			if (button_highlight && button_highlight === 'top_' + i) {
				suffix[0] = 'highlight'
			}
			if (button_highlight && button_highlight === 'bottom_' + i) {
				suffix[1] = 'highlight'
			}

			extra_button[0] =
				global_constant.option_button_style[option_button_state[0]][suffix[0]]
			extra_button[1] =
				global_constant.option_button_style[option_button_state[1]][suffix[1]]
			extra_button_label[0] =
				global_constant.option_button_label_style[option_button_state[0]][
					suffix[0]
				]
			extra_button_label[1] =
				global_constant.option_button_label_style[option_button_state[1]][
					suffix[1]
				]
			const geom = [
				get_option_button_geom('top_' + i),
				get_option_button_geom('bottom_' + i),
			]
			option_buttons.push(
				<Button
					key={1}
					height={geom[0].height}
					label="="
					label_style={[styles.bg_button_label, extra_button_label[0]]}
					position={geom[0].position}
					view_style={[styles.bg_button, extra_button[0]]}
					width={geom[0].width}
				/>,
			)
			option_buttons.push(
				<Button
					key={2}
					height={geom[1].height}
					label={String.fromCharCode(parseInt('2260', 16))}
					label_style={[styles.bg_button_label, extra_button_label[1]]}
					position={geom[1].position}
					view_style={[styles.bg_button, extra_button[1]]}
					width={geom[1].width}
				/>,
			)
		}
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
				{option_buttons}
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
		// overflow: 'hidden',  // put into misc
	},
	bg_button: {
		borderRadius: 30,
	},
	bg_button_label: {
		position: 'absolute',
		fontSize: 100,
		bottom: 0,
	},
})

export default OptionBackground
