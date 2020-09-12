let xhr = new XMLHttpRequest();
let today = new Date().toISOString().substr(0, 10).replace("-", "").replace("-", "");// date to yyyymmdd
let id_model = '59';
let initstr = "";

let weekDayNum = new Date().getDay(); // get number of week day
let monthDayNum = new Date().getDate(); // get day of month
let year = new Date().getFullYear(); // get year
let minutes = new Date().getMinutes();
let hours = new Date().getHours();

if (minutes < 10) {
    minutes = "0" + "" + minutes;
}
if (hours < 10) {
    hours = "0" + "" + hours;
}

let timeNow = +(hours + "" + minutes);

if (timeNow >= 2030 || timeNow < 0830) { // if time more then 20:30, or less then 8:30
    initstr = today + "12";
} else {
    initstr = today + "00";
}

let sevenDays = getSevenDays(weekDayNum);// get seven days arr
let tableHead = getDaysTr(sevenDays, monthDayNum); // get table header
let findFlag = false;
let intervalFlag = false;
let interval = 1;

function startIntervalRequest() {
    interval = document.getElementById("interval").value;
    document.getElementById("interval-form").style = "display: none";
    intervalFlag = true;
}

if (interval !== "" && interval !== null && interval !== undefined && intervalFlag !== false) {

    setInterval(() => { // interval data analysis 
        $.get({
            url: "https://www.windguru.cz/int/iapi.php?q=forecast&id_model=" + id_model + "&initstr=" + initstr + "&id_spot=87721",
            dataType: 'jsonp',
            success: function (data) {
                let find_data = find(data.fcst);
                if (localStorage.getItem("data") !== find_data ) {
                    if (find(data.fcst).length > 0) {
                        let matched_table = createTableOfMatchedElements(find_data);
                        document.getElementById('matched-table').innerHTML = matched_table; // filling out table
                        localStorage.setItem("data", JSON.stringify(find_data));
                        sendMail(matched_table); // send notifycation
                    }
                }
                document.getElementById("table").innerHTML = tableHead + createWeatherTableBody(data.fcst);// filling out weather table
            },
            error: function () {
                alert("Error");
            }
        });
    }, interval * 3600000);

}


function sendMail(text) {
    let reciever = document.getElementById("reciever").value; // reciever

    if (reciever.indexOf(',') > -1) {
        reciever = reciever.replace(/\s+/g, '');

        xhr.open("POST", "/sendMail");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify({ reciever: reciever, text: text}));

    } else {

        xhr.open("POST", "/sendMail");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify({ reciever: reciever, text: text}));
    }
}

function find(data) { //find matched data

    let daysObjsArr = getDayObjsArr(sevenDays, data, monthDayNum); // get all days-hours objects with their data
    let matchedElements = findMatchingData(daysObjsArr); // find matching days-hours objects

    return matchedElements;
}

