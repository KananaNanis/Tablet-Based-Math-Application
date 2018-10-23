import React from 'react'
import {Map, fromJS} from 'immutable'
import {StyleSheet, View, Animated} from 'react-native'
import {as_greyscale} from './Tower'
import {render_nums, render_tiles, render_doors} from './render_geoms'
import {global_constant, doAction} from '../App'
import {apply_bounds} from '../event/utils'
import * as Anim from '../event/animation'

class Door extends React.Component {
	state = {
		slideAnim: new Animated.Value(0),

		time_value: new Animated.Value(0),
	}

	componentDidMount() {
		Anim.init_anim(this.props.anim_info, this.state.time_value)
	}

	componentDidUpdate(prev_props) {
		const {id} = this.props
		//if ('portal_1' == id) tlog('Door', id, 'componentDidUpate')
		let {anim_info} = this.props
		const clear_anim_info = f => {
			let {anim_info} = this.props
			//console.log('clear_anim_info', anim_info)
			if (f.finished && anim_info) {
				doAction.setAnimInfo(id, null)
			}
		}
		if (anim_info && anim_info.hasOwnProperty('zoom')) {
			//if ('portal_1' == id) tlog('  STARTING ANIMATION')
			let timings = []
			for (let i = 0; i < anim_info.time.length; ++i) {
				const t = anim_info.time[i]
				timings.push(
					Animated.timing(this.state.slideAnim, {
						toValue: (i + 1) % 2,
						duration: t.duration,
						delay: t.delay,
					}),
				)
			}
			this.state.slideAnim.setValue(0)
			Animated.sequence(timings).start(clear_anim_info)
		}
		if (anim_info && anim_info.hasOwnProperty('slide_duration')) {
			//if ('door_2' == id) tlog('  STARTING ANIMATION')
			//Animated.timing(this.state.slideAnim).stop()
			//this.state.slideAnim.setValue(0)
			Anim.start_anim(this.state.slideAnim, 1, anim_info.slide_duration)
			// really doesn't like this:
			//set_primary_height(id, anim_info.target)
		}
		/*
    if (!this.state.has_listener) {
      this.state.has_listener = true
      console.log('adding listener')
      this.state.slideAnim.addListener(function (x) {
        console.log('x', x)
      })
    }
    */
		Anim.update_anim(
			this.props.anim_info,
			this.state.time_value,
			prev_props.anim_info,
		)
	}

