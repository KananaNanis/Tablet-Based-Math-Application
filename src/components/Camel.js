import React from 'react'
import {View, Image, StyleSheet} from 'react-native'
import {global_constant} from '../lib/global'
import {image_location} from '../lib/images'
import ErrBox from './ErrBox'

const CamelBaggage = ({err_box_updated, scale_factor, bottom, err_list}) => {
	let floor = 0
	let scale = global_constant.camels.baggage_scale
	let boxes = []
	for (let i = 0; i < err_list.length; ++i) {
		const err = err_list[i]
		let h = err * scale * scale_factor
		let anim_info = null
		if (
			err_box_updated.hasOwnProperty('position') &&
			i + 1 === err_list.length
		) {
			anim_info = err_box_updated
		}
		//console.log('err', err, 'floor', floor, 'h', h)
		boxes.push(
			<ErrBox
				key={i}
				anim_info={anim_info}
				height={h}
				position={[0, floor]}
				width={40}
			/>,
		)
		if (h > 0) floor += h + 1
	}
	return (
		<View
			style={[
				styles.camel_baggage,
				{bottom, left: global_constant.camels.baggage_offset},
			]}
		>
			{boxes}
		</View>
	)
}

const Camel = ({
	err_box_updated,
	camel_index,
	err_list,
	scale_factor,
	style,
}) => {
	if (!global_constant) return null
	let img = null
	let img_name = 'camel' + camel_index
	let scale = global_constant.camels.camel_scale
	let width = scale * global_constant.camels[img_name].pixel_width
	let height = scale * global_constant.camels[img_name].pixel_height
	if (img_name) {
		img = (
			<Image
				source={image_location(img_name)}
				style={[styles.image_default, {width, height}]}
			/>
		)
	}
	return (
		<View
			style={[
				styles.camel,
				style,
				{
					width,
					height,
					right: global_constant.camels.camel_offsets[0],
					bottom: global_constant.camels.camel_offsets[1],
				},
			]}
		>
			{img}
			<CamelBaggage
				bottom={height}
				err_box_updated={err_box_updated}
				err_list={err_list}
				scale_factor={scale_factor}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	image_default: {
		position: 'absolute',
	},
	camel: {
		position: 'absolute',
	},
	camel_baggage: {
		position: 'absolute',
	},
})

export default Camel
