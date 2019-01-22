import React from 'react'
import {View, Image, Text, StyleSheet, Dimensions} from 'react-native'
import Keypad from './Keypad'
import Button, {get_special_button_geoms} from './Button'
import Placard from './Placard'
import ErrBox from './ErrBox'
import CamelContainer from '../containers/CamelContainer'
import OptionBackground from '../components/OptionBackground'
import {global_constant} from '../lib/global'
import {image_location} from '../lib/images'
import {
	query_event,
	query_arg,
	query_prop,
	query_obj_misc,
} from '../providers/query_store'
import {
	render_nums,
	render_tiles,
	render_doors,
	render_portals,
	render_five_frames,
	render_bars,
} from './render_geoms'
//import FiveFrame from './FiveFrame'
import BarContainer from '../containers/BarContainer'
//import {runInDebugContext} from 'vm'

export const original_global_screen_width = Dimensions.get('window').width
export let global_screen_width = original_global_screen_width
export const original_global_screen_height = Dimensions.get('window').height
export let global_screen_height = original_global_screen_height
export const global_grass_height = 190
export let global_workspace_height = global_screen_height - global_grass_height

export function update_screen_dimensions() {
	if (1 !== global_constant.laptop_scaling_factor) {
		global_screen_width = global_constant.tablet_width
		global_screen_height = global_constant.tablet_height
		global_workspace_height = global_screen_height - global_grass_height
		//console.log('changing global_workspace_height to', global_workspace_height)
	}
	/*
	console.log(
		'laptop_scaling',
		global_constant.laptop_scaling_factor,
		'screen_width',
		global_screen_width,
		'workspace_height',
		global_workspace_height,
	)
	*/
}

export const window2workspaceCoords = pos0 => [
	pos0[0] / global_constant.laptop_scaling_factor,
	global_workspace_height - pos0[1] / global_constant.laptop_scaling_factor,
]

