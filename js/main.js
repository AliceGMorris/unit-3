//First line of main.js...wrap everything in a self-executing anonymous function to move to local scope
(function(){

	//pseudo-global variables
	var attrArray = ["Pop", "Pop/Km", "PercWelsh", "HigherEd", "NEETSPerc"]; //list of attributes
	var expressed = attrArray[0]; //initial attribute
	
	//chart frame dimensions
	var chartWidth = window.innerWidth * 0.425,
		chartHeight = 473,
		leftPadding = 50,
		rightPadding = 2,
		topBottomPadding = 5,
		chartInnerWidth = chartWidth - leftPadding - rightPadding,
		chartInnerHeight = chartHeight - topBottomPadding * 2,
		translate = "translate(" + leftPadding + "," + topBottomPadding + ")";
	//create a scale to size bars proportionally to frame and for axis
	var yScale = d3.scaleLinear()
		.range([463, 0])
		.domain([0, 100]);

	var chart = d3.select("#map")
			.append("svg")
			.attr("width", chartWidth)
			.attr("height", chartHeight)
			.attr("class", "chart");
	
	//create vertical axis generator
	var yAxis = d3.axisLeft()
	.scale(yScale);
			
	//place axis
	var axis = chart.append("g")
		.attr("class", "axis")
		.attr("transform", translate)
		.call(yAxis);
	
	//begin script when window loads
	window.onload = setMap();

	//set up choropleth map
	function setMap(){
		//map frame dimensions
		var width = window.innerWidth * 0.5,
			height = 460;
		
		//create new svg container for the map
		var map = d3.select("#map")
		.append("svg")
		.attr("class", "map")
		.attr("width", width)
		.attr("height", height);
		
		//create Albers equal area conic projection centered on wales
		var projection = d3.geoAlbers()
		.center([-5.5, 52.4])
		.rotate([-2, 0])
		.parallels([51, 53])
		.scale(12000)
		.translate([width / 2, height / 2]);
		
		var path = d3.geoPath()
			.projection(projection);
		
		//use Promise.all to parallelize asynchronous data loading
		var promises = []; 
		promises.push(d3.csv("data/WalesData.csv")); //load attributes from csv 
		promises.push(d3.json("data/EuropeCountries2.topojson")); //load background spatial data 
		promises.push(d3.json("data/WalesRegions.topojson")); //load choropleth spatial data 
		Promise.all(promises).then(callback);		
		
		function callback(data) {
			var csvData = data[0],
				europe = data[1],
				wales = data[2];
				
			//place graticule on the map
			setGraticule(map, path);
			
			//translate europe TopoJSON
			var europeCountries = topojson.feature(europe, europe.objects.EuropeCountries),
			WalesRegions = topojson.feature(wales, wales.objects.Wales).features;
			
			//add Europe countries to map
			var countries = map.append("path")
				.datum(europeCountries)
				.attr("class", "countries")
				.attr("d", path);
			
			//join csv data to GeoJSON enumeration units
			WalesRegions = joinData(WalesRegions, csvData);
			
			//create the color scale
			var colorScale = makeColorScale(csvData);
			
			//add enumeration units to the map
			setEnumerationUnits(WalesRegions, map, path, colorScale);
			
			//add coordinated visualization to the map
			setChart(csvData, colorScale);
			
			createDropdown(csvData);
		};
	};
	
	//function to create color scale generator
	function makeColorScale(data){
		var colorClasses = [
			"#7b3294",
			"#c2a5cf",
			"#808080",
			"#a6dba0",
			"#008837"
		];

		//create color scale generator
		var colorScale = d3.scaleQuantile()
			.range(colorClasses);

		var domainArray = [];
		for (var i=0; i<data.length; i++){
			var val = parseFloat(data[i][expressed]);
			domainArray.push(val);
		};

		//assign array of expressed values as scale domain
		colorScale.domain(domainArray);

		return colorScale;
	};

			
	function joinData(WalesRegions, csvData){	
		//loop through csv to assign each set of csv attribute values to geojson region
		for (var i=0; i<csvData.length; i++){
			var csvRegion = csvData[i]; //the current region
			var csvKey = csvRegion.name; //the CSV primary key

			//loop through geojson regions to find correct region
			for (var a=0; a<WalesRegions.length; a++){

				var geojsonProps = WalesRegions[a].properties; //the current region geojson properties
				var geojsonKey = geojsonProps.name; //the geojson primary key

				//where primary keys match, transfer csv data to geojson properties object
				if (geojsonKey == csvKey){

					//assign all attributes and values
					attrArray.forEach(function(attr){
						var val = parseFloat(csvRegion[attr]); //get csv attribute value
						geojsonProps[attr] = val; //assign attribute and value to geojson properties
					});
				};
			};
		};
		return WalesRegions;
	};
	function setGraticule(map, path){
			//create graticule generator
			var graticule = d3.geoGraticule()
			.step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude
			
			//create graticule background
			var gratBackground = map.append("path")
				.datum(graticule.outline()) //bind graticule background
				.attr("class", "gratBackground") //assign class for styling
				.attr("d", path) //project graticule
			
			//create graticule lines
			var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
			.data(graticule.lines()) //bind graticule lines to each element to be created
			.enter() //create an element for each datum
			.append("path") //append each element to the svg as a path element
			.attr("class", "gratLines") //assign class for styling
			.attr("d", path); //project graticule lines
	};
	function setEnumerationUnits(WalesRegions, map, path, colorScale){
		//add wales regions to map
		var regions = map.selectAll(".regions")
			.data(WalesRegions)
			.enter()
			.append("path")
			.attr("class", function(d){
				return "regions " + d.properties.name;
			})
			.attr("d", path)
			.style("fill", function(d){            
                var value = d.properties[expressed];            
                if(value) {                
                    return colorScale(d.properties[expressed]);            
                } else {                
                    return "#8B0000";            
                }    
			})
			.on("mouseover", function(event, d){
				highlight(d.properties);
			})
			.on("mouseout", function(event, d){
				dehighlight(d.properties);
			})
			.on("mousemove", moveLabel);
			
			var desc = regions.append("desc")
				.text('{"stroke": "#000", "stroke-width": "0.5px"}');
	};
	//function to create coordinated bar chart
	function setChart(csvData, colorScale){		
		//set bars for each province
		var bars = chart.selectAll(".bar")
			.data(csvData)
			.enter()
			.append("rect")
			.sort(function(b, a){
				return b[expressed]-a[expressed]
			})
			.attr("class", function(d){
				return "bar " + d.name;
		})
		.attr("width", chartInnerWidth / csvData.length - 1)
		.on("mouseover", function(event, d){
			highlight(d);
		})
		.on("mouseover", function(event, d){
			dehighlight(d);
		})
		.on("mousemove", moveLabel);
		
		var desc = bars.append("desc")
			.text('{"stroke": "none", "stroke-width": "0px"}');
		
		var chartTitle = chart.append("text")
			.attr("x", 55)
			.attr("y", 40)
			.attr("class", "chartTitle")
			
		//set bar positions, heights, and colors
		updateChart(bars, csvData.length, colorScale);
	};
	
	//function to create a dropdown menu for attribute selection
	function createDropdown(csvData){
		//add select element
		var dropdown = d3.select("#dropdown")
			.append("select")
			.attr("class", "dropdown")
			.on("change", function(){
			changeAttribute(this.value, csvData)
		});
		//add initial option
		var titleOption = dropdown.append("option")
		.attr("class", "titleOption")
		.attr("disabled", "true")
		.text("Select Attribute");
		
		//add attribute name options
		var attrOptions = dropdown.selectAll("attrOptions")
			.data(attrArray)
			.enter()
			.append("option")
			.attr("value", function(d){ return d })
			.text(function(d){ return d });
	};
	//dropdown change event handler
	function changeAttribute(attribute, csvData) {
		//change the expressed attribute
		expressed = attribute;
		
		//recreate the color scale
		var colorScale = makeColorScale(csvData);
		
		//recolor enumeration units
		var regions = d3.selectAll(".regions")
			.transition()
			.duration(1000)
			.style("fill", function(d){ 
				var value = d.properties[expressed]; 
				if(value) { 
				return colorScale(value); 
				} else { 
				return "#8B0000"; 
				} 
			});
		var bars = d3.selectAll(".bar")
			//Sort bars
			.sort(function(b, a){
				return b[expressed] - a[expressed];
			})
			.transition() //add animation
			.delay(function(d, i){
				return i * 20
			})
			.duration(500);
		
		updateChart(bars, csvData.length, colorScale);
	};
	//function to position, size, and color bars in chart
	function updateChart(bars, n, colorScale){
		if (expressed == attrArray[0]) {
			yScale = d3.scaleLinear()
				.range([463, 0])
				.domain([0, 362400]);
			
			axis.remove();	
			
			//create vertical axis generator
			yAxis = d3.axisLeft()
			.scale(yScale);
			
			//place axis
			axis = chart.append("g")
				.attr("class", "axis")
				.attr("transform", translate)
				.call(yAxis);
		} else if (expressed == attrArray[1]) {
			yScale = d3.scaleLinear()
				.range([463, 0])
				.domain([0, 2572]);
				
			axis.remove();	
				
			//create vertical axis generator
			yAxis = d3.axisLeft()
			.scale(yScale);
			
			//place axis
			axis = chart.append("g")
				.attr("class", "axis")
				.attr("transform", translate)
				.call(yAxis);
		} else {
			yScale = d3.scaleLinear()
				.range([463, 0])
				.domain([0, 100]);
			
			axis.remove();	
			
			//create vertical axis generator
			yAxis = d3.axisLeft()
			.scale(yScale);
			
			//place axis
			axis = chart.append("g")
				.attr("class", "axis")
				.attr("transform", translate)
				.call(yAxis);
		}
		//position bars
		bars.attr("x", function(d, i){
				return i * (chartInnerWidth / n) + leftPadding;
			})
			//size/resize bars
			.attr("height", function(d, i){
				return 463 - yScale(parseFloat(d[expressed]));
			})
			.attr("y", function(d, i){
				return yScale(parseFloat(d[expressed])) + topBottomPadding;
			})
			//color/recolor bars
			.style("fill", function(d){ 
				var value = d[expressed]; 
				if(value) { 
					return colorScale(value); 
				} else { 
					return "#8B0000"; 
				} 
		});
		//Pop
		if (expressed == attrArray[0]) {
			var chartTitle = d3.select(".chartTitle")
				.text("Number of people in each region");
			var Title = d3.select("#LabelTitle")
				.text(expressed)
			var Title = d3.select("#Para")
				.text("As of the 2021 Census, 93.8% of the population identified as White, with 90.6% of the white population identifying as Welsh, English, Scottish, Northern Irish, or British. People in the Black, Black Welsh, Caribbean of African group were most likely to report as being in very good health (88.7%). Asian, Asian Welsh, or Asian British group were the least likely to classify themselves as being disabled (9.7%). Asian, Asian Welsh, or Asian British group were most likely to hold qualifications at Level 4 or above (43.9%) while the white group was least likely (9.3%).")
		//Pop/SqKM
		} else if (expressed == attrArray[1]) {
			var chartTitle = d3.select(".chartTitle")
				.text("Number of people per square kilometer in each region");
			var Title = d3.select("#LabelTitle")
				.text(expressed)
			var Title = d3.select("#Para")
				.text(" Wales has 150 residents per square kilometer. Cardiff is the densest at 2572 residents per square kilometer, more than 3 times the next highest, Newport, at 838 residents per square kilometer. Powys has the lowest density at 26 residents per square kilometer.")
		//% Welsh Speakers
		} else if (expressed == attrArray[2]) {
			var chartTitle = d3.select(".chartTitle")
				.text("Percentage of people in each region who can speak Welsh");
			var Title = d3.select("#LabelTitle")
				.text(expressed)
			var Title = d3.select("#Para")
				.text("As of the 2021 Welsh Census, 17.8% of the population over the age of 3 could speak Welsh. 1.2% points lower than the 2011 Census. With the percentage of people able to speak Welsh being the lowest percentage ever recorded in a census. 5 to 15 year old age group saw a 6 percentage point decrease. The highest areas of Welsh speaking are in the north-west.")
		//%HigherEd
		} else if (expressed == attrArray[3]) {
			var chartTitle = d3.select(".chartTitle")
				.text("Percentage of people aged 18-19 not pursuing higher education");
			var Title = d3.select("#LabelTitle")
				.text(expressed)
			var Title = d3.select("#Para")
				.text("19.9% of the Welsh population reported having no qualifications, while 31.5% reported having a Level 4 qualification or above. Most regions saw a decrease in proportion of full-time students since 2011, except for 5 local authorities such as Cardiff. Cardiff saw the highest percentage of schoolchildren or full-time students at 27.6% of their population while Powys saw the lowest at 15.5%.")
		//%NEETs
		} else if (expressed == attrArray[4]) {
			var chartTitle = d3.select(".chartTitle")
				.text("Percentage of people aged 16-24 who are NEETs by region");
			var Title = d3.select("#LabelTitle")
				.text(expressed)
			var Title = d3.select("#Para")
				.text("Young people not in education, employment or training (NEET) has seen a decrease from 2011 to 2017, but saw a rise between 2020 and 2021. This increase is driven by an economic inactivity rate. 2008 saw the largest increase in NEETs (17.4% increase between 2008 and 2009) which continued to lower every year up to 2017. Males have a higher percentage of NEETs in the 16-18 age group with Males being 14.7% and females being 12.4%. 19-24 age group saw an increase in female NEETs from 14.3% to 15.9% while males saw a decrease from 2020-2021 from 17.2% to 16.7%.")
		}
		
	};
	//function to highlight enumeration units and bars
	function highlight(props){
		//change stroke
		var selected = d3.selectAll("." + props.name)
			.style("stroke", "blue")
			.style("stroke-width", "2");
	};
	//function to reset the element style on mouseout
	function dehighlight(props){
		var selected = d3.selectAll("." + props.name)
			.style("stroke", function(){
				return getStyle(this, "stroke")
			})
			.style("stroke-width", function(){
				return getStyle(this, "stroke-width")
			});
		function getStyle(element, styleName){
			var styleText = d3.select(element)
				.select("desc")
				.text();
			var styleObject = JSON.parse(styleText);
			return styleObject[styleName];
		};
		d3.select(".infolabel")
			.remove();
	};
	//function to create dynamic label
	function setLabel(props){
		//label content
		var labelAttribute = "<h1>" + props[expressed] +
			"</h1><b>" + expressed + "</b>";
			
		//create info label div
		var infolabel = d3.select("#map")
			.append("div")
			.attr("class", "infolabel")
			.attr("id", props.name + "_label")
			.html(labelAttribute);
			
		var regionName = infolabel.append("div")
			.attr("class", "labelname")
			.html(props.name);
	};
	//function to move info label with mouse
	function moveLabel(){
		//get width of label
		var labelWidth = d3.select(".infolabel")
			.node()
			.getBoundingClientRect()
			.width;
		
		//use coordinates of mousemove event to set label coordinates
		var x1 = event.clientX + 10,
		y1 = event.clientY - 75,
		x2 = event.clientX - labelWidth - 10,
		y2 = event.clientY + 25;
		
		//horizontal label coordinate, testing for overflow
		var x = event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1; 
		//vertical label coordinate, testing for overflow
		var y = event.clientY < 75 ? y2 : y1; 
		
		d3.select(".infolabel")
			.style("left", x + "px")
			.style("top", y + "px");
	};
})();