var ExternalUI = (function () {
    var PLAYING_COLOR = "#15CF00";
    var IDLE_COLOR = "#ABABAB";

    var loop_refresh_client_list;
    var loop_refresh_client_scores;

    var cloneable_node;
    var $client_list;
    var $client_count;

    var $loading_input_username;
    var $loading_connecting_message;
    var $loading_input_username_invalid;

    var initialize_cloneable_node = function () {
        var parent = document.createElement("li");
        var client_color = document.createElement("div");
        client_color.className = "client-color";

        var client_text = document.createElement("div");
        client_text.className = "client-text";

        var client_id = document.createElement("div");
        client_id.className = "client-name";

        var client_status_and_score_parent = document.createElement("div");
        client_status_and_score_parent.className = "client-status-and-score-parent";

        var client_status = document.createElement("div");
        client_status.className = "client-status";

        var client_score = document.createElement("div");
        client_score.className = "client-score";

        client_status_and_score_parent.appendChild(client_status);
        client_status_and_score_parent.appendChild(client_score);

        client_text.appendChild(client_id);
        client_text.appendChild(client_status_and_score_parent);

        parent.appendChild(client_color);
        parent.appendChild(client_text);

        return parent;
    }

    var update_connected_clients_list = function (clients) {
        var clients_array = $.map(clients, function (value, key) { return value });

        clients_array.sort(function (a,b) { return b.state - a.state });

        $client_list.empty();

        for (var i = 0; i < clients_array.length; i++) {
            var client = clients_array[i];
            var client_node_jquery = $(cloneable_node.cloneNode(true));

            if (client.state === 0) {
                client_node_jquery.find(".client-color").css( "background-color", IDLE_COLOR );
                client_node_jquery.find(".client-status").html("Idle");
            } else {
                client_node_jquery.find(".client-color").css( "background-color", PLAYING_COLOR );
                client_node_jquery.find(".client-status").html("Playing");

                client_node_jquery.find(".client-score").html(client.score);
                client_node_jquery.find(".client-score").attr("id", "score-" + client.id);
            }

            client_node_jquery.find(".client-name").html(client.username);

            $client_list.append(client_node_jquery);
        }
    }

    var update_connected_clients_count = function (count) {
        $client_count.html(count);
    }

    var update_connected_clients_score = function (data) {
        for (var client_id in data) {
            var client = data[client_id];
            $("#score-" + client.id).html(client.score);
        }
    }

    var begin_registration = function (show_error_message) {
        $loading_connecting_message.hide();
        $loading_input_username.show();

        if (show_error_message === true) $loading_input_username_invalid.show();

        enable_character_username_submission();
    }

    var show_connecting_message = function () {
        $loading_connecting_message.show();
        $loading_input_username.hide();
    }

    var enable_character_username_submission = function () {
        document.onkeydown = function (event) {
            var e = e || window.event;

            if (e.keyCode === 13) {
                var username = $("#loading-input-username input").val();
                Network.send.register(username);
                $loading_input_username_invalid.hide();
                disable_character_username_submission();
                show_connecting_message();
            }
        }
    }

    var disable_character_username_submission = function () {
        document.onkeydown = function () {}
    }

    return {
        initialize : function () {
            $client_list = $("#clientscreen ul");

            $client_count = $("#client-count span");

            $loading_input_username = $("#loading-input-username");

            $loading_connecting_message = $("#loading-message");

            $loading_input_username_invalid = $("#loading-input-username-invalid");

            cloneable_node = initialize_cloneable_node();

            Network.on.client_list_returned(function (data) {
                update_connected_clients_count(Object.keys(data).length);

                update_connected_clients_list(data);
            });

            Network.on.client_score_returned(function (data) {
                update_connected_clients_score(data);
            });

            $("#about-button").click(function () {
                $("#about").toggle("fast", function () {
                    $('html, body').animate({
                        scrollTop: $("#about").offset().top
                    }, 2000);
                });
            });
        },

        remove_loading_blocker : function () {
            $loading_connecting_message.hide();
            $loading_input_username.hide();

            $(".loading").fadeOut("fast");
        },

        update_connected_clients_count : update_connected_clients_count,

        update_connected_clients_list : update_connected_clients_list,

        begin_registration : begin_registration
    }
})();