var instructionsModalShown = false;
var errorModalShown = false;

var AJAX_ERROR_ALLOWANCE = 10; // Keep in sync with models.py setting
var ajaxErrorCount = 0;

var updateGameInfo = function() {
    $.getJSON('/ajax-game-info', function(data) {
        ajaxErrorCount = 0;
    }).error(function(xhr, status, data) {
        ajaxErrorCount++;
        if (ajaxErrorCount < AJAX_ERROR_ALLOWANCE)
            return;
        ajaxErrorCount = 0;

        if (errorModalShown)
            return;
        errorModalShown = true;

        if (instructionsModalShown) {
            $('#instructions_modal').modal('hide');
        }

        if ('NO-GAME' === xhr.responseText) {
            $('#error_reason').html('the game was cancelled.');
        } else {
            $('#error_reason').html('your player has been wiped off the server. ' +
                'Are you experiencing any internet connection issues?');
        }

        $('#error_modal').on('hide', function() {
            window.location.replace('/');
        });
        $('#error_modal').modal('show');
    });
};

updateGameInfo();
setInterval(updateGameInfo, 1000);

// Show a modal with instructions, other resources are loading in background
$('#instructions_modal').on('show', function() {
    instructionsModalShown = true;
});
$('#instructions_modal').modal('show');
