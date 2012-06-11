var instructionsModalShown = false;
var errorModalShown = false;

// Outside the document ready handler for immediate execution
var updateGameInfo = function() {
    $.getJSON('/ajax-game-info', function(data) {
    }).error(function(xhr, status, data) {
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

// Show a modal with instructions
$('#instructions_modal').on('show', function() {
    instructionsModalShown = true;
});
$('#instructions_modal').modal('show');
