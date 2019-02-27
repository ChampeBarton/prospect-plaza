var md = new MobileDetect(window.navigator.userAgent);

var mobile = false;
var fullWidth = false;
var tablet = false;
if( /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
  mobile = true;
}
if(md.tablet()){
  tablet = true;
}

var filterWords = false;




var grabbing = false;
var formatComma = d3.format(",");
var wuTangIds = [446,162,109,431,380,78,48,442];
var migosIds = [423,390,109,481];
var nwaIds = [136,472,348,456];

var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
if(viewportWidth < 900){
  fullWidth = true;
}
var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
var fullWidth = false;
var smallWidth = false;
var animationArrow = false;
var tree;
var topOffset = 50;
var containerSearchResults;
var transformFunction;
var scaleAmount = 1;
const htmlEl = document.querySelector('html')
const ie9 = htmlEl.className === 'ie9'
var ratio = ie9 ? 1 : window.devicePixelRatio
var adjust = 1;
var zoomDiv;
var tnseSearchResults;
var artistCentralSearchResults;
adjust = window.devicePixelRatio;

if(viewportWidth < 640){
  fullWidth = true;
}
if(viewportWidth < 330){
  smallWidth = true;
}

function ordinal_suffix_of(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

var Controller = new ScrollMagic.Controller()


queue()
  .defer(d3.csv, "data/decade_centricity.csv") // 200KB
  .defer(d3.csv, "data/tf_idf_filtered.csv") // 200KB
  .defer(d3.csv, "data/complete_full.csv") // 200KB
  .defer(d3.csv, "data/artist_song_counts_full.csv") // 200KB
  .defer(d3.csv, "data/police_counts.csv") // 200KB
  .defer(d3.csv, "data/tsne.csv") // 200KB
  .defer(d3.csv, "data/most_centric.csv") // 200KB
  .defer(d3.csv, "data/spritesheet.csv") // 200KB
  .defer(d3.csv, "data/similarity_rank.csv") // 200KB

  .await(ready);

function ready(error
  ,decade_centricity
  ,artist_centricity
  ,complete_centricity
  ,artist_song_counts
  ,police_counts
  ,tsne_data
  ,most_centric
  ,spriteSheetLocationsRaw
  ,similarity
){

  var retina = false;
  if(window.devicePixelRatio > 1){
    retina = true;
    spriteSheetLocationsRaw = spriteSheetLocationsRaw.filter(function(d){
      return d.size == 2
    })
  }
  else{
    spriteSheetLocationsRaw.filter(function(d){
      return d.size == 1;
    })
  }

  var spriteSheetLocations = d3.map(spriteSheetLocationsRaw,function(d){
    return d.id;
  });

  var artistMap = d3.map(artist_song_counts,function(d){ return d.artist; });
  var artistIDMap = d3.map(artist_song_counts,function(d){ return d.artist_id; });

  var similarityIdMap = d3.map(d3.nest().key(function(d){return d.artist_1_id}).entries(similarity),function(d){return d.key});

  var artistNest = d3.nest().key(function(d){
      return d.artist_id
    })
    .entries(artist_centricity)
    ;

  function artistCentricity(){

    function buildToggles(){
      var container = d3.select(".artist-central-toggles");

      var search = container
        .append("div")
        .attr("class","artist-central-search")
        ;

      var magnifying = search
        .append("svg")
        .attr("class","artist-central-magnifying-glass")
        .attr("xmlns","http://www.w3.org/2000/svg")
        .attr("xmlns:xlink","http://www.w3.org/1999/xlink")
        .attr("version","1.1")
        .attr("x","0px")
        .attr("y","0px")
        .attr("viewBox","0 0 32 32")
        .attr("enable-background","new 0 0 32 32")
        .attr("xml:space","preserve")
        .append("path")
        .attr("d","M29.283,25.749l-7.125-7.127c0.959-1.582,1.521-3.436,1.521-5.422c0-5.793-4.688-10.484-10.481-10.486  C7.409,2.716,2.717,7.407,2.717,13.199c0,5.788,4.693,10.479,10.484,10.479c1.987,0,3.838-0.562,5.42-1.521l7.129,7.129  L29.283,25.749z M6.716,13.199C6.722,9.617,9.619,6.72,13.2,6.714c3.58,0.008,6.478,2.903,6.484,6.485  c-0.007,3.579-2.904,6.478-6.484,6.483C9.618,19.677,6.721,16.778,6.716,13.199z")
        ;

      var searchInput = search
        .append("input")
        .attr("class","artist-central-search-input")
        .attr("type","text")
        .attr("placeholder","Find an artist...")
        ;

      artistCentralSearchResults = search.append("div")
        .attr("class","artist-central-search-results")
        ;

      searchInput
        .on("keyup", keyupedFilmColumn)
        ;

      function keyupedFilmColumn() {
        if(filterSelected!="ALL"){
          filterSelected = "ALL"
          resetSlides();
        }
        searchNewsroom(this.value.trim());
      }

      function highlightWord(indexOfArtist){
        swiper.slideTo(indexOfArtist, 1000);
      }

      function searchNewsroom(value) {
        if (value.length > 2) {
          artistCentralSearchResults.style("display","block");
          artistCentralSearchResults.selectAll("p").remove();

          function escapeString(s) {
            return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          }
          //
          var re = new RegExp("\\b" + escapeString(value), "i");
          var searchArray = [];

          searchArray = _.filter(artistNest, function(d,i) {
            return re.test(d["artist"]);
          })
          ;

          console.log(searchArray);

          searchArray = searchArray.slice(0,3);

          artistCentralSearchResults
            .selectAll("p")
            .data(searchArray)
            .enter()
            .append("p")
            .attr("class","scatter-chart-search-results-result")
            .text(function(d){
              return d.artist;
            })
            .on("click",function(d){
              var artist = d.key;
              var indexOfArtist = _.findIndex(artistNest, function(d) { return d.key == artist });
              highlightWord(indexOfArtist);
            })
            ;

          if(searchArray.length == 1){
            var artist = searchArray[0].key;
            var indexOfArtist = _.findIndex(artistNest, function(d) { return d.key == artist });
            highlightWord(indexOfArtist);
            artistCentralSearchResults.style("display",null);
          }

        }
        else{
          artistCentralSearchResults.style("display",null);
        }

      };

      var filterSelected = "ALL"

      function resetSlides(){
        filter.classed("artist-central-filter-selected",function(d,i){
          if(i==0){
            return true;
          }
          return false;
        })

        slide.sort(function(a,b){
            return (a.artist_data.artist < b.artist_data.artist) ? -1 : (a.artist_data.artist > b.artist_data.artist) ? 1 : 0;
          })
          .style("opacity",null)
          ;

        swiper.update(true);

        swiper.slideTo(0, 0);

        artistNest = artistNest.sort(function(a,b){
          return (a.artist_data.artist < b.artist_data.artist) ? -1 : (a.artist_data.artist > b.artist_data.artist) ? 1 : 0;
        })
      }

      var totalFound = 0;

      var filter = container
        .append("div")
        .attr("class","artist-central-filters")
        .selectAll("div")
        .data(["ALL","1980s","1990s","2000s","2010s","ONLY"])
        .enter()
        .append("div")
        .attr("class",function(d,i){
          if(i==0){
            return "artist-central-filter-selected artist-central-filter";
          }
          if(i==5){
            return "artist-central-wu-tang-filter artist-central-filter"
          }
          return "artist-central-filter"
        })
        .html(function(d,i){
          if(i==5){
            return "ONLY"
          }
          return d;
        })
        .on("click",function(d,i){
          totalFound = 0;
          var selected = d;
          filterSelected = selected;
          filter.classed("artist-central-filter-selected",function(d){
            if(d==selected){
              return true;
            }
            return false;
          })

          if(i==0){
            resetSlides();
          }
          else if(i==5){
            slide.sort(function(a,b){
              var wuTangA = wuTangIds.indexOf(a.id);
              var wuTangB = wuTangIds.indexOf(b.id);

              if(wuTangA == wuTangB)
              {
                  return (a.artist_data.artist < b.artist_data.artist) ? -1 : (a.artist_data.artist > b.artist_data.artist) ? 1 : 0;
              }
              else
              {
                  return (wuTangA < wuTangB) ? 1 : -1;
              }
            })
            .style("opacity",function(d){
              if(wuTangIds.indexOf(d.id) > -1){
                totalFound = totalFound + 1;
                return null
              }
              return 0;
            })
            ;
            var toRemove = [];

            swiper.update(true);

            swiper.slideTo(0, 0);

            artistNest = artistNest.sort(function(a,b){
              var wuTangA = wuTangIds.indexOf(a.id);
              var wuTangB = wuTangIds.indexOf(b.id);

              if(wuTangA == wuTangB)
              {
                  return (a.artist_data.artist < b.artist_data.artist) ? -1 : (a.artist_data.artist > b.artist_data.artist) ? 1 : 0;
              }
              else
              {
                  return (wuTangA < wuTangB) ? 1 : -1;
              }
            })
          }
          else {
            slide.sort(function(a,b){
              var eraA = 0;
              var eraB = 0;
              if(a.artist_data.era == selected){
                eraA = 1;
              }
              if(b.artist_data.era == selected){
                eraB = 1;
              }

              if(eraA == eraB)
              {
                  return (a.artist_data.artist < b.artist_data.artist) ? -1 : (a.artist_data.artist > b.artist_data.artist) ? 1 : 0;
              }
              else
              {
                  return (eraA < eraB) ? 1 : -1;
              }
            })
            .style("opacity",function(d){
              if(d.artist_data.era == selected){
                totalFound = totalFound + 1;
                return null
              }
              return 0;
            })
            ;
            var toRemove = [];

            swiper.update(true);

            swiper.slideTo(0, 0);

            artistNest = artistNest.sort(function(a,b){
              var eraA = 0;
              var eraB = 0;
              if(a.artist_data.era == selected){
                eraA = 1;
              }
              if(b.artist_data.era == selected){
                eraB = 1;
              }

              if(eraA == eraB)
              {
                  return (a.artist_data.artist < b.artist_data.artist) ? -1 : (a.artist_data.artist > b.artist_data.artist) ? 1 : 0;
              }
              else
              {
                  return (eraA < eraB) ? 1 : -1;
              }
            })

          }

        })

      filter
        .filter(function(d,i){
          return i==5
        })
        .append("div")
        .attr("class","wu-tang-logo")
        ;

      var jump = container
        .append("div")
        .attr("class","artist-central-jump")
        .selectAll("p")
        .data('abcdefghijklmnopqrstuvwxy'.split(''))
        .enter()
        .append("p")
        .attr("class","artist-central-jump-letter")
        .text(function(d){
          return d;
        })
        .on("click",function(d){
          var found = false;
          var letterSelected = d;

          slideWrapper.selectAll(".swiper-slide").each(function(d,i){

            var count = i;
            if(!found){
              var letter = d.artist_data.artist.charAt(0).toLowerCase();
              if(letter == letterSelected){
                found = true;
                if(filterSelected!="ALL" && (count+1) < totalFound){
                  swiper.slideTo(count, 1000);
                }
                else if(filterSelected == "ALL") {
                  swiper.slideTo(count, 1000);
                }

              }
              if(found){
              }
            }
          })
        })
        ;

    }

    artistNest.forEach(function(d){
      d.r = 18;
      var artist_data = artistIDMap.get(+d.key)
      d.id = +d.key;
      d.artist = artist_data.artist
      d.remove = artist_data.remove;
      d.artist_data = artist_data;
    });

    artistNest = artistNest.filter(function(d){
        return +d.remove != 1;
      }).sort(function(a,b){
        if (a.artist < b.artist)
          return -1;
        if (a.artist > b.artist)
          return 1;
        return 0;
      });

    var slideWrapper = d3.select(".swiper-wrapper");

    var slide = slideWrapper
      .selectAll("div")
      .data(artistNest)
      .enter()
      .append("div")
      .attr("class","swiper-slide")
      ;

    var scaleAmount = 1;
    if(retina){
      scaleAmount = 3/2;
    }

    slide
      .append("div")
      .attr("class","swiper-slide-image")
      .style("width",function(d){
          return Math.floor(spriteSheetLocations.get(+d.id).width/scaleAmount)+"px"
      })
      .style("height",function(d){
        return Math.floor(spriteSheetLocations.get(+d.id).height/scaleAmount)+"px"
      })
      .style("background-position-x",function(d,i){
        return Math.floor(-spriteSheetLocations.get(+d.id).x/scaleAmount) + "px"
      })
      .style("background-position-y",function(d,i){
        return Math.floor(-spriteSheetLocations.get(+d.id).y/scaleAmount) + "px"
      })
      ;

    slide
      .append("p")
      .attr("class","swiper-slide-text")
      .text(function(d){
        // if(d.key.length > 16){
        //   return d.key.slice(0,13)+"..."
        // }
        return d.artist;
      })
      .style("bottom",function(d){
        return spriteSheetLocations.get(+d.id).height/scaleAmount + 3 + "px"
      })
      ;

    slide
      .append("div")
      .attr("class","swiper-slide-words")
      .selectAll("p")
      .data(function(d){
        var arrayValues = d.artist.toLowerCase().split(" ");

        return d.values.filter(function(d){
          return arrayValues.indexOf(d.Word) == -1;
        }).slice(0,10)
      })
      .enter()
      .append("p")
      .attr("class","swiper-slide-words-word")
      .append("span")
      .attr("class","swiper-slide-words-word-span")
      .text(function(d){
        return d.Word
      })
      ;

    var swiper = new Swiper('.swiper-container', {
          pagination: '.swiper-pagination',
          // slidesPerView: 25,
          // effect: 'fade',
          keyboardControl: true,
          // setWrapperTransition: 500,
          mousewheelControl: true,
          mousewheelForceToAxis: true,
          centeredSlides: true,
          freeMode: true,
          speed:400,
          watchSlidesVisibility:true,
          longSwipes:false,
          freeModeSticky: true,
          // freeModeMomentum:true,
          slideToClickedSlide:true,
          preventClicks:true,
          preventClicksPropagation:true,
          mousewheelInvert: true,
          grabCursor: true,
          slidesPerView: 'auto',
          scrollbarHide: true,
          roundLengths: true,
          initialSlide:94,
          watchSlidesProgress:true,
          // paginationClickable: true,
          spaceBetween: 0
          // fade: {
          //   crossFade: false
          // }
          // coverflow: {
          //   rotate: 50,
          //   stretch: 0,
          //   depth: 100,
          //   modifier: 1,
          //   slideShadows : true
          // }
          // grabCursor: true

      })
      // .on("progress",function(swiper,progress){
        // console.log(swiper);
        // var time = transition;
        // console.log(time);
        // var active = swiper.activeIndex;
        // var activeSelect = d3.select(swiper.slides[active])
        //   .transition()
        //   .duration(0)
        //   .delay(time/2)
        //   .style("opacity",1)
      // })
      .on("onSliderMove",function(swiper,event){
        swiper.update(true);

        // var time = transition;
        // console.log(time);
        // var active = swiper.activeIndex;
        // var activeSelectData = d3.select(swiper.slides[active]).datum().values.slice(0,10);
        //
        // // activeColumn.selectAll("p").remove();
        //
        // activeColumnText.text(function(d,i){
        //   return activeSelectData[i].Word;
        // })
        //
        // activeColumn.selectAll("p")
        //   .data(activeSelectData,function(d){
        //
        //   })
        //   .enter()
        //   .append("p")
        //   .attr("class","artist-central-row-chart-active-word")
        //   .append("span")
        //   .attr("class","artist-central-row-chart-active-word-span")
        //   .text(function(d){
        //     return d.Word;
        //   })
        //   ;
      })
      ;

    var artistCentral = d3.select(".artist-central");
    var container = artistCentral.select(".artist-central-container");
    var chartTitleArtist = artistCentral.select(".fat-title").select("span");


    buildToggles();

  }
  function scatterChart(){

    var migosData = artistNest.filter(function(d){
      return [423,57,328].indexOf(+d.key) > -1;
    });

    var migosWords = d3.select(".migos-info")
      .selectAll("div")
      .data(migosData)
      .enter()
      .append("div")
      .attr("class","migos-data-row")

    migosWords.append("p")
      .attr("class","migos-data-row-label")
      .text(function(d){
        var artist = artistIDMap.get(+d.key).artist;
        if(artist == "Kodak Black"){
          return "Kodak:";
        }
        return artist + ":";
      });

    migosWords.append("div")
      .attr("class","migos-data-row-word-container")
      .selectAll("p")
      .data(function(d){
        return d.values.slice(0,10);
      })
      .enter()
      .append("p")
      .attr("class",function(d){
        if(d.Word == "skrrt"){
          return "migos-data-row-word migos-data-row-word-highlight"
        }
        return "migos-data-row-word"
      })
      .text(function(d){
        return d.Word;
      })
      .on("click",function(d){
        var artist = d3.select(this.parentNode).data()[0].artist;
        // var artist = artistIDMap.get(+d3.select(this.parentNode).data().key).artist;
        var artistName = "kodak";
        if(artist == "Lil Yachty"){
          artistName = "lil"
        }
        else if(artist == "Migos"){
          artistName = "migos"
        }
        var fileString = "audio/"+artistName+"-"+d.Word+".wav";
        var audio = new Audio(fileString);
        audio.play();
      })
      ;

    var width = 375;
    var height = 375;

    if(mobile && viewportWidth < 420){
      width = Math.floor(viewportWidth*.9);
      height = width;
    }
    console.log(mobile,viewportWidth);
    console.log(width,height);

    var maxValue = 62;
    var circleRadius = 4;
    var rowHeight = 45;
    var circleTextOffset = 8;
    var titleMarginTop = "40px";
    var firstParagraph = d3.select(".slide-first");

    var minValue = .05;

    var xScale = d3.scaleLog().domain([minValue,maxValue]).range([0,width-10]).clamp(true);
    var yScale = d3.scaleLog().domain([minValue,maxValue]).range([height-10,0]).clamp(true);

    var xScaleLog = d3.scaleLog().domain([minValue,maxValue]).range([0,width-10]).clamp(true);
    var yScaleLog = d3.scaleLog().domain([minValue,maxValue]).range([height-10,0]).clamp(true);

    var lineScale = d3.scaleLinear().domain([0,maxValue/2,maxValue]).range(["rgb(215, 33, 65)","rgb(254, 234, 176)","rgb(26, 152, 80)"])
    var centricityScaleLow = d3.scaleLinear().domain([.3,.5,1]).range(["rgb(182, 49, 50)","rgb(236, 203, 123)","#ccc"]).clamp(true);
    var centricityScaleMid = d3.scaleLinear().domain([.95,1,1.05]).range(["#ccc","#bbb","#ccc"]);
    var centricityScaleHigh = d3.scaleLinear().domain([1.05,1.5,8]).range(["#ccc","rgb(204, 219, 163)","rgb(39, 108, 145)"]).clamp(true);

    // var words = [["Fuck",62.59239069,1.921661395],["Love",42,71],["Girl",36,18.2],["Game",21,3.45],["cry",3.75,9.2]];
    var words = [["Game",10.501,3.45],["Love",21,71],["struggle",.67,.35],["sorrow",.1002,1.0541]]; //darling, whisper



    var scrollContainer = d3.select(".scatter-prose")

    var container = d3.select(".scatter-chart-container")
      .style("width",width+"px")
      .style("height",height+"px")
      ;

    var containerTrianglesText = container
      .append("div")
      .attr("class","scatter-chart-triangles-container")
      .selectAll("div")
      .data(d3.range(2))
      .enter()
      .append("div")
      .attr("class","scatter-chart-triangles-text-container")
      .style("top",yScale(minValue)/2+"px")
      .style("left",width/2+"px")
      ;

    containerTrianglesText
      .append("p")
      .attr("class","scatter-chart-triangles-text")
      .style("color",function(d,i){
        if(i==0){
          return d3.color(centricityScaleLow.range()[0]).darker();
        }
        return d3.color(centricityScaleHigh.range()[2]).darker();
      })
      .style("left",function(d,i){
        if(i==1){
          return "0px";
        }
      })
      .style("transform",function(d,i){
        if(i==1){
          return "translate(50%,50%)";
        }
      })
      .style("text-align",function(d,i){
        if(i==1){
          return "left";
        }
      })
      .html(function(d,i){
        if(i==0){
          return "<span>Less</span> likely to appear hip hop vs. all music"
        }
        return "<span>More</span> likely to appear hip hop vs. all music"
      })
      ;

    var triangleMax = 25;

    var containerTrianglesTextContainer = containerTrianglesText
      .append("svg")
      .attr("class","scatter-chart-triangles-arrow-container")
      .attr("width",triangleMax)
      .attr("height",triangleMax)
      .style("width",triangleMax+"px")
      .style("height",triangleMax+"px")

    containerTrianglesTextContainer.append("svg:defs")
      .selectAll("marker")
      .data(["end"])      // Different link/path types can be defined here
      .enter().append("svg:marker")    // This section adds in the arrows
      .attr("id", "arrow-head")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 0)
      .attr("refY", 0)
      .attr("markerWidth", 7)
      .attr("markerHeight", 12)
      .attr("orient", "auto")
      .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill",d3.color(centricityScaleLow.range()[0]).darker())
      ;

    containerTrianglesTextContainer.append("svg:defs")
      .selectAll("marker")
      .data(["end"])      // Different link/path types can be defined here
      .enter().append("svg:marker")    // This section adds in the arrows
      .attr("id", "arrow-head-up")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 0)
      .attr("refY", 0)
      .attr("markerWidth", 7)
      .attr("markerHeight", 12)
      .attr("orient", "auto")
      .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill",d3.color(centricityScaleHigh.range()[2]).darker())
      ;

    var containerTrianglesTextContainerLines = containerTrianglesTextContainer
      .append("g")
      .selectAll("line")
      .data(function(d,i){
        return [{item:i,val:33},{item:i,val:66},{item:i,val:33}]
      })
      .enter()
      .append("line")
      .attr("class","scatter-chart-triangles-arrow")
      .attr("x1",0)
      .attr("x2",function(d){
        if(d.item == 0){
          return -d.val+"%"
        }
        return d.val+"%"
      })
      .attr("y1",0)
      .attr("y2",function(d){
        if(d.item == 0){
          return -d.val+"%"
        }
        return d.val+"%"
      })
      .style("transform",function(d,i){
        if(i==0){
          return "translate(7px,-7px)"
        }
        if(i==2){
          return "translate(-7px,7px)"
        }
      })
      .style("stroke",function(d){
        if(d.item==0){
          return d3.color(centricityScaleLow.range()[0]).darker();
        }
        return d3.color(centricityScaleHigh.range()[2]).darker();
      })
      .attr("marker-end", function(d){
        if(d.item == 0){
          return "url(#arrow-head)"
        }
        return "url(#arrow-head-up)"
      })
      ;

    var containerCirclesCanvasContainer = container.append("div")
      .attr("class","scatter-chart-circles-canvas")

    var zoom = d3.zoom()
      .scaleExtent([1, 1])
      .on("zoom", function(){
        initialDraw();
      })
      ;

    function transform(d) {
  		return d3.zoomIdentity
  			.translate(0,0)
  			.scale(scaleAmount*window.devicePixelRatio)
  			;
  	}

    var containerCirclesCanvas = containerCirclesCanvasContainer
      .append("canvas")
      .attr("width", function(d){
        return width * window.devicePixelRatio;
      })
      .attr("height", function(d){
        return height * window.devicePixelRatio;
      })
      .style("width", function(d){
        return width+"px";
      })
      .style("height", function(d){
        return height+"px";
      })

    var circleContext = containerCirclesCanvas.node().getContext("2d"),
  	    canvasWidth = containerCirclesCanvas.node().width,
  	    canvasHeight = containerCirclesCanvas.node().height
  			;

    containerCirclesCanvas
      .call(zoom.transform,function(d){
        return transform(d);
      })
      .on("mouseout",function(d){
        containerHoverInfo.style("visibility",null)
        containerHoverContainer.style("visibility",null)
      })
      .on("mousemove",function(){

        // containerHoverContainer.style("visibility","visible")
        containerHoverInfo.style("visibility","visible")

        var mouse = d3.mouse(this);
				var xPos, yPos;
				if (ie9) {
					xPos = mouse[0]
					yPos = mouse[1]
				} else {
					xPos = transformFunction.invertX(mouse[0]*adjust);
					yPos = transformFunction.invertY(mouse[1]*adjust);
				}

        var closest = tree.find(xPos,yPos);
        console.log(closest);

        containerHoverInfoWord.text(closest.Word);

        containerHoverInfoTimes
          .html(function(d){
            if(+closest.gen_rate < +closest.rap_rate){
              return "<span>"+Math.round(+closest.rap_rate/+closest.gen_rate*10)/10+"x</span> higher in hip hop"
            }
            return "<span>"+Math.round(+closest.gen_rate/+closest.rap_rate*10)/10+"x</span> higher other genres"
          })
          ;

        containerHoverText
          .style("left",function(d,i){
            return xScale(closest.rap_rate)-circleRadius+"px";
          })
          .style("top",function(d,i){
            return yScale(closest.gen_rate)+"px";
          })
          .text(closest.Word);

        containerHoverInfoRightHipHopRowText
          .text(Math.round(+closest.rap_rate*1000)/1000)
          ;

        containerHoverInfoRightOtherRowText
            .text(Math.round(+closest.gen_rate*1000)/1000)
            ;

        containerHoverCircle
          .style("left",function(d,i){
            return xScale(closest.rap_rate)-circleRadius+"px";
          })
          .style("top",function(d,i){
            return yScale(closest.gen_rate)+"px";
          })
          .style("background-color",function(d,i){
            if(closest.rap_rate/closest.gen_rate < .95){
              return centricityScaleLow(closest.rap_rate/closest.gen_rate)
            }
            if(closest.rap_rate/closest.gen_rate > 1.05){
              return centricityScaleHigh(closest.rap_rate/closest.gen_rate);
            }
            return centricityScaleMid(closest.rap_rate/closest.gen_rate);
          })
          ;

        containerHoverContainer.style("visibility",function(d){
          if(["game","love","struggle","sorrow"].indexOf(closest.Word) > -1){
            return "hidden";
          }
          return "visible";
        })

      })
      ;

    var containerCirclesWrapper = container
      .append("div")
      .attr("class","scatter-chart-circles-container")

    var containerSvg = container.append("svg")
      .attr("class","scatter-chart-diagonal")
      ;

    containerSearch = container.append("div")
      .attr("class","scatter-chart-search")
      .attr("id","scatter-chart-search")

    var containerSearchInput = containerSearch
      .append("input")
      .attr("class","scatter-chart-search-input")
      .attr("type","text")
      .attr("placeholder","Find a word...")
      ;

    containerSearchInput
      .on("keyup", keyupedFilmColumn)
      ;
  //
    function keyupedFilmColumn() {
      searchNewsroom(this.value.trim());
    }

    function highlightWord(closest){
      console.log(closest);
      containerHoverContainer.style("visibility","visible")
      containerHoverInfo.style("visibility","visible")

      containerHoverInfoWord.text(closest.Word);

      containerHoverInfoTimes
        .html(function(d){
          if(+closest.gen_rate < +closest.rap_rate){
            return "<span>"+Math.round(+closest.rap_rate/+closest.gen_rate*10)/10+"x</span> higher in hip hop"
          }
          return "<span>"+Math.round(+closest.gen_rate/+closest.rap_rate*10)/10+"x</span> higher other genres"
        })
        ;

      containerHoverText
        .transition()
        .duration(1000)
        .style("left",function(d,i){
          return xScale(closest.rap_rate)-circleRadius+"px";
        })
        .style("top",function(d,i){
          return yScale(closest.gen_rate)+"px";
        })
        .text(closest.Word);

      containerHoverInfoRightHipHopRowText
        .text(Math.round(+closest.rap_rate*100)/100)
        ;

      containerHoverInfoRightOtherRowText
          .text(Math.round(+closest.gen_rate*100)/100)
          ;

      containerHoverCircle
        .transition()
        .duration(1000)
        .style("left",function(d,i){
          return xScale(closest.rap_rate)-circleRadius+"px";
        })
        .style("top",function(d,i){
          return yScale(closest.gen_rate)+"px";
        })
        .style("background-color",function(d,i){
          if(closest.rap_rate/closest.gen_rate < .95){
            return centricityScaleLow(closest.rap_rate/closest.gen_rate)
          }
          if(closest.rap_rate/closest.gen_rate > 1.05){
            return centricityScaleHigh(closest.rap_rate/closest.gen_rate);
          }
          return centricityScaleMid(closest.rap_rate/closest.gen_rate);
        })
        ;

    }

    function searchNewsroom(value) {
      if (value.length > 2) {
        containerSearchResults.style("display","block");
        containerSearchResults.selectAll("p").remove();

        function escapeString(s) {
          return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        }
        //
        var re = new RegExp("\\b" + escapeString(value), "i");
        var searchArray = [];

        searchArray = _.filter(complete_centricity, function(d,i) {
          return re.test(d["Word"]);
        })
        ;

        searchArray = searchArray.sort(function(a,b){
          return a.Word.length - b.Word.length;
        });

        searchArray = searchArray.slice(0,3);

        containerSearchResults
          .selectAll("p")
          .data(searchArray)
          .enter()
          .append("p")
          .attr("class","scatter-chart-search-results-result")
          .text(function(d){
            return d.Word;
          })
          .on("click",function(d){
            highlightWord(d);
          })
          ;

        if(searchArray.length == 1){
          highlightWord(searchArray[0]);
        }

        // //
        // // //
        // // var searchDivData = searchResults.selectAll("p")
        // //   .data(searchArray, function(d){
        // //     return d["imdb_id"];
        // //   })
        // //   ;
        // //
        // // var searchEnter = searchDivData
        // //   .enter()
        // //   .append("p")
        // //   .attr("class","tk-futura-pt search-result")
        // //   .html(function(d){
        // //     var final_str = d.title.replace(re, function(str) {return '<b><u>'+str+'</u></b>'});
        // //     var percent = "<span class='search-result-percent'><span style='color:"+maleColor+";'>"+percentFormat(1-d.female_percent)+"</span>/<span style='color:"+femaleColor+";'>"+percentFormat(d.female_percent)+"</span></span>";
        // //     return final_str + " " + percent;
        // //   })
        // //   .on("click",function(d){
        // //     genreSelected = "all";
        // //     updateSpectrumSearch(d);
        // //     d3.selectAll(".filter-item-spectrum").style("background-color",null).style("box-shadow",null).style("border-color",null).style("font-weight",null);
        // //     d3.select(".filter-item-spectrum").style("background-color","#F5F5F5").style("box-shadow","inset 0 3px 5px rgba(0,0,0,.125)").style("border-color","#adadad").style("font-weight","500");
        // //     if(mobile){
        // //       searchResults.style("display","none");
        // //     }
        // //   })
        // //   ;
        // //
        // // searchDivData.exit().remove();

      }
      else{
        containerSearchResults.style("display",null);
      }

    };

    containerSearchResults = containerSearch
      .append("div")
      .attr("class","scatter-chart-search-results")
      ;

    var containerHoverInfo = container.append("div")
      .attr("class","scatter-chart-hover-info");

    var containerHoverInfoLeft = containerHoverInfo.append("div")
      .attr("class","scatter-chart-hover-info-left")

    var containerHoverInfoWord = containerHoverInfoLeft.append("p")
      .attr("class","scatter-chart-hover-info-word")
      .text("Balling")
      ;

    var containerHoverInfoTimes = containerHoverInfoLeft.append("div")
      .attr("class","scatter-chart-hover-times-container")
      .append("p")
      .attr("class","scatter-chart-hover-times-text")
      .html(function(d){
        return "<span>3x</span> higher in hip hop"
      })
      ;

    var containerHoverInfoRight = containerHoverInfo.append("div")
      .attr("class","scatter-chart-hover-info-right")
      ;

    containerHoverInfoRight.append("p")
      .attr("class","scatter-chart-hover-info-right-title")
      .text("Usage per 10,000 words");

    var containerHoverInfoRightHipHopRow = containerHoverInfoRight.append("div")
      .attr("class","scatter-chart-hover-info-right-row")

    containerHoverInfoRightHipHopRow.append("p")
      .attr("class","scatter-chart-hover-info-right-row-label")
      .text("Hip Hop");

    var containerHoverInfoRightHipHopRowText = containerHoverInfoRightHipHopRow.append("p")
      .attr("class","scatter-chart-hover-info-right-row-text")
      .text(".05")
      ;

    var containerHoverInfoRightOtherRow = containerHoverInfoRight.append("div")
      .attr("class","scatter-chart-hover-info-right-row")

    containerHoverInfoRightOtherRow.append("p")
      .attr("class","scatter-chart-hover-info-right-row-label")
      .text("Other Genres");

    var containerHoverInfoRightOtherRowText = containerHoverInfoRightOtherRow.append("p")
      .attr("class","scatter-chart-hover-info-right-row-text")
      .text(".05")
      ;

    var containerHoverContainer = container.append("div")
      .attr("class","scatter-chart-hover")
      ;

    var containerHoverCircle = containerHoverContainer.append("div")
      .attr("class","scatter-chart-hover-circle")
      ;

    var containerHoverText = containerHoverContainer.append("div")
      .attr("class","scatter-chart-hover-text")
      ;

    var containerSvgArrowLines = containerSvg
      .append("g")
      .selectAll("line")
      .data(words)
      .enter()
      .append("line")
      .attr("x1",function(d){
        return xScale(d[1])+1;
      })
      .attr("y1", yScale(minValue))
      .attr("x2",function(d){
        return xScale(d[1])+1;
      })
      .attr("y2",function(d){
        return yScale(minValue);
      })
      .attr("class","scatter-chart-arrow-line")
      .style("stroke",function(d){
        return lineScale(d[2]);
      })
      ;

    var containerCirclesContainer = containerCirclesWrapper
      .selectAll(".scatter-chart-circle-div")
      .data(words)
      .enter()
      .append("div")
      .attr("class","scatter-chart-circle-div")
      .style("height",rowHeight+"px")
      ;

    var containerCirclesCount = containerCirclesContainer
      .append("div")
      .attr("class","scatter-chart-row-count")
      .html(function(d,i){
        if(d[1]<2){
          return Math.round(d[1]*100)/100;
        }
        return Math.round(d[1])
      })
      ;

    var containerCirclesCircleLabel = containerCirclesContainer
      .append("p")
      .attr("class","scatter-chart-row-circle-label")
      .text(function(d,i){
        return d[0]
      })
      .style("transform",function(d){
        if(d[0]=="Game"){
          return "translate(calc(-50% - 10px),0px)";
        }
        if(d[0]=="sorrow"){
          return "translate(calc(-50% - -9px),0px)";
        }
        return null;
      })
      ;

    var containerCirclesAnnotation = containerCirclesContainer
      .append("p")
      .attr("class","scatter-chart-row-circle-annotation")
      .html(function(d){ return d[0]+" is <span> also common</span> in all music genres" })
      .style("left",function(d,i){
        return xScale(d[1])+"px";
      })
      .style("top",function(d,i){
        return yScale(d[2])+"px";
      })
      ;

    var containerCircles = containerCirclesContainer.append("div")
      .attr("class","scatter-chart-circle")
      .style("width",circleRadius*2+"px")
      .style("height",circleRadius*2+"px")
      // .style("border-radius",circleRadius+"px")
      .style("left",function(d,i){
        return xScale(d[1])+"px";
      })
      .style("top",function(d,i){
        return yScale(d[2])+"px";
      })
      ;

    var containerSvgTriangles = containerSvg
      .append("g")
      .selectAll("polygon")
      .data([[[0,0],[0,yScale(minValue)],[width,0]],[[0,yScale(minValue)],[width,yScale(minValue)],[width,0]]])
      .enter()
      .append("polygon")
      .attr("class","scatter-chart-triangle")
      .attr("fill",function(d,i){
        if(i==0){
          return centricityScaleLow.range()[0]
        }
        return centricityScaleHigh.range()[2]
      })
      .attr("points",function(d){
        return d[0][0]+","+d[0][1]+" "+d[1][0]+","+d[1][1]+" "+d[2][0]+","+d[2][1]
      })
      ;

    function initialDraw() {

      circleContext.clearRect(0, 0, width*window.devicePixelRatio, height*window.devicePixelRatio);

      transformFunction = d3.event.transform;
      //
      if(d3.event.transform.k==scaleAmount*ratio){
    			circleContext.translate(0, 0);
    	}
      else{
        circleContext.translate(d3.event.transform.x, d3.event.transform.y);
      }
      circleContext.scale(d3.event.transform.k, d3.event.transform.k);
      //
      tree = d3.quadtree()
  			.extent([[0, 0], [width, height]])
  			.x(function(d){
  				return xScaleLog(d.rap_rate);
  			})
  			.y(function(d){
  				return yScaleLog(d.gen_rate);
  			})
  			.addAll(complete_centricity)
  			;

  		complete_centricity.forEach(drawCircle);

  	}
    function drawCircle(d) {

       circleContext.beginPath();

       if(d.centricity < .95){
        circleContext.fillStyle = centricityScaleLow(d.centricity)
      }
       else if(d.centricity > 1.05){
        circleContext.fillStyle = centricityScaleHigh(d.centricity);
      }
       else{
         circleContext.fillStyle = centricityScaleMid(d.centricity);
       }

      circleContext.moveTo(xScaleLog(d.rap_rate), yScaleLog(d.gen_rate));
      circleContext.arc(xScaleLog(d.rap_rate), yScaleLog(d.gen_rate), 2, 0, 2 * Math.PI);
      circleContext.fill();
	  }

    var containerSvgLine = containerSvg
      .append("line")
      .attr("x1",0)
      .attr("y1",yScale(minValue))
      .attr("x2",width)
      .attr("y2",0)
      .attr("class","scatter-chart-line")
      ;
    var containerSvgLasso = containerSvg
      .append("g")
      .selectAll("path")
      .data([[[xScale(.25),yScale(.08)],[xScale(10),yScale(.08)],[width-5,yScale(1)],[width-5,yScale(20)]]])
      .enter()
      .append("path")
      .attr("class","scatter-chart-triangle-lasso")
      .attr("d",function(d){
        return "M"+d[0][0]+","+d[0][1]+"L"+d[1][0]+","+d[1][1]+"L"+d[2][0]+","+d[2][1]+"L"+d[3][0]+","+d[3][1]+"Z"
      })
      .attr("stroke-linejoin","round")
      ;
    var containerSvgLineText = containerSvg
      .append("text")
      .attr("transform","translate("+height/2 + ',' + (height/2+5) + ') rotate(45)')
      .attr("class","scatter-chart-line-text")
      .html("<tspan>Equal</tspan> usage in hip hop vs. all music")
      ;

    var xAxis = container.append("div")
      .attr("class","scatter-chart-x-container")
      ;

    var xAxisText = xAxis.selectAll(".scatter-chart-x-text")
      .data(["less usage","more usage"])
      .enter()
      .append("p")
      .attr("class","scatter-chart-x-text")
      .style("text-align",function(d,i){
        if(i==1){
          return "right"
        }
        return null
      })
      .text(function(d){
        return d;
      })
      ;

    var xAxisTitle = xAxis.append("p")
      .attr("class","scatter-chart-x-title")
      .text("IN HIP HOP")
      ;

    var xAxisLine = xAxis.append("div")
      .attr("class","scatter-chart-x-line")
      ;

    var yAxis = container.append("div")
      .attr("class","scatter-chart-y-container")
      ;

    var yAxisTitle = yAxis.append("p")
      .attr("class","scatter-chart-y-title")
      .text("ALL OTHER GENRES")
      ;

    var yAxisText = yAxis.selectAll(".scatter-chart-y-text")
      .data(["","more usage"])
      .enter()
      .append("p")
      .attr("class","scatter-chart-y-text")
      .style("top",function(d,i){
        if(i==1){
          return "0%"
        }
        return null
      })
      .text(function(d){
        return d;
      })
      ;

    var yAxisLine = yAxis.append("div")
      .attr("class","scatter-chart-y-line")
      .style("height",yScale(minValue)+"px")
      ;

    function buildSecondScrollyChart(data,container){
      var container = container;
      var rapSize = 26052902;
      var genSize = 46855289;

      function buildRows(decade){

        container
          .append("p")
          .attr("class","scrolly-chart-word-title chart-title-big chart-title-big-common")
          .html(function(d){
            return "The Most &ldquo;Hip Hop&rdquo; Words";
          })
          ;

        container
          .append("p")
          .attr("class","scrolly-chart-word-title chart-title")
          .html(function(d){
            return "Likelihood word appears in hip hop vs. other genres";

            // return "Likelihood word appears in <span style='color:"+d3.color(centricityScaleHigh.range()[2])+";'>hip hop</span> vs. <span style='color:"+d3.color(centricityScaleLow.range()[0])+";'>other genres</span>";
          })
          ;

        var mostCentricNest = d3.nest().key(function(d){
            if(d.region == "all"){
              return d.decade;
            }
            return d.decade;
          })
          .entries(most_centric);

        var mostCentricMap = d3.map(mostCentricNest,function(d){return d.key});

        function changeRows(cut){

          rowsContainer.selectAll("div").remove();

          var data = mostCentricMap.get(cut).values

          if(cut == "new" && !filterWords){
            data = most_centric.filter(function(d){
              return d.region != "nsfw"
            })
            .sort(function(a,b){
              return b.centricity - a.centricity;
            })
            .slice(0,50);
          }
          else {
            data = most_centric
            .sort(function(a,b){
              return b.centricity - a.centricity;
            })
            .slice(0,50);
          }

          // console.log(cut);
          // if(cut == "new"){
          //   data = data.slice(0,50);
          // }

          var rows = rowsContainer
            .selectAll("div")
            .data(data)
            .enter()
            .append("div")
            .attr("class","scrolly-chart-row second-scrolly-rows")
            .on("mouseover",function(d){
              var wordObject = {Word:d.word,gen_rate:d.gen_tf/genSize*10000,rap_rate:d.rap_tf/rapSize*10000};
              highlightWord(wordObject);
            })
            ;

          var rowWord = rows
            .append("div")
            .attr("class","scrolly-chart-word")
            .text(function(d){
              if(d.word=="n-word"){
                return "N-word"
              }
              return d.word;
            })
            .style("text-transform",function(d){
              if(d.word=="n-word"){
                return "none";
              }
              return null;
            })
            .style("width","")
            ;

          rowWord.append("p")
            .attr("class","scrolly-chart-word-num")
            .text(function(d,i){
              return (i+1)+".";
            })
            ;

          var rowCentricity = rows
            .append("div")
            .attr("class","scrolly-chart-centricity")
            .text(function(d){
              if(d.centricity < 1){
                return formatComma(Math.round(d.centricity*100)/100)+":1";
              }
              return formatComma(Math.round(d.centricity))+":1";
            })
            .filter(function(d,i){
              return i==0;
            })
            .append("p")
            .attr("class","scrolly-chart-col-label")
            .text(function(d){
              return "odds in hip hop"
            })
            ;

          var rapSong = rows
            .append("div")
            .attr("class","scrolly-chart-centricity")
            .text(function(d){
              return formatComma(d.rap_tf);
            })
            .filter(function(d,i){
              return i==0;
            })
            .append("p")
            .attr("class","scrolly-chart-col-label")
            .html(function(d){
              return "rap word count*"
            })
            ;

          var otherSong = rows
            .append("div")
            .attr("class","scrolly-chart-centricity")
            .text(function(d){
              return formatComma(d.gen_tf);
            })
            .filter(function(d,i){
              return i==0;
            })
            .append("p")
            .attr("class","scrolly-chart-col-label")
            .text(function(d){
              return "other word count*"
            })
            ;
        }

        var rowsContainer = container
          .append("div")
          .attr("class","scrolly-chart-col-container");

        changeRows("new");
        //
        var toggles = [["sfw","nsfw"]];

        var toggle = container.append("div")
          .attr("class","scrolly-bar-chart-toggle-div")
          .selectAll("div")
          .data(toggles)
          .enter()
          .append("div")
          .attr("class","scrolly-bar-chart-toggle")

        toggle
          .append("div")
          .attr("class","scrolly-bar-chart-toggle-label")
          .text(function(d,i){
            if(i==0){
              return "Region"
            }
            return "Decade";
          })
          ;

        var buttons = toggle.selectAll(".scrolly-bar-chart-toggle-button")
          .data(function(d,i){
            return d;
          })
          .enter()
          .append("p")
          .attr("class",function(d,i){
            if(i==0){
              return "scrolly-bar-chart-toggle-button scrolly-bar-chart-toggle-button-selected"
            }
            return "scrolly-bar-chart-toggle-button"
          })
          .text(function(d){
            if(d=="nsfw"){
              return "NSFW (NOT safe for work)"
            }
            return "SFW (safe for work)";
          })
          .style("color",function(d){
            if(d=="nsfw"){
              return "#790404"
            }
            return null;
          })
          .style("font-weight",function(d){
            if(d=="nsfw"){
              return "600"
            }
            return null;
          })
          .on("click",function(d){
            buttons.classed("scrolly-bar-chart-toggle-button-selected",function(d){
              return false;
            })
            d3.select(this).classed("scrolly-bar-chart-toggle-button-selected",true);
            if(d == "nsfw"){
              filterWords = true;
            }
            else{
              filterWords = false;
            }
            changeRows("new");
          })
          ;

        container
          .append("p")
          .attr("class","scrolly-chart-footnote")
          .html(function(d){
            return "*Rap corpus: 26M words. General music corpus: 46.8M words";
          })
          ;

      }
      buildRows("all");


    }

    function buildScrollyChart(data,container){
      var container = container;
      var rapSize = 26052902;
      var genSize = 46855289;

      function buildRows(decade){
        var leastContainer = d3.select(".least-scroll-chart");
        var leastData = [["sailed",9,651,40],["emptiness",22,"1,371",35],["sigh",71,"2,368",19],["desire",468,"5,825",7],["sea","1,096","13,076",7],["broken","1,199","15,742",7.3],["heart","10,189","105,855",6],["cried",505,"5,215",6],["mountain",865,"7,990",5],["alone","5,195","40,721",4]];

        leastData = leastData.map(function(d){
          return {word:d[0],rap_tf:d[1],gen_tf:d[2],centricity:d[3]};
        })

        var top10Data = data.slice(0,10);

        var bottom10Data = complete_centricity.sort(function(a,b){
          return +a.centricity - +b.centricity;
        }).slice(0,10)

        var genMax = d3.max(top10Data,function(d){return d.gen_freq/genSize})
        var rapMax = d3.max(top10Data,function(d){return d.rap_freq/rapSize})
        var maxRate = Math.max(genMax,rapMax)*10000;

        var mostCentricNest = d3.nest().key(function(d){
            if(d.region == "all"){
              return d.decade;
            }
            return d.region;
          })
          .entries(most_centric);

        var mostCentricMap = d3.map(mostCentricNest,function(d){return d.key});

        leastContainer
          .append("p")
          .attr("class","scrolly-chart-word-title chart-title-big least-title")
          .html(function(d){
            return "The Least &ldquo;Hip Hop&rdquo; Words";
          })
          ;

        leastContainer
          .append("p")
          .attr("class","scrolly-chart-word-title chart-title")
          .html(function(d){
            return "Likelihood word appears in other genres vs. hip hop";

            // return "Likelihood word appears in <span style='color:"+d3.color(centricityScaleLow.range()[0])+";'>other genres</span> vs. <span style='color:"+d3.color(centricityScaleHigh.range()[2])+";'>hip hop</span>";
          })
          ;

        var rowsLeastContainer = leastContainer
          .append("div")
          .attr("class","scrolly-chart-col-container");



        buildLeastRows()

        leastContainer
          .append("p")
          .attr("class","scrolly-chart-footnote")
          .html(function(d){
            return "*Rap corpus: 26M words. General music corpus: 46.8M words";
          })
          ;


        // container
        //   .append("p")
        //   .attr("class","scrolly-chart-word-title chart-title-big")
        //   .html(function(d){
        //     return "The Most &ldquo;Hip Hop&rdquo; Words";
        //   })
        //   ;
        //
        // container
        //   .append("p")
        //   .attr("class","scrolly-chart-word-title chart-title")
        //   .html(function(d){
        //     return "Likelihood word appears in hip hop vs. other genres";
        //     // return "Likelihood word appears in <span style='color:"+d3.color(centricityScaleHigh.range()[2])+";'>hip hop</span> vs. <span style='color:"+d3.color(centricityScaleLow.range()[0])+";'>other genres</span>";
        //   })
        //   ;


        function changeRows(cut){

          rowsContainer.selectAll("div").remove();

          var rows = rowsContainer
            .selectAll("div")
            .data(mostCentricMap.get(cut).values)
            .enter()
            .append("div")
            .attr("class","scrolly-chart-row")
            ;

          var rowWord = rows
            .append("div")
            .attr("class","scrolly-chart-word")
            .text(function(d){
              return d.word;
            })
            ;

          rowWord.append("p")
            .attr("class","scrolly-chart-word-num")
            .text(function(d,i){
              return (i+1)+".";
            })
            ;

          var rowCentricity = rows
            .append("div")
            .attr("class","scrolly-chart-centricity")
            .text(function(d){
              if(d.centricity < 1){
                return Math.round(d.centricity*100)/100+":1";
              }
              return Math.round(d.centricity)+":1";
            })
            .filter(function(d,i){
              return i==0;
            })
            .append("p")
            .attr("class","scrolly-chart-col-label")
            .text(function(d){
              return "odds in hip hop"
            })
            ;

          var rapSong = rows
            .append("div")
            .attr("class","scrolly-chart-centricity")
            .text(function(d){
              return formatComma(d.rap_tf);
            })
            .filter(function(d,i){
              return i==0;
            })
            .append("p")
            .attr("class","scrolly-chart-col-label")
            .html(function(d){
              return "rap word count*"
            })
            ;

          var otherSong = rows
            .append("div")
            .attr("class","scrolly-chart-centricity")
            .text(function(d){
              return formatComma(d.gen_tf);
            })
            .filter(function(d,i){
              return i==0;
            })
            .append("p")
            .attr("class","scrolly-chart-col-label")
            .text(function(d){
              return "other word count*"
            })
            ;
        }
        function buildLeastRows(){

          var rows = rowsLeastContainer
            .selectAll("div")
            .data(leastData)
            .enter()
            .append("div")
            .attr("class","scrolly-chart-row")
            ;

          var rowWord = rows
            .append("div")
            .attr("class","scrolly-chart-word")
            .text(function(d){
              return d.word;
            })
            ;

          rowWord.append("p")
            .attr("class","scrolly-chart-word-num")
            .text(function(d,i){
              return (i+1)+".";
            })
            ;

          var rowCentricity = rows
            .append("div")
            .attr("class","scrolly-chart-centricity")
            .text(function(d){
              if(d.centricity < 1){
                return Math.round(d.centricity*100)/100+":1";
              }
              return Math.round(d.centricity)+":1";
            })
            .filter(function(d,i){
              return i==0;
            })
            .append("p")
            .attr("class","scrolly-chart-col-label")
            .text(function(d){
              return "odds not in hip hop"
            })
            ;

          var rapSong = rows
            .append("div")
            .attr("class","scrolly-chart-centricity")
            .text(function(d){
              return d.rap_tf;
            })
            .filter(function(d,i){
              return i==0;
            })
            .append("p")
            .attr("class","scrolly-chart-col-label")
            .html(function(d){
              return "rap word count*"
            })
            ;

          var otherSong = rows
            .append("div")
            .attr("class","scrolly-chart-centricity")
            .text(function(d){
              return d.gen_tf;
            })
            .filter(function(d,i){
              return i==0;
            })
            .append("p")
            .attr("class","scrolly-chart-col-label")
            .text(function(d){
              return "other word count*"
            })
            ;
        }

        // var rowsContainer = container
        //   .append("div")
        //   .attr("class","scrolly-chart-col-container");

        // changeRows("all");

        // var toggles = [["all","east","west","south","midwest"],["all","2010s","2000s","1990s","1980s"]];
        //
        // var toggle = container.append("div")
        //   .attr("class","scrolly-bar-chart-toggle-div")
        //   .selectAll("div")
        //   .data(toggles)
        //   .enter()
        //   .append("div")
        //   .attr("class","scrolly-bar-chart-toggle")
        //
        // toggle
        //   .append("div")
        //   .attr("class","scrolly-bar-chart-toggle-label")
        //   .text(function(d,i){
        //     if(i==0){
        //       return "Region"
        //     }
        //     return "Decade";
        //   })
        //   ;
        //
        // var buttons = toggle.selectAll(".scrolly-bar-chart-toggle-button")
        //   .data(function(d,i){
        //     return d;
        //   })
        //   .enter()
        //   .append("p")
        //   .attr("class",function(d,i){
        //     if(i==0){
        //       return "scrolly-bar-chart-toggle-button scrolly-bar-chart-toggle-button-selected"
        //     }
        //     return "scrolly-bar-chart-toggle-button"
        //   })
        //   .text(function(d){
        //     return d;
        //   })
        //   .on("click",function(d){
        //     buttons.classed("scrolly-bar-chart-toggle-button-selected",function(d){
        //       return false;
        //     })
        //     d3.select(this).classed("scrolly-bar-chart-toggle-button-selected",true);
        //     changeRows(d);
        //   })
        //   ;
        //






      }
      buildRows("all");

    }

    function buildSecondScrollyChartToggles(){
      var container = d3.select(".scrolly-bar-chart-two-toggles");

      var toggles = [["All","East","West","South"],["All","90s","80s"]];

      var toggle = container.append("div")
        .attr("class","scrolly-bar-chart-toggle-div")
        .selectAll("div")
        .data(toggles)
        .enter()
        .append("div")
        .attr("class","scrolly-bar-chart-toggle")

      toggle
        .append("div")
        .attr("class","scrolly-bar-chart-toggle-label")
        .text(function(d,i){
          if(i==0){
            return "Region"
          }
          return "Decade";
        })
        ;

      toggle.selectAll(".scrolly-bar-chart-toggle-button")
        .data(function(d){
          return d
        })
        .enter()
        .append("p")
        .attr("class",function(d,i){
          if(i==0){
            return "scrolly-bar-chart-toggle-button scrolly-bar-chart-toggle-button-selected"
          }
          return "scrolly-bar-chart-toggle-button"
        })
        .text(function(d){
          return d;
        })
        ;



    }

    function stepper(step){
      console.log(step);
      if(step==5){
        animationArrow = true;
      }
      else{
        animationArrow = false;
      }

      if(step!= 4 && step!=3 && step!= 5){

        containerSearch
          .style("opacity",0)
          .style("display","block")
          .transition()
          .duration(500)
          .style("opacity",1);
      }
      else{
        containerSearch
          .style("display",null);
      }

      if(step != 6){
        circleRadius = 4;
      }

      if(step == 8){
        // containerSvgLasso.style("display","block");
      }
      else if(step==7){
        containerSvgLasso.style("display",null);

        containerSvgTriangles
          .transition()
          .duration(0)
          .style("opacity",null)
          .style("visibility",null)

        containerTrianglesText
          .transition()
          .duration(0)
          .style("visibility","hidden")
          ;
        containerCirclesWrapper
          .transition()
          .duration(0)
          .style("opacity",null)
          ;
        containerCirclesCanvasContainer
          .style("opacity",1)
          ;
      }
      else if(step==6){

        containerCirclesAnnotation
          .transition()
          .duration(0)
          .style("visibility","hidden")

        containerSvgArrowLines
          .transition()
          .duration(0)
          .attr("y2",function(d){
            return yScale(d[2]);
          })
          .style("visibility","visible")
          .transition()
          .duration(1000)
          .style("opacity",null)
          .style("visibility",null)
          ;

        containerSvgLine
          .transition()
          .duration(0)
          .style("visibility","visible")

        containerCirclesCanvasContainer
          .style("visibility","visible")
          .style("opacity",null)
          ;
        containerSvgTriangles
          .transition()
          .duration(0)
          .style("opacity",null)
          .style("visibility",null)

        containerTrianglesText
          .transition()
          .duration(0)
          .style("visibility","hidden")
          ;

        containerCirclesWrapper
          .transition()
          .duration(1000)
          .style("opacity",1)
          ;

        circleRadius = 3;

        containerCircles
          .transition()
          .duration(0)
          .style("left",function(d,i){
            return xScale(d[1])-circleRadius+"px";
          })
          .style("top",function(d,i){
            return yScale(d[2])-circleRadius+"px";
          })
          .transition()
          .duration(1000)
          .delay(function(d,i){
            return i*200;
          })
          .style("background-color",function(d,i){
            if(d[1]/d[2] < .95){
              return centricityScaleLow(d[1]/d[2])
            }
            if(d[1]/d[2] > 1.05){
              return centricityScaleHigh(d[1]/d[2]);
            }
            return centricityScaleMid(d[1]/d[2]);
          })
          // .style("border-width","0px")
          .style("width",function(d,i){
            return circleRadius*2+"px";
          })
          .style("height",function(d,i){
            return circleRadius*2+"px";
          })
          ;

        container.transition().duration(500).style("margin-top",titleMarginTop);
      }
      else if(step==5){

        containerCirclesCanvasContainer
          .style("opacity",.3)
          ;

        function animation(){
          containerTrianglesTextContainerLines
            .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .delay(function(d,i){
              return 0// i*50
            })
            .attr("y2",function(d){
              if(d.item == 0){
                return -d.val*.5+"%"
              }
              return d.val*.5+"%"
            })
            .attr("x2",function(d){
              if(d.item == 0){
                return -d.val*.5+"%"
              }
              return d.val*.5+"%"
            })
            .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .attr("y2",function(d){
              if(d.item == 0){
                return -d.val+"%"
              }
              return d.val+"%"
            })
            .attr("x2",function(d){
              if(d.item == 0){
                return -d.val+"%"
              }
              return d.val+"%"
            })
            .on("end",function(d){
              if(animationArrow == true){
                animation();
              }
            })
            ;
        }
        animation();

        containerCirclesCircleLabel
          .transition()
          .duration(0)
          .style("left",function(d,i){
            return xScale(d[1])+"px";
          })
          .style("top",function(d,i){
            return yScale(d[2])-circleRadius-17+"px";
          })
          .style("visibility","visible")
          ;

        containerSvgTriangles
          .transition()
          .duration(0)
          .style("opacity",0)
          .style("visibility","visible")
          .transition()
          .duration(1000)
          .style("opacity",1)
          .transition()
          .duration(0)
          .style("opacity",null)

        containerTrianglesText
          .transition()
          .duration(0)
          .style("opacity",0)
          .style("visibility","visible")
          .transition()
          .duration(1000)
          .style("opacity",1)
          .transition()
          .duration(0)
          .style("opacity",null)

        containerSvgLineText
          .transition()
          .duration(0)
          .style("opacity",0)
          .style("visibility","visible")
          .transition()
          .duration(1000)
          .style("opacity",1)
          .transition()
          .duration(0)
          .style("opacity",null)
          ;

        containerCirclesWrapper
          .transition()
          .duration(1000)
          .style("opacity",.3)
          ;

        containerSvgLine
          .transition()
          .duration(0)
          .style("visibility","visible")

        containerCirclesAnnotation
          .transition()
          .duration(0)
          .style("visibility","hidden")

        container.transition().duration(500).style("margin-top",titleMarginTop);

      }
      else if(step==4){



        var transitionDuration = 1000;
        containerSvgLine.transition().duration(0).style("visibility","hidden")
        container.transition().duration(500).style("margin-top",titleMarginTop);
        // containerSvg.style("visibility",null)
        xAxis.style("visibility",null)
        containerCircles.style("visibility",null);
        xAxisTitle.style("visibility","visible")
        xAxisText.classed("scatter-chart-x-text-bottom",function(d){
          return true;
        });

        containerCirclesCanvasContainer.style("visibility",null);

        xAxis.transition()
          .duration(transitionDuration)
          .style("top",yScale(minValue)+"px")
          ;

        yAxis
          .transition()
          .duration(0)
          .style("opacity",0)
          .style("visibility",null)
          .transition()
          .duration(1000)
          .delay(transitionDuration)
          .style("opacity",1)
          .transition()
          .duration(0)
          .style("opacity",null)
          ;

        containerCirclesCount
          .transition()
          .duration(500)
          .style("opacity",0)
          .transition()
          .duration(0)
          .style("opacity",null)
          .style("visibility","hidden")
          ;

        containerSvgLine.style("visibility","hidden");

        containerSvgArrowLines
          .attr("y2",function(d){
            return  yScale(minValue);
          })
          .transition()
          .duration(1000)
          .delay(function(d,i){
            return i*200+transitionDuration
          })
          .style("visibility","visible")
          .attr("y2",function(d){
            return yScale(d[2]);
          })
          ;

        containerCirclesContainer
          .classed("row-design",false)
          .style("top",function(d,i){
            return 0+"px";
          })
          ;

        containerCirclesCircleLabel
          .transition()
          .duration(transitionDuration)
          .style("top",function(d,i){
            return yScale(minValue)-20+"px";
          })
          .transition()
          .duration(1000)
          .delay(function(d,i){
            return i*200 + transitionDuration
          })
          .style("left",function(d,i){
            return xScale(d[1])+"px";
          })
          .style("top",function(d,i){
            return yScale(d[2])-circleRadius-17+"px";
          })
          .style("visibility","visible")
          ;

        containerCirclesAnnotation
          .transition()
          .duration(0)
          .style("visibility",null)
          .style("opacity",0)
          .style("left",function(d,i){
            return xScale(d[1])+"px";
          })
          .style("top",function(d,i){
            return yScale(d[2])-(circleRadius*2)+10+"px";
          })
          .style("visibility",function(d){
            if(d[0]=="Love"){
              return "visible";
            }
            return null
          })
          .transition()
          .duration(1000)
          .delay(function(d,i){
            return transitionDuration + 1000
          })
          .style("opacity",1)
          ;

        containerCircles
          .transition()
          .duration(0)
          .style("width",circleRadius*2+"px")
          .style("height",circleRadius*2+"px")
          .transition()
          .duration(transitionDuration)
          .style("top",function(d,i){
            return yScale(minValue)-circleRadius+"px";
          })
          .style("background-color",null)
          .transition()
          .duration(1000)
          .delay(function(d,i){
            return i*200 + transitionDuration;
          })
          .style("left",function(d,i){
            return xScale(d[1])-circleRadius+"px";
          })
          .style("top",function(d,i){
            return yScale(d[2])-circleRadius+"px";
          })

          ;
      }
      else if(step == 3){

        var transitionDuration = 1000;
        xAxisText.classed("scatter-chart-x-text-bottom",false);
        container.transition().duration(0).style("margin-top",null);
        xAxis.transition().duration(0).style("top",null);
        xAxisTitle.style("visibility",null)
        containerSvgLine.transition().duration(0).style("visibility",null)
        containerSvgArrowLines
          .transition()
          .duration(500)
          .style("visibility","hidden")
          .attr("y2",function(d){
            return 0;
          })
          ;

        xAxis.style("visibility",null)

        containerCirclesAnnotation.transition()
          .duration(500)
          .style("left",function(d,i){
            return xScale(d[1])+"px";
          })
          .style("top",function(d,i){
            return yScale(minValue)+10+"px";
          })
          .style("visibility","hidden")
          ;

        containerCirclesCircleLabel
          .transition()
          .duration(500)
          .style("left",function(d,i){
            return xScale(d[1])+"px";
          })
          .style("top",function(d,i){
            return 0+13+"px";
          })
          .style("visibility",function(d,i){
            if(d[0] != "Money"){
              return "visible"
            }
          })
          ;

        container.transition().duration(500).style("margin-top",titleMarginTop);
        containerSvg.style("visibility","hidden")
        yAxis.style("visibility","hidden")

        containerCircles
          .transition()
          .duration(500)
          .style("background-color",null)
          .style("top",function(d,i){
            return 0-circleRadius+"px";
          })
          .style("left",function(d,i){
            return xScale(d[1])-circleRadius+"px";
          })
          ;

        containerCirclesCount
          .transition()
          .duration(500)
          .style("visibility","visible")
          .style("top",function(d,i){
            return circleRadius+24+"px"//(yScale(0)-circleRadius)+(30)+"px";
          })
          .style("left",function(d,i){
            return xScale(d[1])+"px";
          })

        containerCircles.style("visibility",null);

        containerCirclesContainer
          .classed("row-design",false)
          .transition()
          .duration(500)
          .style("top",function(d,i){
            return 0+"px";
          })
          ;

      }
    }

    buildScrollyChart(decade_centricity,d3.select(".scrolly-bar-chart"))
    // buildScrollyChart(,d3.select(".scrolly-bar-chart"))
    buildSecondScrollyChart(decade_centricity,d3.select(".scrolly-bar-chart-two"));
    // buildSecondScrollyChartToggles();

    stepper(3);

    function tsneZoom(){
      // zoomDiv.style("transform","translate3d("+0+"px,"+topOffset+"px,0px) scale(1,1)")
    }
    function tsneZoomOut(){
      // zoomDiv.style("transform","translate3d("+0+"px,"+topOffset+"px,0px) scale(.5,.5)")
    }

    var pinChart = new ScrollMagic.Scene({
          // triggerElement: ".third-chart-wrapper",
          triggerElement: ".scatter-two-column",
          triggerHook:0,
          offset: -50,
          duration:scrollContainer.node().getBoundingClientRect().height - (viewportHeight)
        })
        // .addIndicators({name: "pin 3 chart"}) // add indicators (requires plugin)
        .setPin(".scatter-container", {pushFollowers: false})
        .addTo(Controller)
        .on("enter",function(e){
          if(e.target.controller().info("scrollDirection") == "REVERSE"){
          }
          else{
            firstParagraph.transition().duration(250).style("opacity",1);
          }
          ;
        })
        .on("leave",function(e){
          if(e.target.controller().info("scrollDirection") == "FORWARD"){
          };
        })
        ;

    var secondTrigger = d3.select(".second-trigger");
    var thirdTrigger = d3.select(".third-trigger");
    var fourthTrigger = d3.select(".fourth-trigger");
    var fifthTrigger = d3.select(".fifth-trigger");
    // var sixthTrigger = d3.select(".sixth-trigger");

    var secondScene = new ScrollMagic.Scene({
        triggerElement: secondTrigger.node(),
        triggerHook:.4,
        offset: 0,
        duration:viewportHeight
      })
      // .addIndicators({name: "second trigger"}) // add indicators (requires plugin)
      .addTo(Controller)
      .on("enter",function(e){
        if(e.target.controller().info("scrollDirection") == "REVERSE"){
        }
        else{
          d3.select(secondTrigger.node().parentNode).transition().duration(250).style("opacity",1);
          stepper(4);
        }
      })
      .on("leave",function(e){
        if(e.target.controller().info("scrollDirection") == "REVERSE"){
          stepper(3);
        }
        else{

        }
      })
      ;

    var thirdScene = new ScrollMagic.Scene({
        triggerElement: thirdTrigger.node(),
        triggerHook:.4,
        offset: 0,
        duration:viewportHeight
      })
      // .addIndicators({name: "third trigger"}) // add indicators (requires plugin)
      .addTo(Controller)
      .on("enter",function(e){
        if(e.target.controller().info("scrollDirection") == "REVERSE"){
        }
        else{
          d3.select(thirdTrigger.node().parentNode).transition().duration(250).style("opacity",1);
          stepper(5);
        }
      })
      .on("leave",function(e){
        if(e.target.controller().info("scrollDirection") == "REVERSE"){
          stepper(6);
        }
        else{
        }
      })
      ;

    var fourthScene = new ScrollMagic.Scene({
        triggerElement: fourthTrigger.node(),
        triggerHook:.4,
        offset: 0,
        duration:viewportHeight
      })
      // .addIndicators({name: "fourth trigger"}) // add indicators (requires plugin)
      .addTo(Controller)
      .on("enter",function(e){
        if(e.target.controller().info("scrollDirection") == "REVERSE"){
        }
        else{
          d3.select(fourthTrigger.node().parentNode).transition().duration(250).style("opacity",1);
          stepper(6);
        }
      })
      .on("leave",function(e){
        if(e.target.controller().info("scrollDirection") == "REVERSE"){
          stepper(4);
        }
        else{
        }
      })
      ;

    var fifthScene = new ScrollMagic.Scene({
        triggerElement: fifthTrigger.node(),
        triggerHook:.4,
        offset: 0,
        duration:viewportHeight
      })
      // .addIndicators({name: "fifth trigger"}) // add indicators (requires plugin)
      .addTo(Controller)
      .on("enter",function(e){
        if(e.target.controller().info("scrollDirection") == "REVERSE"){
        }
        else{
          d3.select(fifthTrigger.node().parentNode).transition().duration(250).style("opacity",1);
          stepper(7)
        }
      })
      .on("leave",function(e){
        if(e.target.controller().info("scrollDirection") == "REVERSE"){
          stepper(5)
        }
        else{
        }
      })
      ;

    // var sixthScene = new ScrollMagic.Scene({
    //     triggerElement: sixthTrigger.node(),
    //     triggerHook:.4,
    //     offset: 0,
    //     duration:viewportHeight
    //   })
    //   // .addIndicators({name: "fifth trigger"}) // add indicators (requires plugin)
    //   .addTo(Controller)
    //   .on("enter",function(e){
    //     if(e.target.controller().info("scrollDirection") == "REVERSE"){
    //     }
    //     else{
    //       d3.select(sixthTrigger.node().parentNode).transition().duration(250).style("opacity",1);
    //       // stepper(8)
    //     }
    //   })
    //   .on("leave",function(e){
    //     if(e.target.controller().info("scrollDirection") == "REVERSE"){
    //       stepper(7)
    //     }
    //     else{
    //     }
    //   })
    //   ;

    // var fixedTsneScene = new ScrollMagic.Scene({
    //     triggerElement: ".intro-section",
    //     triggerHook:0,
    //     offset: 0,
    //     duration:1000
    //   })
    //   // .addIndicators({name: "fixed trigger"}) // add indicators (requires plugin)
    //   .addTo(Controller)
    //   .on("enter",function(e){
    //     if(e.target.controller().info("scrollDirection") == "REVERSE"){
    //     }
    //     else{
    //       // tsneChart.classed("fixed-hidden",false);
    //     }
    //   })
    //   .on("leave",function(e){
    //     if(e.target.controller().info("scrollDirection") == "REVERSE"){
    //       // tsneChart.classed("fixed-hidden",true);
    //     }
    //     else{
    //     }
    //   })
    //   ;

  }
  function artistExplain(){

    police_counts = police_counts.filter(function(d){
      return d.total_song > 10;
    })
    .sort(function(a,b){
      if(a.artist == "N.W.A" || a.artist == "Avg. Artist"){
        if(a.artist == "N.W.A" && b.artist == "Avg. Artist"){
          return -1;
        }
        else if(b.artist == "N.W.A" && a.artist == "Avg. Artist"){
          return 1;
        }
        return -1
      }
      else if(b.artist == "N.W.A" || b.artist == "Avg. Artist"){
        return 1;
      }

      var countA = +a.song_percent;
      var countB = +b.song_percent;
      return countB - countA;
    })

    var container = d3.select(".artist-explain-chart-container");
    var scrollContainer = d3.select(".artist-explain-prose")

    var topContainer = d3.select(".artist-explain-chart-container-top");

    var wordFreqExtent = d3.extent(police_counts,function(d){ return d.freq_10K; });
    var percentExtent = d3.extent(police_counts,function(d){ return d.song_percent; });

    var wordFreqCompExtent = d3.extent(police_counts,function(d){ return d.freq_10K_compton; });
    var percentCompExtent = d3.extent(police_counts,function(d){ return d.song_percent_compton; });

    var wordScale = d3.scaleLinear().domain([5,.2]).range(["#aaaaaa","#1f69c5"]).clamp(true);
    var percentScale = d3.scaleLinear().domain([.05,.2]).range(["#aaaaaa","#1f69c5"]).clamp(true);

    var wordCompScale = d3.scaleLinear().domain([5,48]).range(["#aaaaaa","#03BE62"]).clamp(true);
    var percentCompScale = d3.scaleLinear().domain([.05,.26]).range(["#aaaaaa","#1fc573"]).clamp(true);

    var colWidth = 170;

    var lineHeightStart = 40;
    var lineHeightEnd = 15

    var startArtistSize = 23;
    var endArtistSize = 11;

    var startSongLeft = 150;
    var endSongLeft = 130;

    var startWordLeft = 234;
    var endWordLeft = 164;

    var headerHeight = 140;
    var rowPadding = 40;
    var maxRows = (viewportHeight - (headerHeight+rowPadding))/lineHeightEnd

    var rowHeight = 15;
    var cols = 4;
    if(viewportWidth<950){
      cols = 3;
    }
    var maxRowsCount = ((viewportHeight - (200))/rowHeight)*cols

    var rowsTop = topContainer.selectAll("div")
      .data(police_counts.slice(0,2))
      .enter()
      .append("div")
      .attr("class","artist-explainer-col-top")

    var rowsTopArtist = rowsTop.append("p")
      .attr("class","artist-explainer-col-top-artist")
      .text(function(d){
        return d.artist;
      });

    var rowsTopPercent = rowsTop.append("p")
      .attr("class","artist-explainer-col-top-percent")
      .html(function(d){
        return Math.round(100*d.song_percent)+"<span>%</span>";
      })
      .style("color",function(d){
        return percentScale(d.song_percent);
      })
      ;

    var rows = container.selectAll("div")
      .data(police_counts.slice(2,maxRowsCount))
      .enter()
      .append("div")
      .each(function(d){
        d.startArtistSize = startArtistSize
        d.endArtistSize = endArtistSize
      })
      .attr("class","artist-expainer-row")
      // .style("transform",function(d,i){
      //   // if(i==0){
      //   //   return "translate("+0+"px,"+(i+1)*lineHeightStart+"px)"
      //   // }
      //   // if(i==1){
      //   //   return "translate("+0+"px,"+(i-1)*lineHeightStart+"px)"
      //   // }
      //   // return "translate("+0+"px,"+i*lineHeightStart+"px)"
      // })
      // .style("opacity",function(d,i){
      //   if(i<2){
      //     return 1;
      //   }
      //   return 0
      // })
      ;

    var artistName = rows.append("p")
      .attr("class","artist-expainer-row-artist")
      .text(function(d){
        if(mobile && viewportWidth < 420){
          if(d.artist.length > 11){
            return d.artist.slice(0,10)+"..."
          }
        }
        if(d.artist.length > 14){
          return d.artist.slice(0,13)+"..."
        }
        return d.artist;
      })
      ;

    var trackPercent = rows.append("div")
      .attr("class","artist-expainer-row-track-percent")

    var trackPercentText = trackPercent.append("p")
      .html(function(d){
        return Math.round(100*d.song_percent)+"<span>%</span>";
      })
      .style("color",function(d){
        return percentScale(d.song_percent);
      })
      ;

    var percentLabel = trackPercent.filter(function(d,i){
        if(i!=0 && (i==1 || Math.floor(i % maxRows) == 0)){
          return d;
        }
      })
      .append("p")
      .text("Percent of Tracks")
      .attr("class","artist-explainer-column-label")
      ;

    var wordFreq = rows.append("div")
      .attr("class","artist-expainer-row-track-freq")

    var wordFreqText = wordFreq.append("p")
      .text(function(d){
        return Math.round(d.freq_10K*10)/10;
      })
      .style("color",function(d){
        return wordScale(d.freq_10K);
      })
      ;

    var freqLabel = wordFreq.filter(function(d,i){
        if(i!=0 && (i==1 || Math.floor(i % maxRows) == 0)){
          return d;
        }
      })
      .append("p")
      .text("Occurances per 10K lyrics")
      .attr("class","artist-explainer-column-label")
      ;

    function showRows(change){
      console.log("showing ros");
      rows
        .transition()
        .duration(500)
        .delay(function(d,i){
          if(change=="hide"){
            return 0;
          }
          return 10*i;
        })
        .style("opacity",function(d,i){
          if(change=="hide"){
            return 0
          }
          return 1;
        })
        ;
    }

    var titleToStrike = d3.select(container.node().parentNode).selectAll(".to-strike")
    var titleToAdd = d3.select(container.node().parentNode).selectAll(".to-add")

    function changeCompton(change){
      titleToStrike.classed("striking",function(d,i){
        if(change=="compton"){
          return true
        }
        return false;
      });

      titleToAdd.classed("showing",function(d,i){
          if(change=="compton"){
            return true
          }
          return false;
        })
        .style("opacity",function(d){
          if(change=="compton"){
            return 0
          }
          return 1;
        })
        .transition()
        .duration(500)
        .style("opacity",function(d){
          if(change=="compton"){
            return 1
          }
          return 0;
        })
        ;

      trackPercentText
        .style("opacity",function(d){
          return 0;
        })
        .html(function(d){
          if(change=="compton"){
            return Math.round(100*d.song_percent_compton)+"<span>%</span>";
          }
          return Math.round(100*d.song_percent)+"<span>%</span>";
        })
        .style("color",function(d){
          if(change=="compton"){
            if(d.song_percent_compton < .01){
              return "#cacaca";
            }
            return percentCompScale(d.song_percent_compton);
          }
          return percentScale(d.song_percent);
        })
        .transition()
        .duration(750)
        .delay(function(d,i){
          return i*15;
        })
        .style("opacity",1)
        ;

      rowsTopPercent
        .html(function(d){
          if(change=="compton"){
            return Math.round(100*d.song_percent_compton)+"<span>%</span>";
          }
          return Math.round(100*d.song_percent)+"<span>%</span>";
        })
        .style("color",function(d){
          if(change=="compton"){
            return percentCompScale(d.song_percent_compton);
          }
          return percentScale(d.song_percent);
        })
        .transition()
        .duration(750)
        .delay(function(d,i){
          return i*15;
        })
        .style("opacity",1)
        ;

      artistName.style("opacity",function(d){
        if(change=="compton"){
          if(d.song_percent_compton < .01){
            return .5;
          }
          return null;
        }
        return 1;
      })
    }
    function showCard(element){
      if(!mobile){
        d3.select(element.parentNode).transition().duration(250).style("opacity",1);
      }
    }

    var triggerSetting = .4;
    if(mobile){
      triggerSetting = 1;
    }

    var firstTrigger = scrollContainer.select(".explain-first-trigger");
    var secondTrigger = scrollContainer.select(".explain-second-trigger");
    var thirdTrigger = scrollContainer.select(".explain-third-trigger");
    var fourthTrigger = scrollContainer.select(".explain-fourth-trigger");

    var pinChart = new ScrollMagic.Scene({
          triggerElement: ".artist-explain-container",
          triggerHook:0,
          offset: -30,
          duration:scrollContainer.node().getBoundingClientRect().height-viewportHeight+200
        })
        .setPin(".artist-explain-container", {pushFollowers: false})
        .addTo(Controller)
        .on("enter",function(e){
          if(e.target.controller().info("scrollDirection") == "REVERSE"){
          }
          else{
            showCard(firstTrigger.node());
          }
          ;
        })
        ;

    var secondScene = new ScrollMagic.Scene({
        triggerElement: secondTrigger.node(),
        triggerHook:triggerSetting,
        offset: 0,
        duration:viewportHeight
      })
      // .addIndicators({name: "second trigger"})
      .addTo(Controller)
      .on("enter",function(e){
        if(e.target.controller().info("scrollDirection") == "REVERSE"){
        }
        else{
          showCard(secondTrigger.node());
          showRows("show");
        }
      })
      .on("leave",function(e){
        if(e.target.controller().info("scrollDirection") == "REVERSE"){
          showRows("hide");
        }
        else{
        }
      })
      ;

    var thirdScene = new ScrollMagic.Scene({
        triggerElement: thirdTrigger.node(),
        triggerHook:triggerSetting,
        offset: 0,
        duration:viewportHeight
      })
      // .addIndicators({name: "third trigger"})
      .addTo(Controller)
      .on("enter",function(e){
        if(e.target.controller().info("scrollDirection") == "REVERSE"){
        }
        else{
          showCard(thirdTrigger.node());
          changeCompton("compton");
        }
      })
      .on("leave",function(e){
        if(e.target.controller().info("scrollDirection") == "REVERSE"){
          changeCompton("police");
        }
        else{
        }
      })
      ;

    var fourthScene = new ScrollMagic.Scene({
        triggerElement: fourthTrigger.node(),
        triggerHook:triggerSetting,
        offset: 0,
        duration:viewportHeight
      })
      // .addIndicators({name: "fourth trigger"})
      .addTo(Controller)
      .on("enter",function(e){
        if(e.target.controller().info("scrollDirection") == "REVERSE"){
        }
        else{
          showCard(fourthTrigger.node());
        }
      })
      .on("leave",function(e){
        if(e.target.controller().info("scrollDirection") == "REVERSE"){
        }
        else{
        }
      })
      ;

  }
  function tsneDraw(){


    var methodology = d3.select(".tnse-methodology");
    var methodologyActive = false;

    methodology
      .append("p")
      .attr("class","tsne-methodology-button")
      .text("Methodology")
      .on("click",function(d){
        if(!methodologyActive){
          if(modalVisible){
            console.log(modal);
            modal.style("display","none");
            modalVisible = false;
          }
          methodologyWindow.classed("tsne-methodology-window-active",true)
          methodologyActive = true;
        }
        else{
          methodologyWindow.classed("tsne-methodology-window-active",false)
          methodologyActive = false;
        }
      })
      ;

    var methodologyWindow = methodology
      .append("div")
      .attr("class","tsne-methodology-window")
      ;

    methodologyWindow.append("p")
      .attr("class","tsne-methodology-window-close")
      .text("close")
      .on("click",function(d){
        methodologyWindow.classed("tsne-methodology-window-active",false)
        methodologyActive = false;
      })


    var superParentContainer = d3.select(".tsne-chart-wrapper");
    superParentContainer.classed("additional-fixed",true);
    if(tablet){
      superParentContainer.classed("tablet-fixed",true);
    }
    superParentContainer.classed("additional-fixed",true);

    var container = d3.select(".tsne-chart");
    var width = 1200;
    var height = 1200;

    var modal = d3.select(".tnse-modal");
    if(tablet){
      modal.classed("tablet-modal",true);
    }
    var modalVisible = true;
    var leftGutter = 180;

    var x0 = 1500;


    function zoomed() {
      toolTip.style("display","none");
      var transform = d3.event.transform;
      zoomDiv.style("transform", "translate3d(" + Math.round(transform.x) + "px," + Math.round(transform.y) + "px,0px) scale(" + transform.k + ")");
    }

    function started(){
      // console.log(d3.event.transform);
      // console.log(d3.event.type);
      // console.log(d3.event.target);
      // console.log(d3.event.sourceEvent);
    }

    function ended(){

    }

    var zoom = d3.zoom()
      // .scaleExtent([.001,1])
      .scaleExtent([.4,1])
      // .translateExtent([[-leftGutter*2,-leftGutter*2],[width+leftGutter*2,height+leftGutter*2]])
      .on("zoom", zoomed)//function () {
      // .on("start",started)
      .on("start",function(){
        grabbing = true;
        tsneSimilarLines.style("display","none")
        container.style("cursor","-webkit-grabbing")
      })
      .on("end",function(){
        grabbing = false;
        tsneSimilarLines.style("display",null)
        container.style("cursor",null)
      })
      ;

    container
      .on("mousemove",function(d){
        var coordinates = [0, 0];
        coordinates = d3.mouse(this);
        var x = coordinates[0];
        var y = coordinates[1];
        toolTip.style("transform","translate("+x+"px,"+y+"px)");
      })
      .on("mousedown",function(d){
        if(!mobile && !tablet){
          if(modalVisible){
            modal.style("display","none");
            modalVisible = false;
          }
        }
      })
      .call(zoom)
      .on("wheel.zoom", null)
      // .on("dblclick", doubleClick);
      ;

    var wuTangVertices = [];
    var migosVertices = [];
    var nwaVertices = [];

    tsne_data.forEach(function(d){
      d.r = 18;
      var artist_data = artistMap.get(d.artist)


      d.id = +artist_data.artist_id;
      d.remove = artist_data.remove;
      d.positionX = +d.x
      d.artist_data = artist_data;
      d.positionY = +d.y
      d.x = +d.positionX
      d.y = +d.positionY
      if(d.remove != 1){
        var similarityData = similarityIdMap.get(d.id).values
        d.similarityRank = similarityData;
      }
    });


    tsne_data = tsne_data.filter(function(d){
      return d.remove != 1;
    })
    .sort(function(a,b){
      return a.artist_id - b.artist_id;
    })

    var xExtent = d3.extent(tsne_data,function(d){return +d.positionX;});
    var yExtent = d3.extent(tsne_data,function(d){return +d.positionY;});

    var xScale = d3.scaleLinear().domain(xExtent).range([0,width]);
    var yScale = d3.scaleLinear().domain(yExtent).range([height,0]);

    // var xScale = d3.scaleLinear().domain(xExtent).range([-width/2,width/2]);
    // var yScale = d3.scaleLinear().domain(yExtent).range([height/2,-height/2]);

    // function buildMap(){
    //
    //   var mapTransformFunction;
    //
    //   var zoom = d3.zoom()
    //     .scaleExtent([scaleAmount*window.devicePixelRatio, 10])
    //     .on("zoom", function(){
    //       initialDraw();
    //     })
    //     ;
    //
    //   function transform(d) {
    //     return d3.zoomIdentity
    //       .translate(0,0)
    //       .scale(scaleAmount*window.devicePixelRatio)
    //       ;
    //   }
    //
    //   var mapWidth = 160;
    //   var mapHeight = 100;
    //
    //   var mapContainer = container
    //     .append("div")
    //     .attr("class","tsne-map-container")
    //
    //   mapContainer
    //     .append("div")
    //     .attr("class","tsne-map-rect")
    //     ;
    //
    //   var map = mapContainer
    //     .append("canvas")
    //     .attr("class","tsne-map")
    //     .attr("width", function(d){
    //       return mapWidth * window.devicePixelRatio;
    //     })
    //     .attr("height", function(d){
    //       return mapHeight * window.devicePixelRatio;
    //     })
    //     .style("width", function(d){
    //       return mapWidth+"px";
    //     })
    //     .style("height", function(d){
    //       return mapHeight+"px";
    //     })
    //     ;
    //
    //   var mapContext = map.node().getContext("2d"),
    // 	    canvasWidth = map.node().width,
    // 	    canvasHeight = map.node().height
    // 			;
    //
    //   map
    //     .call(zoom.transform,function(d){
    //       return transform(d);
    //     });
    //
    //   function initialDraw() {
    //
    //     var xScale = d3.scaleLinear().domain(xExtent).range([0,mapWidth]);
    //     var yScale = d3.scaleLinear().domain(yExtent).range([mapHeight,0]);
    //     mapContext.clearRect(0, 0, mapWidth*window.devicePixelRatio, mapHeight*window.devicePixelRatio);
    //
    //     mapTransformFunction = d3.event.transform;
    //
    //     if(d3.event.transform.k==scaleAmount*ratio){
    //         mapContext.translate(0, 0);
    //     }
    //     else{
    //       mapContext.translate(d3.event.transform.x, d3.event.transform.y);
    //     }
    //     mapContext.scale(d3.event.transform.k, d3.event.transform.k);
    //
    //     base_image = new Image();
    //     base_image.src = 'css/face_images/group_1.png';
    //     base_image.onload = function(){
    //       tsne_data.forEach(drawCircle);
    //     }
    //     function drawCircle(d,i) {
    //       // console.log(i);
    //       mapContext.drawImage(base_image, 0, 0, 30, 47, xScale(d.positionX), yScale(d.positionY), 30/8, 47/8);
    //
    //     //    circleContext.beginPath();
    //     //
    //     //    if(d.centricity < .95){
    //     //     circleContext.fillStyle = centricityScaleLow(d.centricity)
    //     //   }
    //     //    else if(d.centricity > 1.05){
    //     //     circleContext.fillStyle = centricityScaleHigh(d.centricity);
    //     //   }
    //     //    else{
    //     //      circleContext.fillStyle = centricityScaleMid(d.centricity);
    //     //    }
    //     //
    //     //   circleContext.moveTo(xScaleLog(d.rap_rate), yScaleLog(d.gen_rate));
    //     //   circleContext.arc(xScaleLog(d.rap_rate), yScaleLog(d.gen_rate), 2, 0, 2 * Math.PI);
    //     //   circleContext.fill();
    //     }
    //   }
    //
    // }
    //
    // buildMap();

    zoomDiv = container
      .append("div")
      .attr("class","tsne-zooming-div")
      ;

    var search = d3.select(".tsne-search");
    var tsneFiltersContainer = d3.select(".tsne-filters");

    var filterArray = [
      {filter_name:"clusters",options:["Wu-Tang Clan","Migos/Young Thug/Future","Ice Cube/Eazy-E/Dre"]},
      {filter_name:"regions",options:["All","South","West","East"]},
      {filter_name:"era",options:["All","2010s","2000s","1990s","1980s"]}
    ];

    var tsneFilter = tsneFiltersContainer.selectAll("div")
      .data(filterArray)
      .enter()
      .append("div")
      .attr("class","tsne-filter")
      ;

    tsneFilter.append("p")
      .attr("class","tsne-filter-label")
      .text(function(d){
        return d.filter_name;
      })
      ;

    var filterSelected = "";
    console.log(tsne_data);

    var tsneFilterItems = tsneFilter
      .append("div")
      .attr("class","tsne-filter-item-container")
      .selectAll("div")
      .data(function(d){
        return d.options;
      })
      .enter()
      .append("div")
      .attr("class","tsne-filter-item")
      .on("click",function(d){
        var selected = d;
        if(selected == "All"){
          filterSelected = selected;
          tsneFilterItems.classed("tsne-filter-active",false);
          facesTsne.classed("opacity-out",false);
          wuTangCluster.style("display",null);
        }
        else{
          if(selected == filterSelected){
            filterSelected = ""
            tsneFilterItems.classed("tsne-filter-active",false);
            facesTsne.classed("opacity-out",false);
            wuTangCluster.style("display",null);
          }
          else{
            filterSelected = selected;
            tsneFilterItems.classed("tsne-filter-active",function(d){
              if(d==selected){
                return true;
              }
              return false;
            });

            var filterType = d3.select(this.parentNode).datum().filter_name;
            if(filterType == "regions"){

              facesTsne
                .classed("opacity-out",function(d){
                  if(d.artist_data.region == selected){
                    return false;
                  }
                  return true;
                })
            }
            else if(filterType == "era"){
              facesTsne
                .classed("opacity-out",function(d){
                  if(d.artist_data.era == selected){
                    return false;
                  }
                  return true;
                })
            }
            else{
              wuTangCluster.style("display","block");

              if(selected == "Wu-Tang Clan"){

                // facesTsne
                //   .classed("opacity-out",function(d){
                //     if(wuTangIds.indexOf(+d.id) > -1){
                //       return false
                //     }
                //     return true;
                //   })
                wuTangCluster
                  .datum(d3.polygonHull(wuTangVertices))
                  .transition()
                  .duration(1000)
                  .attr("d",function(d){
                    return "M" + d.join("L") + "Z";
                  })
                  ;

                var zoomTransform = d3.zoomIdentity
                  .translate(-378+viewportWidth/2,-148+viewportHeight/2)
                  .scale(1)

              }
              else if(selected == "Migos/Young Thug/Future"){
                wuTangCluster
                  .datum(d3.polygonHull(migosVertices))
                  .transition()
                  .duration(1000)
                  .attr("d",function(d){
                    return "M" + d.join("L") + "Z";
                  })
                  ;

                var zoomTransform = d3.zoomIdentity
                  .translate(-914+viewportWidth/2,-171+viewportHeight/2)
                  .scale(1)

              }
              else{
                wuTangCluster
                  .datum(d3.polygonHull(nwaVertices))
                  .transition()
                  .duration(1000)
                  .attr("d",function(d){
                    return "M" + d.join("L") + "Z";
                  })
                  ;

                var zoomTransform = d3.zoomIdentity
                  .translate(-132+viewportWidth/2,-603+viewportHeight/2)
                  .scale(1)
              }

              container.transition()
                .duration(500)
                .call(zoom.transform, zoomTransform)


            }

          }

        }
      })

    tsneFilterItems
      .append("p")
      .text(function(d){
        return d;
      })
      .append("span")
      .append("svg")
      .attr("xmlns","http://www.w3.org/2000/svg")
      .attr("width",24)
      .attr("height",24)
      .attr("viewBox","0 0 24 24")
      .append("path")
      .attr("d","M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.151 17.943l-4.143-4.102-4.117 4.159-1.833-1.833 4.104-4.157-4.162-4.119 1.833-1.833 4.155 4.102 4.106-4.16 1.849 1.849-4.1 4.141 4.157 4.104-1.849 1.849z")
      ;

    var magnifying = search
      .append("svg")
      .attr("class","magnifying-class")
      .attr("xmlns","http://www.w3.org/2000/svg")
      .attr("xmlns:xlink","http://www.w3.org/1999/xlink")
      .attr("version","1.1")
      .attr("x","0px")
      .attr("y","0px")
      .attr("viewBox","0 0 32 32")
      .attr("enable-background","new 0 0 32 32")
      .attr("xml:space","preserve")
      .append("path")
      .attr("d","M29.283,25.749l-7.125-7.127c0.959-1.582,1.521-3.436,1.521-5.422c0-5.793-4.688-10.484-10.481-10.486  C7.409,2.716,2.717,7.407,2.717,13.199c0,5.788,4.693,10.479,10.484,10.479c1.987,0,3.838-0.562,5.42-1.521l7.129,7.129  L29.283,25.749z M6.716,13.199C6.722,9.617,9.619,6.72,13.2,6.714c3.58,0.008,6.478,2.903,6.484,6.485  c-0.007,3.579-2.904,6.478-6.484,6.483C9.618,19.677,6.721,16.778,6.716,13.199z")
      ;

    var searchInput = search
      .append("input")
      .attr("class","tsne-search-input")
      .attr("type","text")
      .attr("placeholder","Find an artist...")
      ;

    tnseSearchResults = search.append("div")
      .attr("class","tsne-search-results")
      ;

    searchInput
      .on("keyup", keyupedFilmColumn)
      ;
      //
    function keyupedFilmColumn() {
      searchNewsroom(this.value.trim());
    }

    function highlightWord(data){
      var zoomTransform = d3.zoomIdentity
        .translate(-xScale(data.positionX)+viewportWidth/2,-yScale(data.positionY)+viewportHeight/2)
        .scale(1)

      container.transition()
        .duration(500)
        .call(zoom.transform, zoomTransform)

      searchMarker
        .style("visibility","visible")
        .style("transform",function(d){
          return "translate("+xScale(data.positionX)+"px,"+yScale(data.positionY)+"px)"
        })
        .text(data.artist)
        ;

      searchCircle
        .style("visibility","visible")
        .style("transform",function(d){
          return "translate("+xScale(data.positionX)+"px,"+yScale(data.positionY)+"px)"
        });
    }

    function searchNewsroom(value) {
      if (value.length > 2) {
        tnseSearchResults.style("display","block");
        tnseSearchResults.selectAll("p").remove();

        function escapeString(s) {
          return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        }
        //
        var re = new RegExp("\\b" + escapeString(value), "i");
        var searchArray = [];

        searchArray = _.filter(tsne_data, function(d,i) {
          return re.test(d["artist"]);
        })
        ;
        //
        searchArray = searchArray.slice(0,3);
        //
        tnseSearchResults
          .selectAll("p")
          .data(searchArray)
          .enter()
          .append("p")
          .attr("class","scatter-chart-search-results-result")
          .text(function(d){
            return d.artist;
          })
          .on("click",function(d){
            highlightWord(d);
          })
          ;

        if(searchArray.length == 1){
          highlightWord(searchArray[0]);
        }

      }
      else{
        tnseSearchResults.style("display",null);
        searchMarker.style("visibility",null)
        searchCircle.style("visibility",null)
      }

    };

    var controlDiv = superParentContainer.append("div")
      .attr("class","tsne-zoom-buttons");

    var controlDivTwo = superParentContainer.append("div")
      .attr("class","tsne-zoom-buttons-two");

    var controls = controlDiv
      .selectAll("div")
      .data(["zoom-in","zoom-out"])
      .enter()
      .append("div")
      .attr("class","tsne-zoom-button")
      .text(function(d){
        if(d=="zoom-in"){
          return "+"
        }
        return "–"
      })
      .on("click",function(d){
        var zoomAmount;
        if(d=="zoom-in"){
          zoomAmount = 1.5;
          // zoomLevel = Math.min(zoomLevel+1,3);
          // zoomTransform = d3.zoomTransform(container.node()).scale(1.2);

        }
        else{
          zoomAmount = 1/1.5;
          // zoomLevel = Math.max(zoomLevel-1,0);
          // console.log(zoomLevel);
          // console.log(zoomTransform.invertX(1176));
          // zoomTransform = d3.zoomTransform(container.node()).scale(.8);
        }

        initiateZoom([viewportWidth/2,viewportHeight/2],zoomAmount);


        // var zoomScale = zoomOptions[zoomLevel];


        // var zoomTransform = d3.zoomIdentity
        //     .translate(translateX, translateY)
        //     .scale(zoomScale)

        // container.transition()
        //     .duration(1000)
        //     .call(zoom.transform, zoomTransform);

        // zoomDiv.transition().duration(300).style("transform", "translate(" + translateX + "px," + translateY + "px) scale(" + zoomScale + ")");


        // d3.zoomTransform(container.node()).k = .4;

        // zoom.scaleTo(zoomDiv,.8);
        // console.log(d3.zoomTransform(container.node()));
        // d3.zoomTransform(container.node()).k = zoomOptions[zoomLevel];
        // var transform = d3.zoomTransform(container.node());
        // //
        //
        // console.log(transform.x,transform.y);
        // var applied = transform.apply([transform.x,transform.y]);
        // zoomDiv.transition().duration(300).style("transform", "translate(" + transform.x + "px," + transform.y + "px) scale(" + transform.k + ")");
      })
      .call(zoom).on("dblclick.zoom", null)
      ;

    var controlsTwo = controlDivTwo
     .selectAll("div")
     .data(["zoom-in","zoom-out"])
     .enter()
     .append("div")
     .attr("class","tsne-zoom-button")
     .text(function(d){
       if(d=="zoom-in"){
         return "+"
       }
       return "–"
     })
     .on("click",function(d){
       var zoomAmount;
       if(d=="zoom-in"){
         zoomAmount = 1.5;
         // zoomLevel = Math.min(zoomLevel+1,3);
         // zoomTransform = d3.zoomTransform(container.node()).scale(1.2);

       }
       else{
         zoomAmount = 1/1.5;
         // zoomLevel = Math.max(zoomLevel-1,0);
         // console.log(zoomLevel);
         // console.log(zoomTransform.invertX(1176));
         // zoomTransform = d3.zoomTransform(container.node()).scale(.8);
       }

       initiateZoom([viewportWidth/2,viewportHeight/2],zoomAmount);


       // var zoomScale = zoomOptions[zoomLevel];


       // var zoomTransform = d3.zoomIdentity
       //     .translate(translateX, translateY)
       //     .scale(zoomScale)

       // container.transition()
       //     .duration(1000)
       //     .call(zoom.transform, zoomTransform);

       // zoomDiv.transition().duration(300).style("transform", "translate(" + translateX + "px," + translateY + "px) scale(" + zoomScale + ")");


       // d3.zoomTransform(container.node()).k = .4;

       // zoom.scaleTo(zoomDiv,.8);
       // console.log(d3.zoomTransform(container.node()));
       // d3.zoomTransform(container.node()).k = zoomOptions[zoomLevel];
       // var transform = d3.zoomTransform(container.node());
       // //
       //
       // console.log(transform.x,transform.y);
       // var applied = transform.apply([transform.x,transform.y]);
       // zoomDiv.transition().duration(300).style("transform", "translate(" + transform.x + "px," + transform.y + "px) scale(" + transform.k + ")");
     })
     .call(zoom).on("dblclick.zoom", null)
     ;

    function zoomTo(coors,zoomAmount){

      function translate(transform, p0, p1) {
        var x = p0[0] - p1[0] * transform.k, y = p0[1] - p1[1] * transform.k;
        return d3.zoomIdentity.translate(x, y).scale(transform.k)
        //return x === transform.x && y === transform.y ? transform : new Transform(transform.k, x, y);
      }
      function scale(transform, k) {
        k = Math.max(k0, Math.min(k1, k));
        return d3.zoomIdentity.translate(transform.x, transform.y).scale(k)
      }

      var translateX = (viewportWidth / 2) - (zoomAmount * coors[0])
      var translateY = (viewportHeight / 2) - (zoomAmount * coors[1])

      var zoomTransform = d3.zoomIdentity
          .translate(translateX, translateY)
          .scale(zoomAmount)

      container.transition()
          .duration(1000)
          .call(zoom.transform, zoomTransform)

      // var k0 = 0;
      // var t0 = d3.zoomTransform(container.node());
      // var p0 = coors;
      // var p1 = t0.invert(p0);
      // var k1 = zoomAmount;
      // var k1 = t0.k * zoomAmount;
      //
      // if(k1 > 1){
      //   k1 = 1;
      // }
      // if(k1 < .4){
      //   k1 = .4
      // }
      //
      // var scaled = scale(t0, k1);
      // var t1 = translate(scaled, p0, p1);
      //
      // container.transition()
      //     .duration(300)
      //     .call(zoom.transform, t1);

    }

    function initiateZoom(coors,zoomAmount){

      function translate(transform, p0, p1) {
        var x = p0[0] - p1[0] * transform.k, y = p0[1] - p1[1] * transform.k;
        return d3.zoomIdentity.translate(x, y).scale(transform.k)
        //return x === transform.x && y === transform.y ? transform : new Transform(transform.k, x, y);
      }
      function scale(transform, k) {
        k = Math.max(k0, Math.min(k1, k));
        return d3.zoomIdentity.translate(transform.x, transform.y).scale(k)
      }
      var k0 = 0;
      var t0 = d3.zoomTransform(container.node());
      var p0 = coors;
      var p1 = t0.invert(p0);
      var k1 = zoomAmount;
      var k1 = t0.k * zoomAmount;

      if(k1 > 1){
        k1 = 1;
      }
      if(k1 < .4){
        k1 = .4
      }

      var scaled = scale(t0, k1);
      var t1 = translate(scaled, p0, p1);

      container.transition()
          .duration(300)
          .call(zoom.transform, t1);

    }

    var vertexArray = [];

    var scaleFacter = 1;
    if(retina){
      scaleFacter = 2;
    }

    var facesTsne = zoomDiv
      .selectAll("div")
      .data(tsne_data)
      .enter()
      .append("div")
      .style("transform",function(d){
        if(wuTangIds.indexOf(+d.id) > -1){
          wuTangVertices.push([(xScale(+d.positionX)+spriteSheetLocations.get(+d.id).width/2/scaleFacter),(yScale(+d.positionY)+spriteSheetLocations.get(+d.id).height/2/scaleFacter)]);
        }
        else if(migosIds.indexOf(+d.id) > -1){
          migosVertices.push([(xScale(+d.positionX)+spriteSheetLocations.get(+d.id).width/2/scaleFacter),(yScale(+d.positionY)+spriteSheetLocations.get(+d.id).height/2/scaleFacter)]);
        }
        else if(nwaIds.indexOf(+d.id) > -1){
          nwaVertices.push([(xScale(+d.positionX)+spriteSheetLocations.get(+d.id).width/2/scaleFacter),(yScale(+d.positionY)+spriteSheetLocations.get(+d.id).height/2/scaleFacter)]);
        }
        vertexArray.push([d.id,(xScale(+d.positionX)+spriteSheetLocations.get(+d.id).width/2/scaleFacter),(yScale(+d.positionY)+spriteSheetLocations.get(+d.id).height/2/scaleFacter)])
        return "translate("+Math.round(xScale(d.positionX))+"px,"+Math.round(yScale(d.positionY))+"px)"
      })
      .attr("class","face-div")
      .style("width",function(d){
          return Math.floor(spriteSheetLocations.get(+d.id).width/scaleFacter)+"px"
      })
      .style("height",function(d){
        return Math.floor(spriteSheetLocations.get(+d.id).height/scaleFacter)+"px"
      })
      .style("background-position-x",function(d,i){
        return Math.floor(-spriteSheetLocations.get(+d.id).x/scaleFacter) + "px"
      })
      .style("background-position-y",function(d,i){
        return Math.floor(-spriteSheetLocations.get(+d.id).y/scaleFacter) + "px"
      })
      .on("mouseover",function(d){
        var mostSimilar = d.similarityRank;

        if(!grabbing){
          vertexArray.push([d.id,(xScale(+d.positionX)+spriteSheetLocations.get(+d.id).width/2/scaleFacter),(yScale(+d.positionY)+spriteSheetLocations.get(+d.id).height/2/scaleFacter)])

          var vertexes = [];
          vertexes.push(vertexMap.get(mostSimilar[0].artist_2_id));
          // vertexes.push(vertexMap.get(mostSimilar[1].artist_2_id));
          // vertexes.push(vertexMap.get(mostSimilar[2].artist_2_id));

          console.log(vertexes);

          tsneSimilarLines.selectAll("line").remove();

          var x1 = (xScale(+d.positionX)+spriteSheetLocations.get(+d.id).width/2/scaleFacter);
          var y1 = (yScale(+d.positionY)+spriteSheetLocations.get(+d.id).height/2/scaleFacter);

          tsneSimilarLines.selectAll("line").data(vertexes)
            .enter()
            .append("line")
            .attr("class","tsne-similar-line")
            .attr("x1",function(d){
              return x1
            })
            .attr("x2",function(d){
              return d[1]
            })
            .attr("y1",function(d){
              return y1
            })
            .attr("y2",function(d){
              return d[2]
            })
            ;
        }


        toolTip.style("display","block")
        var artist = d.artist;
        // toolTipName.html(artist);
        toolTipName.html(artist+"<span class='new-span new-span-label'>Most Similar:</span><span class='new-span new-span-one'>"+artistIDMap.get(mostSimilar[0].artist_2_id).artist+"</span>");
        // toolTipName.html(artist+"<span class='new-span new-span-label'>Most Similar:</span><span class='new-span new-span-one'>1. "+artistIDMap.get(mostSimilar[0].artist_2_id).artist+"</span><span class='new-span new-span-two'>2. "+artistIDMap.get(mostSimilar[1].artist_2_id).artist+"</span><span class='new-span new-span-three'>3. "+artistIDMap.get(mostSimilar[2].artist_2_id).artist+"</span>");
        var artistId = d.id;
        var x = d.positionX;
        var y = d.positionY;

        zoomDiv.classed("highlighting-face",true)

        d3.select(this)
          .classed("face-div-selected",true)
          .style("opacity",1)
          .transition()
          .duration(1000)
          .ease(d3.easeElastic)
          .style("transform",function(d){
            return "translate("+Math.round(xScale(d.positionX))+"px,"+Math.round(yScale(d.positionY))+"px) rotate(30deg)"
          })
          ;

        backgroundCicle
          .style("visibility","visible")
          .style("transform",function(d){
            return "translate("+(xScale(x)+spriteSheetLocations.get(+artistId).width/2/scaleFacter)+"px,"+(yScale(y)+spriteSheetLocations.get(+artistId).height/2/scaleFacter)+"px)"
          });

        // console.log(d);

      })
      .on("mouseout",function(d){

        zoomDiv.classed("highlighting-face",false);

        toolTip.style("display","none");
        backgroundCicle
          .style("visibility",null)

        d3.select(this)
          .classed("face-div-selected",false)
          .style("opacity",null)
          .transition()
          .duration(0)
          .style("transform",function(d){
            return "translate("+Math.round(xScale(d.positionX))+"px,"+Math.round(yScale(d.positionY))+"px) rotate(0deg)"
          })

      })
      .on("click",function(d){
        toolTip.style("display","none");
        var zoomTransform = d3.zoomIdentity
          .translate(-xScale(d.positionX)+viewportWidth/2,-yScale(d.positionY)+viewportHeight/2)
          .scale(1)

        container.transition()
          .duration(500)
          .call(zoom.transform, zoomTransform)


        // var coors = d3.mouse(this);
        // initiateZoom(coors);
      })

    var vertexMap = d3.map(vertexArray,function(d){return d[0]});

    var wuTangCluster = zoomDiv
      .append("svg")
      .attr("class","tsne-cluster")
      .append("g")
      .append("path")
      .style("stroke-linejoin", "round")
      .style("stroke-width", 40)
      .datum(d3.polygonHull(wuTangVertices))
      .attr("d",function(d){
        return "M" + d.join("L") + "Z";
      })
      ;


    var tsneSimilarLines = zoomDiv
      .append("svg")
      .attr("class","tsne-similar")
      .append("g")
      ;

    // facesTsne.append("span")
    //   .attr("class","face-div-circle")
    //   ;

    var backgroundCicle = zoomDiv
      .append("div")
      .attr("class","tsne-background-circle")
      ;

    var searchMarker = zoomDiv
      .append("div")
      .attr("class","tsne-search-tool-tip")
      ;

    var searchCircle = zoomDiv
      .append("div")
      .attr("class","tsne-search-circle")
      ;

    var toolTip = container
      .append("div")
      .attr("class","tsne-tool-tip-container")
      .append("div")
      .attr("class","tsne-tool-tip")
      ;

    var toolTipName = toolTip.append("p")
      .append("span")
      ;

    var pinChart = new ScrollMagic.Scene({
          triggerElement: ".tsne-chart-wrapper",
          triggerHook:0,
          offset: -30,
          duration:viewportHeight-100
        })
        .setPin(".tsne-zoom-buttons", {pushFollowers: false})
        .addTo(Controller)
        ;

    // initiateZoom([viewportWidth/2,viewportHeight/2-200],.4)

    zoomTo([750,450],.6);

    // var zoomTransformStart = d3.zoomIdentity
    //   .translate(viewportWidth/2,-height/2)
    //   .scale(.4)
    //
    // container.transition()
    //   .duration(0)
    //   .call(zoom.transform, zoomTransformStart)

    var tsneTriggerIntro = d3.select(".tsne-zoom-scene");
    var tsneTriggerEnd = d3.select(".last-slide");

    var setupTsneScene = new ScrollMagic.Scene({
        triggerElement: ".intro-section",
        triggerHook:0,
        offset: 0,
        duration:1000
      })
      // .addIndicators({name: "setup Tsne for later"}) // add indicators (requires plugin)
      .addTo(Controller)
      .on("enter",function(e){
        toolTip.style("display","none");

        if(e.target.controller().info("scrollDirection") == "REVERSE"){
        }
        else{
          container.classed("fixed-hidden",false);
          superParentContainer.classed("additional-fixed",false);
          // controlDiv.style("position","absolute");
        }
      })
      .on("leave",function(e){
        toolTip.style("display","none");

        if(e.target.controller().info("scrollDirection") == "REVERSE"){
          container.classed("fixed-hidden",true);
          superParentContainer.classed("additional-fixed",true);
        }
        else{
          facesTsne.classed("opacity-out",false);
          var zoomTransform = d3.zoomIdentity
            .translate(-378+viewportWidth/2,-148+viewportHeight/2)
            .scale(1)

          container.transition()
            .duration(500)
            .call(zoom.transform, zoomTransform)

        }
      })
      ;

    var tsneZoomScene = new ScrollMagic.Scene({
        triggerElement: tsneTriggerIntro.node(),
        triggerHook:.6,
        offset: 0,
        duration:Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
      })
      // .addIndicators({name: "tsne trigger"}) // add indicators (requires plugin)
      .addTo(Controller)
      .on("enter",function(e){
        toolTip.style("display","none");

        if(e.target.controller().info("scrollDirection") == "REVERSE"){
          facesTsne.classed("opacity-out", false);
          zoomTo([750,450],.6);
        }
        else{
          facesTsne
            .classed("opacity-out",function(d){
              if([423,57,328].indexOf(+d.id) > -1){
                return false;
              }
              return true;
            })

          var zoomTransform = d3.zoomIdentity
            .translate(-1038+viewportWidth/2,-431+viewportHeight/2)
            .scale(1)

          container.transition()
            .duration(1000)
            .call(zoom.transform, zoomTransform)
        }

      })
      .on("leave",function(e){
        toolTip.style("display","none");
        wuTangCluster.style("display",null);

        // zoomTo([750,750],.4);

        if(e.target.controller().info("scrollDirection") == "REVERSE"){
          facesTsne.classed("opacity-out", false);
          zoomTo([750,450],.6);

        }
        else{
          wuTangCluster.style("display","block");
          wuTangCluster
            .datum(d3.polygonHull(wuTangVertices))
            .transition()
            .duration(1000)
            .attr("d",function(d){
              return "M" + d.join("L") + "Z";
            })
            ;

          facesTsne
            .classed("opacity-out",function(d){
              if(wuTangIds.indexOf(+d.id) > -1){
                return false
              }
              return true;
            })

          var zoomTransform = d3.zoomIdentity
            .translate(-378+viewportWidth/2,-148+viewportHeight/2)
            .scale(1)

          container.transition()
            .duration(1000)
            .call(zoom.transform, zoomTransform)
        }




      })
      ;

    var tsneZoomSceneTwo = new ScrollMagic.Scene({
        triggerElement: tsneTriggerEnd.node(),
        triggerHook:.9,
        offset: 0,
        duration:Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
      })
      // .addIndicators({name: "tsne trigger end"}) // add indicators (requires plugin)
      .addTo(Controller)
      .on("enter",function(e){
        toolTip.style("display","none");
        wuTangCluster.style("display",null);
        facesTsne.classed("opacity-out", false);
        zoomTo([750,450],.6);
      })
      ;

    if(mobile || tablet){
      var exploreMode = false;
      d3.select(".mobile-pan").on("click",function(d){
        if(!exploreMode){
          modal.style("background","none").style("pointer-events","none").style("position","fixed").style("top","0px");
          modal.select(".mobile-pan").style("top","230px").text("go back").select("span").style("display","none");
          exploreMode = true;
        }
        else{
          modal.style("background",null).style("pointer-events",null).style("position",null).style("top",null);
          modal.select(".mobile-pan").style("top",null).html("Explore Map <span>touch to start</span>").select("span").style("display",null);
          exploreMode = false;
        }

      })
    }
  }

  function artistOverlap(){
    var container = d3.select(".artist-overlap")
    var colChartCols = container.append("div")
      .attr("class","artist-central-col-chart")
      .selectAll("div")
      .data(function(){
        return artistNest.filter(function(d){
          return d.key == 136 || d.key == 472 || d.key == 318 || d.key == 395;
        })
        .sort(function(a,b){
          if(a.key == 472){
            return -1;
          }
          else if(b.key == 472){
            return 1;
          }
          return a.key - b.key
        })
      })
      .enter()
      .append("div")
      .attr("class","artist-central-col-chart-col")
      ;

    colChartCols
      .append("div")
      .attr("class","artist-central-col-chart-col-artist-cont")
      .append("p")
      .text(function(d){
        var artist = artistIDMap.get(+d.key).artist;
        if(artist == "Kendrick Lamar"){
          return "Kendrick"
        }
        return artist;
      })
      .attr("class","artist-central-col-chart-col-artist")
      ;

    colChartCols
      .append("div")
      .attr("class","artist-central-col-chart-col-artist-words")
      .selectAll("p")
      .data(function(d){
        return d.values.slice(0,10);
      })
      .enter()
      .append("p")
      .attr("class",function(d){
        if(d.Word == "compton"){
          return "artist-central-col-chart-col-artist-word artist-central-col-highlighted"
        }
        return "artist-central-col-chart-col-artist-word";
      })
      .html(function(d,i){
        return "<span>"+(i+1)+". </span>"+d.Word;
      })
      ;

    colChartCols
      .filter(function(d,i){
        return i==0 || i== 4;
      })
      .append("p")
      .attr("class","column-annotation")
      .text(function(d,i){
        if(i==0){
          return "Shared Words mean we can connection everyone..."
        }
        return "...or find out what makes certain musicians completely unique"
      })
  }

  scatterChart();
  // mostCentral();
  artistExplain();
  artistCentricity();
  tsneDraw();
  artistOverlap();

  window.addEventListener('click', function(e){
    if (containerSearchResults.node().contains(e.target)){
      // Clicked in box
    } else{
      containerSearchResults.style("display",null);
    }
    if (artistCentralSearchResults.node().contains(e.target)){
      // Clicked in box
    } else{
      artistCentralSearchResults.style("display",null);
    }
    if (tnseSearchResults.node().contains(e.target)){
      // Clicked in box
    } else{
      tnseSearchResults.style("display",null);
    }


  });

  d3.select(".skrrt").on("click",function(d){
    var audio = new Audio('audio/skrrt.wav');
    audio.play();
  })
}
