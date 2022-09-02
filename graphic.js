let addr = "http://127.0.0.1:1880/realizattakt";
// let addr = "https://node.formens.ro/realizattakt";
let numarTotal = 0;
let MINUTES_TO_UPDATE = 10;
/*
- de adaugat la chart ID, sa creeze cate un div pentru fiecare.
- rezolvare problema cu afisarea datelor. (fara functie)


*/
function GetRequestParam(param) {
    var res = null;
    try {
        var qs = decodeURIComponent(window.location.search.substring(1)); //get everything after then '?' in URI
        var ar = qs.split('&');
        $.each(ar, function (a, b) {
            var kv = b.split('=');
            if (param === kv[0]) {
                res = kv[1];
                return false; //break loop
            }
        });
    } catch (e) { }
    return res;
}

getDataNode();
function getDataNode() {
    let locatedId = GetRequestParam("loc");
    ExtractDacaFromNodeRed(locatedId);

    function ExtractDacaFromNodeRed() {
        let loc = GetRequestParam("loc");
        $.ajax ({
            url: addr + '?loc='+loc,
            type: 'GET', 
            success: function( data ){
                // console.log('deceee');
                for(let i = 0; i < Object.entries(data.checkpoints).length; i++) {
                    const TIME_WORK = 8,
                    SET_FIRSTHOUR = 6,
                    debug_status = false,
                    MAX_INT_TIME = 30,
                    OUT_DATE = 15;
                let checkIfAreThere = 0,
                    startMinut = 0,
                    getTargetNumber,
                    targetEveryNum = [],
                    theHoursGet = 10,
                    finishTime = 0,
                    categoriesChart = new Array(), // legend - time in half hour: 6:00, 6:30, 7:30 ... 16:30 without brakes - 30 minutes.
                    dataChart = [ ], // start with 0 minutes.
                    remChart = new Array(); // black line
            
                getTargetNumber = Number(data.target);
            
                function hoursCalculated(chartTime, start) {
                    let lucrate = (timestringtoDate(chartTime) - timestringtoDate(start)) / 1000;
                    if (lucrate > 30600) lucrate = 28800; // time for 8.5 hours worked.
                    else if (lucrate > 23400) lucrate = lucrate - 1800;
                    else if (lucrate > 22800) lucrate = 21600;
                    else if (lucrate > 12000) lucrate = lucrate - 1200;
                    else if (lucrate > 10800) lucrate = 10800;
                    return lucrate
                }
            
                for (let g = 0; g < getTimesArray(6, OUT_DATE, 30).length; g++) {
                    let chartTime = getTimesArray(6, OUT_DATE, 30)[g];
                    const result = new Date(Math.floor(hmsToSecondsOnly(getTimesArray(6, OUT_DATE, 30)[g])) * 1000).toISOString().slice(11, 19);
                    categoriesChart.push(result);
            
                    let d1 = new Date();
                    let start = getTimesArray(6, OUT_DATE, 30)[0]
                    let d2 = new Date();
                    let now = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), d2.getHours(), d2.getMinutes(), d2.getSeconds());
                    let timenow = chartTime.substring(0, 8); // ultima actualizare la // scot data
            
                    timenow = timenow.substring(0, 5);  // scot secundele
                    let getTime = timenow;
                    if (debug_status) console.log("debug: getTimeWorked: " + getTime);
                    if (debug_status) console.log("debug: now time: " + now);
                    if (debug_status) console.log("debug: start time: " + start);
            
                    let lucrate = hoursCalculated(chartTime, start);
                    const minlucrate = lucrate / 60;
                    const target = getTargetNumber;
            
                    let targetnow = ((target / 480) * minlucrate);
            
                    if (now >= timestringtoDate(chartTime))
                        dataChart.push(Math.round(targetnow));
            
                    if (finishTime >= 360) categoriesChart.pop();
                    if (finishTime >= 360) dataChart.pop();
                }
            
                /* Update de Y Axis (How blue line are calc from getTimeRemain)  */
                for (let d = 0; d < dataChart.length; d++) { checkIfAreThere = d; }
                if (theHoursGet > 0) theHoursGet += (checkIfAreThere * MAX_INT_TIME);
                
                // for (let j = 0; j <= dataChart.length - 1; j++) remChart.push(data.checkpoints[i]); // add black line from node.
                
                if (debug_status) console.log("debug: dataChart: " + dataChart.length);
                if (debug_status) console.log("debug: checkIfAreThere: " + checkIfAreThere);
            
                var options = {
                    series: [{
                        name: "Target",
                        data: dataChart,
                    }, {
                        name: "Rem",
                        data: remChart,
                    }],
                    chart: {
                        height: 350,
                        type: 'line',
                        dropShadow: {
                            enabled: true,
                            color: '#000',
                            top: 18,
                            left: 7,
                            blur: 10,
                            opacity: 0.2
                        },
                        toolbar: {
                            show: false
                        }
                    },
                    colors: ['#fa6934', '#545454'],
                    dataLabels: {
                        enabled: true,
                    },
                    stroke: {
                        curve: 'smooth'
                    },
                    title: {
                        text: `${Object.keys(data.checkpoints[i])}` + ` - last update (${checkUpdate()})`,
                        align: 'center'
                    },
                    grid: {
                        borderColor: '#e7e7e7',
                        row: {
                            colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                            opacity: 0.5
                        },
                    },
                    markers: {
                        size: 1
                    },
                    xaxis: {
                        categories: categoriesChart, // time
                        title: {
                            text: 'Time X-Axis (6:00 - 14:30)'
                        }
                    },
                    yaxis: {
                        title: {
                            text: 'Time'
                        },
                        min: 0,
                        max: theHoursGet  // set averange
                    },
                    legend: {
                        position: 'top',
                        horizontalAlign: 'right',
                        floating: true,
                        offsetY: -25,
                        offsetX: -5
                    }
                };
                    var dived = document.createElement('div');
                    document.body.appendChild(dived);
                    dived.id = "div_"+i;
                    let chart = new ApexCharts(document.querySelector('#chart'), options);
                    chart.render(); 
                }   
            }
        });
    }
}
// console.log(numarTotal)
// function getDataFromNodeRed(data, target) {

