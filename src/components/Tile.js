import React from 'react'
import { StyleSheet, View, Animated } from 'react-native'
import { global_constant, image_location } from '../App'
import { dist2D } from '../event/utils'
import { query_prop } from '../providers/query_store'
import * as Anim from '../event/animation'

export function current_pixel_size_of_animal(name, extra_scale = 1) {
	const height =
		extra_scale *
		global_constant.screen_pixels_per_cm *
		10 *
		global_constant.animals[name].height
	const width =
		(height * global_constant.animals[name].pixel_width) /
		global_constant.animals[name].pixel_height
	return [width, height]
}

export function landmark_location(animal_name, landmark_index) {
	const landmarks = global_constant.animal_landmarks[animal_name]
	let land_pos = []
	for (const ln in landmarks) {
		if (landmarks.hasOwnProperty(ln)) land_pos.push(landmarks[ln])
	}
	return land_pos[landmark_index]
}

export function with_diameter_offset(loc, diameter, extra_scale) {
	return [
		(loc[0] - diameter / 2) * extra_scale,
		(loc[1] - diameter / 2) * extra_scale,
	]
}

export function with_diameter_offset2(loc, diameter, extra_scale) {
	return [
		loc[0] - (diameter / 2) * extra_scale,
		loc[1] - (diameter / 2) * extra_scale,
	]
}

function compute_dot_locs(name, misc) {
	let locB, loc2B
	const extra_scale =
		misc && 'undefined' !== typeof misc.extra_scale ? misc.extra_scale : 1
	const diameter = global_constant.animal_landmarks.extra_dot_diameter
	if (misc && 'undefined' !== typeof misc.landmark_index) {
		//console.log('no landmark_index')
		const loc = landmark_location(name, Number(misc.landmark_index))
		locB = with_diameter_offset(loc, diameter, extra_scale)
	}
	if (misc && 'undefined' !== typeof misc.extra_dot) {
		loc2B = with_diameter_offset2(misc.extra_dot, diameter, extra_scale)
	}
	// console.log('compute_dot_locs name', name, 'locB', locB, 'loc2B', loc2B)
	return [locB, loc2B]
}

function init_dot_anim(props, time_value) {
	const [locB, loc2B] = compute_dot_locs(props.name, props.misc)
	const d = dist2D(locB, loc2B)
	const duration = 100 * d
	//console.log('d', d)
	//console.log('duration ', duration)
	Anim.start_anim(time_value, 1, duration)
}

class Tile extends React.Component {
	state = {
		time_value: new Animated.Value(0),
		timer: Anim.new_timer(),
		peg_offset: this.compute_peg_offset(),
	}

	componentDidMount() {
		Anim.init_anim(this.props.id, this.props.anim_info, this.state.timer, this.state.time_value)
		if (this.props.anim_info && this.props.anim_info.move_extra_dot) {
			init_dot_anim(this.props, this.state.time_value)
		}
	}

	componentDidUpdate(prev_props) {
		Anim.update_anim(
			this.props.id,
			this.props.anim_info,
			this.state.timer,
			this.state.time_value,
			prev_props.anim_info,
		)
		if (this.props.anim_info && this.props.anim_info.move_extra_dot) {
			const had_timer = prev_props.anim_info && prev_props.anim_info.duration
			if (!had_timer && Anim.has_timer(this.props.anim_info)) {
				init_dot_anim(this.props, this.state.time_value)
			}
		}
	}

	compute_peg_offset() {
		// determine a random offset in the wood texture, that will
		//   stay the same as long as the name stays the same
		if (!this.props.name.startsWith('peg')) return [0, 0]
		const { name, misc } = this.props
		const extra_scale =
			misc && 'undefined' !== typeof misc.extra_scale ? misc.extra_scale : 1
		const [width, height] = current_pixel_size_of_animal(name, extra_scale)
		let [img_width, img_height] = current_pixel_size_of_animal(
			'peg',
			extra_scale,
		)
		const max_offset_x = img_width - width
		const max_offset_y = img_height - height
		return [
			-1 * Math.floor(max_offset_x * Math.random()),
			-1 * Math.floor(max_offset_y * Math.random()),
		]
	}

