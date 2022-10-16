




let time = 0;
let SEASONS = {
    SUMMER : {
        id: 0,
        layer: './data/trees/summer_trees.png',
        oceanColour: [109, 213, 248],
        oceanStroke: [10, 148, 194],
        roadColour: [225, 207, 77]
    },
    AUTUMN : {
        id: 1,
        layer: './data/trees/autumn_trees.png',
        oceanColour: [170, 211, 223],
        oceanStroke: [102, 176, 198],
        roadColour: [225, 203, 122]
    },
    WINTER : {
        id: 2,
        layer: './data/trees/winter_trees.png',
        oceanColour: [140, 179, 217],
        oceanStroke: [102, 153, 204],
        roadColour: [250, 252, 255]
    },
    SPRING : {
        id: 3,
        layer: './data/trees/spring_trees.png',
        oceanColour: [170, 211, 223],
        oceanStroke: [102, 176, 198],
        roadColour: [236, 230, 95]
    }
}
let roadsOutput = [];
let refedex = [];
let rawRoadsJSON, ogRoadsGeoJSON, oceanGeoJSON;

window.preload = function() {
    ogRoadsGeoJSON = loadJSON("./data/roads_all_min.json");
    rawRoadsJSON = loadJSON("./data/roads_filtered_2.json");
    oceanGeoJSON = loadJSON("./data/ocean_min.json");

    SEASONS.SUMMER.layer = loadImage(SEASONS.SUMMER.layer);
    SEASONS.AUTUMN.layer = loadImage(SEASONS.AUTUMN.layer);
    SEASONS.WINTER.layer = loadImage(SEASONS.WINTER.layer);
    SEASONS.SPRING.layer = loadImage(SEASONS.SPRING.layer);
}


window.setup = function() {
    // canvas takes up the window
    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.style('display', 'block');

    for (let i in rawRoadsJSON) {
        refedex.push(rawRoadsJSON[i]);
    }

    console.log(width, height);

    // Set the background to whatever
    // background(242, 239, 233);
    
    // saveRoads(ogRoadsGeoJSON);

    frameRate(30);
    angleMode(RADIANS);
}

window.draw = function() {
    // Reset the canvas
    // resizeCanvas(windowWidth, windowHeight);
    // background(242, 239, 233);
    background(0);

    let season = SEASONS.SPRING;

    drawTrees(season);
    drawRoads(season);
    drawOcean(oceanGeoJSON, season);
    
    // stroke(0);
    // strokeWeight(2);
    // adjust = hslider(adjust, 20, 70, 200, 0, 255);
    // uiupd();
}



function saveRoads(boundary) {
    let geom;
    let coords;
    let features = boundary.features;

    for (let i = 0; i < features.length; i++) {
        geom = features[i].geometry;
        if (geom) {
            coords = geom.coordinates;
            if (coords) {

                if (!(features[i].properties.junction)) {
                    if (!(features[i].properties.highway == "tertiary")) {
                        roadsOutput.push({
                            type: features[i].properties.highway,
                            nodes: []
                        });
    
                        let pX = map(coords[0][0], 144.1498, 145.7123, 0, width);
                        let pY = map(coords[0][1], -37.4418, -38.2646, 0, height);
                        roadsOutput[roadsOutput.length - 1].nodes.push([pX, pY]);

                        for (let j = 1; j < coords.length; j++) {
                            let x = map(coords[j][0], 144.1498, 145.7123, 0, width);
                            let y = map(coords[j][1], -37.4418, -38.2646, 0, height);

                            if (dist(pX, pY, x, y) > ((j == (coords.length - 1)) ? 1 : 5)) {
                                roadsOutput[roadsOutput.length - 1].nodes.push([x, y]);
    
                                pX = x;
                                pY = y;
                            }
                        }
    
                        if (roadsOutput[roadsOutput.length - 1].nodes.length < 2) {
                            roadsOutput.pop();
                        }
                    }
                }
            }
        }
    }

    save(roadsOutput, 'roads_filtered_2', 'json');
}

