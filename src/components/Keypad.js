import React from 'react'
import {StyleSheet, View, Text} from 'react-native'
import Button from './Button'
import {global_fiver_shadow} from './Num'
import {global_constant} from '../lib/global'

import {
	query_event,
	query_position_of,
} from '../providers/query_store'

export function get_button_geoms_for(kind, x_offset=0) {
	//console.warn('get_button_geoms_for', kind)
	const pos = global_constant.keypad_info[kind]
	// console.log('get_button_geoms_for', kind, 'pos', pos)



	let geoms = []
	for (let row = 0; row < pos.num_rows; ++row) {
		for (let col = 0; col < pos.num_cols; ++col) {
			geoms.push({
				position: [
					col * (pos.button_width + pos.space_width) + x_offset,
					row * (pos.button_height + pos.space_height),
				],
				width: pos.button_width,
				height: pos.button_height,
			})
		}
	}
	return geoms
}

export function get_keypad_width_height(kind) {
	const pos = global_constant.keypad_info[kind]
	return {
		width:
			pos.num_cols * pos.button_width + (pos.num_cols - 1) * pos.space_width,
		height:
			pos.num_rows * pos.button_height + (pos.num_rows - 1) * pos.space_height,
	}
}

const Keypad = ({
	kind,
	button_display,
	button_highlight,
	freeze_display,
	scale_factor,
	keypad_column,
}) => {
	// console.log(button_display)
	let buttons = []
	const add_words_on_side = false
	const pos = global_constant.keypad_info[kind]
	const geoms = get_button_geoms_for(kind)
	const is_scaled = 520 !== scale_factor
	for (let row = 0; row < pos.num_rows; ++row) {
		for (let col = 0; col < pos.num_cols; ++col) {
			const index = col + pos.num_cols * row
			if (index in button_display && false === button_display[index]) continue
			let button_position = geoms[index].position
			if (is_scaled) button_position[0] -= 10
			const height = pos.button_height
			let width = pos.button_width
			let label = index,
				label_style = {
					//marginBottom: 0.1 * height,
					fontSize: 0.75 * height,
				} // default
			let image_name,
				image_style = {}
			//console.log(label_style)
			const skip_symbol = true
			if ('buildTower' === kind) {
				const size = global_constant.buildTower_button_info[index][0]
				const is_fiver = global_constant.buildTower_button_info[index][1]
				if (skip_symbol) {
					label = ''
					label_style['color'] = 'black'
					if (0 === size) {
						image_name = 'goat'
						image_style = {position: 'absolute', width: 60, height: 60}
					} else if (-1 === size) {
						image_name = 'anansi'
						image_style = {position: 'absolute', width: 30, height: 30}
					} else if (-2 === size) {
						image_name = 'ant'
						image_style = {position: 'absolute', width: 30, height: 30}
					}
					if (is_fiver) {
						label = '5  '
						image_style.marginLeft = 20
					}
				} else {
					label = global_constant.tower.size2symbol[size]
					label_style['color'] = global_constant.tower.size2color[size]
					if (is_fiver) {
						label = '5' + label
						label_style = {...global_fiver_shadow[1], ...label_style}
					}
				}
			} else if ('decimal' === kind) {
				if (index > 2) label = index - 2
				else if (index === 1) label = 0
				else continue
				
			} else if ('decimal_column' === kind) {
				let col = keypad_column
				if (col !== 'goat' && col !== 'spider' && col !== 'ant' ) continue
				const tgt = query_event('target')
				let pos_x = query_position_of(tgt).get(0)
				let x_offset = 0
				if (col === 'ant') x_offset = 120
				else if (col === 'spider') x_offset = 55
				button_position[0] += pos_x + x_offset
				label = index
			}

			const view_style = {borderColor: 'black', borderWidth: 1} // backgroundColor: 'grey'}
			if (null !== button_highlight && index === button_highlight) {
				view_style['backgroundColor'] = freeze_display ? 'red' : 'yellow'
			} else if (freeze_display) view_style['opacity'] = 0.25
			buttons.push(
				<Button
					key={index}
					height={height}
					image_name={image_name}
					image_style={image_style}
					label={label}
					label_style={label_style}
					position={button_position}
					view_style={view_style}
					width={width}
				/>,
			)
		}
	}
	let extras = []
	if (add_words_on_side && 'buildTower' === kind) {
		extras.push(
			<Text key='707' style={styles.keypad_text1}>
				Small
			</Text>,
		)
		extras.push(
			<Text key='727' style={styles.keypad_text2}>
				Box
			</Text>,
		)
	}
	return (
		<View
			style={[styles.keypad, {left: pos.position[0], bottom: pos.position[1]}]}
		>
			{buttons}
			{extras}
		</View>
	)
}

const styles = StyleSheet.create({
	keypad: {
		position: 'absolute',
	},
	keypad_text1: {
		position: 'absolute',
		left: -120,
		bottom: 160,
		fontSize: 50,
	},
	keypad_text2: {
		position: 'absolute',
		left: -120,
		bottom: 80,
		fontSize: 50,
	},
})

export default Keypad
