//Chart config functions that can be re-used for different pages

function updateChart(chart, data) {
    chart.update();
}

function updateChart(chart) {
    chart.update();
}

function setDaysDisplayedOnChart(numberOfDays, chart){
    chart.options.scales.x.min = new Date(today - numberOfDays * 24 * 60 * 60 * 1000).toISOString();
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
    const entries = customer[entryType+"Entries"];
    entries.forEach(entry => {
        let newEntry = {};

        //Object properties 1 and 2 are used as 0 will be the entry id
        newEntry.x = entry[Object.keys(entry)[1]];
        newEntry.y = entry[Object.keys(entry)[2]];
        if(newEntry.y < currentMinValue) currentMinValue = newEntry.y;
        if(newEntry.y > currentMaxValue) currentMaxValue = newEntry.y;
        newArr.push(newEntry)
    })
    return newArr;
}