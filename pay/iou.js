var currentBalances = {};
var table = document.getElementById("currentBalances");

function bodyLoaded() {
    instance({
        method: "get",
        url: "/IOU"
    }).then(function (response) {
        response.data.records.forEach(function (record) {
            currentBalances[record.fields.Relationship] = {
                balance: record.fields.Balance,
                id: record.id,
                quickActions: JSON.parse(record.fields["Quick Actions"])
            };
        });
        for (var relationship in currentBalances) {
            var relationshipBalanceElement = document.createElement("tr");
            var relationshipDisplayElement = document.createElement("td");
            relationshipDisplayElement.innerHTML = relationship;
            relationshipBalanceElement.appendChild(relationshipDisplayElement);
            var balanceDisplayElement = document.createElement("td");
            balanceDisplayElement.innerHTML = "$" + currentBalances[relationship].balance.toLocaleString(undefined, {
                minimumFractionDigits: 2
            });
            relationshipBalanceElement.appendChild(balanceDisplayElement);
            var updateElement = document.createElement("td");
            var updateInput = document.createElement("input");
            updateInput.setAttribute("size", "5");
            updateInput.setAttribute("id", "UPDATEINPUT" + currentBalances[relationship].id);
            updateElement.setAttribute("class", "permEdit");
            updateElement.appendChild(updateInput);
            var updateSpacingElement = document.createElement("span");
            updateSpacingElement.innerHTML = "&nbsp;";
            updateElement.appendChild(updateSpacingElement);
            var updateButton = document.createElement("button");
            updateButton.innerHTML = "Update";
            updateButton.setAttribute("onclick", "updateDatabase('UPDATEINPUT" + currentBalances[relationship].id + "', document.getElementById('UPDATEINPUT" + currentBalances[relationship].id + "').value);");
            updateElement.appendChild(updateButton);
            relationshipBalanceElement.appendChild(updateElement);
            // --------------------------------------------------------
            var quickUpdateElement = document.createElement("td");
            quickUpdateElement.setAttribute("class", "permEdit");
            var quickUpdateSpacingElement = document.createElement("span");
            quickUpdateSpacingElement.innerHTML = "&nbsp;";
            quickUpdateElement.appendChild(quickUpdateSpacingElement);
            for (var quickTitle in currentBalances[relationship].quickActions) {
                var quickUpdateButton = document.createElement("button");
                quickUpdateButton.innerHTML = quickTitle;
                quickUpdateButton.setAttribute("onclick", "updateDatabase('UPDATEINPUT" + currentBalances[relationship].id + "', " + currentBalances[relationship].quickActions[quickTitle] + ");");
                quickUpdateElement.appendChild(quickUpdateButton);
            }
            relationshipBalanceElement.appendChild(quickUpdateElement);
            // --------------------------------------------------------
            relationshipBalanceElement.setAttribute("data-record-id", currentBalances[relationship].id);
            relationshipBalanceElement.setAttribute("data-record-balance", currentBalances[relationship].balance);
            table.appendChild(relationshipBalanceElement);
        }
    });
}

function updateDatabase(inputId, amountToAdd) {
    var inputElement = document.getElementById(inputId);
    var recordId = inputElement.parentElement.parentElement.getAttribute("data-record-id");
    var currentBalance = parseFloat(inputElement.parentElement.parentElement.getAttribute("data-record-balance"));
    var newBalance = currentBalance + parseFloat(amountToAdd);
    instance({
        method: "patch",
        url: "/IOU/" + recordId,
        data: {
            "fields": {
                "Balance": newBalance
            }
        }
    }).then(function (response) {
        location.reload();
    });
}