function drawRoads(season) {
    let rStroke = season.roadColour;

    strokeJoin(ROUND);
    for (let i = 0; i < refedex.length; i++) {
        const road = refedex[i];

        switch (road.type) {
            case ("motorway"):
                strokeWeight(3);
                break;
            case ("trunk"):
                strokeWeight(1.7);
                break;
            case ("primary"):
                strokeWeight(1);
                break;
            case ("secondary"):
                strokeWeight(0.8);
                break;
            case ("tertiary"):
                strokeWeight(0.4);
                break;
            default:
                break;
        }

        let pX = map(road.nodes[0][0], 0, 1605, 0, width);
        let pY = map(road.nodes[0][1], 0, 787, 0, height);

        for (let j = 1; j < road.nodes.length; j++) {
            let x = map(road.nodes[j][0], 0, 1604, 0, width);
            let y = map(road.nodes[j][1], 0, 787, 0, height);

            stroke(rStroke[0] + Math.floor(((x + y) % 4)*12), rStroke[1], rStroke[2], 100);
            line(pX, pY, x, y);

            pX = x;
            pY = y;
        }
    }
}

function drawOcean(boundary, season) {
    let geom;
    let polygons;
    let coords;
    let features = boundary.features;

    strokeWeight(2);
    let oStroke = season.oceanStroke;
    stroke(oStroke[0], oStroke[1], oStroke[2], 255 * 0.6);

    let oFill = season.oceanColour;
    fill(oFill[0], oFill[1], oFill[2], 255 * 0.35);
    
    for (let i = 0; i < features.length; i++) {
        geom = features[i].geometry;
        if (geom) {
            polygons = geom.coordinates;
            if (polygons) {
                coords = polygons[0];
                if (coords) {
                    beginShape();
                    for (let j = 0; j < coords.length; j++) {
                        let lon = coords[j][0];
                        let lat = coords[j][1];
                        let x = map(lon, 144.1498, 145.7123, 0, width);
                        let y = map(lat, -37.4418, -38.2646, 0, height);
                        vertex(x,y);
                    }
                    endShape(CLOSE);
                }
            }
        }
    }
}

function drawTrees(season) {
    image(season.layer, 0, 0, width, height);
    // filter(BLUR, 0.1);
}

function _drawTrees(boundary) {
    let geom;
    let polygons;
    let coords;
    let features = boundary.features;

    for (let i = 0; i < features.length; i++) {
        geom = features[i].geometry;
        if (geom) {
            polygons = geom.coordinates;
            if (polygons) {
                coords = polygons[0];
                if (coords) {
                    beginShape();
                    for (let j = 0; j < coords.length; j++) {
                        let lon = coords[j][0];
                        let lat = coords[j][1];

                        // let vert = (5846764 - lat)/(5846764 - 5764045);
                        // let x = map(lon, 249613, 378905, 0, width);
                        // let y = map(lat, 5846764, 5764045, 0, height);

                        switch (features[i].properties.TREE_DEN) {
                            case ("sparse"):
                                strokeWeight(0.2);
                                stroke(220, 253, 180);
                                fill(220, 253, 180);
                                break;
                            case ("medium"):
                                strokeWeight(0.4);
                                stroke(157, 217, 38);
                                fill(157, 217, 38);
                                break;
                            case ("dense"):
                                strokeWeight(0.6);
                                stroke(67, 134, 45);
                                fill(67, 134, 45);
                                break;
                            default:
                                break;
                        }

                        let rotated = rotator(lon, lat, { y: 5805404, x: 314259 });
                        let x = map(rotated.x, 249613, 378905 + 7500, 0, width);
                        let y = map(rotated.y, 5846764 + 6500, 5764045 - 1000, 0, height);
                        vertex(x,y);
                    }
                    endShape(CLOSE);
                }
            }
        }
    }
}

function rotator(x, y, origin) {
    let xAxis = {};
    let yAxis = {};
    let rotation = -0.0274889357;
    // let rotation = Math.PI / 2;
    let rotated = {};

    x = x - origin.x;
    y = y - origin.y;

    xAxis.x = cos(rotation);
    xAxis.y = sin(rotation);
    yAxis.x = -xAxis.y;
    yAxis.y = xAxis.x;

    rotated.x = x * xAxis.x + y * yAxis.x + origin.x;
    rotated.y = x * xAxis.y + y * yAxis.y + origin.y;

    return rotated;
}






