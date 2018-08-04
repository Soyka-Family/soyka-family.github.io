var records, intervalId, hours, minutes, stopwatchContent, benEarnings, mattEarnings;
var babysittingDiv = document.getElementById("babysitting");
instance({
    method: "get",
    url: "/Babysitting"
}).then(function(response) {
    records = response.data.records;
    if (!records || records.length === 0) {
        // ********************************
        // NO RECORDS --- SHOW START SCREEN
        // ********************************
        var babysittingStartButton = document.createElement("button");
        babysittingStartButton.innerHTML = "Start Stopwatch";
        babysittingStartButton.setAttribute("onclick", "startBabysittingStopwatch();");
        babysittingDiv.appendChild(babysittingStartButton);
    } else {
        // ************************************************
        // RECORD EXISTS --- SHOW STOPWATCH AND STOP SCREEN
        // ************************************************
        var startedAtDiv = document.createElement("div");
        startedAtDiv.setAttribute("id", "babysittingTimes");
        startedAtDiv.innerHTML = "<b>Started:</b> " + (new Date(records[0].fields["Start Time"]));
        babysittingDiv.appendChild(startedAtDiv);
        babysittingDiv.appendChild(document.createElement("br"));
        var stopwatchDiv = document.createElement("div");
        stopwatchDiv.setAttribute("id", "stopwatch");
        babysittingDiv.appendChild(stopwatchDiv);
        var stopwatchEndButton = document.createElement("button");
        stopwatchEndButton.setAttribute("onclick", "endBabysittingStopwatch();");
        stopwatchEndButton.setAttribute("id", "stopwatchEndButton");
        stopwatchEndButton.innerHTML = "End Stopwatch";
        babysittingDiv.appendChild(document.createElement("br"));
        babysittingDiv.appendChild(stopwatchEndButton);
        intervalId = setInterval(function() {
            var milliseconds = parseInt((new Date()) - (new Date(records[0].fields["Start Time"])));
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
            }
            stopwatchDiv.innerHTML = "<b>Time Elapsed</b>: " + stopwatchContent;
        }, 1000);
    }
});

function startBabysittingStopwatch() {
    instance({
        method: "post",
        url: "/Babysitting",
        data: {
            "fields": {
                "Start Time": (new Date()).toISOString()
            }
        }
    }).then(function(response) {
        location.reload();
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
    instance({
        method: "get",
        url: "/Babysitting"
    }).then(function(response) {
        // Remove first and only record
        instance({
            method: "delete",
            url: "/Babysitting/" + response.data.records[0].id
        });
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
    earningsDiv.innerHTML = "<b>Ben's Earnings</b>: $" + benEarnings + "<br><br><b>Matt's Earnings</b>: $" + mattEarnings + "<br><br><button onclick='addEarnings();'>Add to IOU</button>";
    babysittingDiv.appendChild(earningsDiv);
}

function addEarnings() {
    function getBenBalance() {
        return instance({
            method: "get",
            url: "/IOU/reczNIYdM2ZGEmWEM"
        });
    }

    function getMattBalance() {
        return instance({
            method: "get",
            url: "/IOU/recjcKmBpxMZtgDrW"
        });
    }
    axios.all([getBenBalance(), getMattBalance()]).then(axios.spread(function(benBalanceResponse, mattBalanceResponse) {
        var newBenBalance = parseFloat(benBalanceResponse.data.fields.Balance) + parseFloat(benEarnings);
        var newMattBalance = parseFloat(mattBalanceResponse.data.fields.Balance) + parseFloat(mattEarnings);

        function updateBenBalance() {
            return instance({
                method: "patch",
                url: "/IOU/reczNIYdM2ZGEmWEM",
                data: {
                    "fields": {
                        "Balance": newBenBalance
                    }
                }
            });
        }

        function updateMattBalance() {
            return instance({
                method: "patch",
                url: "/IOU/recjcKmBpxMZtgDrW",
                data: {
                    "fields": {
                        "Balance": newMattBalance
                    }
                }
            });
        }
        axios.all([updateBenBalance(), updateMattBalance()]).then(axios.spread(function(benBalanceUpdateResponse, mattBalanceUpdateResponse) {
            location.reload();
        }));
    }));
}
