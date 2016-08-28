import Stage from '../../engine/Stage';
import MapGenerator from './util/MapGenerator';

export default class Map extends Stage {

	constructor(engine) {
		super();
		this.engine = engine;
		
		this.map = new MapGenerator({
			width: this.engine.config.width,
			height: this.engine.config.height,
			sites: 200
		});
	}

	render() {
		//Sites
		let point = new PIXI.Graphics();
		for(var i=0; i<this.map.sites.length; i++) {
			point.beginFill(0xFF0000);
			point.drawCircle(this.map.sites[i].x, this.map.sites[i].y, 2);
			point.endFill();
		}
		this.addChild(point);

		//Cells
		let area = new PIXI.Graphics();
		let sites = this.map.sites;
		for(var i=0; i<sites.length; i++) {
			let cell = this.map.diagram.cells[sites[i].voronoiId];

			if(cell.halfedges.length > 2) {
				let halfedges = cell.halfedges;
				let startPoint = cell.halfedges[0].getStartpoint();

				area.beginFill(sites[i].biomeColor);
				//area.lineStyle(2, 0xFF0000);
				area.moveTo(startPoint.x, startPoint.y);

				for(var k=0; k<halfedges.length; k++) {
					let endPoint = halfedges[k].getEndpoint();
					area.lineTo(endPoint.x, endPoint.y);
				}
				area.endFill();
			}
		}
		this.addChild(area);

		//Vertex
		let line = new PIXI.Graphics();
		line.lineStyle(1, 0x000000, .1);
		for(var i=0; i<this.map.diagram.edges.length; i++) {
			line.moveTo(this.map.diagram.edges[i].va.x, this.map.diagram.edges[i].va.y);
			line.lineTo(this.map.diagram.edges[i].vb.x, this.map.diagram.edges[i].vb.y);
		}
		//this.addChild(line);
	}

	

	update() {

	}

}