//Chart config functions that can be re-used for different pages

function updateChart(chart, data) {
    chart.update();
}

function updateChart(chart, values) {
    chart.options.scales.x.suggestedMax = new Date(today).toISOString();
    chart.options.scales.y.min = values.min-5;
    chart.options.scales.y.max = values.max+5;
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
    updateChart(chart, dataValues);
}

function getChartDataFromCustomer(customer, entryType, values){
    const newArr = new Array();
    const entries = customer[entryType[0].toLowerCase() + entryType.slice(1)+"Entries"];
    entries.forEach(entry => {
        let newEntry = {};

        //Object properties 1 and 2 are used as 0 will be the entry id
        newEntry.x = entry[Object.keys(entry)[1]];
        newEntry.y = entry[Object.keys(entry)[2]];
        newArr.push(newEntry)
    })
    getLowestAndHighestValues(newArr, values);
    return newArr;
}

function getLowestAndHighestValues(chartData, values){
    chartData.forEach(dataEntry => {
            if(dataEntry.y <= values.lowest){
                values.lowest = dataEntry.y;
            }
            if(dataEntry.y >= values.highest){
                values.highest = dataEntry.y;
            }
    })
}