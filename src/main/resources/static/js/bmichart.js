function switchToBMIChart(){
    chartEl.style.display = "none";
    BMIChartEl.style.display = "block";
        chartData.forEach((data) => {
            data.y = data.y/Math.pow((customer.height/100), 2);
        });
console.log(chartData);
    const buttons = document.getElementById('buttons');
    buttons.style.display = "none";

    let chart2 = new Chart(
            BMIChartEl,
            {
                type: 'line',
                //Plugin to draw weight target line on chart
                plugins: [],
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
            }
        );

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

    chart2.options.plugins.backgrounds = {
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

    chart2.config.plugins.push(ColouredBgPlugin);
    chart2.options.scales.y.min = 15;
    chart2.options.scales.y.max = 40;
    console.log(chart2)
    chart2.update();
}

function revertToNormalChart(){
        BMIChartEl.style.display = "none";
        chartEl.style.display = "block";
}