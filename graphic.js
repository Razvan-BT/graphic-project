let addr = "http://127.0.0.1:1880/realizattakt";
// let addr = "https://node.formens.ro/realizattakt";

setInterval(getFirstTable, (1000 * 60) * 10); // update at every 10 minutes to sync automatically
setInterval(getSecondTable, (1000 * 60) * 10); // update at every 10 minutes to sync automatically
setInterval(getLastTable, (1000 * 60) * 10); // update at every 10 minutes to sync automatically

// apexchart into one function
function getChart(dataChart, remChart, categoriesChart, theHoursGet, chrt, key) {
    /* Ajax Chart.js */
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
        colors: ['#77B6EA', '#545454'],
        dataLabels: {
            enabled: true,
        },
        stroke: {
            curve: 'smooth'
        },
        title: {
            text: `${key}`,
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
    if(chrt === '') chrt = '';
    chart = new ApexCharts(document.querySelector("#chart"+chrt), options);
    chart.render();  
}

function getFirstTable() {
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
        chart,
        categoriesChart = new Array(), // legend - time in half hour: 6:00, 6:30, 7:30 ... 16:30 without brakes - 30 minutes.
        dataChart = [], // start with 0 minutes.
        remChart = new Array(); // black line

    // Time from X-Axis 

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

    let locatedId = GetRequestParam("loc");
    getDataFromNodeRed(locatedId);

    function getDataFromNodeRed(loc) {

        $.ajax({
            url: addr + '?loc=' + loc,
            type: 'GET',
            success: function (data) {
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

                for (let i = 0; i < getTimesArray(6, OUT_DATE, 30).length; i++) {
                    let chartTime = getTimesArray(6, OUT_DATE, 30)[i];
                    const result = new Date(Math.floor(hmsToSecondsOnly(getTimesArray(6, OUT_DATE, 30)[i])) * 1000).toISOString().slice(11, 19);
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
                        targetEveryNum.push(Math.round(targetnow));

                    finishTime = targetnow;
                }

                dataChart.push(...targetEveryNum);

                /* remove  last items from array */
                if (finishTime >= 360) categoriesChart.pop();
                if (finishTime >= 360) dataChart.pop();
    
                /* Update de Y Axis (How blue line are calc from getTimeRemain)  */
                for (let i = 0; i < dataChart.length; i++) { checkIfAreThere = i; }
                if (theHoursGet > 0) theHoursGet += (checkIfAreThere * MAX_INT_TIME);
                
                for (let j = 0; j <= dataChart.length - 1; j++) remChart.push(data.checkpoints[0].pensa[j]); // add black line from node.
                
                if (debug_status) console.log("debug: dataChart: " + dataChart.length);
                if (debug_status) console.log("debug: checkIfAreThere: " + checkIfAreThere);

                getChart(dataChart, remChart, categoriesChart, theHoursGet, '', Object.keys(data.checkpoints[0]));
            }
        })
    }
}
function getSecondTable() {
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
        chart,
        categoriesChart = new Array(), // legend - time in half hour: 6:00, 6:30, 7:30 ... 16:30 without brakes - 30 minutes.
        dataChart = [], // start with 0 minutes.
        remChart = new Array(); // black line

    // Time from X-Axis 

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

    let locatedId = GetRequestParam("loc");
    getDataFromNodeRed(locatedId);

    function getDataFromNodeRed(loc) {

        $.ajax({
            url: addr + '?loc=' + loc,
            type: 'GET',
            success: function (data) {
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

                for (let i = 0; i < getTimesArray(6, OUT_DATE, 30).length; i++) {
                    let chartTime = getTimesArray(6, OUT_DATE, 30)[i];
                    const result = new Date(Math.floor(hmsToSecondsOnly(getTimesArray(6, OUT_DATE, 30)[i])) * 1000).toISOString().slice(11, 19);
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
                        targetEveryNum.push(Math.round(targetnow));

                    finishTime = targetnow;
                }

                dataChart.push(...targetEveryNum);

                /* remove  last items from array */
                if (finishTime >= 360) categoriesChart.pop();
                if (finishTime >= 360) dataChart.pop();
    
                /* Update de Y Axis (How blue line are calc from getTimeRemain)  */
                for (let i = 0; i < dataChart.length; i++) { checkIfAreThere = i; }
                if (theHoursGet > 0) theHoursGet += (checkIfAreThere * MAX_INT_TIME);
                
                for (let j = 0; j <= dataChart.length - 1; j++) remChart.push(data.checkpoints[1].buzunar[j]); // add black line from node.
                
                if (debug_status) console.log("debug: dataChart: " + dataChart.length);
                if (debug_status) console.log("debug: checkIfAreThere: " + checkIfAreThere);

                /* Ajax Chart.js */
                getChart(dataChart, remChart, categoriesChart, theHoursGet, 'Two', Object.keys(data.checkpoints[1]));
            }
        })
    }
}
function getLastTable() {
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
        chart,
        categoriesChart = new Array(), // legend - time in half hour: 6:00, 6:30, 7:30 ... 16:30 without brakes - 30 minutes.
        dataChart = [], // start with 0 minutes.
        remChart = new Array(); // black line

    // Time from X-Axis 

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

    let locatedId = GetRequestParam("loc");
    getDataFromNodeRed(locatedId);

    function getDataFromNodeRed(loc) {

        $.ajax({
            url: addr + '?loc=' + loc,
            type: 'GET',
            success: function (data) {
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

                for (let i = 0; i < getTimesArray(6, OUT_DATE, 30).length; i++) {
                    let chartTime = getTimesArray(6, OUT_DATE, 30)[i];
                    const result = new Date(Math.floor(hmsToSecondsOnly(getTimesArray(6, OUT_DATE, 30)[i])) * 1000).toISOString().slice(11, 19);
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
                        targetEveryNum.push(Math.round(targetnow));

                    finishTime = targetnow;
                }

                dataChart.push(...targetEveryNum);

                /* remove  last items from array */
                if (finishTime >= 360) categoriesChart.pop();
                if (finishTime >= 360) dataChart.pop();
    
                /* Update de Y Axis (How blue line are calc from getTimeRemain)  */
                for (let i = 0; i < dataChart.length; i++) { checkIfAreThere = i; }
                if (theHoursGet > 0) theHoursGet += (checkIfAreThere * MAX_INT_TIME);

                for (let j = 0; j <= dataChart.length - 1; j++) remChart.push(data.checkpoints[2].teslu[j]); // add black line from node.
                
                if (debug_status) console.log("debug: dataChart: " + dataChart.length);
                if (debug_status) console.log("debug: checkIfAreThere: " + checkIfAreThere);

                getChart(dataChart, remChart, categoriesChart, theHoursGet, 'Three', Object.keys(data.checkpoints[2]));
            }
        })
    }
}


/* Execute all functions */

getFirstTable();
getSecondTable();
getLastTable();


function timestringtoDate(timestring) {
    let d = new Date(); // Creates a Date Object using the clients current time

    let [hours, minutes, seconds] = timestring.split(':');

    d.setHours(+hours); // Set the hours, using implicit type coercion
    d.setMinutes(minutes); // can pass Number or String - doesn't really matter
    d.setSeconds(seconds);
    return d;
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
        "x": 280,
        "y": 220,
        "wires": [
            [
                "b5b7022d53055b3c",
                "767d7a552328bed7"
            ]
        ]
    },
    {
        "id": "b5b7022d53055b3c",
        "type": "function",
        "z": "2375f1fd09d5550f",
        "name": "function 8",
        "func": "msg.payload = {}\nmsg.payload.target = 360;\nmsg.payload.checkpoints = [\n    {'pensa':[1111,3,1,48,-50,50,50,50,50,50,50,50,50,50,50,50,50, 70]},\n    { 'buzunar': [10, 15, 16, 48, 60, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50] },\n    { 'teslu': [15, 18, 21, 48, 60, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50] },\n    ];\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 460,
        "y": 220,
        "wires": [
            [
                "9308144f8ce79ebc",
                "0536c240865a443a"
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
        "x": 650,
        "y": 220,
        "wires": []
    },
    {
        "id": "767d7a552328bed7",
        "type": "debug",
        "z": "2375f1fd09d5550f",
        "name": "IN RTAKT",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 480,
        "y": 180,
        "wires": []
    },
    {
        "id": "0536c240865a443a",
        "type": "debug",
        "z": "2375f1fd09d5550f",
        "name": "TX",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "true",
        "targetType": "full",
        "statusVal": "",
        "statusType": "auto",
        "x": 680,
        "y": 160,
        "wires": []
    }
]

*/
