//execute script when window is loaded.
window.onload = function(){
	//SVG dimension variables
	var w = 1600, h = 850;

	var container = d3.select("body") //get the <body> element from the DOM
		.append("svg") //put a new svg in the body
		.attr("width", w) //assign the width
		.attr("height", h) //assign the height
		.attr("class", "container") //always assign a class (as the block name) for styling and future selection
		.style("background-color", "rgba(0,0,0,0.2)");
		
	//innerRect block
	var innerRect = container.append("rect") //put a new rect in the svg
		.datum(750)
		.attr("width", function(d){ //rectangle width
			return d * 2; //750 * 2 = 1500
		})
		.attr("height", function(d){ //rectangle height
			return d; //750
		})
		.attr("class", "innerRect") //class name
		.attr("x", 50) //position from left on the x (horizontal) axis
		.attr("y", 50) //position from top on the y (vertical) axis
		.style("fill", "#FFFFFF"); //fill color
	
	/* Sources:
		1-2) https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/bulletins/populationandhouseholdestimateswales/census2021
		3) https://statswales.gov.wales/Catalogue/Welsh-Language/Annual-Population-Survey-Welsh-Language/annualpopulationsurveyestimatesofpersonsaged3andoverwhosaytheycanspeakwelsh-by-localauthority-measure
		4-5) https://statswales.gov.wales/Catalogue/Community-Safety-and-Social-Inclusion/Communities-First/keyindicators-by-localauthority
	*/
	var WalesData = [
	{ 
		Area: 'Newport',
		population: 159600,
		popDenSQKM: 838,
		WelshPercent: 22.4,
		NotHigherEd: 54,
		NEETSPercent: 16
	},
	{ 
		Area: 'Blaenau Gwent',
		population: 66900,
		popDenSQKM: 615,
		WelshPercent: 14.5,
		NotHigherEd: 81,
		NEETSPercent: 25
	},
	{ 
		Area: 'Denbighshire',
		population: 95800,
		popDenSQKM: 114,
		WelshPercent: 37.8,
		NotHigherEd: 68,
		NEETSPercent: 18
	},
	{ 
		Area: 'Vale of Glamorgan',
		population: 131800,
		popDenSQKM: 398,
		WelshPercent: 23.9,
		NotHigherEd: 62,
		NEETSPercent: 17
	},
	{ 
		Area: 'Isle of Anglesey',
		population: 68900,
		popDenSQKM: 97,
		WelshPercent: 62.8,
		NotHigherEd: 64,
		NEETSPercent: 15
	},
	{ 
		Area: 'Merthyr Tydfil',
		population: 58800,
		popDenSQKM: 528,
		WelshPercent: 21.8,
		NotHigherEd: 75,
		NEETSPercent: 28
	},
	{ 
		Area: 'Conwy',
		population: 114800,
		popDenSQKM: 102,
		WelshPercent: 39.7,
		NotHigherEd: 65,
		NEETSPercent: 17
	},
	{ 
		Area: 'Flintshire',
		population: 155000,
		popDenSQKM: 352,
		WelshPercent: 23.9,
		NotHigherEd: 71,
		NEETSPercent: 13
	},
	{ 
		Area: 'Wrexham',
		population: 135100,
		popDenSQKM: 268,
		WelshPercent: 26.6,
		NotHigherEd: 75,
		NEETSPercent: 17
	},
	{ 
		Area: 'Powys',
		population: 135100,
		popDenSQKM: 26,
		WelshPercent: 30.7,
		NotHigherEd: 61,
		NEETSPercent: 13
	},
	{ 
		Area: 'Cardiff',
		population: 362400,
		popDenSQKM: 2572,
		WelshPercent: 25.9,
		NotHigherEd: 68,
		NEETSPercent: 18
	},
	{ 
		Area: 'Monmouthshire',
		population: 93000,
		popDenSQKM: 110,
		WelshPercent: 17.3,
		NotHigherEd: 71,
		NEETSPercent: 18
	},
	{ 
		Area: 'Ceredigion',
		population: 71500,
		popDenSQKM: 40,
		WelshPercent: 57.7,
		NotHigherEd: 59,
		NEETSPercent: 10
	},
	{ 
		Area: 'Pembrokeshire',
		population: 123400,
		popDenSQKM: 76,
		WelshPercent: 27.4,
		NotHigherEd: 62,
		NEETSPercent: 17
	},
	{ 
		Area: 'Bridgend',
		population: 145500,
		popDenSQKM: 580,
		WelshPercent: 22.8,
		NotHigherEd: 69,
		NEETSPercent: 21
	},
	{ 
		Area: 'Carmarthenshire',
		population: 187900,
		popDenSQKM: 79,
		WelshPercent: 51,
		NotHigherEd: 63,
		NEETSPercent: 24
	},
	{ 
		Area: 'Swansea',
		population: 238500,
		popDenSQKM: 632,
		WelshPercent: 19.2,
		NotHigherEd: 67,
		NEETSPercent: 15
	},
	{ 
		Area: 'Neath Port Talbot',
		population: 142300,
		popDenSQKM: 322,
		WelshPercent: 22.6,
		NotHigherEd: 73,
		NEETSPercent: 24
	},
	{ 
		Area: 'Gwynedd',
		population: 117400,
		popDenSQKM: 46,
		WelshPercent: 74.2,
		NotHigherEd: 63,
		NEETSPercent: 18
	},
	{ 
		Area: 'Rhondda Cynon Taf',
		population: 237700,
		popDenSQKM: 560,
		WelshPercent: 19.8,
		NotHigherEd: 73,
		NEETSPercent: 28
	},
	{ 
		Area: 'Caerphilly',
		population: 175900,
		popDenSQKM: 634,
		WelshPercent: 24.6,
		NotHigherEd: 75,
		NEETSPercent: 27
	},
	{ 
		Area: 'Torfaen',
		population: 92300,
		popDenSQKM: 734,
		WelshPercent: 17.6,
		NotHigherEd: 74,
		NEETSPercent: 23
	}
	];
	
	var x = d3.scaleLinear() //create the scale
	.range([80, 1475]) //output min and max
	.domain([0, 21]); //input min and max
	
	//find the minimum value of the array
	var minWelsh = d3.min(WalesData, function(d){
		return d.WelshPercent;
	});
	//find the maximum value of the array
	var maxWelsh = d3.max(WalesData, function(d){
		return d.WelshPercent;
	});
	//scale for circles center y coordinate
	var y = d3.scaleLinear()
		.range([800, 50])
		.domain([0, 100]);
	
	//color scale generator 
	var color = d3.scaleLinear()
		.range([
			"#C8C8C8",
			"#00B140"
		])
		.domain([
			minWelsh, 
			maxWelsh
		]);

	var circles = container.selectAll(".circles") //create an empty selection
		.data(WalesData) //here we feed in an array
		.enter() //one of the great mysteries of the universe
		.append("circle") //inspect the HTML--holy crap, there's some circles there
		.attr("class", "circles")
		.attr("id", function(d){
			return d.Area;
		})
		.attr("r", function(d){
			//calculate the radius based on WelshPercent value as circle area
			var area = d.WelshPercent * 10;
			return Math.sqrt(area/Math.PI);
		})
		.attr("cx", function(d, i){
			//use the scale generator with the index to place each circle horizontally
			return x(i);
		})
		.attr("cy", function(d){
			//subtract value from 450 to "grow" circles up from the bottom instead of down from the top of the SVG
			return y(d.WelshPercent);
		})
		
		.style("fill", function(d, i){ //add a fill based on the color scale generator
			return color(d.WelshPercent);
		})
		.style("stroke", "#000"); //black circle stroke
		
	//create y axis generator
	var yAxis = d3.axisLeft(y);
		
	//create axis g element and add axis
	var axis = container.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(50, 0)")
		.call(yAxis);
	//create a text element and add the title
	var title = container.append("text")
		.attr("class", "title")
		.attr("text-anchor", "middle")
		.attr("x", 800)
		.attr("y", 30)
		.text("Percentage of people in Wales who can speak Welsh by local authorities");
		
	//create circle labels
	var labels = container.selectAll(".labels")
		.data(WalesData)
		.enter()
		.append("text")
		.attr("class", "labels")
		.attr("text-anchor", "left")
		.attr("y", function(d){
			//vertical position centered on each circle
			return y(d.WelshPercent) + 5;
		})
	var nameLine = labels.append("tspan")
		.attr("class", "nameLine")
		.attr("x", function(d,i){
			//horizontal position to the right of each circle
			return x(i) + Math.sqrt(d.WelshPercent * 10 / Math.PI) + 10;
		})
		.text(function(d){
			return d.Area;
		});
	//create format generator
	var format = d3.format(",");
	
	var welshLine = labels.append("tspan")
		.attr("class", "welshLine")
		.attr("x", function(d,i){
			return x(i) + Math.sqrt(d.WelshPercent * 10 / Math.PI) + 10;
		})
		.attr("dy", "15") //vertical offset
		.text(function(d){
			return "Welsh " + format(d.WelshPercent) + "%";
	});
};