$(document).ready(function() {
    var updateGameList = function() {
        $.getJSON('/games', function(data) {
            var items = [];

            $.each(data, function(key, val) {
                items.push('<li>' + val + '</li>');
            });

            $('#game_list').html('<ul>' + items.toString() + '</ul>');
        });
    };

    updateGameList();
    setInterval(updateGameList, 1000);
});
