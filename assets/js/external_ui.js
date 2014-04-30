var ExternalUI = (function () {
    var PLAYING_COLOR = "#15CF00";
    var IDLE_COLOR = "#ABABAB";

    var loop_client_list;
    var cloneable_node;
    var client_list;

    var initialize_cloneable_node = function () {
        var parent = document.createElement("li");
        var client_color = document.createElement("div");
        client_color.className = "client-color";

        var client_text = document.createElement("div");
        client_text.className = "client-text";

        var client_id = document.createElement("div");
        client_id.className = "client-id";

        var client_status = document.createElement("div");
        client_status.className = "client-status";

        client_text.appendChild(client_id);
        client_text.appendChild(client_status);

        parent.appendChild(client_color);
        parent.appendChild(client_text);

        return parent;
    }

    return {
        initialize : function () {
            client_list = $("#clientscreen ul");

            cloneable_node = initialize_cloneable_node();

            Network.on.client_list_returned(function (data) {
                $(".client-count span").html(Object.keys(data).length);

                client_list.empty();

                for (var client_id in data) {
                    var client = data[client_id];
                    var client_node_jquery = $(cloneable_node.cloneNode(true));

                    if (client.state === 0) {
                        client_node_jquery.find(".client-color").css( "background-color", IDLE_COLOR );
                        client_node_jquery.find(".client-status").html("Idle");
                    } else {
                        client_node_jquery.find(".client-color").css( "background-color", PLAYING_COLOR );
                        client_node_jquery.find(".client-status").html("Playing");
                    }

                    client_node_jquery.find(".client-id").html(client.id);

                    client_list.append(client_node_jquery);
                }
            });

            loop_client_list = setInterval(function () {
                Network.send.client_list(null);
            }, 3000);
        }
    }
})();