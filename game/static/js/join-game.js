var errorModalShown = false;

var documentReady = false;
var hasJoinedGameYet = false;

var AJAX_ERROR_ALLOWANCE = 10; // Keep in sync with models.py setting
var ajaxErrorCount = 0;
var ajaxErrorCount2 = 0;

// Outside the document ready handler for immediate execution
var updateGameInfo = function() {
    $.getJSON('/ajax-game-info', function(data) {
        ajaxErrorCount2 = 0;

        if (data[1] === 1) {
            // Game has started
            window.location.replace('/game');
        }

        if (!documentReady)
            return;

        var items = [];
        $.each(data[2], function(key, val) {
            items.push('<li>' + val + '</li>');
        });

        $('#game_name').html(data[0]);
        $('#joined_game_instructions').fadeIn();
        $('#player_list').html('<ul>' + items.join('') + '</ul>');
    }).error(function(xhr, status, data) {
        ajaxErrorCount2++;
        if (ajaxErrorCount2 < AJAX_ERROR_ALLOWANCE)
            return;
        ajaxErrorCount2 = 0;

        if ('NO-GAME' === xhr.responseText && hasJoinedGameYet) {
            if (errorModalShown)
                return;
            errorModalShown = true;

            // No game associated with this player anymore
            hasJoinedGameYet = false;
            $('#game_name').html('');
            $('#joined_game_instructions').fadeOut();

            $('#error_reason').html('the game you joined was cancelled.');
            $('#error_details').html('Please join a different game.');
            $('#error_modal').on('hide', function() {
                errorModalShown = false;
            });
            $('#error_modal').modal('show');
        }

        $('#player_list').html('<p>No game joined</p>');
    });
};

updateGameInfo();
setInterval(updateGameInfo, 1000);

$(document).ready(function() {
    documentReady = true;

    var updateGameList = function() {
        $.getJSON('/ajax-games', function(data) {
            ajaxErrorCount = 0;

            var items = [];
            $.each(data, function(key, val) {
                items.push('<li>' +
                '<span>' + val + '</span>' +
                '<a class="btn btn-success btn_join_game" data-game-id="' + key + '">' +
                'Join</a>' +
                '</li>');
            });

            $('#game_list').html('<ul>' + items.join('') + '</ul>');
            if (items.length == 0)
                $('#game_list').html('<p>No available games</p>');

            $('.btn_join_game').click(function() {
                var game_id = $(this).attr('data-game-id');
                $.getJSON('ajax-join-game/' + game_id, function(data) {
                    hasJoinedGameYet = true;
                    $(this).addClass('disabled');
                });
            });
        }).error(function(xhr, status, data) {
            ajaxErrorCount++;
            if (ajaxErrorCount < AJAX_ERROR_ALLOWANCE)
                return;
            ajaxErrorCount = 0;

            if (errorModalShown)
                return;
            errorModalShown = true;

            $('#error_reason').html('your player has been wiped off the server. ' +
                'Are you experiencing any internet connection issues?');
            $('#error_modal').on('hide', function() {
                window.location.replace('/');
            });
            $('#error_modal').modal('show');
        });
    };

    updateGameList();
    setInterval(updateGameList, 1000);
});
