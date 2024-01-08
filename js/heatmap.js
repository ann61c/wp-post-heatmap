const chartDom = document.getElementById('heatmap');
const myChart = echarts.init(chartDom);
window.onresize = function () {
    myChart.resize();
};

let option;
const dataMap = new Map();

heatmapData.forEach(function(post) {
    const key = post.date; // Date of the post
    const value = dataMap.get(key);
    const wordCount = (post.word_count / 1000).toFixed(2);// Word count of the post
    const link = post.url; // URL of the post
    const title = post.title; // Title of the post
    console.log(key, value, wordCount, link, title)

    // In the case of multiple articles on the same day, prefer the one with more words.
    if (value == null || wordCount > value.wordCount) {
        dataMap.set(key, {wordCount, link, title});
    }
});

const data = [];
for (const [key, value] of dataMap.entries()) {
    data.push([key, value.wordCount]);
}


let startDate = new Date();
const year_Mill = startDate.setFullYear((startDate.getFullYear() - 1));
startDate = +new Date(year_Mill);
let endDate = +new Date();

const dayTime = 3600 * 24 * 1000;
startDate = echarts.format.formatTime('yyyy-MM-dd', startDate);
endDate = echarts.format.formatTime('yyyy-MM-dd', endDate);

// change date range according to months we want to render
function heatmap_width(months) {
    let startDate = new Date();
    const mill = startDate.setMonth((startDate.getMonth() - months));
    let endDate = +new Date();
    startDate = +new Date(mill);

    endDate = echarts.format.formatTime('yyyy-MM-dd', endDate);
    startDate = echarts.format.formatTime('yyyy-MM-dd', startDate);

    const showmonth = [];
    showmonth.push([
        startDate,
        endDate
    ]);
    return showmonth
}

function getRangeArr() {
    const windowWidth = window.innerWidth;
    if (windowWidth >= 600) {
        return heatmap_width(12);
    } else if (windowWidth >= 400) {
        return heatmap_width(9);
    } else {
        return heatmap_width(6);
    }
}

option = {
    title: {
        top: 0,
        left: 'center',
        text: '博客废话产量'
    },
    tooltip: {
        formatter: function (p) {
            const post = dataMap.get(p.data[0]);
            return post.title + ' | ' + post.wordCount + ' 千字';
        }
    },
    visualMap: {
        min: 0,
        max: 10,
        type: 'piecewise',
        orient: 'horizontal',
        left: 'center',
        top: 30,

        inRange: {
            //  [floor color, ceiling color]
            color: ['#7aa8744c', '#7AA874']
        },
        splitNumber: 4,
        text: ['千字', ''],
        showLabel: true,
        itemGap: 20,
    },
    calendar: {
        top: 80,
        left: 20,
        right: 4,
        cellSize: ['auto', 12],
        range: getRangeArr(),
        itemStyle: {
            color: '#F1F1F1',
            borderWidth: 2.5,
            borderColor: '#fff',
        },
        yearLabel: { show: false },
        // the splitline between months. set to transparent for now.
        splitLine: {
            lineStyle: {
                color: 'rgba(0, 0, 0, 0.0)',
                // shadowColor: 'rgba(0, 0, 0, 0.5)',
                // shadowBlur: 5,
                // width: 0.5,
                // type: 'dashed',
            }
        }
    },
    series: {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: data,
    }
};

myChart.setOption(option);

myChart.on('click', function (params) {
    if (params.componentType === 'series') {
        const post = dataMap.get(params.data[0]);
        window.open(post.link, '_blank').focus();
    }
});