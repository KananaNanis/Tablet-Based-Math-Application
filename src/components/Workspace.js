import React from 'react'
import {View, Image, Text, StyleSheet, Dimensions} from 'react-native'
import Keypad from './Keypad'
import Button from './Button'
import Placard from './Placard'
import ErrBox from './ErrBox'
import CamelContainer from '../containers/CamelContainer'
import OptionBackground from '../components/OptionBackground'
import {global_constant, image_location} from '../App'
import {query_event, query_option_values} from '../providers/query_store'
import {
	render_nums,
	render_tiles,
	render_doors,
	render_portals,
	render_five_frames,
	render_bars,
} from './render_geoms'
//import FiveFrame from './FiveFrame'

export const global_screen_width = Dimensions.get('window').width
export const global_screen_height = Dimensions.get('window').height
export const global_grass_height = 50
export const global_workspace_height =
	global_screen_height - global_grass_height

export const window2workspaceCoords = pos0 => [
	pos0[0],
	global_workspace_height - pos0[1],
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
	big_op,
	err_box,
	option_values,
}) => {
	//console.log('Workspace all_nums', all_nums, 'all_tiles', all_tiles, 'all_doors', all_doors)
	//console.log('Workspace all_portals', all_portals)
	if ('undefined' === typeof config_path) return []
	//console.log('Workspace config_path', config_path.toJS())
	//console.log('Workspace five_frame_ids', five_frame_ids.toJS())
	//console.log('Workspace bar_ids', bar_ids.toJS())
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
	let misc = [],
		key = 0,
		options = []
	const add_username = true
	if (add_username) {
		++key
		misc.push(
			<Text key={key} style={styles.username}>
				{global_constant.username}
			</Text>,
		)
	}
	if (query_option_values()) {
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
		for (let i = 0; i < option_inner.length; ++i) {
			++key
			options.push(
				<OptionBackground key={i} button_highlight={button_highlight} i={i}>
					{option_inner[i]}
				</OptionBackground>,
			)
		}
	}
	if (err_box) {
		// console.log('err_box', err_box.toJS())
		if (query_event('show_camel')) {
			++key
			misc.push(<CamelContainer key={key} />)
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
			misc.push(
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
		misc.push(
			<Text key={key} style={styles.center_text}>
				{center_text}
			</Text>,
		)
	}
	if (top_right_text) {
		++key
		misc.push(
			<Text
				key={key}
				style={[
					styles.top_right_text,
					{right: global_constant.top_right_text_offset},
				]}
			>
				{top_right_text}
			</Text>,
		)
	}
	if (top_left_text) {
		++key
		const zero = 0
		misc.push(
			<Text key={key} style={[styles.top_left_text, {left: zero}]}>
				{top_left_text}
			</Text>,
		)
	}
	if (big_op) {
		//console.log(' big_op', big_op)
		++key
		misc.push(
			<Text key={key} style={[styles.big_op]}>
				{big_op}
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
		misc.push(
			<Keypad
				key={key}
				button_display={button_display}
				button_highlight={button_highlight}
				freeze_display={freeze_display}
				kind={keypad_kind}
			/>,
		)
	}
	if ('in_between' === config_path.get(0)) {
		++key
		misc.push(
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
	for (const special_button in global_constant.special_button_geoms) {
		//if (special_button in button_display)
		if (button_display.has(special_button)) {
			++key
			let bg_style = {}
			if (freeze_display && 'start' !== special_button) {
				bg_style =
					special_button === button_highlight
						? freeze_highlight_style
						: freeze_no_highlight_style
			} else if (special_button === button_highlight) bg_style = highlight_style
			//console.log('bg_style', bg_style)
			misc.push(
				<Button
					key={key}
					height={global_constant.special_button_geoms[special_button].height}
					label={special_button}
					label_style={styles.button_text_default}
					position={
						global_constant.special_button_geoms[special_button].position
					}
					view_style={[
						styles.button_view_default,
						button_view[special_button],
						bg_style,
						//(special_button === button_highlight) ?
						//  (freeze_display ? freeze_highlight_style : highlight_style) : {}
					]}
					width={global_constant.special_button_geoms[special_button].width}
				/>,
			)
		}
	}
	for (let i = 0; i < num_stars; ++i) {
		++key
		misc.push(
			<Image
				key={key}
				source={image_location('star')}
				style={[
					styles.image_default,
					{
						right: 5 + 25 * i,
					},
				]}
			/>,
		)
		//source={require('img/star.png')}
	}
	//console.log(doors.length)
	return (
		<View style={styles.workspace}>
			{nums}
			{bars}
			{options}
			{tiles}
			{doors}
			{portals}
			{five_frames}
			{misc}
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
const styles = StyleSheet.create({
	workspace: {
		//backgroundColor: 'blue',
		height: global_workspace_height,
		width: global_screen_width,
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
		width: 20,
		height: 20,
	},
	username: {
		position: 'absolute',
		fontSize: 20,
		top: 0,
		left: global_screen_width / 2,
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
	big_op: {
		position: 'absolute',
		fontSize: 200,
		left: 70,
		bottom: 160,
		color: grey,
	},
})

export default Workspace
