// select the element, append the svg, and
// initialize the height and width of our graph
var svg = d3.select('body').append('svg')
    .attr('width', window.innerWidth)
    .attr('height', window.innerHeight);

// declare a quantitative linear scale
// used to calculate the fill color
var color = d3.scaleLinear()
    .domain([1, 38421464])
    .range(["aliceblue", "steelblue"]);

// declare a new geographic path generator
var path = d3.geoPath();

// read the data one by one, can invoke callback
// after all required data are ready to use
d3.queue()
    .defer(d3.json,"./data/us-10m.v1.json")
    .defer(d3.tsv, "./data/us-state-names.tsv")
    .defer(d3.csv, "./data/acs2015_census_tract_data.csv")
    .await(ready);

// called after all data are ready
function ready(error, us, tsv, csv) {
    // error handling
    if (error) throw error

    // create a new map
    var id_to_state = d3.map();

    // go thorough each element and set
    // the value (name of the state)
    // for the key (id of that state)
    tsv.forEach((d) => {
        id_to_state.set(d.id, d.name);
    });

    // create two objects to hold information
    var state_population = {};

    // go through each state
    csv.forEach((d) => {
        // create a new key if such a key does not exist
        if (!state_population[d.State])
            state_population[d.State] = 0;
        
        // increase the value (population of that state)
        state_population[d.State] += +d.TotalPop;
    });

    // append a group for our visualization
    svg.append("g")
        // set the class to be states
        // so we can stylizes it using CSS
        .attr("class", "states")
        // select all path
        .selectAll("path")
        // bind the data to them
        .data(topojson.feature(us, us.objects.states).features)
        // enter the selection
        .enter()
        // append path for each
        .append("path")
        // path descriptions
        .attr("d", path)
        // set the fill color based on population
        .style("fill", (d) => {
            // get the population using the id of that state
            var pop = state_population[id_to_state.get(d.id)];
            // calculate the color and return
            return color(pop);
        });

    // generate state borders
    svg.append("path")
        .attr("class", "state-borders")
        .attr("d", path(topojson.mesh(us, us.objects.states, function (a, b) {
            return a !== b;
        })));
}
