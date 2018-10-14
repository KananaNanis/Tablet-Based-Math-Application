import React from 'react'
import {StyleSheet, Animated} from 'react-native'
import {query_prop} from '../providers/query_store'
import * as Anim from '../event/animation'

class Bar extends React.Component {
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
		let {name, position, style, anim_info, just_grey} = this.props
		//just_grey = true
		//console.log('Bar  name', name)
		// const extra_scale =
		// 	misc && 'undefined' !== typeof misc.extra_scale ? misc.extra_scale : 1
		//console.log('Bar  id', id, 'extra_scale', extra_scale)

		const scale_factor = query_prop('scale_factor')
		const height = name * scale_factor
		let animated_style = {}
		if (Anim.has_timer(anim_info)) {
			Anim.interpolate_anim_attr(
				anim_info,
				this.state.time_value,
				animated_style,
			)
		}

		let extra_style = {}
		//let image_opacity = 1
		if (just_grey) extra_style = {opacity: 0.1}
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
		return (
			<Animated.View
				style={[
					styles.bar,
					{height},
					style,
					pos_info,
					extra_style,
					animated_style,
				]}
			/>
		)
	}
}

const grey = 'grey'
const styles = StyleSheet.create({
	bar: {
		position: 'absolute',
		backgroundColor: grey,
		width: 100,
		overflow: 'hidden',
	},
})

export default Bar
