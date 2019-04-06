		var mobile = 0;

		if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
			mobile = 1;
		}


		var swiper = new Swiper('.swiper-container', {
		      slidesPerView: 1,
		      spaceBetween: 10,
		     //  pagination: {
		     //    el: '.swiper-pagination',
		     //    clickable: true,
	      // },
		});

		queue()
				.defer(d3.csv, "assets/data/430_test3.csv")
				.defer(d3.csv, "assets/data/1750_test4.csv")
				.defer(d3.csv, "assets/data/1765_test3.csv")
				.defer(d3.csv, "assets/data/1786_test3.csv")
			    .await(enter);
			// } else {
			// 	queue()
			// 		.defer(d3.csv, "prev_mobile.csv")
			// 	    .defer(d3.csv, "cur_mobile.csv")
			// 	    .defer(d3.csv, "nycha_latlng.csv")
			// 	    .await(enter);
			// }

			function enter(error, four, fifty, sixty, eighty) {

				var spec_margin = 200;

				if(!mobile) {
					var svg = d3.select("svg[id='slider-bar']")
						.attr("width", 500 + 'px')
						.attr("height", 100 + 'px');
				} else {
					var svg = d3.select("svg[id='slider-bar']")
						.attr("width", 300 + 'px')
						.attr("height", 100 + 'px');
				}

			    var margin = {right: 50, left: 50},
			    width = +svg.attr("width") - margin.left - margin.right,
			    height = +svg.attr("height")
			    race_data = 1;

				if(!mobile){
					var x = d3.scaleLinear()
					    .domain([0, 100])
					    .range([0, 400])
					    .clamp(true);
				} else {
					var x = d3.scaleLinear()
					    .domain([0, 100])
					    .range([0, 250])
					    .clamp(true);
				}

				var colorScale = d3.scaleSequential(d3.interpolateReds)
    				.domain([0, 100]);

				var slider = svg.append("g")
				    .attr("class", "slider")
				    .attr("transform", "translate(" + margin.left + "," + margin.right + ")");

				slider.append("line")
				    .attr("class", "track")
				    .attr("x1", x.range()[0])
				    .attr("x2", x.range()[1])
				  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
				    .attr("class", "track-inset")
				  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
				    .attr("class", "track-overlay")
				    .call(d3.drag()
				        .on("start.interrupt", function() { slider.interrupt(); })
				        .on("start drag", function() { hue(x.invert(d3.event.x)); }));

				slider.insert("g", ".track-overlay")
				    .attr("class", "ticks")
				    .attr("transform", "translate(0," + 18 + ")")
				  .selectAll("text")
				  .data(x.ticks(5))
				  .enter().append("text")
				    .attr("x", x)
				    .attr("text-anchor", "middle")
				    .text(function(d) { return d + "%";});

				var handle = slider.insert("circle", ".track-overlay")
				    .attr("class", "handle")
				    .attr("r", 9);

				var formatNum = d3.format(".1f");

				var label = slider.append("text")  
				    .attr("class", "label")
				    .attr("text-anchor", "left")
				    .text(function(d) {
				    	if(race_data == 1) {
				    		return ("> " + formatNum(0) + "% below the poverty line");
				    	}
				    		else {
				    			return ("> " + formatNum(0) + "% black");
				    		}
				    	
				    })
				    .attr("transform", "translate(0," + (-25) + ")");

				var race_button = d3.select("#race_button")
					.text("race")
					// .style("float", "right")
					.style("margin-top", 20 + "px")
					.style("justify-content", "center")
					// .style("margin-right", 200 + "px")
					// .attr("id", "race_button")
					.on("click", function(){

						d3.select("#poverty_button").style("background-color", "#f8f8f8");
						d3.select(this).style("background-color", colors[1]);

						// console.log(race_data);
						if(race_data == 1) {
							race_data = 0;

							zero();

							slider.call(d3.drag()
								.on("start.interrupt", function() { slider.interrupt(); })
				        		.on("start drag", function() { hue(x.invert(d3.event.x)); }));
						} 
						// console.log(race_data);
					})

				var pov_button = d3.select("#poverty_button")
					.text("poverty")
					// .style("float", "right")
					.style("margin-top", 20 + "px")
					.style("justify-content", "center")
					// .style("margin-right", 200 + "px")
					// .attr("id", "poverty")
					.on("click", function(){

						d3.select("#race_button").style("background-color", "#f8f8f8");
						d3.select(this).style("background-color", colors[3]);

						// console.log("IS THIS FUCKING THING ON?")
						// console.log(race_data);
						if(race_data == 0) {
							race_data = 1;

							zero();

							slider.call(d3.drag()
								.on("start.interrupt", function() { slider.interrupt(); })
				        		.on("start drag", function() { hue(x.invert(d3.event.x)); }));
						} 
						// console.log(race_data);
					})




				// slider.transition() // Gratuitous intro!
				//     .duration(750)
				//     .tween("hue", function() {
				//       var i = d3.interpolate(0, 70);
				//       return function(t) { hue(i(t)); };
				//     });


		
				// Select your div
				var waffle_four = d3.select('.waffle-four');
				var waffle_fifty = d3.select('.waffle-fifty');
				var waffle_sixty = d3.select('.waffle-sixty');
				var waffle_eighty = d3.select('.waffle-eighty');
				var block = d3.select('.block');
				var axis = document.createTextNode("1");
				// Create an array with numbers 0 - 99
				const numbers = d3.range(30);

				var temp = 0-1;

				const colors = {1:'#fe4a49',2:'#ede6de',3:'#fdd065', 4:'rgba(0,0,0,0)', 5:'#f2f0ed', 6:'#e8e8e8'};

				var twelve_floors = ['Twelfth', 'Eleventh', 'Tenth', 'Ninth', 'Eighth', 'Seventh', 'Sixth', 'Fifth', 'Fourth', 'Third', 'Second', 'First'];

				var fifteen_floors = ['Fifteenth', 'Fourteenth', 'Thirteenth', 'Twelfth', 'Eleventh', 'Tenth', 'Ninth', 'Eighth', 'Seventh', 'Sixth', 'Fifth', 'Fourth', 'Third', 'Second', 'First'];

				var height = window.innerHeight*0.55,
				twelve_square = height/12,
				fifteen_square = height/15 + 2;

				var head_div = d3.select(".swiper-container").append("div")
					.attr("class", "head_tooltip")
					.style("display", "none");

				var img_div = d3.select(".swiper-container").append("div")	
		    		.attr("class", "img_tooltip")				
		    		.style("display", "none");

		    	var text_div = d3.select(".swiper-container").append("div")	
		    		.attr("class", "text_tooltip")				
		    		.style("display", "none");

				waffle_four
					.style('width', (fifteen_square)*10 + 'px')
					.selectAll('.block')
					.data(four)
					.enter()
					.append('div')
					.attr('class', 'block')
						.style('width', fifteen_square + 'px')
						.style('height', fifteen_square + 'px')
						.attr('id', function(d) { return d.apt;})
						.attr('unit', function(d) { return d.unit;})
						.attr('name', function(d) { return d.tenant;})
						.attr('post', function(d) { return d.post_address;})
						.attr('desc', function(d) { return d.desc;})
						.attr('race', function(d) { return d.pct_blk;})
						.attr('pov', function(d) { return d.pct_bel_pov;})
						.attr('path', function(d) { return d.img_path;})
					.style('background-color', d => 
						d.pct_blk != 'TEST' && d.pct_blk != '' ? colors[2] : colors [4]
						)
					.style('text-align', d => 
						d.bldg == 1 ? "right" : "center"
					)
					.append('text')
					.text(function(d, i) {
						if (d.bldg == 1) {

							return fifteen_floors[i/8];
						} else { return d.unit;} 
					})
					.attr('class', 'unit-num')
						.style('right', d => 
							d.bldg == 1 ? (10+'px') : (0+'px')
						)
						.style('color', d => 
							d.bldg == 1 ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.8)'
						)
						.style('font-size', d => 
							d.bldg == 1 ? '1rem' : '0.8rem'
						);

				waffle_fifty
					.style('width', (twelve_square)*10 + 'px')
					.selectAll('.block')
					.data(fifty)
					.enter()
					.append('div')
					.attr('class', 'block')
						.style('width', twelve_square + 'px')
						.style('height', twelve_square + 'px')
						.attr('id', function(d) { return d.apt;})
						.attr('unit', function(d) { return d.unit;})
						.attr('name', function(d) { return d.tenant;})
						.attr('post', function(d) { return d.post_address;})
						.attr('desc', function(d) { return d.desc;})
						.attr('race', function(d) { return d.pct_blk;})
						.attr('pov', function(d) { return d.pct_bel_pov;})
						.attr('path', function(d) { return d.img_path;})
					.style('background-color', d => 
						d.pct_blk != 'TEST' && d.pct_blk != '' ? colors[2] : colors [4]
						)
					.style('text-align', d => 
						d.bldg == 1 ? "right" : "center"
					)
					.append('text')
					.text(function(d, i) {
						if (d.bldg == 1) {
							return twelve_floors[i/8];
						} else { return d.unit;} 
					})
					.attr('class', 'unit-num')
						.style('right', d => 
							d.bldg == 1 ? (10+'px') : (0+'px')
						)
						.style('color', d => 
							d.bldg == 1 ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.8)'
						)
						.style('font-size', d => 
							d.bldg == 1 ? '1rem' : '0.8rem'
						);

				waffle_sixty
					.style('width', (twelve_square)*10 + 'px')
					.selectAll('.block')
					.data(sixty)
					.enter()
					.append('div')
					.attr('class', 'block')
						.style('width', twelve_square + 'px')
						.style('height', twelve_square + 'px')
						.attr('id', function(d) { return d.apt;})
						.attr('unit', function(d) { return d.unit;})
						.attr('name', function(d) { return d.tenant;})
						.attr('post', function(d) { return d.post_address;})
						.attr('desc', function(d) { return d.desc;})
						.attr('race', function(d) { return d.pct_blk;})
						.attr('pov', function(d) { return d.pct_bel_pov;})
						.attr('path', function(d) { return d.img_path;})
					.style('background-color', d => 
						d.pct_blk != 'TEST' && d.pct_blk != '' ? colors[2] : colors [4]
						)
					.style('text-align', d => 
						d.bldg == 1 ? "right" : "center"
					)
					.append('text')
					.text(function(d, i) {
						if (d.bldg == 1) {

							return twelve_floors[i/8];
						} else { return d.unit;} 
					})
					.attr('class', 'unit-num')
						.style('right', d => 
							d.bldg == 1 ? (10+'px') : (0+'px')
						)
						.style('color', d => 
							d.bldg == 1 ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.8)'
						)
						.style('font-size', d => 
							d.bldg == 1 ? '1rem' : '0.8rem'
						);

				waffle_eighty
					.style('width', (fifteen_square)*10 + 'px')
					.selectAll('.block')
					.data(eighty)
					.enter()
					.append('div')
					.attr('class', 'block')
						.style('width', fifteen_square + 'px')
						.style('height', fifteen_square + 'px')
						.attr('id', function(d) { return d.apt;})
						.attr('unit', function(d) { return d.unit;})
						.attr('name', function(d) { return d.tenant;})
						.attr('post', function(d) { return d.post_address;})
						.attr('desc', function(d) { return d.desc;})
						.attr('race', function(d) { return d.pct_blk;})
						.attr('pov', function(d) { return d.pct_bel_pov;})
						.attr('path', function(d) { return d.img_path;})
					.style('background-color', d => 
						d.pct_blk != 'TEST' && d.pct_blk != '' ? colors[2] : colors [4]
						)
					.style('text-align', d => 
						d.bldg == 1 ? "right" : "center"
					)
					.append('text')
					.text(function(d, i) {
						if (d.bldg == 1) {
							return fifteen_floors[i/8];
						} else { return d.unit;} 
					})
					.attr('class', 'unit-num')
						.style('right', d => 
							d.bldg == 1 ? (10+'px') : (0+'px')
						)
						.style('color', d => 
							d.bldg == 1 ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.8)'
						)
						.style('font-size', d => 
							d.bldg == 1 ? '1rem' : '0.8rem'
						);


				// var name = "Cool B";
				var image = "coolB.png";

