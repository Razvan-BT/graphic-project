$(document).ready(function () {
  // let addr = "http://127.0.0.1:1880/realizattakt";
  let addr = "https://node.formens.ro/realizattakt";

  function GetRequestParam(param) {
    var res = null;
    try {
      var qs = decodeURIComponent(window.location.search.substring(1)); //get everything after than '?' in URI
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
    //debugger;
    let locatedId = GetRequestParam("loc");
    ExtractDataFromNodeRed(locatedId);

    function ExtractDataFromNodeRed(loc) {
      $({ property: 0 }).animate({ property: 105 }, {
        duration: 200, // 200 ms.
        step: function () {
          var _percent = Math.round(this.property);
          $('#progress').css('width', _percent + "%");
          if (_percent == 105) {
            $("#progress").addClass("done");
          }
        },
        complete: function () {
          $.ajax({
            url: addr + '?loc=' + loc,
            type: 'GET',
            timeout: 10000,
            error: function (err) {
              window.setTimeout(getDataNode, 15000); // check every 15 sec. internet connection
              alert('Cannot connect to the server... try again.');
              console.error("ERROR: Something is wrong... ");
            },
            success: function (data) {
              for (let i = 0; i < Object.entries(data.checkpoints).length; i++) {
                const debug_status = false,
                  OUT_DATE = 15;
                let getTargetNumber,
                  categoriesChart = new Array(), // legend - time in half hour: 6:00, 6:30, 7:30 ... 16:30 without brakets - 30 minutes.
                  dataChart = [], // start with 0 minutes.
                  realChart = []; // black line

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
                  const result = new Date(Math.floor(hmsToSecondsOnly(getTimesArray(6, OUT_DATE, 30)[g])) * 1000).toISOString().slice(11, 16);
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
                  const minlucrate = (lucrate / 60);
                  const target = getTargetNumber;

                  let targetnow = ((target / 480) * minlucrate);
                  for (let values of Object.values(data.checkpoints[i])) {
                    for (let z = 0; z < Object.entries(data.checkpoints).length; z++) {
                      realChart.push(...[values]);
                    }
                  }
                  if (now >= timestringtoDate(chartTime))
                    dataChart.push(...[Math.round(targetnow)]);

                }

                let newTime = new Date();
                let hourTm = newTime.getHours();
                if (hourTm > 14) dataChart.pop(); // remove last element from array. after 14:30

                /* If are more realChart that dataChart make equal between this two. */
                if (dataChart.length < realChart[i].length) {
                  do {
                    realChart[i].pop();
                  }
                  while (dataChart.length < realChart[i].length);
                }

                if (debug_status) console.log("debug: dataChart: " + dataChart.length);

                /* Change color for each column with value better than dataChart (time)  */
                // red less dataChart - green better datachart.
                let dataCheck = [],
                  chkCl = [],
                  chkClRespond = [],
                  colorCheck = [];

                chkClRespond.push(...dataChart); // L-am facut aiurea... era destul dataChart....
                for (let y = 0; y < dataChart.length; y++) {
                  dataCheck[y] = {
                    x: categoriesChart[y],
                    y: realChart[i][y],
                    goals: [
                      {
                        name: 'Target',
                        value: dataChart[y],
                        strokeHeight: 5,
                        strokeColor: '#775DD0',
                      }
                    ]
                  };
                }

                /* ----------- [This LOOP add red bar or green bar] ----------------------------- */
                for (let x = 0; x < chkClRespond.length; x++) {
                  chkCl.push(...[
                    function ({ value, seriesIndex, dataPointIndex, w }) {
                      if (value < dataChart[dataPointIndex]) {
                        return '#f21616'
                      } if (value > dataChart[dataPointIndex]) {
                        return '#06cf67'
                      }
                      else return '#06cf67'
                    }
                  ]);
                }

                colorCheck = {
                  colors: chkCl
                }

                console.trace(colorCheck);
                // console.log(chkCl);
                // Id - data for each element from Id (Table) -> result Color for each element

                var options = {
                  series: [
                    {
                      name: 'Real',
                      data: dataCheck
                    }
                  ],
                  chart: {
                    fontFamily: 'Montserrat, sans-serif',
                    height: 350,
                    type: 'bar'
                  },
                  plotOptions: {
                    bar: {
                      columnWidth: '35%'
                    }
                  },
                  fill: colorCheck,
                  dataLabels: {
                    enabled: true,
                  },
                  title: {
                    style: {
                      fontSize: '25px',
                    },
                    text: `${Object.keys(data.checkpoints[i])}`,
                    align: 'center',

                  },
                  legend: {
                    show: true,
                    showForSingleSeries: true,
                    customLegendItems: ['Real', 'Real', 'Target'],
                    markers: {
                      fillColors: ['#f21616', '#06cf67' , '#775DD0']
                    }
                  }
                };

                /* create element forEach table */
                let diver = document.createElement('div');
                diver.id = 'num_' + i;
                let checkParent = document.getElementById('chart');
                checkParent.appendChild(diver);

                let chart = new ApexCharts(diver, options);
                chart.render();
              }
              $("#progress").addClass("done");
              console.warn('Successfully page loaded!');
            }
          });
        }
      });
    }
  }

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
});

