
/* ***** CHARTS ***** */

/**
 *
 * @param DOMElement DomElement
 * @param temperatures array
 */
export function displayChartTemp(DOMElement, temperatures) {
    oneLineChart(DOMElement, temperatures, 'Températures (C°)');
}

/**
 *
 * @param DOMElement DomElement
 * @param windspeed array
 * @param windgusts array
 */
export function displayChartWinds(DOMElement, windspeed, windgusts) {
    // console.log(DOMElement);
    twoLineChart(DOMElement, windspeed, 'Vents (km/h)', windgusts, 'Rafales (km/h)');
}

/**
 *
 * @param DOMElement DomElement
 * @param humidity array
 */
export function displayChartHumidity(DOMElement, humidity) {
    oneLineChart(DOMElement, humidity, 'Humidité (%)');
}

/**
 *
 * @param DOMElement DomElement
 * @param cloudcover array
 */
export function displayChartCloudcover(DOMElement, cloudcover) {
    oneLineChart(DOMElement, cloudcover, 'Couverture nuageuse (%)');
}

const TIME_ARRAY = ['0h', '', '2h', '', '4h', '', '6h', '', '8h', '', '10h', '', '12h', '', '14h', '', '16h', '', '18h', '', '20h', '', '22h', ''];
const COLOR_GRID = "#8d8d8d";
const COLOR_WHITE = "#201f1f";

function oneLineChart(DOMelement, data, label) {
    new Chart(DOMelement, {
        type: 'line',
        data: {
            labels: TIME_ARRAY,
            datasets: [{
                label: label,
                data: data,
                borderWidth: 1,
                tension: 0.3,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: COLOR_GRID,
                        borderColor: 'white'
                    },
                    ticks: {
                        color: COLOR_WHITE
                    }
                },
                x: {
                    ticks: {
                        color: COLOR_WHITE
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: COLOR_WHITE
                    }
                },
            }
        }
    });
}

function twoLineChart(DOMelement, data1, label1, data2, label2) {
    new Chart(DOMelement, {
        type: 'line',
        data: {
            labels: TIME_ARRAY,
            datasets: [{
                label: label1,
                data: data1,
                borderWidth: 1,
                tension: 0.3
            },
                {
                    label: label2,
                    data: data2,
                    borderWidth: 1,
                    tension: 0.3
                }],

        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: COLOR_GRID,
                        borderColor: COLOR_WHITE
                    },
                    ticks: {
                        color: COLOR_WHITE
                    }
                },
                x: {
                    ticks: {
                        color: COLOR_WHITE
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: COLOR_WHITE
                    }
                },
            }
        }
    });
}


/**
 * this function resize all charts (with fixes values) because :
 * https://www.chartjs.org/docs/latest/configuration/responsive.html
 */
export function resizeChart(elContentChart, allCanvas) {
    if (window.matchMedia("(min-width: 950px)").matches) {
        const contentChartWidth = elContentChart.offsetWidth;
        const contentChartHeight = elContentChart.offsetHeight;

        allCanvas.forEach(function (canvas) {
            const marginBottomParent = parseInt(window.getComputedStyle(canvas.parentNode).marginBottom);
            const marginLeftParent = parseInt(window.getComputedStyle(canvas.parentNode).marginLeft);
            const marginRightParent = parseInt(window.getComputedStyle(canvas.parentNode).marginRight);

            const height = (contentChartHeight / 2) - marginBottomParent;//ok
            const width = (contentChartWidth / 2) - (marginLeftParent + marginRightParent);

            canvas.style.width = `${width}px`; //440px
            canvas.style.height = `${height}px`; //270px
        });
    }
}
