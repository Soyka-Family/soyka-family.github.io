var records, intervalId, hours, minutes, stopwatchContent, benEarnings, mattEarnings;
var babysittingDiv = document.getElementById("babysitting");

function reloadBabysitting() {
    db.collection("babysitting").get().then(function (response) {
        babysittingDiv.innerHTML = "";
        records = response.docs;
        console.log(records);
        if (records.length == 0) {
            // ********************************
            // NO RECORDS --- SHOW START SCREEN
            // ********************************
            var babysittingStartButton = document.createElement("button");
            babysittingStartButton.innerHTML = "Start Stopwatch";
            babysittingStartButton.setAttribute("onclick", "startBabysittingStopwatch();");
            babysittingStartButton.setAttribute("class", "permBabysit btn btn-outline-primary");
            babysittingDiv.appendChild(babysittingStartButton);
        } else {
            // ************************************************
            // RECORD EXISTS --- SHOW STOPWATCH AND STOP SCREEN
            // ************************************************
            var startedAtDiv = document.createElement("div");
            startedAtDiv.setAttribute("id", "babysittingTimes");
            startedAtDiv.innerHTML = "<b>Started:</b> " + (records[0].data().started.toDate());
            babysittingDiv.appendChild(startedAtDiv);
            babysittingDiv.appendChild(document.createElement("br"));
            var stopwatchDiv = document.createElement("div");
            stopwatchDiv.setAttribute("id", "stopwatch");
            babysittingDiv.appendChild(stopwatchDiv);
            var stopwatchEndButton = document.createElement("button");
            stopwatchEndButton.setAttribute("onclick", "endBabysittingStopwatch();");
            stopwatchEndButton.setAttribute("id", "stopwatchEndButton");
            stopwatchEndButton.setAttribute("class", "btn btn-outline-primary");
            stopwatchEndButton.innerHTML = "End Stopwatch";
            babysittingDiv.appendChild(document.createElement("br"));
            babysittingDiv.appendChild(stopwatchEndButton);
            var earningsDiv = document.createElement("div");
            babysittingDiv.appendChild(earningsDiv);
            intervalId = setInterval(function () {
                var milliseconds = parseInt((new Date()) - (records[0].data().started.toDate()));
                minutes = Math.floor(milliseconds / 60000);
                stopwatchContent = minutes + "min";
                if (minutes >= 60) {
                    // Need to include hours
                    hours = Math.floor(minutes / 60);
                    minutes = minutes % 60;
                    if (minutes != hours * 60) {
                        stopwatchContent = hours + "hr " + minutes + "min";
                        if (hours > 1) {
                            stopwatchContent = hours + "hrs " + minutes + "min";
                        }
                    } else {
                        stopwatchContent = hours + "hr";
                        if (hours > 1) {
                            stopwatchContent = hours + "hrs";
                        }
                    }
                } else {
                    hours = 0;
                }
                stopwatchDiv.innerHTML = "<b>Time Elapsed</b>: " + stopwatchContent;
                // Calculate earnings per person
                var totalHours = hours + (minutes / 60);
                benEarnings = (totalHours * 5).toFixed(2);
                mattEarnings = (totalHours * 1).toFixed(2);
                earningsDiv.innerHTML = "<b>Ben's Earnings</b>: $" + benEarnings + "<br><br><b>Matt's Earnings</b>: $" + mattEarnings;
            }, 1000);
        }
    });
}
reloadBabysitting();

function startBabysittingStopwatch() {
    db.collection("babysitting").add({
        started: firebase.firestore.Timestamp.fromDate(new Date())
    }).then(function (response) {
        reloadBabysitting();
    });
}

function endBabysittingStopwatch() {
    // Get element with start time
    var timesElement = document.getElementById("babysittingTimes");
    // Add end time
    timesElement.innerHTML = timesElement.innerHTML + "<br><br><b>Ended</b>: " + (new Date());
    // End stopwatch interval
    clearInterval(intervalId);
    // Remove stopwatch end button
    document.getElementById("stopwatchEndButton").parentElement.removeChild(document.getElementById("stopwatchEndButton"));
    // Get AIrtable record list
    db.collection("babysitting").get().then(function (response) {
        // Remove first and only record
        db.collection("babysitting").doc(response.docs[0].id).delete();
    });
    // Calculate earnings per person
    var totalHours = hours + (minutes / 60);
    benEarnings = (totalHours * 5).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    mattEarnings = (totalHours * 1).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    var earningsDiv = document.createElement("div");
    earningsDiv.innerHTML = "<b>Ben's Earnings</b>: $" + benEarnings + "<br><br><b>Matt's Earnings</b>: $" + mattEarnings + "<br><br><button onclick='addEarnings();' class='permEdit btn btn-outline-primary'>Add to IOU</button>";
    babysittingDiv.appendChild(earningsDiv);
}

function addEarnings() {
    db.collection("users").doc("jQmILFjXMVNUHpVBlJ420c3aNp43").update({
        balance: firebase.firestore.FieldValue.increment(parseFloat(benEarnings))
    }).then(function () {
        db.collection("users").doc("j3CMDV2x1UUPERcsPs4nIXOkZMD2").update({
            balance: firebase.firestore.FieldValue.increment(parseFloat(mattEarnings))
        }).then(function () {
            reloadBabysitting();
        });
    });
}
