// Outside the document ready handler for immediate execution
var updateGameInfo = function() {
    $.getJSON('/ajax-game-info', function(data) {
        var items = [];

        $.each(data[2], function(key, val) {
            items.push('<li>' + val + '</li>');
        });

        $('#player_list').html('<ul>' + items.join('') + '</ul>');
    }).error(function(xhr, status, data) {
        $('#error_modal').modal('show');
        $('#error_modal').on('hide', function() {
            window.location.replace('/');
        });
    });
};

updateGameInfo();
setInterval(updateGameInfo, 1000);