function createWeatherTableBody(data) {
    let resHtml = "";// table body
    let limiter = 49; // seven days limit 

    //WINDDIR and WINDSPD from fcst object
    let windDirRow = "<tr><td style ='border: 1px solid black;'> Wind Direction (°) </td>"; // table row for wind direction 
    let windSpdRow = "<tr><td style ='border: 1px solid black;'> Wind Speed (m/s) </td>";// table row for wind speed 
    let windGustRow = "<tr><td style ='border: 1px solid black;'> Wind Gust (m/s) </td>";// table row for wind gust 
    let temperatureRow = "<tr><td style ='border: 1px solid black;'> Temperature (°C) </td>";// table row for temperature
    let rainfallRow = "<tr><td style ='border: 1px solid black;'> Rainfall (mm/3h) </td>";// table row for rainfall

    data.WINDDIR.forEach((el, i) => { // loop for wind direction row
        if (i < limiter) {
            windDirRow += "<td style ='border: 1px solid black;'>" + el + "</td>";
        }
    }); 

    data.WINDSPD.forEach((el, i) => { // loop for wind speed row
        if (i < limiter) {
            windSpdRow += "<td style ='border: 1px solid black;'>" + (el * 0.51444444444).toFixed(2) + "</td>";
        }
    });
    
    data.GUST.forEach((el, i) => { // loop for wind gust row
        if (i < limiter) {
            windGustRow += "<td style ='border: 1px solid black;'>" + (el * 0.51444444444).toFixed(2) + "</td>";
        }
    });

    data.TMPE.forEach((el, i) => { // loop for wind speed row
        if (i < limiter) {
            temperatureRow += "<td style ='border: 1px solid black;'>" + el + "</td>";
        }
    });

    data.APCP.forEach((el, i) => { // loop for wind speed row
        if (i < limiter) {
            if (el === null) {
                el = 0;
                rainfallRow += "<td style ='border: 1px solid black;'>" + el + "</td>";
            }
            else {
                rainfallRow += "<td style ='border: 1px solid black;'>" + el + "</td>";
            }

        }
    });

    // closing rows
    windDirRow += "</tr>";
    windSpdRow += "</tr>";
    windGustRow += "</tr>";
    temperatureRow += "</tr>";
    rainfallRow += "</tr>";

    //enter data to result html
    resHtml += windDirRow;
    resHtml += windSpdRow;
    resHtml += windGustRow;
    resHtml += temperatureRow;
    resHtml += rainfallRow;
    return resHtml;
}

function getSevenDays(weekDayNum) {
    let week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let sevenDays = [];// arr for days

    if (weekDayNum > 0) {
        for (let k = weekDayNum; k < week.length; k++) {
            sevenDays.push(week[k]);
        }
        for (let i = 0; i < weekDayNum; i++) {
            sevenDays.push(week[i]);
        }
    }
    else {
        for (let i = weekDayNum; i < week.length; i++) {
            sevenDays.push(week[i]);
        }
    }
    return sevenDays;
}

function getDaysTr(sevenDays, monthDayNum) { //form days table row for weather table
    let daysTr = "<tr><td style ='border: 1px solid black;'></td>";

    sevenDays.forEach(day => {
        let startHour = 0; // table td hour starts from 0
        for (let i = 0; i < 7; i++) {
            startHour += 3;
            if (startHour < 10) {
                daysTr += "<td style ='border: 1px solid black;'>" + monthDayNum + " " + day + " " + "0" + startHour + "h</td>";
            } else {
                daysTr += "<td style ='border: 1px solid black;'>" + monthDayNum + " " + day + " " + startHour + "h</td>";
            }

        }
        monthDayNum++;
    });
    daysTr += '</tr>';
    return daysTr;
}

function getDayObjsArr(sevenDays, data, monthDayNum) { // get all day-hours data from request

    let daysObjsArr = []; // the array for days with data
    let k = 0;

    sevenDays.forEach(day => {
        let startHour = 0; // table td hour starts from 0

        for (let i = 0; i < 7; i++) {
            startHour += 3;

            //translating knots to m/s
            data.WINDSPD[k] = (data.WINDSPD[k] * 0.51444444444).toFixed(2);
            data.GUST[k] = (data.GUST[k] * 0.51444444444).toFixed(2); 

            if (data.APCP[k] === null) {
                data.APCP[k] = 0;

                if (startHour < 10) {
                    daysObjsArr.push({ date: monthDayNum, day: day, hour: "0" + startHour, windspd: data.WINDSPD[k], gust: data.GUST[k], winddir: data.WINDDIR[k], temperature: data.TMPE[k], rainfall: data.APCP[k] })
                } else {
                    daysObjsArr.push({ date: monthDayNum, day: day, hour: startHour, windspd: data.WINDSPD[k], gust: data.GUST[k], winddir: data.WINDDIR[k], temperature: data.TMPE[k], rainfall: data.APCP[k] })
                }
            }
            else {

                if (startHour < 10) {
                    daysObjsArr.push({ date: monthDayNum, day: day, hour: "0" + startHour, windspd: data.WINDSPD[k], gust: data.GUST[k], winddir: data.WINDDIR[k], temperature: data.TMPE[k], rainfall: data.APCP[k] })
                } else {
                    daysObjsArr.push({ date: monthDayNum, day: day, hour: startHour, windspd: data.WINDSPD[k], gust: data.GUST[k], winddir: data.WINDDIR[k], temperature: data.TMPE[k], rainfall: data.APCP[k] })
                }
            }
            k++;
        }
        monthDayNum++;
    });
    return daysObjsArr;
}

