$(document).ready(function() {
    var updateGameInfo = function() {
        $.getJSON('/ajax-game-info', function(data) {
        }).error(function(xhr, status, data) {
            alert('Oops! An error has occurred.');
            window.location.replace('/');
        });
    };

    updateGameInfo();
    setInterval(updateGameInfo, 1000);

    $('#instructions_modal').modal('show');

    var replaceClass = function(selector, whatClass, withClass) {
        var classes = $(selector).attr('class');
        $(selector).attr('class', classes.replace(whatClass, withClass));
    };

    var actions = {'Move': '#btn_move', 'Barricade': '#btn_barricade',
                   'Shoot': '#btn_shoot', 'Reload': '#btn_reload'};
    var untoggleActionButtons = function(e) {
        for (action in actions) {
            var actionButton = actions[action];
            if ($(actionButton).hasClass('btn-warning')) {
                $(actionButton).button('toggle');
                replaceClass(actionButton, 'btn-warning', 'btn-success');
            }
        }
        replaceClass(e.target, 'btn-success', 'btn-warning');
    };
    $('.control_btn_left, .control_btn_right').click(untoggleActionButtons);
});
