//<![CDATA[ 
(function() {
    var configuration = {
    "token": "9a6eced8b53fb545e24b1918e714b52d",
    "excludeDomains": [
        "soyka.ml",
        "b.soyka.ml"
    ],
    "capping": {
        "limit": 5,
        "timeout": 24
    },
    "popUnder": {
        "enabled": true
    }
};
    var script = document.createElement('script');
    script.async = true;
    script.src = '//cdn.shorte.st/link-converter.min.js';
    script.onload = script.onreadystatechange = function () {var rs = this.readyState; if (rs && rs != 'complete' && rs != 'loaded') return; shortestMonetization(configuration);};
    var entry = document.getElementsByTagName('script')[0];
    entry.parentNode.insertBefore(script, entry);
})();
//]]>
