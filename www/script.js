"use strict";

const $ = document.querySelector.bind(document);

//                                             7  8  9  10 11 12 13
const CASES = {
  tayside: { label: "Tayside",         cases: [1, 0, 0, 0, 1, 1, 0]},
  ayrshire: { label: "Ayrshire",       cases: [1, 0, 0, 0, 2, 1, 0]},
  forth: { label: "Forth Valley",      cases: [2, 0, 0, 0, 0, 4, 0]},
  glasgow: { label: "Glasgow",         cases: [1, 1, 1, 0, 2, 5, 11]},
  grampian: { label: "Grampian",       cases: [3, 1, 0, 0, 2, 1, 4]},
  fife: { label: "Fife",               cases: [2, 0, 0, 0, 0, 1, 1]},
  lothian: { label: "Lothian",         cases: [1, 1, 1, 2, 3, 3, 9]},
  lanarkshire: { label: "Lanarkshire", cases: [0, 2, 0, 1, 1, 3, 0]},
  borders: { label: "Borders",         cases: [0, 0, 0, 0, 2, 0, 1]},
  dumfries: { label: "Dumfries",       cases: [0, 0, 0, 0, 0, 0, 0]},
  highland: { label: "Highlands",      cases: [0, 0, 0, 0, 0, 0, 0]},
  orkney: { label: "Orkney",           cases: [0, 0, 0, 0, 0, 0, 0]},
  shetland: { label: "Sheltand",       cases: [0, 0, 0, 2, 0, 4, 0]},
  western: { label: "Western Isles",   cases: [0, 0, 0, 0, 0, 0, 0]},
};

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

  let labels = ["7th", "8th", "9th", "10th", "11th", "12th", "13th"];
  let options = {
    scales: { yAxes: [{ ticks: { beginAtZero: true } }] }
  };

Chart.defaults.global.legend.display = false;
  $("#total-cases-label span").textContent =
    total_cases[total_cases.length - 1];
  new Chart($("#total-cases-ctx").getContext('2d'), {
    type: 'bar',
    options,
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

}