const Workspace = ({
	keypad_kind,
	button_display,
	button_highlight,
	freeze_display,
	num_stars,
	config_path,
	tower_ids,
	tile_ids,
	door_ids,
	portal_ids,
	five_frame_ids,
	bar_ids,
	center_text,
	top_left_text,
	top_right_text,
	stderr_text,
	big_op,
	big_paren,
	big_paren_style,
	arith_symbol,
	equal_symbol,
	err_box,
	option_values,
}) => {
	//console.log('Workspace all_nums', all_nums, 'all_tiles', all_tiles, 'all_doors', all_doors)
	//console.log('Workspace all_portals', all_portals)
	if ('undefined' === typeof config_path) return []
	//console.log('Workspace config_path', config_path.toJS())
	//console.log('Workspace five_frame_ids', five_frame_ids.toJS())
	//console.log('Workspace bar_ids', bar_ids.toJS())
	const scale_factor = query_prop('scale_factor')
	const is_scaled = 520 !== scale_factor
	const nums = render_nums(tower_ids)
	const tiles = render_tiles(tile_ids)
	const doors = render_doors(door_ids)
	const portals = render_portals(
		portal_ids,
		null,
		tower_ids,
		tile_ids,
		door_ids,
	)
	const five_frames = render_five_frames(five_frame_ids)
	const bars = render_bars(bar_ids)
	//console.log('len', doors.length)
	//console.log('Workspace option_values', option_values ? option_values.toJS() : null)
	let misc_above = [],
		misc_below = [],
		key = 0,
		options = []
	const add_username = true
	if (add_username) {
		++key
		let top = 0
		if (is_scaled) top += 10
		misc_below.push(
			<Text
				key={key}
				style={[
					styles.username,
					{
						top,
						left: global_screen_width / 2,
					},
				]}
			>
				{global_constant.username}
			</Text>,
		)
	}
	let big_paren_content = null
	if (option_values) {
		// add options
		//console.log('option_values', query_option_values().toJS())
		// are the options doors or nums?
		let option_inner = []
		//console.log('nums actual', all_nums.size, 'nums rendered', nums.length)
		//console.log('doors actual', door_ids.size, 'doors rendered', doors.length)
		if (door_ids.size === doors.length + 1) {
			option_inner = render_doors(door_ids, null, 0, false, option_values)
		}
		if (tower_ids.size === nums.length + 1) {
			option_inner = render_nums(tower_ids, 0, false, option_values)
		}
		if (five_frame_ids.size === five_frames.length + 1) {
			option_inner = render_five_frames(five_frame_ids, option_values)
		}
		if (bar_ids.size === bars.length + 1) {
			option_inner = render_bars(bar_ids, option_values)
		}
		const option_obj = option_inner[option_values.size]
		const option_button_choice = query_obj_misc(option_obj).get(
			'option_button_choice',
		)
		for (let i = 0; i < option_values.size; ++i) {
			++key
			let choice = option_button_choice ? option_button_choice.get(i) : null
			options.push(
				<OptionBackground
					key={i}
					button_highlight={button_highlight}
					i={i}
					option_button_choice={choice}
					option_obj={option_obj}
				>
					{option_inner[i]}
				</OptionBackground>,
			)
		}
		const is_arg1 = query_arg(1) === option_obj
		const is_arg2 = query_arg(2) === option_obj
		if (is_arg1 || is_arg2) {
			big_paren_content = options
			options = null
		}
	}
	if (err_box) {
		// console.log('err_box', err_box.toJS())
		if (query_event('show_camel')) {
			++key
			misc_above.push(<CamelContainer key={key} />)
		}
		if (
			err_box.has('position') &&
			(!query_event('show_camel') ||
				(err_box.has('misc') && err_box.getIn(['misc', 'is_thin_height'])))
		) {
			//console.log('err_box beyond camel')
			let style = {},
				err_misc = {}
			if (err_box.get('style')) style = err_box.get('style').toJS()
			if (err_box.get('misc')) err_misc = err_box.get('misc').toJS()
			++key
			misc_above.push(
				<ErrBox
					key={key}
					height={err_box.get('height')}
					misc={err_misc}
					position={err_box.get('position').toJS()}
					style={style}
					width={err_box.get('width')}
				/>,
			)
		}
	}
	if (center_text) {
		++key
		misc_above.push(
			<Text key={key} style={styles.center_text}>
				{center_text}
			</Text>,
		)
	}
	if (top_right_text) {
		++key
		let top = 0
		if (is_scaled) top += 10
		misc_above.push(
			<Text
				key={key}
				style={[
					styles.top_right_text,
					{top, right: global_constant.top_right_text_offset},
				]}
			>
				{top_right_text}
			</Text>,
		)
	}
	if (top_left_text) {
		++key
		let top = 0
		let left = 0
		if (is_scaled) {
			top += 10
			left += 10
		}
		misc_above.push(
			<Text key={key} style={[styles.top_left_text, {top, left}]}>
				{top_left_text}
			</Text>,
		)
	}
	if (big_paren) {
		// console.log('big_paren_style', big_paren_style)
		++key
		misc_below.push(
			<View key={key} style={[styles.big_paren, big_paren_style.toJS()]}>
				{big_paren_content}
			</View>,
		)
	}
	if (big_op) {
		// console.log(' big_op', big_op, 'big_op_anim', big_op_anim)
		++key
		misc_below.push(
			<BarContainer key={key} id="big_op" name={0}>
				<Text style={[styles.big_op]}>{big_op}</Text>
			</BarContainer>,
		)
	}

	if (arith_symbol) {
		++key
		misc_below.push(
			<Text key={key} id="arith_symbol" style={[styles.arith_symbol]}>
				{arith_symbol}
			</Text>,
		)
	}

	if (equal_symbol) {
		++key
		misc_below.push(
			<Text key={key} id="equal_symbol" style={[styles.equal_symbol]}>
				{equal_symbol}
			</Text>,
		)
	}
	/*
  if (err_box) {
    ++key
    misc.push(<ErrBox position={err_box.position}
      width={err_box.width}
      height={err_box.height}
      key={key} />)
  }
  */
	if (keypad_kind) {
		//console.log('keypad_kind', keypad_kind)
		++key
		misc_above.push(
			<Keypad
				key={key}
				button_display={button_display}
				button_highlight={button_highlight}
				freeze_display={freeze_display}
				kind={keypad_kind}
				scale_factor={scale_factor}
			/>,
		)
	}
	if ('in_between' === config_path.get(0)) {
		++key
		misc_above.push(
			<Placard
				key={key}
				height={global_constant.placard.height}
				position={global_constant.placard.position}
				width={global_constant.placard.width}
			/>,
		)
	}
	const button_view = {
		submit: {borderColor: 'lime'},
		start: {borderColor: 'forestgreen'},
	}
	const highlight_style = {
		backgroundColor: 'lightgreen',
	}
	const freeze_highlight_style = {
		backgroundColor: 'red',
	}
	const freeze_no_highlight_style = {
		backgroundColor: 'grey',
	}
	//console.log('freeze_display', freeze_display)
	//console.log('button_display', button_display)
	for (const special_button in global_constant.special_button_defaults) {
		//if (special_button in button_display)
		if (button_display.has(special_button)) {
			++key
			let bg_style = {}
			if (freeze_display && 'button_start' !== special_button) {
				bg_style =
					special_button === button_highlight
						? freeze_highlight_style
						: freeze_no_highlight_style
			} else if (special_button === button_highlight) bg_style = highlight_style
			//console.log('bg_style', bg_style)
			let position = get_special_button_geoms(special_button).position.concat()
			if (is_scaled) {
				if (['button_submit', 'button_delete'].includes(special_button)) {
					position[1] -= 10
				}
			}
			misc_above.push(
				<Button
					key={key}
					height={get_special_button_geoms(special_button).height}
					label={get_special_button_geoms(special_button).label}
					label_style={styles.button_text_default}
					position={position}
					view_style={[
						styles.button_view_default,
						button_view[special_button],
						bg_style,
						//(special_button === button_highlight) ?
						//  (freeze_display ? freeze_highlight_style : highlight_style) : {}
					]}
					width={get_special_button_geoms(special_button).width}
				/>,
			)
		}
	}
	for (let i = 0; i < num_stars; ++i) {
		++key
		let top = 0
		let right = 400 + 30 * i
		if (is_scaled) {
			top += 10
			right += 8
		}
		misc_below.push(
			<Image
				key={key}
				source={image_location('star')}
				style={[styles.image_default, {top, right}]}
			/>,
		)
		//source={require('img/star.png')}
	}
	if (stderr_text) {
		++key
		let top = 40
		let left = 10
		misc_above.push(
			<Text key={key} style={[styles.stderr_text, {top, left}]}>
				{stderr_text}
			</Text>,
		)
	}
	//console.log(doors.length)
	//console.log('using global_workspace_height of', global_workspace_height)
	return (
		<View
			style={[
				styles.workspace,
				{
					height: global_workspace_height,
					width: global_screen_width,
				},
			]}
		>
			{misc_below}
			{nums}
			{bars}
			{options}
			{tiles}
			{doors}
			{portals}
			{five_frames}
			{misc_above}
		</View>
	)
	/*
  return <View style={styles.workspace}>
     <Tile position={[0,0]} width={200} height={200} name="kitty" />
  </View>
  */
}

