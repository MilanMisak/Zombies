$(document).ready(function() {
    var updateGameList = function() {
        $.getJSON('/games', function(data) {
            var items = [];

            $.each(data, function(key, val) {
                items.push('<li>' +
                '<span>' + val + '</span>' +
                '<a class="btn btn-danger btn_join_game" data-game-id="' + key + '">' +
                'Join</a>' +
                '</li>');
            });

            $('#game_list').html('<ul>' + items.toString() + '</ul>');

            $('.btn_join_game').click(function() {
                var game_id = $(this).attr('data-game-id');
                $.getJSON('join/' + game_id, function(data) {
                    $(this).addClass('disabled');
                });
            });
        }).error(function() {
            window.location.replace('/');
        });
    };

    updateGameList();
    setInterval(updateGameList, 1000);
});
