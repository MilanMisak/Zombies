var documentReady = false;
var hasJoinedGameYet = false;

// Outside the document ready handler for immediate execution
var updateGameInfo = function() {
    $.getJSON('/ajax-game-info', function(data) {
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
        if ('NO-GAME' === xhr.responseText && hasJoinedGameYet) {
            // No game associated with this player anymore
            hasJoinedGameYet = false;
            $('#game_name').html('');
            $('#joined_game_instructions').fadeOut();
            alert('The game you joined was cancelled');
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
            alert('An error occurred');
            window.location.replace('/');
        });
    };

    updateGameList();
    setInterval(updateGameList, 1000);
});
