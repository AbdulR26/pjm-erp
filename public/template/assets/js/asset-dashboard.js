$("#bulan").on("change", function() {
    var bulan = $(this).val();
    fetData(bulan);
});
var defaultMonth = $('#bulan').val();
    fetData(defaultMonth);
console.log(defaultMonth);


function fetData(bulan)
{{
    $.ajax({
        url : '/data',
        type : 'POST',
        data: { 
            bulan: bulan, 
            _token: $('meta[name="csrf-token"]').attr('content') },
        dataType: 'json',
            success: function(response) {
                var balitaData = response.balitaData;
                var ibuHamilData = response.ibuHamilData;
                var lansiaData = response.lansiaData;
                var months = response.months;

                $(".balita-count").text(response.jumlahBalita);
                $(".ibuhamil-count").text(response.jumlahIbuHamil);
                $(".lansia-count").text(response.jumlahLansia);

                var monthLabels = Object.values(months);
                var balitaCounts = monthLabels.map((_, index) => balitaData[index + 1] || 0);
                var ibuHamilCounts = monthLabels.map((_, index) => ibuHamilData[index + 1] || 0);
                var lansiaCounts = monthLabels.map((_, index) => lansiaData[index + 1] || 0);

                console.log( monthLabels, balitaCounts);
                updateChart(monthLabels, balitaCounts, ibuHamilCounts, lansiaCounts);
            }
    });
}

function updateChart(labels, balitaData, ibuHamilData, lansiaData) 
{
    const blueColor = 'rgba(0, 123, 255, 0.5)';
    const successColorShade = 'rgba(40, 167, 69, 0.5)';
    const lineChartDanger = 'rgba(220, 53, 69, 0.5)';
    const tooltipShadow = 'rgba(0, 0, 0, 0.2)';
    const grid_line_color = 'rgba(200, 200, 200, 0.2)';
    const labelColor = '#6c757d';

    const ctx = document.getElementById('lineAreaChartEx').getContext('2d');
    if (window.myChart) {
        window.myChart.destroy();
    }
    window.myChart = new Chart(ctx, {
        type: 'line',
        plugins: [
            {
                beforeInit: function (chart) {
                    chart.legend.afterFit = function () {
                        this.height += 20;
                    };
                }
            }
        ],
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                position: 'top',
                align: 'start',
                labels: {
                    usePointStyle: true,
                    padding: 25,
                    boxWidth: 9
                }
            },
            layout: {
                padding: {
                    top: -20,
                    bottom: -20,
                    left: -20
                }
            },
            tooltips: {
                shadowOffsetX: 1,
                shadowOffsetY: 1,
                shadowBlur: 8,
                shadowColor: tooltipShadow,
                backgroundColor: window.colors.solid.white,
                titleFontColor: window.colors.solid.black,
                bodyFontColor: window.colors.solid.black
            },
            scales: {
                xAxes: [
                    {
                        display: true,
                        gridLines: {
                            color: 'transparent',
                            zeroLineColor: grid_line_color
                        },
                        scaleLabel: {
                            display: true
                        },
                        ticks: {
                            fontColor: labelColor
                        }
                    }
                ],
                yAxes: [
                    {
                        display: true,
                        gridLines: {
                            color: 'transparent',
                            zeroLineColor: grid_line_color
                        },
                        ticks: {
                            stepSize: 100,
                            min: 0,
                            max: 400,
                            fontColor: labelColor
                        },
                        scaleLabel: {
                            display: true
                        }
                    }
                ]
            }
        },
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Balita',
                    data: balitaData,
                    lineTension: 0,
                    backgroundColor: blueColor,
                    pointStyle: 'circle',
                    borderColor: 'transparent',
                    pointRadius: 0.5,
                    pointHoverRadius: 5,
                    pointHoverBorderWidth: 5,
                    pointBorderColor: 'transparent',
                    pointHoverBackgroundColor: blueColor,
                    pointHoverBorderColor: window.colors.solid.white
                },
                {
                    label: 'Ibu Hamil',
                    data: ibuHamilData,
                    lineTension: 0,
                    backgroundColor: successColorShade,
                    pointStyle: 'circle',
                    borderColor: 'transparent',
                    pointRadius: 0.5,
                    pointHoverRadius: 5,
                    pointHoverBorderWidth: 5,
                    pointBorderColor: 'transparent',
                    pointHoverBackgroundColor: successColorShade,
                    pointHoverBorderColor: window.colors.solid.white
                },
                {
                    label: 'Lansia',
                    data: lansiaData,
                    lineTension: 0,
                    backgroundColor: lineChartDanger,
                    pointStyle: 'circle',
                    borderColor: 'transparent',
                    pointRadius: 0.5,
                    pointHoverRadius: 5,
                    pointHoverBorderWidth: 5,
                    pointBorderColor: 'transparent',
                    pointHoverBackgroundColor: lineChartDanger,
                    pointHoverBorderColor: window.colors.solid.white
                }
            ]
        }
    });
}

}