// 				waffle_four
// 					.selectAll('.block')
// 					.data(four)
// 					.on("mouseover", mouseover)
// 				    .on("mousemove", mousemove)
// 				    .on("mouseout", mouseout);

// 				waffle_fifty
// 					.selectAll('.block')
// 					.data(fifty)
// 					.on("mouseover", mouseover)
// 				    .on("mousemove", mousemove)
// 				    .on("mouseout", mouseout);

// 				waffle_sixty
// 					.selectAll('.block')
// 					.data(sixty)
// 					.on("mouseover", mouseover)
// 				    .on("mousemove", mousemove)
// 				    .on("mouseout", mouseout);

// 				waffle_eighty
// 					.selectAll('.block')
// 					.data(eighty)
// 					.on("mouseover", mouseover)
// 				    .on("mousemove", mousemove)
// 				    .on("mouseout", mouseout);

				function zero() {
					slider.transition() 
						    .duration(750)
						    .tween("hue", function() {
						    	// console.log(x.invert(label.attr("x")));
								var i = d3.interpolate(x.invert(label.attr("x")), 0);
								return function(t) { hue(i(t)); };
						    });
				}

				function hue(h) {

					// console.log(d3.select('#poverty_button').style("background-color"));

					if(d3.select('#poverty_button').style("background-color") == "rgb(248, 248, 248)" && d3.select('#race_button').style("background-color") == "rgb(248, 248, 248)") {
						d3.select('#poverty_button').style("background-color", colors[3]);
					}

					handle.attr("cx", x(h));
					label
						.attr("x", x(h))
						.text(function(d) {
					    	if(race_data == 1) {
					    		return ("> " + formatNum(h) + "% below the poverty line");
					    	}
					    		else {
					    			return ("> " + formatNum(h) + "% black");
					    		}
					    	
					    });

					if (race_data == 0) {
						waffle_four
						.selectAll('.block')
						.data(four)
						.transition().duration(40)
							.style('background-color', function(d) {
								if (d.bldg == 0) {
									if (d.pct_blk != "TEST" && d.pct_blk != '') {
										// var pluto = d.pct_blk*100;
										// console.log(pluto);
										if (d.pct_blk*100 > h) {
											return (colors[1]);
										} else return colors[2];
									} else return colors[4];
								}
								else return colors[5];
							});

						waffle_fifty
						.selectAll('.block')
						.data(fifty)
						.transition().duration(40)
							.style('background-color', function(d) {
								if (d.bldg == 0) {
									if (d.pct_blk != "TEST" && d.pct_blk != '') {
										// var pluto = d.pct_blk*100;
										// console.log(pluto);
										if (d.pct_blk*100 > h) {
											return (colors[1]);
										} else return colors[2];
									} else return colors[4];
								}
								else return colors[5];
							});

						waffle_sixty
						.selectAll('.block')
						.data(sixty)
						.transition().duration(40)
							.style('background-color', function(d) {
								if (d.bldg == 0) {
									if (d.pct_blk != "TEST" && d.pct_blk != '') {
										// var pluto = d.pct_blk*100;
										// console.log(pluto);
										if (d.pct_blk*100 > h) {
											return (colors[1]);
										} else return colors[2];
									} else return colors[4];
								}
								else return colors[5];
							});

						waffle_eighty
						.selectAll('.block')
						.data(eighty)
						.transition().duration(40)
							.style('background-color', function(d) {
								if (d.bldg == 0) {
									if (d.pct_blk != "TEST" && d.pct_blk != '') {
										// var pluto = d.pct_blk*100;
										// console.log(pluto);
										if (d.pct_blk*100 > h) {
											return (colors[1]);
										} else return colors[2];
									} else return colors[4];
								}
								else return colors[5];
							});
					} else {
						waffle_four
						.selectAll('.block')
						.data(four)
						.transition().duration(40)
							.style('background-color', function(d) {
								if (d.bldg == 0) {
									if (d.pct_bel_pov != "TEST" && d.pct_bel_pov != '') {
										// var pluto = d.pct_blk*100;
										// console.log(pluto);
										if (d.pct_bel_pov > h) {
											return (colors[3]);
										} else return colors[2];
									} else return colors[4];
								}
								else return colors[5];
							});

						waffle_fifty
						.selectAll('.block')
						.data(fifty)
						.transition().duration(40)
							.style('background-color', function(d) {
								if (d.bldg == 0) {
									if (d.pct_bel_pov != "TEST" && d.pct_bel_pov != '') {
										// var pluto = d.pct_blk*100;
										// console.log(pluto);
										if (d.pct_bel_pov > h) {
											return (colors[3]);
										} else return colors[2];
									} else return colors[4];
								}
								else return colors[5];
							});

						waffle_sixty
						.selectAll('.block')
						.data(sixty)
						.transition().duration(40)
							.style('background-color', function(d) {
								if (d.bldg == 0) {
									if (d.pct_bel_pov != "TEST" && d.pct_bel_pov != '') {
										// var pluto = d.pct_blk*100;
										// console.log(pluto);
										if (d.pct_bel_pov > h) {
											return (colors[3]);
										} else return colors[2];
									} else return colors[4];
								}
								else return colors[5];
							});

						waffle_eighty
						.selectAll('.block')
						.data(eighty)
						.transition().duration(40)
							.style('background-color', function(d) {
								if (d.bldg == 0) {
									if (d.pct_bel_pov != "TEST" && d.pct_bel_pov != '') {
										// var pluto = d.pct_blk*100;
										// console.log(pluto);
										if (d.pct_bel_pov > h) {
											return (colors[3]);
										} else return colors[2];
									} else return colors[4];
								}
								else return colors[5];
							});
					}
				}

			    function mouseover() {
			    	// console.log(d3.select(this).attr('race'));
			    	// console.log("hello");
			    	if (d3.select(this).attr('race') != 'TEST' && d3.select(this).attr('race') != ''){
						head_div
							.html("<p class='chart__title'>" + d3.select(this).attr("name") + "<span class='unit-num' style='float:right;'>" + d3.select(this).attr("unit") + "</span></p><p style='margin:0;padding:.75rem 0 0'><span style='font-weight:600;color:rgba(0,0,0,0.4);'>Race:</span> " + formatNum(100*d3.select(this).attr("race")) + "% black</p><p style='margin:0;padding:0'><span style='font-weight:600;color:rgba(0,0,0,0.4);'>Poverty:</span> " + d3.select(this).attr("pov") + "% below the poverty line</p>")
							.style("display", "block")

						if(d3.select(this).attr("path") != "NULL") {
							img_div
								.html("<div id='thumbnail'><span></span><img width='50%' height='50%' src='" + d3.select(this).attr("path") + "' /></div>")
								.style("display", "block");
								// .text('Cool B');
						}

						text_div
							.text(d3.select(this).attr("desc"))
							.style("display", "block");
						d3.select(this).style("cursor", "pointer");
						d3.select(this).style('opacity', '0.3');
					} 
				}


				function mousemove() {
					if (d3.select(this).attr('race') != 'TEST' && d3.select(this).attr('race') != ''){
						if(d3.select(this).attr('id') == 'A' || d3.select(this).attr('id') == 'B' || d3.select(this).attr('id') == 'C') {
							head_div
								.style("left", 60 + "px")
								.style("top", 60 + "px");

							if(d3.select(this).attr("path") != "NULL") {
								img_div
								  // .text(d3.event.pageX + ", " + d3.event.pageY)
									.style("left", 60 + "px")
									.style("top", 60 + parseInt(head_div.style("height")) + "px");

								text_div
								  // .text(d3.event.pageX + ", " + d3.event.pageY)
									.style("left", 60 + "px")
									.style("top", 60 + parseInt(head_div.style("height")) + parseInt(img_div.style("height")) + "px");
							} else {
								text_div
								  // .text(d3.event.pageX + ", " + d3.event.pageY)
									.style("left", 60 + "px")
									.style("top", 60 + parseInt(head_div.style("height")) + "px");
							}
						} else {
							head_div
								.style("left", 900 + "px")
								.style("top", 60 + "px");

							if(d3.select(this).attr("path") != "NULL") {
								img_div
								  // .text(d3.event.pageX + ", " + d3.event.pageY)
									.style("left", 900 + "px")
									.style("top", 60 + parseInt(head_div.style("height")) + "px");

								text_div
								  // .text(d3.event.pageX + ", " + d3.event.pageY)
									.style("left", 900 + "px")
									.style("top", 60 + parseInt(head_div.style("height")) + parseInt(img_div.style("height")) + "px");
							} else {
								text_div
								  // .text(d3.event.pageX + ", " + d3.event.pageY)
									.style("left", 900 + "px")
									.style("top", 60 + parseInt(head_div.style("height")) + "px");
							}

							
						}
					} 
				}

				function mouseout() {
					if (d3.select(this).attr('race') != 'TEST'){
						head_div.style("display", "none");
						img_div.style("display", "none");
						text_div.style("display", "none");
						d3.select(this).style("cursor", "default");
						d3.select(this).style('opacity', '1');
					} 
				}

				function clicked(){
					if (d3.select(this).style('background-color') != 'rgba(0, 0, 0, 0)'){
						d3.select(this).transition()
					      .style("background-color", "#fe4a49");
				 	} 
				}

				// waffle
				// 	.selectAll('.block')
				// 	.data(buildings[0])
				// 	.transition().duration(1000)
				// 		.style('background-color', d => 
				// 			d == 1 ? colors[4] : d == 2 ? colors[4] : colors[1]
				// 		)
				// 		.style('width', function(d,i) {
				// 			if (i%15 == 0) {
				// 				return (square*1.5 + 'px');
				// 			} else return square;
				// 		});

			}