function findMatchingData(daysObjsArr) {
    let startHour = document.getElementById("startHour").value;
    let endHour = document.getElementById("endHour").value;
    let startWINDSPD = document.getElementById("startWINDSPD").value;
    let endWINDSPD = document.getElementById("endWINDSPD").value;
    let startWINDGUST = document.getElementById("startWINDGUST").value;
    let endWINDGUST = document.getElementById("endWINDGUST").value;
    let startWINDDIR = document.getElementById("startWINDDIR").value;
    let endWINDDIR = document.getElementById("endWINDDIR").value;
    let startTMPE = document.getElementById("startTMPE").value;
    let endTMPE = document.getElementById("endTMPE").value;
    let startRainfall = document.getElementById("startRainfall").value;
    let endRainfall = document.getElementById("endRainfall").value;

    let matchedElements = [];

    daysObjsArr.forEach(el => {
        if (el.windspd >= startWINDSPD && el.windspd <= endWINDSPD) {
            if (el.winddir >= startWINDDIR && el.winddir <= endWINDDIR) {
                if (el.temperature >= startTMPE && el.temperature <= endTMPE) {
                    if (el.rainfall >= startRainfall && el.rainfall <= endRainfall) {
                        if (+el.hour >= startHour && +el.hour <= endHour) {
                            if(el.gust >= startWINDGUST && el.gust <= endWINDGUST){
                                matchedElements.push(el);
                            }
                        }
                    }
                }

            }
        }
    });
    return matchedElements;
}

function createTableOfMatchedElements(matchedElements) {
    let resHtml = "";// table body

    let daysTr = "<tr><td style ='border: 1px solid #000000;'></td>";
    let windDirRow = "<tr><td style ='border: 1px solid black;'> Wind Direction (°) </td>"; // table row for wind direction 
    let windSpdRow = "<tr><td style ='border: 1px solid black;'> Wind Speed (m/s) </td>";// table row for wind speed 
    let windGustRow = "<tr><td style ='border: 1px solid black;'> Wind Gust (m/s) </td>";// table row for wind gust 
    let temperatureRow = "<tr><td style ='border: 1px solid black;'> Temperature (°C) </td>";// table row for temperature
    let rainfallRow = "<tr><td style ='border: 1px solid black;'> Rainfall (mm/3h) </td>";// table row for rainfall 

    matchedElements.forEach(el => {
        daysTr += "<td style ='border: 1px solid black;'>" + el.date + " " + el.day + " " + el.hour + "h</td>";
        windDirRow += "<td style ='border: 1px solid black;'>" + el.winddir + "</td>";
        windSpdRow += "<td style ='border: 1px solid black;'>" + el.windspd + "</td>";
        windGustRow += "<td style ='border: 1px solid black;'>" + el.gust + "</td>";
        temperatureRow += "<td style ='border: 1px solid black;'>" + el.temperature + "</td>";
        rainfallRow += "<td style ='border: 1px solid black;'>" + el.rainfall + "</td>";
    });

    // closing rows
    daysTr += "</tr>";
    windDirRow += "</tr>";
    windSpdRow += "</tr>";
    windGustRow += "</tr>";
    temperatureRow += "</tr>";
    rainfallRow += "</tr>";

    //enter data to result html
    resHtml += daysTr;
    resHtml += windDirRow;
    resHtml += windSpdRow;
    resHtml += windGustRow;
    resHtml += temperatureRow;
    resHtml += rainfallRow;
    return resHtml;
}
