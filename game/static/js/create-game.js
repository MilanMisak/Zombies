var ajaxErrorCount = 0;

var updateGameInfo = function() {
    $.getJSON('/ajax-game-info', function(data) {
        ajaxErrorCount = 0;

        var items = [];
        $.each(data[2], function(i, v) {
            items.push('<li>' + v + '</li>');
        });

        $('#player_list').html('<ul>' + items.join('') + '</ul>');
    }).error(function(xhr, status, data) {
        ajaxErrorCount++;
        if (ajaxErrorCount < AJAX_ERROR_ALLOWANCE)
            return;
        ajaxErrorCount = 0;

        showErrorModal(
            'your player has been wiped off the server. ' +
            'Are you experiencing any internet connection issues?',
            '', '/');
    });
};

updateGameInfo();
setInterval(updateGameInfo, 1000);
