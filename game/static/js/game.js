$(document).ready(function() {
    var updateGameInfo = function() {
        $.getJSON('/ajax-game-info', function(data) {
        }).error(function(xhr, status, data) {
        });
    };

    updateGameInfo();
    setInterval(updateGameInfo, 1000);
});
