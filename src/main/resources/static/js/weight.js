//update and get customer object
getCustData();
let customer = JSON.parse(sessionStorage.getItem('customer'));

let targetWeight = 65;

//Min and max values user has submitted, used to render chart to display a practical scale
let currentMinValue = 50;
let currentMaxValue = 0;

const chartData = getChartDataFromCustomer(customer, "weight");
console.log(chartData);
let daysDisplayedOnChart = 7;

let currentWeight = 0;

//Setting messages for weight section
let target = document.getElementById('targetWeight');
target.innerHTML = `${targetWeight}KG`;
let current = document.getElementById('currentWeight');
let weightMessage = document.getElementById('weightMessage');

if(currentWeight==0){
       current.innerHTML = `No data.`;
       weightMessage.innerHTML = `No data.`;
}
else{
    current.innerHTML = `${currentWeight}KG`;
    weightMessage.innerHTML = getWeightMessage(targetWeight, currentWeight);
}

const weightModalTable = document.getElementById('weightModalData');
const nextIn = document.getElementById('btn_next');
const prevIn = document.getElementById('btn_prev');
const pageNoSpanIn = document.getElementById('page');

setupTable(chartData, nextIn, prevIn, pageNoSpanIn, weightModalTable, 10);

function getWeightMessage(targetWeight, currentWeight) {
    const weightDifference = Math.abs(targetWeight - currentWeight);
    if (targetWeight > currentWeight) {
        return `You are <b>${weightDifference}KG</b> below your target`
    }
    else if (targetWeight < currentWeight) {
        return `You are <b>${weightDifference}KG</b> above your target`
    }
    else {
        return `Well done, you're on target!`
    }
}

//Chart.js charts settings and config
let weightChart = new Chart(
    document.getElementById('weightchart'),
    {
        type: 'line',
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

                            //Default min 1 week before
                            min: new Date(today - 7 * 24 * 60 * 60 * 1000).toISOString(),

                            //Max will be yesterday unless data exists for today
                            suggestedMax: new Date(today - 1 * 24 * 60 * 60 * 1000).toISOString(),
                            ticks: {
                                source: 'auto',
                            }
                        },
                        y: {
                            min: currentMinValue-5,
                            max: currentMaxValue+5
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
                }
            }
            }
        }
);

function addWeight(event) {
    event.preventDefault();

    //Get input by class
    const input = event.target.querySelector('#weight');
    const newWeight = parseInt(input.value);
    //Reset value
    input.value = '';
    const newDateString = today.toLocaleDateString('en-GB');

    //Object has to be fully null to send to back end and be parsed by spring boot
    let newEntry = Object.create(null);
    newEntry.x = today.toISOString();
    newEntry.y = newWeight;
    console.log(newEntry);
    //Save to db
    let hasBeenAdded = addEntryToTable(newEntry);

   if(hasBeenAdded){
        console.log(newEntry);
        //Save to DB
        saveEntry(newEntry, "/customer/weight/save", "Weight");

        //Update min/max if required
        if(newEntry.y < currentMinValue) currentMinValue = newEntry.y;
        if(newEntry.y > currentMaxValue) currentMaxValue = newEntry.y;

        currentWeight = newEntry.y;
       //Update customer object
       getCustData();

       customer = JSON.parse(sessionStorage.getItem('customer'));
       updateChart(weightChart);
       weightMessage.innerHTML = getMessage(newWeight);
   }
//   showSubmittedContent(newWeight, hasBeenAdded);
}

const form = document.getElementById('weightForm');
form.addEventListener('submit', addWeight);