	render() {
		let {
			name,
			position,
			style,
			anim_info,
			misc,
			scale_factor,
			just_grey,
			id,
			freeze_display,
		} = this.props
		// console.log('Door  id', id, 'name', name, 'position', position)
		//if (!name) name = [.1]
		//console.log('Door  id', id, 'style', style, 'anim_info', anim_info, 'misc', misc)

		let animated_style = {},
			handle_animated_style = {}
		if (Anim.has_timer(anim_info)) {
			Anim.interpolate_anim_attr(
				anim_info,
				this.state.time_value,
				animated_style,
				handle_animated_style,
			)
		}

		const is_portal = id.startsWith('portal_')
		const extra_scale =
			misc && 'undefined' !== typeof misc.extra_scale ? misc.extra_scale : 1
		const height = scale_factor * extra_scale
		//console.log('scale_factor', scale_factor)
		const width = is_portal
			? global_constant.door.portal_width * extra_scale
			: 0
		let thickness = height * global_constant.door.thickness_fraction
		if (thickness < 1) thickness = 1
		let frame_thickness = thickness
		let handle_thickness = thickness
		if (misc && 'undefined' !== typeof misc.mutable) {
			frame_thickness *= 1.5
		}
		if (misc && 'undefined' !== typeof misc.frame_thickness) {
			frame_thickness = misc.frame_thickness
		}
		if (misc && 'undefined' !== typeof misc.handle_thickness) {
			handle_thickness = misc.handle_thickness
		}
		//console.log('Door name', name, 'position', position, 'scale_factor', scale_factor, 'height', height)
		//console.log('Door name', name, ' style', style)
		//console.log('Door name', name, 'thickness', thickness)
		let frame_color = global_constant.door.frame_color
		let portal_bg_color = global_constant.door.portal_bg_color
		if (misc && 'undefined' !== typeof misc.mutable) {
			const col = freeze_display
				? misc['is_correct']
					? 'lightgreen'
					: 'red'
				: global_constant.door.color_of_mutable
			frame_color = col
			portal_bg_color = col
		}
		if (just_grey) {
			//frame_color = as_greyscale(frame_color)
			portal_bg_color = as_greyscale(portal_bg_color)
			frame_color = global_constant.door.frame_color_grey
		}
		let door_style = [
			styles.door,
			style,
			{
				width,
				height,
				left: position[0],
				bottom: position[1],
				backgroundColor: portal_bg_color,
			},
		]
		if (frame_thickness > 0) {
			door_style.push({
				borderLeftWidth: frame_thickness,
				borderLeftColor: frame_color,
			})
		}
		if (misc && 'undefined' !== typeof misc.is_option) {
			door_style.push({position: null})
		}
		let bounded_name = apply_bounds(name[0], 0, 2)
		if (is_portal && name[0] < global_constant.door.portal_min_value) {
			name[0] = global_constant.door.portal_min_value
		}
		const handle_bot =
			bounded_name * scale_factor * extra_scale - handle_thickness / 2
		let handle_width = global_constant.door.handle_fraction * height
		if (misc && 'undefined' !== typeof misc.handle_width) {
			handle_width = misc.handle_width
		}
		let handle_style = [
			styles.handle,
			{
				width: handle_width,
				bottom: handle_bot,
				borderTopWidth: handle_thickness,
				borderTopColor: frame_color,
			},
			handle_animated_style,
		]
		if (misc && 'undefined' !== typeof misc.handle_opacity) {
			handle_style.push({opacity: misc.handle_opacity})
		}
		//if ('door_p1' == id) anim_info = { slide_duration: 2000 }
		if (anim_info && anim_info.hasOwnProperty('slide_duration')) {
			/*
      start_anim(this.state.handlePosAnim, scale_factor * name[1]
        - handle_thickness / 2., anim_info.slide_duration);
      handle_style.push({ 'bottom': this.state.handlePosAnim })
      */
			let start_bot = handle_bot
			let flip = anim_info.hasOwnProperty('flip')
			if (anim_info.hasOwnProperty('slide_source')) {
				start_bot = scale_factor * anim_info.slide_source - handle_thickness / 2
			}
			let end_bot
			if (anim_info.hasOwnProperty('slide_target')) {
				end_bot = scale_factor * anim_info.slide_target - handle_thickness / 2
			} else if (name.length > 1) {
				end_bot = scale_factor * name[1] - handle_thickness / 2
			} else end_bot = handle_bot
			// tlog('starting slide from', start_bot, 'to', end_bot)
			//this.state.slideAnim.setValue(0)
			if (0 === 1 && flip) {
				handle_style.push({
					bottom: this.state.slideAnim.interpolate({
						inputRange: [1, 2],
						outputRange: [start_bot, end_bot],
					}),
				})
				Anim.start_anim(this.state.slideAnim, 2, anim_info.slide_duration)
			} else {
				handle_style.push({
					bottom: this.state.slideAnim.interpolate({
						inputRange: [0, 1],
						outputRange: [start_bot, end_bot],
					}),
				})
				//start_anim(this.state.slideAnim, 1, anim_info.slide_duration)
				//if (elapsed_time() < 5000) start_anim(this.state.slideAnim, 1, anim_info.slide_duration, 0, ()=>{this.setState({redo: true})})
			}
		}
		if (anim_info && anim_info.hasOwnProperty('zoom')) {
			const start_bot = scale_factor * anim_info.source - handle_thickness / 2
			const end_bot = scale_factor * anim_info.target - handle_thickness / 2
			//tlog('starting zoom from', start_bot, 'to', end_bot)
			handle_style.push({
				bottom: this.state.slideAnim.interpolate({
					inputRange: [0, 1],
					outputRange: [start_bot, end_bot],
				}),
			})
		}
		if (misc && misc.handle_color && !just_grey) {
			handle_style.push({borderTopColor: misc.handle_color})
		}
		if (misc && 'undefined' !== typeof misc.stealth_mode) {
			handle_style.push({borderTopColor: 'transparent'})
		}
		//console.log('handle_style', handle_style)
		let handles = [<Animated.View key={1} style={handle_style} />]
		if (name.length > 1) {
			// add a second handle
			const second_handle_opacity = 0.25
			handles.push(
				<View
					key={2}
					style={[
						handle_style,
						{
							opacity: second_handle_opacity,
							bottom:
								name[1] * scale_factor * extra_scale - handle_thickness / 2,
						},
					]}
				/>,
			)
		}
		let tickmarks = []
		if (misc && 'undefined' !== typeof misc.tickmarks) {
			const twidth = (global_constant.door.handle_fraction * height) / 8
			for (const tval of misc.tickmarks) {
				tickmarks.push(
					<View
						key={'tm' + tval}
						style={[
							styles.tickmark,
							{
								bottom:
									tval * scale_factor * extra_scale - handle_thickness / 4,
								left: -(frame_thickness + twidth),
								width: twidth,
								borderTopWidth: handle_thickness / 2,
								borderTopColor: frame_color,
							},
						]}
					/>,
				)
			}
		}
		if (is_portal) {
			// this is a portal, so we need to add all the other geometry,
			//   twice!
			//console.log('id', id, 'scale_factor', scale_factor, 'misc', misc)
			door_style.unshift(styles.portal)
			door_style.push({
				borderBottomRightRadius: global_constant.door.border_radius,
				borderTopRightRadius: global_constant.door.border_radius,
			})
			if (misc && 'undefined' !== typeof misc.stealth_mode) {
				door_style.push({
					borderLeftColor: 'transparent',
					borderTopColor: 'transparent',
					borderRightColor: 'transparent',
				})
			}
			let {tower_ids, tile_ids, door_ids} = this.props
			if (!Map.isMap(tower_ids)) tower_ids = fromJS(tower_ids)
			if (!Map.isMap(tile_ids)) tile_ids = fromJS(tile_ids)
			if (!Map.isMap(door_ids)) door_ids = fromJS(door_ids)
			//console.log('id', id, 'door_ids', door_ids)
			let offset_x = -1 * (position[0] + frame_thickness)
			let nums_grey, tiles_grey, doors_grey
			if (!misc || 'undefined' === typeof misc.stealth_mode) {
				nums_grey = render_nums(tower_ids, offset_x, true)
				tiles_grey = render_tiles(tile_ids, offset_x, true)
				doors_grey = render_doors(door_ids, id, offset_x, true)
			}
			const nums = render_nums(tower_ids, offset_x)
			const tiles = render_tiles(tile_ids, offset_x)
			const doors = render_doors(door_ids, id, offset_x)
			const transform = [{scale: bounded_name}]
			let inner_style = [
				styles.inner,
				{
					width,
					height,
					transform,
					borderBottomRightRadius: global_constant.door.border_radius,
					borderTopRightRadius: global_constant.door.border_radius,
				},
			]
			if (anim_info && anim_info.hasOwnProperty('slide_duration')) {
				//inner_style.push({ transform: [{ scale: .5}] })
				/*
        start_anim(this.state.scaleAnim, name[1],
          anim_info.slide_duration);
        inner_style.push({ transform: [{ scale: this.state.scaleAnim }] })
        */
				let end_scale
				if (anim_info.hasOwnProperty('slide_target')) {
					end_scale = anim_info.slide_target
				} else if (name.length > 1) end_scale = name[1]
				else end_scale = bounded_name
				inner_style.push({
					transform: [
						{
							scale: this.state.slideAnim.interpolate({
								inputRange: [0, 1],
								outputRange: [bounded_name, end_scale],
							}),
						},
					],
				})
				//console.log(inner_style)
			}
			if (anim_info && anim_info.hasOwnProperty('zoom')) {
				inner_style.push({
					transform: [
						{
							scale: this.state.slideAnim.interpolate({
								inputRange: [0, 1],
								outputRange: [bounded_name, anim_info.target],
							}),
						},
					],
				})
			}
			return (
				<Animated.View style={[door_style, animated_style]}>
					{nums_grey}
					{tiles_grey}
					{doors_grey}
					<Animated.View style={inner_style}>
						{nums}
						{tiles}
						{doors}
					</Animated.View>
					{handles}
					{tickmarks}
				</Animated.View>
			)
		} else {
			return (
				<Animated.View style={[door_style, animated_style]}>
					{handles}
					{tickmarks}
				</Animated.View>
			)
		}
	}
}

const lightgrey = 'lightgrey'
const styles = StyleSheet.create({
	door: {
		position: 'absolute',
	},
	portal: {
		overflow: 'hidden',
		borderRightWidth: 1,
		borderRightColor: lightgrey,
		borderTopWidth: 1,
		borderTopColor: lightgrey,
	},
	inner: {
		position: 'absolute',
		overflow: 'hidden',
		//backgroundColor: 'white',
		transformOrigin: 'bottom left',
	},
	handle: {
		position: 'absolute',
		height: 0,
	},
	tickmark: {
		position: 'absolute',
		height: 0,
	},
})

export default Door
