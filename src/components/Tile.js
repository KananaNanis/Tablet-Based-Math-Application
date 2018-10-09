import React from 'react'
import {StyleSheet, View, Animated} from 'react-native'
import {global_constant, image_location} from '../App'
import {start_anim} from './Workspace'
import {start_anim_loop} from './Door'
import {dist2D} from '../event/utils'
import {query_prop} from '../providers/query_store'

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

class Tile extends React.Component {
	state = {
		fadeAnim: new Animated.Value(1), // Initial value for opacity: 1
		loopAnim: new Animated.Value(0),
		dotAnim: new Animated.Value(0),
	}

	componentDidUpdate() {
		let {misc} = this.props
		if (!misc || !misc.hasOwnProperty('blink')) this.state.loopAnim.setValue(0)
	}

	render() {
		let {name, position, style, anim_info, misc, just_grey} = this.props
		//just_grey = true
		//console.log('Tile  name', name)
		const extra_scale =
			misc && 'undefined' !== typeof misc.extra_scale ? misc.extra_scale : 1
		//console.log('Tile  id', id, 'extra_scale', extra_scale)
		const useAllBorders = false // use true when printing
		const useNoBorders = true

		let extra_style = {}
		let image_opacity = 1
		if (just_grey) extra_style = {opacity: 0.1}
		if (anim_info && anim_info.hasOwnProperty('fade_duration')) {
			start_anim(this.state.fadeAnim, 0, anim_info.fade_duration)
			//extra_style = { 'opacity': this.state.fadeAnim }
			image_opacity = this.state.fadeAnim
		}
		if (
			misc &&
			'undefined' !== typeof misc.blink &&
			!just_grey &&
			'undefined' !== typeof misc.blink.target
		) {
			start_anim_loop(this.state.loopAnim)
			extra_style = {
				opacity: this.state.loopAnim.interpolate({
					inputRange: [0, 1],
					outputRange: [misc.blink.target, 1],
				}),
			}
		}
		const is_peg = name.startsWith('peg_')
		const img_name = is_peg ? 'peg' : name
		const [width, height] = current_pixel_size_of_animal(name, extra_scale)
		let [img_width, img_height] = [width, height]
		let img_offset_x = 0, img_offset_y = 0
		if (is_peg) {
		  [img_width, img_height] = current_pixel_size_of_animal('peg', extra_scale)
			const max_offset_x = img_width - width
			const max_offset_y = img_height - height
			img_offset_x = -1 * Math.floor(max_offset_x * Math.random())
			img_offset_y = -1 * Math.floor(max_offset_y * Math.random())
		}
		console.log('Tile name', name, 'position', position, 'width', width, 'height', height, 'img_name', img_name, 'img_width', img_width)
		let pos_info = {bottom: position[1]}
		pos_info.left = position[0]
		let extra_dot = null,
			landmark = null
		if (!query_prop('hide_dot')) {
			//console.log('Tile name', name, ' style', style)
			const has_dot = misc && 'undefined' !== typeof misc.extra_dot
			let locB
			const diameter = global_constant.animal_landmarks.extra_dot_diameter
			if (
				global_constant.animal_landmarks[name] &&
				misc &&
				'undefined' !== typeof misc.landmark_index
			) {
				const loc = landmark_location(name, Number(misc.landmark_index))
				locB = with_diameter_offset(loc, diameter, extra_scale)
				const half = 0.5
				landmark = (
					<View
						style={[
							styles.extra_dot,
							has_dot ? {opacity: half} : {},
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
				const loc2B = with_diameter_offset2(
					misc.extra_dot,
					diameter,
					extra_scale,
				)
				let dot_style = {}
				if (
					landmark &&
					anim_info &&
					anim_info.hasOwnProperty('move_extra_dot')
				) {
					// compute where and how far to move
					const d = dist2D(locB, loc2B)
					const duration = 100 * d
					//console.log('d', d)
					//console.log('duration ', duration)
					start_anim(this.state.dotAnim, 1, duration)
					dot_style = {
						left: this.state.dotAnim.interpolate({
							inputRange: [0, 1],
							outputRange: [loc2B[0], locB[0]],
						}),
						bottom: this.state.dotAnim.interpolate({
							inputRange: [0, 1],
							outputRange: [loc2B[1], locB[1]],
						}),
					}
				}
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
		if (useNoBorders) {
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
				]}
			>
				<Animated.Image
					source={image_location(img_name, just_grey)}
					style={[styles.tileImage,
					{width: img_width,
					height: img_height,
					opacity: image_opacity,
					left: img_offset_x,
					top: img_offset_y,
					}]}
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
