import React from 'react'
import {StyleSheet, Animated} from 'react-native'
import {global_constant} from '../lib/global'
import {query_prop} from '../providers/query_store'
import * as Anim from '../event/animation'

class Bar extends React.Component {
	state = {
		timer: Anim.new_timer(),
	}

	componentDidMount() {
		// console.log('Bar', this.props.id, 'componentDidMount anim_info', this.props.anim_info)
		Anim.init_anim(this.props.id, this.props.anim_info, this.state.timer)
	}

	componentDidUpdate(prev_props) {
		// console.log('Bar', this.props.id, 'componentDidUpdate anim_info', this.props.anim_info, 'prev', prev_props.anim_info)
		Anim.update_anim(
			this.props.id,
			this.props.anim_info,
			this.state.timer,
			prev_props.anim_info,
		)
	}

	render() {
		let {
			id,
			name,
			position,
			style,
			anim_info,
			misc,
			just_grey,
			freeze_display,
		} = this.props
		//just_grey = true
		//console.log('Bar  name', name)
		// const extra_scale =
		// 	misc && 'undefined' !== typeof misc.extra_scale ? misc.extra_scale : 1
		//console.log('Bar  id', id, 'extra_scale', extra_scale)
		// console.log('Bar  name', name, 'position', position, 'anim_info', anim_info)

		const scale_factor = query_prop('scale_factor')
		const height = name * scale_factor
		let animated_style = {}
		if (anim_info) {
			Anim.interpolate_anim_attr(
				id,
				anim_info,
				this.state.timer,
				animated_style,
			)
		}

		let extra_style = {}
		//let image_opacity = 1
		if (just_grey) extra_style = {opacity: 0.1}
		if (misc && 'undefined' !== typeof misc['mutable']) {
			//const frozen = query_prop('freeze_display')
			extra_style.backgroundColor = freeze_display
				? misc['is_correct']
					? 'lightgreen'
					: 'red'
				: 'darkgreen'
		}
		//console.log('Bar name', name, 'position', position, 'width', width,
		//	'height', height, 'img_name', img_name, 'img_width', img_width)
		//console.log('Bar name', name, 'anim_info', anim_info)
		let pos_info = {bottom: position[1]}
		pos_info.left = position[0]

		/*
		if (useAllBorders) {
			border_info = {
				borderColor: just_grey ? 'grey' : 'orange',
				borderWidth: 1,
			}
		}
*/
		// I'm trying to debug a situation where the y value is not updated
		//   when I turn off anim_info.  My kludge for now is to set it to a small
		//   non-zero value.
		let all_styles = [
			styles.bar,
			{
				height,
				width: global_constant.default_bar_width,
			},
			style,
			pos_info,
			extra_style,
			animated_style,
		]
		//console.log(' id', this.props.id, 'pos_info', pos_info, 'animated_style', animated_style)
		//console.log(' id', this.props.id, 'all_styles', all_styles)
		return (
			<Animated.View style={all_styles}>{this.props.children}</Animated.View>
		)
	}
}

const grey = 'grey'
const styles = StyleSheet.create({
	bar: {
		position: 'absolute',
		bottom: 0,
		backgroundColor: grey,
		//overflow: 'hidden',
	},
})

export default Bar
