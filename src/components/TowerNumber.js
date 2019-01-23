import React from 'react'
import {StyleSheet, Animated, Image, Text, View} from 'react-native'
import * as Anim from '../event/animation'
import {image_location} from '../lib/images'

class TowerNumber extends React.Component {
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
			id,
			name,
			// position,
			anim_info,
			keypad_column,
			target,
			tower_number_style,
			hide_image,
			// just_grey = false,
		} = this.props
		// console.log('TowerNumber id', this.props.id, 'name', this.props.name)

		if ('undefined' === typeof name) {
			console.error('Cannot render tower number id', id)
			return null
		}
		let animated_style = {}
		if (anim_info) {
			Anim.interpolate_anim_attr(
				id,
				anim_info,
				this.state.timer,
				animated_style,
			)
		}

		let digits = [0, 0, 0] // goats, anansis, baby anansis
		for (let i = 0; i < name.length; ++i) {
			if (name[i] > 0.999) digits[0] += Math.round(name[i])
			else if (10 * name[i] > 0.999) digits[1] += Math.round(10 * name[i])
			else if (100 * name[i] > 0.999) digits[2] += Math.round(100 * name[i])
		}
		//console.log(digits)

		let animal_images = [
			{name: 'goat', style: styles.goat_image, extra_style: {}},
			{name: 'anansi', style: styles.anansi_image, extra_style: {}},
			{
				name: 'ant',
				style: styles.ant_image,
				extra_style: {borderRightWidth: 1},
			},
		]
		if (id === target) {
			if (keypad_column === 'goat') {
				animal_images[0].extra_style = {
					backgroundColor: 'white',
				}
			}
			if (keypad_column === 'spider') {
				animal_images[1].extra_style = {
					backgroundColor: 'white',
				}
			}
			if (keypad_column === 'ant') {
				animal_images[2].extra_style = {
					backgroundColor: 'white',
					borderRightWidth: 1,
				}
			}
		}

		let name_elements = []
		let show_digit = false
		for (let i = 0; i < digits.length; ++i) {
			if (digits[i] > 0 || i + 1 === digits.length) show_digit = true
			name_elements.push(
				<View
					key={4 + i}
					style={[
						styles.tower_number_element,
						{left: 60 * i - 10},
						animal_images[i].extra_style,
					]}
				>
					{!hide_image ? (
						<Image
							key={1}
							source={image_location(animal_images[i].name)}
							style={animal_images[i].style}
						/>
					) : null}
					{show_digit ? (
						<View style={styles.tower_number_text_wrapper}>
							<Text style={styles.tower_number_text}>{digits[i]}</Text>
						</View>
					) : null}
				</View>,
			)
		}
		return (
			<Animated.View
				style={[styles.tower_number, tower_number_style, animated_style]}
			>
				{name_elements}
			</Animated.View>
		)
	}
}

const styles = StyleSheet.create({
	tower_number: {
		position: 'absolute',
		top: 0,
		left: 5,
	},
	goat_image: {
		width: 40,
		height: 60,
		left: 10,
	},
	anansi_image: {
		width: 50,
		height: 40,
		left: 8,
		top: 20,
		// marginBottom: 20,
	},
	ant_image: {
		top: 30,
		width: 40,
		height: 30,
		left: 10,
		// marginBottom: 30,
	},
	tower_number_text: {
		fontSize: 100,
	},
	tower_number_text_wrapper: {
		position: 'absolute',
		top: 60
	},
	tower_number_element: {
		position: 'absolute',
		height: 300,
		width: 60,
		borderLeftWidth: 1,
	},
})

export default TowerNumber
