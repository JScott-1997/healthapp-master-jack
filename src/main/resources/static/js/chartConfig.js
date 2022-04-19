//Chart setup function that can be used for multiple pages to generate charts. Some element ID's have to be consistent
//As well as the elements that are inputted to the function, the page must also contain input fields for the metric value submissions with class '.data',
//a span with id 'current' to display the last user entry, and a span with id 'message' to display a message relating to the current reading/target
//May also contain a span with id of 'target' to display current target set

//Author: Sean Laughlin
//Lines 113-184 written by Chart.js team for Chart.js setup


//Lowest value ands highest value from data are set in getChartDataFromCustomer method from paginateTable. 
//Used with current target to get chart scale min and max values
let lowestValueFromData = 1000;
let highestValueFromData = 0;
let currentMinValue = 0;
let currentMaxValue = 0;

const dataValues = {
    lowest: lowestValueFromData,
    highest: highestValueFromData,
    min: 0,
    max: 0
}

let theChart;
let chartData;

function setUpChartAndModal(chartEl, chartType, customer, modalTable, modalNext, modalPrev, modalPageNoSpan, kgLbs, units, forms){
    const unitSpans = document.getElementsByClassName('unit');

    //Set the units to display in areas of page where required
    Array.from(unitSpans).forEach(unit => unit.innerHTML = units);

    chartData = getChartDataFromCustomer(customer, chartType, dataValues);

    //Get target from customer object if target is set
    let metricTargetValue;
    if(customer[`target${chartType}`] > 0) metricTargetValue = customer[`target${chartType}`];

    //Convert lowest value from data, highest value from data and target to pounds if user has imperial units preference
    if (kgLbs && units === 'lbs') {
        chartData.forEach(entry => {
            entry.y = convertKGToLbs(entry.y);
        })
        dataValues.lowest = Math.round((dataValues.lowest * 2.2046))
        dataValues.highest = Math.round((dataValues.highest * 2.2046))
        metricTargetValue = Math.round((metricTargetValue * 2.2046))
    }


    function getMinMaxValues() {
        if (metricTargetValue <= dataValues.lowest) {
            dataValues.min = metricTargetValue;
        }
        else {
            dataValues.min = dataValues.lowest;
        }
        if (metricTargetValue >= dataValues.highest) {
            dataValues.max = metricTargetValue;
        }
        else {
            dataValues.max = dataValues.highest;
        }
    }

    function setChartYScale(chart){
        chart.options.scales.y.min = dataValues.min-5;
        chart.options.scales.y.max = dataValues.max+5;
    }

    //Change min max values for chart y axis based on data and target set
    getMinMaxValues();

    let daysDisplayedOnChart = 7;

    //Users 'current' reading
    let currentMetricValue = 0;

    //Setting messages for weight section
    let target = document.getElementById('target');
    let current = document.getElementById('current');
    let message = document.getElementById('message');

    //May be null if no target set, or NaN if no target set but attempt has been made to convert to imperial
    if(metricTargetValue == null || Number.isNaN(metricTargetValue)){
        message.style.display = "none";
        if(target != null)
            target.innerHTML = `No target set.`;
    }
    else{
        target.innerHTML = `${metricTargetValue}${units}`;
    }

    if (!chartData.length == 0) {
        currentMetricValue = chartData[chartData.length - 1].y
        current.innerHTML = `${currentMetricValue}${units}`;
        message.innerHTML = getMessage(metricTargetValue, currentMetricValue);
    }
    else {
        current.innerHTML = ``;
        message.innerHTML = `-`;
    }

    setupTable(chartData, modalNext, modalPrev, modalPageNoSpan, modalTable, 10);

    function getMessage(metricTargetValue, currentMetricValue) {
        if(metricTargetValue != null){
            const difference = Math.abs(Math.round(metricTargetValue - currentMetricValue));
            if (metricTargetValue > currentMetricValue) {
                return `You are <b>${difference}${units}</b> below your target of <b>${metricTargetValue}${units}</b>`
            }
            else if (metricTargetValue < currentMetricValue) {
                return `You are <b>${difference}${units}</b> above your target of <b>${metricTargetValue}${units}</b>`
            }
            else {
                return `Well done, you're on target!`
            }
            }
    }

    //Chart config
    let chart = new Chart(
        chartEl,
        {
            type: 'line',
            //Plugin to draw weight target line on chart
            plugins: [{
                afterDraw: chart => {
                    const ctx = chart.ctx;
                    ctx.save();
                    const xAxis = chart.scales['x'];
                    const yAxis = chart.scales['y'];
                    let y = yAxis.getPixelForValue(metricTargetValue);
                    ctx.beginPath();
                    ctx.moveTo(xAxis.left, y);
                    ctx.lineTo(xAxis.right, y);
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = 'blue';
                    ctx.stroke();
                    ctx.restore();
                }
            }],
            data: {
                datasets: [{
                    fill: false,
                    backgroundColor: 'rgb(47, 168, 58)',
                    borderColor: 'rgb(47, 168, 58)',
                    data: chartData,
                    spanGaps: true
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            displayFormats: {
                                week: 'MMM d',
                                month: 'MMM'
                            },
                            tooltipFormat: 'dd MMM yy'
                        },

                        //Default min 1 week
                        min: new Date(today - 6 * 24 * 60 * 60 * 1000).toISOString(),

                        //Max will be yesterday unless data exists for today
                        suggestedMax: new Date(today).toISOString(),
                        ticks: {
                            source: 'auto',
                        }
                    },
                    y: {
                        min: (dataValues.min) - 5,
                        max: dataValues.max + 5
                    },
                },
                responsive: true,
                maintainAspectRatio: true,
                elements: {
                    line: {
                        borderJoinStyle: 'round',
                        tension: 0.3,
                    }
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                }
            }
        }
    );

    theChart = chart;

    function addEntry(event) {
        event.preventDefault();

        //Get input by class
        const input = event.target.querySelector('.data');
        let entry;
        const entryReadIn = parseInt(input.value);

        if(kgLbs){
            //Convert to kg if user uses imperial units. data is stored in kg in db. Weight read in is used to update chart data etc as its in users choice of units
            entry = units === 'lbs' ? convertLbsToKG(entryReadIn) : entryReadIn;
        }
        else{
            entry = entryReadIn;
        }

        //Reset value of input
        input.value = '';
        const newDateString = today.toLocaleDateString('en-GB');

        //Object has to be fully null to send to back end and be parsed by spring boot
        let newEntry = Object.create(null);
        newEntry.x = today.toISOString();
        newEntry.y = entryReadIn;
        //Add to modal table
        let hasBeenAdded = addEntryToTable(newEntry);

        if (hasBeenAdded) {
            currentMetricValue = newEntry.y;

            //Change weight to KG in object and save to DB. rounded as stored as int
            const formattedForDBEntry = {
                x: today.toISOString(),
                y: Math.round(entry)
            }
            saveEntry(formattedForDBEntry, `/customer/${chartType.toLowerCase()}/save`, `${chartType}`);

            //Update customer object
            getCustData();

            //Get lowest and highest data points again in case of change. Method in chartConfig.
            getLowestAndHighestValues(chartData);

            //Get chart min and max values (depends on target as well as lowest and highest values)
            getMinMaxValues();

            setChartYScale(chart);
            updateChart(chart);
            message.innerHTML = getMessage(metricTargetValue, entryReadIn);
            current.innerHTML = `${entryReadIn}${units}`
        }
        showSubmittedContent(entryReadIn, hasBeenAdded);
    }

    function setTarget(event) {
        event.preventDefault();

        //Get input by class
        const input = document.getElementById('targetDataInput');

        //Convert to kg if user uses imperial units. data is stored in kg in db. Weight read in is used to update chart data etc as its in users choice of units
        const targetReadIn = parseInt(input.value);
        let newTarget;
        console.log(units)
        if(kgLbs){
        //Convert to kg if user uses imperial units. data is stored in kg in db. Weight read in is used to update chart data etc as its in users choice of units
        newTarget = units === 'lbs' ? convertLbsToKG(targetReadIn) : targetReadIn;
        }
        else{
            newTarget = entryReadIn;
        }

        //Reset value of input
        input.value = '';
        const targetObj = {
            target: newTarget
        }
        metricTargetValue = targetReadIn;
        target.innerHTML = `${metricTargetValue}${units}`;

        //change min and max values for chart and update chart
        getMinMaxValues();

        //Update messages on page
        target.innerHTML = `${metricTargetValue}${units}`;
        message.innerHTML = getMessage(metricTargetValue, currentMetricValue);

        let submittedValue = metricTargetValue;
        //Convert to KG to store in db if required
        if(units == 'lbs'){
            submittedValue = metricTargetValue / 2.2046;
        }

        //Show message now target is set
        message.style.display = "block";
        showSubmittedTargetContent(targetReadIn);

        //Save entry to db and update chart
        saveTarget(submittedValue, `/customer/${chartType.toLowerCase()}/target/save`);

        setChartYScale(chart);
        updateChart(chart, dataValues);
    }

    //Modal elements and data listeners for data submission modals and target submission modal
    forms.forEach((form) =>{
        form.addEventListener('submit', addEntry);
    });

    const targetForm = document.getElementById('targetForm');
    if(targetForm != null){
        targetForm.addEventListener('submit', setTarget);
    }
}

