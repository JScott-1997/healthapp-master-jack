//Chart setup function that can be used for multiple pages to generate charts. Some element ID's have to be consistent
//As well as the elements that are inputted to the function, the page must also contain input fields for the metric value submissions with class '.data',
//a span with id 'current' to display the last user entry, and a span with id 'message' to display a message relating to the current reading/target
//May also contain a span with id of 'target' to display current target set


//Lowest value ands highest value from data are set in getChartDataFromCustomer method from paginateTable.
//Used with current target to get chart scale min and max values
let lowestValueFromData = 1000;
let highestValueFromData = 0;
let currentMinValue = 0;
let currentMaxValue = 0;

const dataValues = {
}

let theChart;

function setUpChartAndModal(chartEl, chartType, customer, modalTable, modalNext, modalPrev, modalPageNoSpan, kgLbs, units, forms){

    const unitSpans = document.getElementsByClassName('unit');

    //Set the units to display in areas of page where required
    Array.from(unitSpans).forEach(unit => unit.innerHTML = units);

    let chartData = getChartDataFromCustomer(customer, chartType);

    let metricTargetValue;

    //Convert data and chart min/max to pounds if user has imperial units preference
    if (kgLbs && units === 'lbs') {
        chartData.forEach(entry => {
            entry.y = convertKGToLbs(entry.y);
        })
        lowestValueFromData = Math.round((lowestValueFromData * 2.2046))
        highestValueFromData = Math.round((highestValueFromData * 2.2046))
        metricTargetValue = Math.round((metricTargetValue * 2.2046))
    }

    function getMinMaxValues() {
        if (metricTargetValue <= lowestValueFromData) {
            currentMinValue = metricTargetValue;
        }
        else {
            currentMinValue = lowestValueFromData;
        }
        if (metricTargetValue >= highestValueFromData) {
            currentMaxValue = metricTargetValue;
        }
        else {
            currentMaxValue = highestValueFromData;
        }
    }

    //Change min max based on target set
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
                            }
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
                        min: currentMinValue - 5,
                        max: currentMaxValue + 5
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

            //Get lowest and highest data points again in case of change
            getLowestAndHighestValues(chartData);

            //Get chart min and max values (depends on target as well as lowest and highest values)
            getMinMaxValues();

            updateChart(chart);
            message.innerHTML = getMessage(metricTargetValue, entryReadIn);
            current.innerHTML = `${entryReadIn}${units}`
        }
        showSubmittedContent(entryReadIn, hasBeenAdded);
    }

    function setTarget(event) {
        event.preventDefault();

        //Get input by class
        const input = event.target.getElementById('targetDataInput');

        //Convert to kg if user uses imperial units. data is stored in kg in db. Weight read in is used to update chart data etc as its in users choice of units
        const targetReadIn = parseInt(input.value);
        let newTarget;

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

        //Show message now target is set
        message.style.display = "block";
        showSubmittedTargetContent(targetReadIn);

        updateChart(chart);
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