//     const TIME_WORK = 8,
//         SET_FIRSTHOUR = 6,
//         debug_status = false,
//         MAX_INT_TIME = 30,
//         OUT_DATE = 15;
//     let checkIfAreThere = 0,
//         startMinut = 0,
//         getTargetNumber,
//         targetEveryNum = [],
//         theHoursGet = 10,
//         finishTime = 0,
//         categoriesChart = new Array(), // legend - time in half hour: 6:00, 6:30, 7:30 ... 16:30 without brakes - 30 minutes.
//         dataChart = [ ], // start with 0 minutes.
//         remChart = new Array(); // black line

//     getTargetNumber = Number(target);

//     function hoursCalculated(chartTime, start) {
//         let lucrate = (timestringtoDate(chartTime) - timestringtoDate(start)) / 1000;
//         if (lucrate > 30600) lucrate = 28800; // time for 8.5 hours worked.
//         else if (lucrate > 23400) lucrate = lucrate - 1800;
//         else if (lucrate > 22800) lucrate = 21600;
//         else if (lucrate > 12000) lucrate = lucrate - 1200;
//         else if (lucrate > 10800) lucrate = 10800;
//         return lucrate
//     }

//     for (let i = 0; i < getTimesArray(6, OUT_DATE, 30).length; i++) {
//         let chartTime = getTimesArray(6, OUT_DATE, 30)[i];
//         const result = new Date(Math.floor(hmsToSecondsOnly(getTimesArray(6, OUT_DATE, 30)[i])) * 1000).toISOString().slice(11, 19);
//         categoriesChart.push(result);

//         let d1 = new Date();
//         let start = getTimesArray(6, OUT_DATE, 30)[0]
//         let d2 = new Date();
//         let now = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), d2.getHours(), d2.getMinutes(), d2.getSeconds());
//         let timenow = chartTime.substring(0, 8); // ultima actualizare la // scot data

//         timenow = timenow.substring(0, 5);  // scot secundele
//         let getTime = timenow;
//         if (debug_status) console.log("debug: getTimeWorked: " + getTime);
//         if (debug_status) console.log("debug: now time: " + now);
//         if (debug_status) console.log("debug: start time: " + start);

//         let lucrate = hoursCalculated(chartTime, start);
//         const minlucrate = lucrate / 60;
//         const target = getTargetNumber;

