$(document).ready(function() {
    var updateGameList = function() {
        $.getJSON('/games', function(data) {
            var items = [];

            $.each(data, function(key, val) {
                items.push('<li>' +
                '<span>' + val + '</span>' +
                '<a class="btn btn-danger" id="btn_start_game" href="/join/' + key + '">' +
                'Join</a>' +
                '</li>');
            });

            $('#game_list').html('<ul>' + items.toString() + '</ul>');
        });
    };

    updateGameList();
    setInterval(updateGameList, 1000);
});
