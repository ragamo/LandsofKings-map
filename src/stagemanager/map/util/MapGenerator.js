import Voronoi from 'voronoi';

export default class MapGenerator {

	constructor(config) {
		this.config = config;

		this.voronoi = new Voronoi();
		this.bbox = { xl: 1, xr: config.width, yt: 1, yb: config.height }; // xl is x-left, xr is x-right, yt is y-top, and yb is y-bottom 

		this.elevation = Math.random();
		this.moisture = Math.random();

		this.sites = this.generateRandomSites(config.sites || 100);
		this.diagram = this.voronoi.compute(this.sites, this.bbox);
		this.relaxVoronoi(2);
		this.setBiomes(this.sites);
	}

	generateRandomSites(n = 100, margin = 0) {
		let output = [];
		let dx = this.config.width - 2*margin;
		let dy = this.config.height - 2*margin;

		for(var i=0; i<n; i++) {
			output.push({
				x: Math.round(margin+Math.random()*dx),
				y: Math.round(margin+Math.random()*dy)
			});
		}		
		return output;
	}

	relaxVoronoi(n = 1) {
		for(var i=0; i<n; i++) {
			this.sites = this.relaxSites();
			this.diagram = this.voronoi.compute(this.sites, this.bbox);
		}
	}

	relaxSites() {
		if(!this.diagram) return;

		let sites = [];
		for(var i=0; i<this.diagram.cells.length; i++) {
			sites.push(Object.assign(this.sites[i], this.getCellCentroid(this.diagram.cells[i])));
		}
		return sites;
	}

	cellArea(cell) {
		var area = 0,
			halfedges = cell.halfedges,
			iHalfedge = halfedges.length,
			halfedge,
			p1, p2;

		while(iHalfedge--) {
			halfedge = halfedges[iHalfedge];
			p1 = halfedge.getStartpoint();
			p2 = halfedge.getEndpoint();
			area += p1.x * p2.y;
			area -= p1.y * p2.x;
		}

		area /= 2;
		return area;
	}

	getCellCentroid(cell) {
		var x = 0, y = 0,
			halfedges = cell.halfedges,
			iHalfedge = halfedges.length,
			halfedge,
			v, p1, p2;

		while (iHalfedge--) {
			halfedge = halfedges[iHalfedge];
			p1 = halfedge.getStartpoint();
			p2 = halfedge.getEndpoint();
			v = p1.x*p2.y - p2.x*p1.y;
			x += (p1.x+p2.x) * v;
			y += (p1.y+p2.y) * v;
		}

		v = this.cellArea(cell) * 6;

		return {
			x: x/v,
			y: y/v
		};
	}

	setBiomes(sites) {
		let elevationDelta = 0.125; //0.25;
		let moistureDelta = 0.08; //0.16;

		for(var i=0; i<sites.length; i++) {
			//Random elevation
			let elevation = this.elevation + (elevationDelta * Math.random()) * (Math.random() > 0.5 ? 1 : -1);
			elevation = (elevation  > 1) ? 1 : (elevation < 0) ? 0 : elevation;
			this.elevation = elevation;

			//Random moisture
			let moisture = this.moisture + (moistureDelta * Math.random()) * (Math.random() > 0.5 ? 1 : -1);
			moisture = (moisture  > 1) ? 1 : (moisture < 0) ? 0 : moisture;
			this.moisture = moisture;

			//Biome
			let biome = this.getBiome(elevation, moisture);

			Object.assign(sites[i], {
				elevation: elevation,
				moisture: moisture,
				biome: biome,
				biomeColor: this.getBiomeColor(biome)
			});
		}

		return sites;
	}

	getBiome(elevation, moisture) {
		if(elevation < 0.1) {
			if(moisture > 0.48) return 'WATER';
			else return 'SUBTROPICAL_DESERT';

		} else if(elevation >= 0.1 && elevation < 0.25) {
			if(moisture < 0.16) return 'SUBTROPICAL_DESERT';
			if(moisture > 0.16 && moisture < 0.32) return 'GRASSLAND';
			if(moisture > 0.32 && moisture < 0.64) return 'TROPICAL_SEASONAL_FOREST';
			if(moisture > 0.64) return 'TROPICAL_RAIN_FOREST';

		} else if(elevation >= 0.25 && elevation < 0.50) {
			if(moisture < 0.16) return 'TEMPERATE_DESERT';
			if(moisture > 0.16 && moisture < 0.48) return 'GRASSLAND';
			if(moisture > 0.48 && moisture < 0.83) return 'TEMPERATE_FOREST';
			if(moisture > 0.83) return 'TEMPERATE_RAIN_FOREST';

		} else if(elevation >= 0.50 && elevation < 0.75) {
			if(moisture < 0.32) return 'TEMPERATE_DESERT';
			if(moisture > 0.32 && moisture < 0.64) return 'SHRUBLAND';
			if(moisture > 0.64) return 'TAIGA';

		} else if(elevation >= 0.75) {
			if(moisture < 0.16) return 'SCORCHED';
			if(moisture > 0.16 && moisture < 0.32) return 'BARE';
			if(moisture > 0.32 && moisture < 0.48) return 'TUNDRA';
			if(moisture > 0.48) return 'SNOW';
		}
	}

	getBiomeColor(biome = 'SNOW') {
		switch(biome) {
			case 'WATER': return 0x557DA6;
			case 'SUBTROPICAL_DESERT': return 0xE9DDC7;
			case 'GRASSLAND': return 0xC4D4AA;
			case 'TROPICAL_SEASONAL_FOREST': return 0xA9CCA4;
			case 'TROPICAL_RAIN_FOREST': return 0x9CBBA9;
			case 'TEMPERATE_DESERT': return 0xE4E8CA;
			case 'TEMPERATE_FOREST': return 0xB4C9A9;
			case 'TEMPERATE_RAIN_FOREST': return 0xA4C4A8;
			case 'SHRUBLAND': return 0xC4CCBB;
			case 'TAIGA': return 0xCCD4BB;
			case 'SCORCHED': return 0x999999;
			case 'BARE': return 0xBBBBBB;
			case 'TUNDRA': return 0xDDDDBB;
			case 'SNOW': return 0xFFFFFF;
		}
	}

}