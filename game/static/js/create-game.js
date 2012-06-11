var AJAX_ERROR_ALLOWANCE = 10; // Keep in sync with models.py setting
var ajaxErrorCount = 0;

var updateGameInfo = function() {
    $.getJSON('/ajax-game-info', function(data) {
        ajaxErrorCount = 0;

        var items = [];
        $.each(data[2], function(key, val) {
            items.push('<li>' + val + '</li>');
        });

        $('#player_list').html('<ul>' + items.join('') + '</ul>');
    }).error(function(xhr, status, data) {
        ajaxErrorCount++;
        if (ajaxErrorCount < AJAX_ERROR_ALLOWANCE)
            return;
        ajaxErrorCount = 0;

        if (errorModalShown)
            return;
        errorModalShown = true;

        $('#error_modal').on('hide', function() {
            window.location.replace('/');
        });
        $('#error_modal').modal('show');
    });
};

updateGameInfo();
setInterval(updateGameInfo, 1000);
