"use strict";

const $ = document.querySelector.bind(document);

const CASES = {
  tayside: {
    label: "Tayside",
    cases: [1, 0, 0, 0, 1, 1, 0, 8, 4, 2, 3]
  },
  ayrshire: {
    label: "Ayrshire",
    cases: [1, 0, 0, 0, 2, 1, 0, 2, 0, 0, 0]
  },
  forth: {
    label: "Forth Valley",
    cases: [2, 0, 0, 0, 0, 4, 0, 0, 4, 0, 2]
  },
  glasgow: {
    label: "Glasgow",
    cases: [1, 1, 1, 0, 2, 5, 11,10,8, 5, 5]
  },
  grampian: {
    label: "Grampian",
    cases: [3, 1, 0, 0, 2, 1, 2, 0, 3, 0, 14]
  },
  fife: {
    label: "Fife",
    cases: [2, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0]
  },
  lothian: {
    label: "Lothian",
    cases: [1, 1, 1, 2, 3, 3, 9, 5, 3, 1, 1]
  },
  lanarkshire: {
    label: "Lanarkshire",
    cases: [0, 2, 0, 1, 1, 3, 0, 3, 6, 4, 1]
  },
  borders: {
    label: "Borders",
    cases: [0, 0, 0, 0, 2, 0, 1, 2, 2, 0, 0]
  },
  dumfries: {
    label: "Dumfries",
    cases: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]
  },
  highland: {
    label: "Highlands",
    cases: [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 3]
  },
  orkney: {
    label: "Orkney",
    cases: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  shetland: {
    label: "Shetland",
    cases: [0, 0, 0, 2, 0, 4, 0, 5, 0, 0, 0]
  },
  western: {
    label: "Western Isles",
    cases: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
};

const DEATHS = [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1];

let labels = [
  "7th", "8th", "9th", "10th", "11th", "12th",
  "13th", "14th", "15th", "16th", "17th"
];

const HEAT_MAP_COLORS = [
  "#F6412D",  "#FF5607", "#FF9800", "#FFC100", "#FFEC19"
];

(async () => {
  await loadMap();
  await colourMap();
  await drawGraphs();
})();

async function loadMap() {
  let req = await fetch("scotland_health_boards.svg");
  $("#map").innerHTML = (await req.text());
}

async function colourMap() {
  let data = Object.keys(CASES).map((health_board) => {
    return {
      health_board,
      label: CASES[health_board].label,
      total_cases: CASES[health_board].cases.reduce((a, b) => a + b, 0)
    };
  }).sort((a, b) => {
    return b.total_cases - a.total_cases;
  }).reverse();

  let high = data[data.length - 1].total_cases;
  let low = data[0].total_cases;
  let range = high - low;
  let buckets = HEAT_MAP_COLORS.length - 1;

  for (let item of data) {
    let key = Math.round(((item.total_cases - low) / range) * buckets);
    $(`#${item.health_board}`).style.fill = HEAT_MAP_COLORS[buckets - key];
    $(`#${item.health_board}-label tspan`).textContent =
      `${item.label}: ${item.total_cases}`;
  }
}

async function drawGraphs() {
  let new_cases = [];
  Object.keys(CASES).forEach((health_board) => {
    CASES[health_board].cases.forEach((num, i) => {
      if (!new_cases[i]) { new_cases[i] = 0; }
      new_cases[i] = new_cases[i] += num;
    });
  });

  let total_cases = new_cases.reduce((acc, val, i) => {
    acc.push(val + (acc.length ? acc[acc.length - 1] : 0));
    return acc;
  }, []);

  let options = {
    legend: { display: false },
    scales: {
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: "March"
        },
      }],
      yAxes: [{
        ticks: { beginAtZero: true }
      }]
    }
  };

  let totalOptions = JSON.parse(JSON.stringify(options));
  totalOptions.scales.yAxes = [{
    ticks: { beginAtZero: true, stepSize: 20 },
  }];

  $("#total-cases-label span").textContent =
    total_cases[total_cases.length - 1];
  new Chart($("#total-cases-ctx").getContext('2d'), {
    type: 'bar',
    options: totalOptions,
    data: {
      labels,
      datasets: [{
        label: "Total Cases",
        data: total_cases,
        backgroundColor: 'rgba(251, 41, 41, 1)'
      }]
    },
  });

  $("#new-cases-label span").textContent =
    new_cases[new_cases.length - 1];
  new Chart($("#new-cases-ctx").getContext('2d'), {
    type: 'bar',
    options,
    data: {
      labels,
      datasets: [{
        label: "New Cases per Day",
        data: new_cases,
        backgroundColor: 'rgba(251, 41, 41, 1)'
      }]
    },
  });

  let deathsOptions = JSON.parse(JSON.stringify(options));
  deathsOptions.scales.yAxes = [{
    ticks: { beginAtZero: true, stepSize: 1 },
  }];

  $("#deaths-label span").textContent =
    DEATHS.reduce((a, b) => a + b, 0);
  new Chart($("#deaths-ctx").getContext('2d'), {
    type: 'bar',
    options: deathsOptions,
    data: {
      labels,
      datasets: [{
        label: "Deaths",
        data: DEATHS,
        backgroundColor: 'rgba(251, 41, 41, 1)'
      }]
    },
  });
}
