$(document).ready(function() {
    $('#btn_create_game').click(function() {
        submitLoginForm();
    });
    $('#btn_join_game').click(function() {
        submitLoginForm();
    });
});

var moveLoginForm = function() {
    $('#login_form').animate({'margin-top': '35px'});
};

var submitLoginForm = function() {
    if (!$.trim($('#id_player_name').val()).length) {
        moveLoginForm();
        $('<p class="error">Yo dawg, tell me your name</p>').insertAfter('#id_player_name');
        return;
    }
    $('#login_form').submit();
};