	render() {
		let { id, name, position, style, anim_info, misc, just_grey } = this.props
		//just_grey = true
		//console.log('Tile  name', name)
		const extra_scale =
			misc && 'undefined' !== typeof misc.extra_scale ? misc.extra_scale : 1
		//console.log('Tile  id', id, 'extra_scale', extra_scale)
		console.log('Tile  id', id, 'anim_info', anim_info)
		const useAllBorders = false // use true when printing
		const useNoBorders = false // need to allow this for some cases!

		let animated_style = {}
		if (!just_grey) {
			Anim.interpolate_anim_attr(
				id,
				anim_info,
				this.state.timer,
				animated_style,
			)
		}

		let extra_style = {}
		let image_opacity =
			misc && 'undefined' !== typeof misc.image_opacity ? misc.image_opacity : 1
		if (just_grey) extra_style = { opacity: 0.1 }
		const is_peg = name.startsWith('peg_')
		const img_name = is_peg ? 'peg' : name
		const [width, height] = current_pixel_size_of_animal(name, extra_scale)
		let [img_width, img_height] = [width, height]
		let img_offset_x = 0,
			img_offset_y = 0
		if (is_peg) {
			;[img_width, img_height] = current_pixel_size_of_animal(
				'peg',
				extra_scale,
			)
			img_offset_x = this.state.peg_offset[0]
			img_offset_y = this.state.peg_offset[1]
		}
		//console.log('Tile name', name, 'position', position, 'width', width,
		//	'height', height, 'img_name', img_name, 'img_width', img_width)
		//console.log('Tile name', name, 'anim_info', anim_info)
		//console.log('Tile id', id, 'misc', misc)
		let pos_info = { bottom: position[1] }
		pos_info.left = position[0]
		let extra_dot = null,
			landmark = null
		//console.log('  hide_dot', query_prop('hide_dot'))
		if (!query_prop('hide_dot')) {
			//console.log('  not hidden')
			//console.log('Tile name', name, ' style', style)
			const has_dot = misc && 'undefined' !== typeof misc.extra_dot
			let [locB, loc2B] = compute_dot_locs(name, misc)
			//let locB
			const diameter = global_constant.animal_landmarks.extra_dot_diameter
			if (
				global_constant.animal_landmarks[name] &&
				misc &&
				'undefined' !== typeof misc.landmark_index
			) {
				//const loc = landmark_location(name, Number(misc.landmark_index))
				//locB = with_diameter_offset(loc, diameter, extra_scale)
				const half = 0.5
				landmark = (
					<View
						style={[
							styles.extra_dot,
							has_dot ? { opacity: half } : {},
							{
								width: extra_scale * diameter,
								height: extra_scale * diameter,
								left: locB[0],
								bottom: locB[1],
							},
						]}
					/>
				)
			}
			if (has_dot) {
				/*
				const loc2B = with_diameter_offset2(
					misc.extra_dot,
					diameter,
					extra_scale,
				)
				*/
				let dot_style = {}
				if (
					landmark &&
					anim_info &&
					anim_info.hasOwnProperty('move_extra_dot')
				) {
					// compute where and how far to move
					//init_dot_anim(this.props, this.state.dotAnim)
					dot_style = {
						left: this.state.time_value.interpolate({
							inputRange: [0, 1],
							outputRange: [loc2B[0], locB[0]],
						}),
						bottom: this.state.time_value.interpolate({
							inputRange: [0, 1],
							outputRange: [loc2B[1], locB[1]],
						}),
					}
				}
				//console.log('  extra_dot id', id, 'misc', misc, 'loc2B', loc2B)
				extra_dot = (
					<Animated.View
						style={[
							styles.extra_dot,
							{
								width: extra_scale * diameter,
								height: extra_scale * diameter,
								left: loc2B[0],
								bottom: loc2B[1],
								//left, bottom
							},
							dot_style,
						]}
					/>
				)
			}
		}
		let border_info
		if (useNoBorders || is_peg) {
			// do nothing
		} else if (useAllBorders) {
			border_info = {
				borderColor: just_grey ? 'grey' : 'orange',
				borderWidth: 1,
			}
		} else {
			border_info = {
				borderTopColor: just_grey ? 'grey' : 'orange',
				borderTopWidth: 1,
			}
		}
		return (
			<Animated.View
				style={[
					styles.tile,
					style,
					pos_info,
					extra_style,
					border_info,
					{
						width: width,
						height: height + 1,
					},
					animated_style,
				]}
			>
				<Animated.Image
					source={image_location(img_name, just_grey)}
					style={[
						styles.tileImage,
						{
							width: img_width,
							height: img_height,
							opacity: image_opacity,
							left: img_offset_x,
							top: img_offset_y,
						},
					]}
				/>
				{extra_dot}
				{landmark}
			</Animated.View>
		)
	}
}

const dotColor = 'red'
const styles = StyleSheet.create({
	tile: {
		position: 'absolute',
		overflow: 'hidden',
	},
	tileImage: {
		position: 'absolute',
	},
	extra_dot: {
		position: 'absolute',
		backgroundColor: dotColor,
		borderRadius: '50%',
	},
})

export default Tile