//         let targetnow = ((target / 480) * minlucrate);

//         if (now >= timestringtoDate(chartTime))
//             dataChart.push(Math.round(targetnow));

//         if (finishTime >= 360) categoriesChart.pop();
//         if (finishTime >= 360) dataChart.pop();
//     }

//     /* Update de Y Axis (How blue line are calc from getTimeRemain)  */
//     for (let i = 0; i < dataChart.length; i++) { checkIfAreThere = i; }
//     if (theHoursGet > 0) theHoursGet += (checkIfAreThere * MAX_INT_TIME);
    
//     //for (let j = 0; j <= dataChart.length - 1; j++) remChart.push(data.checkpoints[c]); // add black line from node.
    
//     if (debug_status) console.log("debug: dataChart: " + dataChart.length);
//     if (debug_status) console.log("debug: checkIfAreThere: " + checkIfAreThere);

//     var options = {
//         series: [{
//             name: "Target",
//             data: dataChart,
//         }, {
//             name: "Rem",
//             data: remChart,
//         }],
//         chart: {
//             height: 350,
//             type: 'line',
//             dropShadow: {
//                 enabled: true,
//                 color: '#000',
//                 top: 18,
//                 left: 7,
//                 blur: 10,
//                 opacity: 0.2
//             },
//             toolbar: {
//                 show: false
//             }
//         },
//         colors: ['#fa6934', '#545454'],
//         dataLabels: {
//             enabled: true,
//         },
//         stroke: {
//             curve: 'smooth'
//         },
//         title: {
//             text: `${Object.keys(data)}` + ` - last update (${checkUpdate()})`,
//             align: 'center'
//         },
//         grid: {
//             borderColor: '#e7e7e7',
//             row: {
//                 colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
//                 opacity: 0.5
//             },
//         },
//         markers: {
//             size: 1
//         },
//         xaxis: {
//             categories: categoriesChart, // time
//             title: {
//                 text: 'Time X-Axis (6:00 - 14:30)'
//             }
//         },
//         yaxis: {
//             title: {
//                 text: 'Time'
//             },
//             min: 0,
//             max: theHoursGet  // set averange
//         },
//         legend: {
//             position: 'top',
//             horizontalAlign: 'right',
//             floating: true,
//             offsetY: -25,
//             offsetX: -5
//         }
//     };
//     let chart = new ApexCharts(document.querySelector("#chart"), options);
//     chart.render();  
// }

function timestringtoDate(timestring) {
    let d = new Date(); // Creates a Date Object using the clients current time

    let [hours, minutes, seconds] = timestring.split(':');

    d.setHours(+hours); // Set the hours, using implicit type coercion
    d.setMinutes(minutes); // can pass Number or String - doesn't really matter
    d.setSeconds(seconds);
    return d;
}


function checkUpdate() {
    let whenIs = new Date(),
        time;
    let h = whenIs.getHours(),
        m = whenIs.getMinutes(),
        s = whenIs.getSeconds();
    if(h < 10) {
        time = "0" + h + ":" +m+ ":" +s;
    } 
    else if(h > 10 && m < 10) {
        time = h + ":" +"0"+ +m+ ":" +s;
    }
    else if(h > 10 && m > 10 && s < 10) {
        time = h + ":" +m+ ":" +"0"+ +s;
    }
    else {
        time = h + ":" +m+ ":" +s;
    }
    return time;
}

function getTimesArray(start, end, length) {
    let startMin = start * 60
    let endMin = end * 60
    let times = []

    while (startMin <= endMin) {
        let mins = startMin % 60
        let hours = Math.floor(startMin / 60)
        let sec = 0;
        let timeString = hours.toString() + ":" + mins.toString().padStart(2, '0') + ":" + sec.toString().padStart(2, '0')
        times.push(timeString)
        startMin += length
    }
    return times
};


/* Return hours, minutes or seconds in only seconds. */
function hmsToSecondsOnly(strComm) {
    var p = strComm.split(':'),
        s = 0, m = 1;

    while (p.length > 0) {
        s += m * parseInt(p.pop(), 10);
        m *= 60;
    }

    return s;
};

