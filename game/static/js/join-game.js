$(document).ready(function() {
    var hasJoinedGameYet = false;

    var updateGameList = function() {
        $.getJSON('/ajax-games', function(data) {
            var items = [];

            $.each(data, function(key, val) {
                items.push('<li>' +
                '<span>' + val + '</span>' +
                '<a class="btn btn-danger btn_join_game" data-game-id="' + key + '">' +
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
            window.location.replace('/');
        });
    };

    var updateGameInfo = function() {
        $.getJSON('/ajax-game-info', function(data) {
            var items = [];

            $.each(data[1], function(key, val) {
                items.push('<li>' + val + '</li>');
            });

            $('#player_list').html('<ul>' + items.join('') + '</ul>');
            $('#game_name').html(data[0]);
        }).error(function(xhr, status, data) {
            if ('NO-GAME' === xhr.responseText && hasJoinedGameYet) {
                // No game associated with this player anymore
                hasJoinedGameYet = false;
                $('#game_name').html('');
                alert('The game you joined was cancelled');
            }
            $('#player_list').html('<p>No game joined</p>');
        });
    };

    updateGameList();
    setInterval(updateGameList, 1000);
    setInterval(updateGameInfo, 1000);
});