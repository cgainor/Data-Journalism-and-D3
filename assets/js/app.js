// The code for the chart is wrapped inside a function that automatically resizes the chart
function makeResponsive() {

    // if the SVG area isn't empty when the browser loads, remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");

    // clear svg if not empty
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // SVG wrapper dimensions are determined by the current width and height of the browser window.
    var svgWidth = window.innerWidth * (2/3);
    var svgHeight = window.innerHeight * (3/4);

    var margin = {
        top: 50,
        bottom: 50,
        right: 50,
        left: 50
    };

    var height = svgHeight - margin.top - margin.bottom;
    var width = svgWidth - margin.left - margin.right;

    // Append SVG element
    var svg = d3
        .select(".chart")
        .append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth);

    // Append group element
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Read CSV
    d3.csv("assets/data/data.csv")
        .then(function (healthData) {

            // parse data
            healthData.forEach(function (data) {
                data.poverty = +data.poverty;
                data.povertyMoe = +data.povertyMoe;
                data.age = +data.age;
                data.ageMoe = +data.ageMoe;
                data.income = +data.income;
                data.incomeMoe = +data.incomeMoe;
                data.healthcare = +data.healthcare;
                data.healthcareLow = +data.healthcareLow;
                data.healthcareHigh = +data.healthcareHigh;
                data.obesity = +data.obesity;
                data.obesityLow = +data.obesityLow;
                data.obesityHigh = +data.obesityHigh;
                data.smokes = +data.smokes;
                data.smokesLow = +data.smokesLow;
                data.smokesHigh = +data.smokesHigh;
            });

            // create scales
            var xLinearScale = d3.scaleLinear()
                .domain([d3.min(healthData, d => d.poverty) * .9, d3.max(healthData, d => d.poverty) * 1.1])
                .range([0, width]);

            var yLinearScale = d3.scaleLinear()
                .domain([0, d3.max(healthData, d => d.healthcare)])
                .range([height, 0]);

            // create axes
            var xAxis = d3.axisBottom(xLinearScale);
            var yAxis = d3.axisLeft(yLinearScale);

            // append axes
            chartGroup.append("g")
                .attr("transform", `translate(0, ${height})`)
                .call(xAxis);

            chartGroup.append("g")
                .call(yAxis);

            var xLabelsGroup = chartGroup.append('g')
                .attr('transform', `translate(${width / 2}, ${height + 20})`)
                .append('text')
                .attr('x', 0)
                .attr('y', 20)
                .attr('value', 'poverty')
                .classed('aText active', true)
                .text('In Poverty (%)');

            var yLabelsGroup = chartGroup.append('g')
                .attr("transform", `translate(-30,${height / 2})rotate(-90)`)
                .append('text')
                .attr('value', 'healthcare')
                .classed('aText active', true)
                .text('Access to Healthcare (%)');

            // append circles
            var circlesGroup = chartGroup.selectAll("circle")
                .data(healthData)
                .enter()
                .append("circle")
                .attr("cx", d => xLinearScale(d.poverty))
                .attr("cy", d => yLinearScale(d.healthcare))
                .attr("r", "10")
                .attr("fill", "#88C1D3");

            // add state abbreviations to circles
            var stateText = chartGroup.append('g').selectAll('text')
                .data(healthData)
                .enter()
                .append('text')
                .classed('stateText', true)
                .attr('x', d => xLinearScale(d['poverty']))
                .attr('y', d => yLinearScale(d['healthcare']))
                .attr('transform', 'translate(0,4.5)')
                .text(d => d.abbr)

            // Step 1: Initialize Tooltip
            var toolTip = d3.tip()
                .attr("class", "d3-tip")
                .offset([80, -60])
                .html(function (d) {
                    return (`<strong>${d.state}<strong><br>Poverty: ${d.poverty}%<br>Healthcare: ${d.healthcare}%`);
                });

            // Step 2: Create the tooltip in chartGroup.
            chartGroup.call(toolTip);

            // Step 3: Create "mouseover"/"mouseout" event listeners to display/hide tooltip
            circlesGroup.on("mouseover", toolTip.show).on("mouseout", toolTip.hide);

            stateText.call(toolTip);
            stateText.on('mouseover', toolTip.show).on('mouseout', toolTip.hide);
        });
}
// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);
