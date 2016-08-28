import Engine from '../engine/Engine';
//import Intro from './intro/Intro';
import Map from './map/Map';

export default class StageManager extends Engine {

	constructor(config) {
		super(config);

		this.createStage('map', new Map(this));
		//this.createStage('intro', new Intro(this));
		this.gotoAndPlay('map');
	}

}