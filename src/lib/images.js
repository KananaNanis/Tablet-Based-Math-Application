export const image_location = (
	name,
	just_grey = false,
	swap_channel = false,
) => {
	let extra = ''
	if ('01' === swap_channel || '02' === swap_channel || '12' === swap_channel) {
		// extra = '.' + swap_channel
	} else if (just_grey) extra = '.bw'
	return require('../assets/img/' + name + extra + '.png')
}
