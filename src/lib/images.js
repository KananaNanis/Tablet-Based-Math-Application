export const image_location = (name, just_grey = false) =>
	require('../assets/img/' + name + (just_grey ? '.bw' : '') + '.png')
