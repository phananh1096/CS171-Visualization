// bubble chart object for creation of bubble charts

/*
 * BubbleChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the bar charts
 * @param _data						-- the dataset 'household characteristics'
 * @param _config					-- variable from the dataset (e.g. 'electricity') and title for each bar chart
 */

BubbleChart = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = _data;

    this.initVis();
}

/*
 * Initialize visualization (static content; e.g. SVG area, axes)
 */

BubbleChart.prototype.initVis = function() {
    var vis = this;
    vis.width = 250;
    vis.height=250;
    vis.filterYear = "2001";

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width)
        .attr("height", vis.height )
        .attr("class", "bubble");

    /*** CREATE SCALES */
    vis.colorCircles = d3.scaleOrdinal(d3.schemeBlues[9]);

    vis.scaleRadius = d3.scaleLinear()
        .range([10,50]);

    vis.scaleRect = d3.scaleLinear()
        .range([5,20]);

    d3.select("#bubble-year").on("change", function(d){

        var selectedOption = d3.select(this).property("value");

        vis.filterYear = selectedOption;

        vis.wrangleData();
    });
    
    vis.wrangleData();
}

BubbleChart.prototype.wrangleData = function(){
    var vis = this;

    // filterYear = d3.select("#year").property("value");
    // console.log(filterYear);
    var tempArray = [];

    vis.data.forEach(function(d) {
        var temp = {Name: d.Country_Name,
        Value: parseInt(d[vis.filterYear]) };
        tempArray.push(temp)
    })

    tempArray.sort(function(a,b) {return b.Value - a.Value})

    vis.displayData = tempArray;
    vis.updateVis();

}


// bubble chart reference: https://www.freecodecamp.org/news/a-gentle-introduction-to-d3-how-to-build-a-reusable-bubble-chart-9106dc4f6c46/

BubbleChart.prototype.updateVis = function() {
    var vis = this;
    console.log(vis.displayData);
    //console.log(vis.displayData.length)

    vis.scaleRadius.domain([
            d3.min(vis.displayData, function(d) { return +d.Value; }),
            d3.max(vis.displayData, function(d) { return +d.Value; })]);

    vis.scaleRect.domain([
            d3.min(vis.displayData, function(d) { return +d.Value; }),
            d3.max(vis.displayData, function(d) { return +d.Value; })]);



    var simulation = d3.forceSimulation(vis.displayData)
        .force("charge", d3.forceManyBody().strength([-35]))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .on("tick", ticked);

    function ticked(e) {
        node.attr("transform",function(d) {
            return "translate(" + [d.x+(vis.width / 2), d.y+((vis.height) / 2)] +")";
        });
    }

    var node = vis.svg.selectAll(".bubbles")
        .data(vis.displayData)
        .enter()
        .append("g")
        .attr("x", function(d){return d.x})
        .attr("y", function(d){return d.y})
        .attr('transform', 'translate(' + [vis.width / 2, vis.height / 2] + ')');

    circle = node.append("circle")
        .attr('r', function(d) {
            return vis.scaleRadius(d.Value)})
        .style("fill", function(d) { return vis.colorCircles(d.Name)})
        .attr("class", "bubbles" );

/*
    node.append("rect")
        .attr("x", 2)
        .attr("y", function(d) { return (scaleRadius(d.Value) - (scaleRadius(d.Value)* 2 )) + 8; })
        .attr("height", function(d) { return scaleRect(d.Value); })
        .attr("width", function(d) { return scaleRect(d.Value); })
        .attr("stroke", "#dddfe2")
        .attr("fill", function(d, i) { return colorCircles(i--) })
        .attr("transform", "rotate(15)");
*/
        node.append("path")
            .attr("y", function(d) { return (vis.scaleRadius(d.Value) - (vis.scaleRadius(d.Value)* 2 )) + 8; })
            .attr("d", function (d){
                //var x = scaleRadius(d.Value) ;
                var x = (vis.scaleRadius(d.Value) - (vis.scaleRadius(d.Value)* 2 )) + vis.scaleRect(d.Value);
                var y = (vis.scaleRadius(d.Value) - (vis.scaleRadius(d.Value)* 2 )) + vis.scaleRect(d.Value);
                var w = vis.scaleRect(d.Value);
                return "M 0 " + x  +
                    " l " + w + " 0" +
                    " l 4 4" +
                    " l 0 8 z"
            })
            .attr("fill", function(d, i) { return vis.colorCircles(i--)})

    node.append("text")
        .attr("dy", ".2em")
        .style("text-anchor", "middle")
        .text(function(d) { return d.Name})
        .attr("class", "bubble_text");


}