//Chart config functions that can be re-used for different pages
function updateChart(chart, data) {
    chart.update();
}

function updateChart(chart) {
    chart.options.scales.x.suggestedMax = new Date(today).toISOString();
    chart.update();
}

function setDaysDisplayedOnChart(numberOfDays, chart){
    chart.options.scales.x.min = new Date(today - (numberOfDays-1) * 24 * 60 * 60 * 1000).toISOString();
    switch(numberOfDays){
        case 180:
            chart.options.scales.x.time.unit = 'month';
            chart.options.scales.x.time.stepSize = 1;
            break;
        case 90:
            chart.options.scales.x.time.unit = 'week';
            chart.options.scales.x.time.stepSize = 2;
            break;
        case 30:
            chart.options.scales.x.time.unit = 'day';
            chart.options.scales.x.time.stepSize = 5;
            break;
        case 7:
            chart.options.scales.x.time.unit = 'day';
            chart.options.scales.x.time.stepSize = 1;
        break;

    }
    updateChart(chart);
}

function getChartDataFromCustomer(customer, entryType){
    const newArr = new Array();
    const entries = customer[entryType[0].toLowerCase() + entryType.slice(1)+"Entries"];
    entries.forEach(entry => {
        let newEntry = {};

        //Object properties 1 and 2 are used as 0 will be the entry id
        newEntry.x = entry[Object.keys(entry)[1]];
        newEntry.y = entry[Object.keys(entry)[2]];
        newArr.push(newEntry)
    })
    getLowestAndHighestValues(newArr);
    return newArr;
}

function getLowestAndHighestValues(chartData){
    chartData.forEach(dataEntry => {
            if(dataEntry.y <= dataValues.lowest){
                dataValues.lowest = dataEntry.y;
            }
            if(dataEntry.y >= dataValues.highest){
                dataValues.highest = dataEntry.y;
            }
    })
}