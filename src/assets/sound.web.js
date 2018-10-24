import {Howl} from 'howler'

export default class Sound {
	static setCategory() {}

	constructor(asset, error) {
		this.sound = new Howl({
			src: [asset],
			onloaderror: error,
		})

		this.play = this.play.bind(this)
		this.stop = this.stop.bind(this)
	}

	play() {
		if (this.sound.state() !== 'loaded') return this
		this.sound.play()
		return this
	}

	stop() {
		this.sound.stop()
		return this
	}
}
