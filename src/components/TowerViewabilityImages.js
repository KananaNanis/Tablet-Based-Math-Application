import React from 'react'
import {StyleSheet, Animated, Image, View} from 'react-native'
import * as Anim from '../event/animation'
import {image_location} from '../lib/images'
import {global_constant} from '../lib/global'
import {query_prop} from '../providers/query_store'
import {tower_name2height} from '../providers/query_tower'

class TowerViewabilityImages extends React.Component {
	state = {
		timer: Anim.new_timer(),
	}

	render() {
		let {name} = this.props

		let scale_factor = query_prop('scale_factor')
		let tower_height = tower_name2height(name)

		let number_of_ants = Math.trunc((tower_height * 100) % 10)

		let ant_images = []
		let ant_image = {name: 'ant', style: styles.ant_image}

		let container_style = {
			position: 'absolute',
			bottom: scale_factor * (Math.trunc(tower_height * 10) / 10),
			left: scale_factor * global_constant.tower.size2depth[-2] + 50,
		}

		let container_antfiver_style = {
			flex: 1,
			flexDirection: 'row',
		}

		let ant_image5 = []

		for (let i = 0; i < number_of_ants; ++i) {
			if (number_of_ants > 4 && i < 5) {
				ant_image5.push(
					<Image
						key={9 + i}
						source={image_location(ant_image.name)}
						style={ant_image.style}
					/>,
				)
			} else {
				ant_images.push(
					<Image
						key={9 + i}
						source={image_location(ant_image.name)}
						style={ant_image.style}
					/>,
				)
			}
		}

		return (
			<Animated.View style={container_style}>
				{ant_images}
				<View style={container_antfiver_style}>{ant_image5}</View>
			</Animated.View>
		)
	}
}

const styles = StyleSheet.create({
	ant_image: {
		width: 15,
		height: 10,
	},
})

export default TowerViewabilityImages
