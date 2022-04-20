/*
For page displaying weight chart and data
Also contains bmi chart and body fat % chart (with coloured background plugins)
Author: Sean Laughlin
*/

//Update and get customer object from session
getCustData();
let customer = JSON.parse(sessionStorage.getItem('customer'));
const customerAge = calculate_age(new Date(customer.dateOfBirth));

//Get ranges for body fat %, dangerous, low, good etc (hard coded into this file)
const ranges = getBodyFatRanges(customer.sex, customerAge);

//Get elements to be used to set up chart and modal (weight chart is set up by by chartSetup.js - setUpChartAndModal() and is referred to just as chart)
const chartEl = document.getElementById('chart');
const BMIChartEl = document.getElementById('BMIChart');
const BodyFatChartEl = document.getElementById('BodyFatChart');

const chartContainer = document.getElementById('weightChartContainer');
const BMIChartContainer = document.getElementById('BMIChartContainer');
const BodyFatChartContainer = document.getElementById('BodyFatChartContainer');

const BMIMessage = document.getElementById('BMIMessage');
const bodyFatMessage = document.getElementById('BodyFatMessage');

const weightHeader = document.getElementById('weightHeader');

let BMIChart;
let chartDataBMI = new Array();
let chartDataBodyFat = new Array();

const chartType = "Weight";
const modalTable = document.getElementById('modalData');
const modalNext = document.getElementById('btn_next');
const modalPrev = document.getElementById('btn_prev');
const modalPageNoSpan = document.getElementById('page');

//Boolean to indicate whether this is kilogram/pounds measured, so that imperial or metric units are applied based on user preference
const kgLbs = true;
let usesImperialUnits = customer.customerUnitsPreference == 'IMPERIAL';
let units = usesImperialUnits ? 'lbs' : 'KG';

//All forms that can be used to input the value on the page
let forms = new Array();
forms.push(document.getElementById('metricForm'));

//Method is from chartConfig.js, general method for setting up charts. Not suitable for BMI and body fat % due to plugins
setUpChartAndModal(chartEl, chartType, customer, modalTable, modalNext, modalPrev, modalPageNoSpan, kgLbs, units, forms);

//Modal elements for data submission modal and target submission modal
const defaultContent = document.getElementById('defaultContent');
const submittedContent = document.getElementById('submittedContent');
const defaultTargetContent = document.getElementById('defaultTargetContent');
const submittedTargetContent = document.getElementById('submittedTargetContent');

//Shows message confirming entry submitted
function showSubmittedContent(entryValue, hasBeenAdded) {
    defaultContent.style.display = 'none';
    let message = submittedContent.querySelector('#submittedMessage');
    message.textContent = hasBeenAdded ? `${chartType} of ${entryValue}${units} submitted successfully!` : `You have already submitted a reading today, please try again tomorrow!`;
    submittedContent.style.display = 'block';
}

//Show default modal content for data record/submission modal
function revertDefault() {
    setTimeout(function () {
        submittedContent.style.display = 'none';
        defaultContent.style.display = 'block';
    }, 500);
}

//Shows message confirming target submitted
function showSubmittedTargetContent(target) {
    defaultTargetContent.style.display = 'none';
    let message = submittedTargetContent.querySelector('#submittedTargetMessage');
    message.textContent = `${chartType} target of ${target}${units} submitted successfully!`;
    submittedTargetContent.style.display = 'block';

}

//Show default modal content for target modal
function revertTargetDefault() {
    setTimeout(function () {
        submittedTargetContent.style.display = 'none';
        defaultTargetContent.style.display = 'block';
    }, 500);
}

