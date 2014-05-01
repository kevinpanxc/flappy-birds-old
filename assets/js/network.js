var Network = (function () {
    var socket;
    var url = 'http://localhost:3700';

    var REQUEST_JUMP = 'bird-jump';
    var REQUEST_UPDATE_STATE = 'state-update';
    var REQUEST_START_GAME = 'start-game';
    var REQUEST_DEATH = 'bird-death-request';
    var REQUEST_NEW_PIPE = 'pipe-request';
    var REQUEST_REGISTER = 'register-request';
    var REQUEST_SYNC = 'sync-request';
    var REQUEST_CLIENT_LIST = 'client-list-request';

    var RESPONSE_REGISTER = 'register-response';
    var RESPONSE_NEW_PIPE = 'pipe-response';
    var RESPONSE_JUMP = 'bird-jumped';
    var RESPONSE_SYNC = 'sync-response';
    var RESPONSE_DEATH = 'bird-death-response';
    var RESPONSE_CLIENT_LIST = 'client-list-response';

    return {
        send : {
            jump : function (data) {
                socket.emit(REQUEST_JUMP, data);
            },
            
            update_state : function (data) {
                socket.emit(REQUEST_UPDATE_STATE, data);
            },
            
            start_game : function (data) {
                socket.emit(REQUEST_START_GAME, data);
            },
            
            death : function (data) {
                socket.emit(REQUEST_DEATH, data);
            },
            
            new_pipe : function (data) {
                socket.emit(REQUEST_NEW_PIPE, data);
            },
            
            register : function (data) {
                socket.emit(REQUEST_REGISTER, data);
            },

            sync : function (data) {
                socket.emit(REQUEST_SYNC, data);
            },

            client_list : function (data) {
                socket.emit(REQUEST_CLIENT_LIST, data);
            }
        },

        on : {
            register_success : function (callback) {
                socket.on(RESPONSE_REGISTER, callback);
            },

            pipe_returned : function (callback) {
                socket.on(RESPONSE_NEW_PIPE, callback);
            },

            bird_jumped : function (callback) {
                socket.on(RESPONSE_JUMP, callback);
            },

            sync_success : function (callback) {
                socket.on(RESPONSE_SYNC, callback);
            },

            bird_death : function (callback) {
                socket.on(RESPONSE_DEATH, callback);
            },

            client_list_returned : function (callback) {
                socket.on(RESPONSE_CLIENT_LIST, callback);
            }
        },

        initialize : function () {
            socket = io.connect(url);
        }
    };
})();