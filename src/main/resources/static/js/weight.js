//For page displaying weight chart and data
//For page displaying heartrate chart and data.

//update and get customer object
getCustData();
let customer = JSON.parse(sessionStorage.getItem('customer'));

//Get elements to be used to set up chart and modal by chartSetup.js setUpChartAndModal
const chartEl = document.getElementById('chart');
const BMIChartEl = document.getElementById('BMIChart');

const chartContainer = document.getElementById('weightChartContainer');
const BMIChartContainer = document.getElementById('BMIChartContainer');
const BMIMessage = document.getElementById('BMIMessage');

let BMIChart;
let chartDataBMI;

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

setUpChartAndModal(chartEl, chartType, customer, modalTable, modalNext, modalPrev, modalPageNoSpan, kgLbs, units, forms);

//Modal elements for data submission modal and target submission modal
const defaultContent = document.getElementById('defaultContent');
const submittedContent = document.getElementById('submittedContent');

const defaultTargetContent = document.getElementById('defaultTargetContent');
const submittedTargetContent = document.getElementById('submittedTargetContent');
//switchToBMIChart();
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
function setUpBMIChart(){
        //Calculate BMI from weight data and customer height
        chartDataBMI = getChartDataFromCustomer(customer, chartType);
        chartDataBMI.forEach((data) => {
                    data.y = data.y/Math.pow((customer.height/100), 2);
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

function showBMIChart(){
    chartContainer.style.display="none";
    BMIChartContainer.style.display="block";
    BMIMessage.innerHTML = getBMIMessage(chartDataBMI[chartDataBMI.length-1].y);
}

function showWeightChart(){
    BMIChartContainer.style.display="none";
    chartContainer.style.display="block";
}

function getBMIMessage(currentBMI){
    let range;
    switch(true){
        case currentBMI < 18.5:
            range = 'Underweight';
            break;
        case currentBMI >= 18.5 && currentBMI < 25:
            range = 'Healthy';
            break;
        case currentBMI >=25 && currentBMI < 30:
            range = 'Overweight'
            break;
        case currentBMI >=30 && currentBMI < 35:
            range = 'Obese'
            break;
        case currentBMI >=35:
            range = 'Morbidly Obese'
            break;
    }
    //Round to 2 decimal places
    currentBMI = currentBMI.toFixed(2);
    return `Your BMI of <b>${currentBMI}</b> is in the <b>${range}</b> range.`
}

setUpBMIChart();