//Set up whole chart with added plugins for coloured background
function setUpBMIChart() {
    //Calculate BMI from weight data and customer height
    chartDataBMI = getChartDataFromCustomer(customer, chartType);

    //Makes sure lowest and highest are correct in lbs rather than kg as may be set by above method
    if (units === 'lbs') {
        dataValues.lowest = Math.round(dataValues.lowest * 2.2046)
        dataValues.highest = Math.round(dataValues.highest * 2.2046)
    }

    chartDataBMI.forEach((data) => {
        data.y = data.y / Math.pow((customer.height / 100), 2);
    });

    //Chart.js setup
    BMIChart = new Chart(
        BMIChartEl,
        {
            type: 'line',
            //Plugin to draw weight target line on chart
            plugins: [],
            data: {
                datasets: [{
                    fill: false,
                    backgroundColor: '#000',
                    borderColor: '#000',
                    data: chartDataBMI,
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
                        min: 15,
                        max: 40
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
        });

    //Plugin for coloured BMI background on chart
    var ColouredBgPlugin = {
        id: 'backgrounds',
        beforeDraw: (chart, args, options) => {
            const {
                ctx,
                chartArea,
                scales: {
                    y
                }
            } = chart;

            options.hbars.forEach((hBar) => {
                ctx.save();
                ctx.fillStyle = hBar.color;
                ctx.fillRect(chartArea.left, y.getPixelForValue(hBar.from), chartArea.right - chartArea.left, y.getPixelForValue(hBar.to) - y.getPixelForValue(hBar.from));
                ctx.restore();
            });
        }
    };
    //Draw colours on background at BMI category intervals
    BMIChart.options.plugins.backgrounds = {
        hbars: [{
            from: 15,
            to: 18.49,
            color: "#99ffff"
        },
        {
            from: 18.5,
            to: 24.99,
            color: "#99ff99"
        },
        {
            from: 25,
            to: 29.99,
            color: "#ffff99"
        },
        {
            from: 30,
            to: 34.99,
            color: "#ffcc99"
        },
        {
            from: 35,
            to: 40,
            color: "#ff9999"
        }
        ]
    };

    BMIChart.config.plugins.push(ColouredBgPlugin);
    BMIChart.update();
}

function showBMIChart() {

    //Check if new weight has been submitted since page load and update BMI chart if it has
    if (chartData.length > chartDataBMI.length) {
        const newWeightEntry = chartData[chartData.length - 1];

        const newBMIEntry = {
            x: newWeightEntry.x,
            y: newWeightEntry.y / Math.pow((customer.height / 100), 2)
        }
        chartDataBMI.push(newBMIEntry)
        BMIChart.update();

    }

    weightHeader.innerHTML = "BMI";
    chartContainer.style.display = "none";
    BodyFatChartContainer.style.display = "none";
    BMIChartContainer.style.display = "block";
    BMIMessage.innerHTML = getBMIMessage(chartDataBMI[chartDataBMI.length - 1].y);
}

function showWeightChart() {
    weightHeader.innerHTML = `Weight (${units})`;
    BMIChartContainer.style.display = "none";
    BodyFatChartContainer.style.display = "none";
    chartContainer.style.display = "block";
}

function getBMIMessage(currentBMI) {
    let range;
    if (customer.height == 0)
        return `<b>Please set your height on your <a href="/customer/profile">Profile</a> to view BMI data.</b>`;

    switch (true) {
        case currentBMI < 18.5:
            range = 'Underweight';
            break;
        case currentBMI >= 18.5 && currentBMI < 25:
            range = 'Healthy';
            break;
        case currentBMI >= 25 && currentBMI < 30:
            range = 'Overweight'
            break;
        case currentBMI >= 30 && currentBMI < 35:
            range = 'Obese'
            break;
        case currentBMI >= 35:
            range = 'Morbidly Obese'
            break;
    }

    const newKG = 24.9 * Math.pow(customer.height / 100, 2);

    let loseGain;
    if (range != 'Healthy' && newKG > (currentBMI * Math.pow(customer.height / 100, 2)))
        loseGain = 'gain';
    else if (range != 'Healthy' && newKG < (currentBMI * Math.pow(customer.height / 100, 2)))
        loseGain = 'lose';

    let loseGainAmount = Math.abs((currentBMI * Math.pow(customer.height / 100, 2)) - newKG);
    if (units == 'IMPERIAL')
        loseGainAmount = loseGainAmount * 2.2046;

    //Round to 2 decimal places
    currentBMI = currentBMI.toFixed(2);
    loseGainAmount = loseGainAmount.toFixed(2);

    let loseGainMessage = `You need to ${loseGain} <b>${loseGainAmount}${units}</b> to bring your BMI into a healthy range.`;
    if (loseGain == null)
        loseGainMessage = "";


    return `Your BMI of <b>${currentBMI}</b> is in the <b>${range}</b> range.<br>
            ${loseGainMessage}`
}

function setUpBodyFatChart() {

    //Formula changes depending on male or female so this is checked and value of variable assigned
    const maleFemaleNumber = customer.sex == 'FEMALE' ? 5.4 : 16.2;
    chartDataBMI.forEach((data) => {
        const yValue = (1.20 * data.y) + (0.23 * customerAge) - maleFemaleNumber;
        const newData = {
            x: data.x,
            y: yValue
        }
        chartDataBodyFat.push(newData);
    });

    //Chart.js setup
    bodyFatChart = new Chart(
        BodyFatChartEl,
        {
            type: 'line',
            plugins: [],
            data: {
                datasets: [{
                    fill: false,
                    backgroundColor: '#000',
                    borderColor: '#000',
                    data: chartDataBodyFat,
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
                        min: 5,
                        max: 40
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
        });

    //Plugin for coloured BMI background on chart
    var ColouredBgPlugin = {
        id: 'backgrounds',
        beforeDraw: (chart, args, options) => {
            const {
                ctx,
                chartArea,
                scales: {
                    y
                }
            } = chart;

            options.hbars.forEach((hBar) => {
                ctx.save();
                ctx.fillStyle = hBar.color;
                ctx.fillRect(chartArea.left, y.getPixelForValue(hBar.from), chartArea.right - chartArea.left, y.getPixelForValue(hBar.to) - y.getPixelForValue(hBar.from));
                ctx.restore();
            });
        }
    };
    //Draw colours on background at BMI category intervals
    bodyFatChart.options.plugins.backgrounds = {
        hbars: [{
            from: ranges.low.low,
            to: ranges.low.high,
            color: "#ff9999"
        },
        {
            from: ranges.good.low,
            to: ranges.good.high,
            color: "#99ff99"
        },
        {
            from: ranges.poor.low,
            to: ranges.poor.high,
            color: "#ffff99"
        },
        {
            from: ranges.dangerous.low,
            to: ranges.dangerous.high,
            color: "#ffcc99"
        },
        {
            from: 35,
            to: 40,
            color: "#ff9999"
        }
        ]
    };
    bodyFatChart.config.plugins.push(ColouredBgPlugin);
    bodyFatChart.update();
}

function showBodyFatChart() {

    //Check if new weight has been submitted since page load and update BMI chart if it has
    if (chartData.length > chartDataBodyFat.length) {
        const newWeightEntry = chartData[chartData.length - 1];
        const maleFemaleNumber = customer.sex == 'FEMALE' ? 5.4 : 16.2;

        const newBodyFatEntry = {
            x: newWeightEntry.x,
            //BMI has to be calculated from weight, then body fat % calculated
            y: (1.20 * (newWeightEntry.y / Math.pow((customer.height / 100), 2)) + (0.23 * customerAge) - maleFemaleNumber)
        }
        chartDataBodyFat.push(newBodyFatEntry)
        bodyFatChart.update();
    }

    weightHeader.innerHTML = "Body Fat (%)";
    chartContainer.style.display = "none";
    BMIChartContainer.style.display = "none";
    BodyFatChartContainer.style.display = "block";
    bodyFatMessage.innerHTML = getBodyFatMessage(chartDataBodyFat[chartDataBodyFat.length - 1].y);
}

//Body fat ranges data by age and gender used to set up charts and display related messages
function getBodyFatRanges(sex, age) {
    const ranges = {};
    if (sex == 'FEMALE') {
        switch (true) {
            case age < 30:
                ranges.low = {
                    low: 5,
                    high: 13.99
                }
                ranges.good = {
                    low: 14,
                    high: 22.69
                }
                ranges.poor = {
                    low: 22.7,
                    high: 27.19
                }
                ranges.dangerous = {
                    low: 27.2,
                    high: 40
                }
                break;
            case age < 40:
                ranges.low = {
                    low: 5,
                    high: 13.99
                }
                ranges.good = {
                    low: 14,
                    high: 24.59
                }
                ranges.poor = {
                    low: 24.6,
                    high: 29.19
                }
                ranges.dangerous = {
                    low: 29.2,
                    high: 40
                }
                break;
            case age < 50:
                ranges.low = {
                    low: 5,
                    high: 13.99
                }
                ranges.good = {
                    low: 14,
                    high: 27.59
                }
                ranges.poor = {
                    low: 27.6,
                    high: 31.29
                }
                ranges.dangerous = {
                    low: 31.3,
                    high: 40
                }
            case age < 60:
                ranges.low = {
                    low: 5,
                    high: 13.99
                }
                ranges.good = {
                    low: 14,
                    high: 30.39
                }
                ranges.poor = {
                    low: 30.4,
                    high: 34.59
                }
                ranges.dangerous = {
                    low: 34.6,
                    high: 40
                }
            case age >= 60:
                ranges.low = {
                    low: 5,
                    high: 13.99
                }
                ranges.good = {
                    low: 14,
                    high: 31.29
                }
                ranges.poor = {
                    low: 31.3,
                    high: 35.39
                }
                ranges.dangerous = {
                    low: 35.4,
                    high: 40
                }
                break;
        }
    }
    else {
        switch (true) {
            case age < 30:
                ranges.low = {
                    low: 5,
                    high: 7.99
                }
                ranges.good = {
                    low: 8,
                    high: 18.59
                }
                ranges.poor = {
                    low: 18.6,
                    high: 23.09
                }
                ranges.dangerous = {
                    low: 23.1,
                    high: 40
                }
                break;
            case age < 40:
                ranges.low = {
                    low: 5,
                    high: 7.99
                }
                ranges.good = {
                    low: 8,
                    high: 21.29
                }
                ranges.poor = {
                    low: 21.3,
                    high: 24.89
                }
                ranges.dangerous = {
                    low: 24.9,
                    high: 40
                }
                break;
            case age < 50:
                ranges.low = {
                    low: 5,
                    high: 7.99
                }
                ranges.good = {
                    low: 8,
                    high: 23.39
                }
                ranges.poor = {
                    low: 23.4,
                    high: 26.59
                }
                ranges.dangerous = {
                    low: 26.6,
                    high: 40
                }
                break;
            case age < 60:
                ranges.low = {
                    low: 5,
                    high: 7.99
                }
                ranges.good = {
                    low: 8,
                    high: 24.59
                }
                ranges.poor = {
                    low: 24.6,
                    high: 27.79
                }
                ranges.dangerous = {
                    low: 27.8,
                    high: 40
                }
                break;
            case age >= 60:
                ranges.low = {
                    low: 5,
                    high: 7.99
                }
                ranges.good = {
                    low: 8,
                    high: 25.19
                }
                ranges.poor = {
                    low: 25.2,
                    high: 28.39
                }
                ranges.dangerous = {
                    low: 28.4,
                    high: 40
                }
                break;
        }
    }
    return ranges;
}

function getBodyFatMessage(currentBodyFat) {
    let range;
    if (customer.height == 0)
        return `<b>Please set your height on your <a href="/customer/profile">Profile</a> to view Body Fat % data.</b>`;

    switch (true) {
        case currentBodyFat > ranges.low.low && currentBodyFat < ranges.low.high:
            range = 'Low';
            break;
        case currentBodyFat > ranges.good.low && currentBodyFat < ranges.good.high:
            range = 'Healthy';
            break;
        case currentBodyFat > ranges.poor.low && currentBodyFat < ranges.poor.high:
            range = 'Poor'
            break;
        case currentBodyFat > ranges.dangerous.low && currentBodyFat < ranges.dangerous.high:
            range = 'Dangerous'
            break;
        case currentBodyFat >= 36:
            range = 'Very Dangerous'
            break;
    }
    currentBodyFat = currentBodyFat.toFixed(2);
    return `Your Body Fat Percentage of <b>${currentBodyFat}%</b> is in the <b>${range}</b> range.`
}

setUpBMIChart();
setUpBodyFatChart();