/*

[
    {
        "id": "ee1cad6ca55907c8",
        "type": "http in",
        "z": "2375f1fd09d5550f",
        "name": "",
        "url": "/realizattakt",
        "method": "get",
        "upload": false,
        "swaggerDoc": "",
        "x": 220,
        "y": 160,
        "wires": [
            [
                "b5b7022d53055b3c",
                "0ecd5c1af432f020"
            ]
        ]
    },
    {
        "id": "b5b7022d53055b3c",
        "type": "function",
        "z": "2375f1fd09d5550f",
        "name": "function 8",
        "func": "msg.payload = {}\nif (msg.payload.loc === 'p1')\n{\n  msg.payload.target = 360;\n  msg.payload.checkpoints = [\n      {'pensa':[12,13,11,46,30,50,50,50,50,50,50,50,50,50,50,50,50, 70]},\n      { 'buzunar': [20, 15, 16, 48, 60, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50] },\n    //  { 'teslu': [0, 0, 0, 48, 60, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50] },\n  ];\n} else\n{\n  msg.payload.target = 300;\n  msg.payload.checkpoints = [\n    { 'altloc': [12, 13, 11, 46, 30, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 70] },\n    { 'altloc2': [20, 15, 16, 48, 60, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50] },\n    //  { 'teslu': [0, 0, 0, 48, 60, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50] },\n  ];\n}\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 540,
        "y": 160,
        "wires": [
            [
                "9308144f8ce79ebc",
                "21464575a32d05a6"
            ]
        ]
    },
    {
        "id": "9308144f8ce79ebc",
        "type": "http response",
        "z": "2375f1fd09d5550f",
        "name": "",
        "statusCode": "",
        "headers": {},
        "x": 830,
        "y": 160,
        "wires": []
    },
    {
        "id": "0ecd5c1af432f020",
        "type": "debug",
        "z": "2375f1fd09d5550f",
        "name": "debug 1",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "false",
        "statusVal": "",
        "statusType": "auto",
        "x": 540,
        "y": 60,
        "wires": []
    },
    {
        "id": "21464575a32d05a6",
        "type": "debug",
        "z": "2375f1fd09d5550f",
        "name": "debug 2",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "false",
        "statusVal": "",
        "statusType": "auto",
        "x": 860,
        "y": 80,
        "wires": []
    },
    {
        "id": "ac51cb9d0079beeb",
        "type": "function",
        "z": "2375f1fd09d5550f",
        "name": "function 9",
        "func": "msg.payload = {}\nif (msg.payload.loc === 'p1')\n{\n  msg.payload.target = 360;\n  msg.payload.checkpoints = [\n      {'pensa':[12,13,11,46,30,50,50,50,50,50,50,50,50,50,50,50,50, 70]},\n      { 'buzunar': [20, 15, 16, 48, 60, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50] },\n    //  { 'teslu': [0, 0, 0, 48, 60, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50] },\n  ];\n} else\n{\n  msg.payload.target = 300;\n  msg.payload.checkpoints = [\n    { 'altloc': [12, 13, 11, 46, 30, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 70] },\n    { 'altloc2': [20, 15, 16, 48, 60, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50] },\n    //  { 'teslu': [0, 0, 0, 48, 60, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50] },\n  ];\n}\n// msg.tmp = []\n// for(let i = 0; i < msg.payload.checkpoints.length; i++){\n//   var tmp = Object.entries(msg.payload.checkpoints[i])\n//   for(let j = 0; j < tmp.length; j++)\n// {\n//   console.log(tmp)\n//   msg.tmp.push(tmp)\n// }\n// }\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 620,
        "y": 320,
        "wires": [
            [
                "bbb6ea3569aad89a"
            ]
        ]
    },
    {
        "id": "b1fd5761912f387a",
        "type": "inject",
        "z": "2375f1fd09d5550f",
        "name": "",
        "props": [
            {
                "p": "payload"
            },
            {
                "p": "topic",
                "vt": "str"
            }
        ],
        "repeat": "",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "x": 400,
        "y": 320,
        "wires": [
            [
                "ac51cb9d0079beeb"
            ]
        ]
    },
    {
        "id": "bbb6ea3569aad89a",
        "type": "debug",
        "z": "2375f1fd09d5550f",
        "name": "debug 3",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "false",
        "statusVal": "",
        "statusType": "auto",
        "x": 800,
        "y": 320,
        "wires": []
    }
]

*/