const green = 'green'
const blue = 'blue'
const white = 'white'
const grey = 'grey'
const black = 'black'
const purple = 'rgb(255, 0, 255)'
const paren_color_1 = '#eee'
const styles = StyleSheet.create({
	workspace: {
		//backgroundColor: 'blue',
		position: 'absolute',
		left: 0,
		bottom: global_grass_height,
		justifyContent: 'center',
		alignItems: 'center',
	},
	button_view_default: {
		backgroundColor: green,
		borderWidth: 10,
		borderColor: blue,
		borderRadius: 20,
	},
	button_text_default: {
		fontSize: 40,
		color: white,
		marginBottom: 10,
	},
	image_default: {
		position: 'absolute',
		top: 5,
		width: 25,
		height: 25,
		margin: 5,
	},
	username: {
		position: 'absolute',
		fontSize: 20,
		top: 0,
	},
	center_text: {
		fontSize: 30,
	},
	top_right_text: {
		position: 'absolute',
		fontSize: 20,
		top: 0,
	},
	top_left_text: {
		position: 'absolute',
		fontSize: 8,
		top: 0,
	},
	stderr_text: {
		position: 'absolute',
		fontSize: 40,
		top: 40,
		color: purple,
	},
	big_op: {
		position: 'absolute',
		fontSize: 170,
		left: 0,
		bottom: 0,
		// left: 70,
		// bottom: 160,
		color: grey,
	},
	big_paren: {
		position: 'absolute',
		left: 5,
		bottom: 0,
		height: 930,
		width: 300,
		backgroundColor: paren_color_1,
		borderTopLeftRadius: 100,
		borderTopRightRadius: 100,
		overflow: 'hidden',
	},
	arith_symbol: {
		position: 'absolute',
		left: 195,
		bottom: -180,
		fontSize: 100,
		color: black,
	},
	equal_symbol: {
		position: 'absolute',
		left: 465,
		bottom: -180,
		fontSize: 100,
		color: black,
	},
})

export default Workspace
