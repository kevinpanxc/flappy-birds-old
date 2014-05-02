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
    var REQUEST_PIPE_DEATH_COUNTER = 'pipe-death-counter-request';

    var RESPONSE_REGISTER = 'register-response';
    var RESPONSE_NEW_PIPE = 'pipe-response';
    var RESPONSE_JUMP = 'bird-jumped';
    var RESPONSE_SYNC = 'sync-response';
    var RESPONSE_DEATH = 'bird-death-response';
    var RESPONSE_CLIENT_LIST = 'client-list-response';
    var RESPONSE_PIPE_DEATH_COUNTER = 'pipe-death-counter-response';

    var jump = function (data) {
        socket.emit(REQUEST_JUMP, data);
    }

    var update_state = function (data) {
        socket.emit(REQUEST_UPDATE_STATE, data);
    }

    var start_game = function (data) {
        socket.emit(REQUEST_START_GAME, data);
    }
    
    var death = function (data) {
        socket.emit(REQUEST_DEATH, data);
    }
    
    var new_pipe = function (data) {
        socket.emit(REQUEST_NEW_PIPE, data);
    }
    
    var register = function (data) {
        socket.emit(REQUEST_REGISTER, data);
    }

    var sync = function (data) {
        socket.emit(REQUEST_SYNC, data);
    }

    var client_list = function (data) {
        socket.emit(REQUEST_CLIENT_LIST, data);
    }

    var update_pipe_death_counter = function (data) {
        socket.emit(REQUEST_PIPE_DEATH_COUNTER, data);
    }

    var register_success = function (callback) {
        socket.on(RESPONSE_REGISTER, callback);
    }

    var pipe_returned = function (callback) {
        socket.on(RESPONSE_NEW_PIPE, callback);
    }

    var bird_jumped = function (callback) {
        socket.on(RESPONSE_JUMP, callback);
    }

    var sync_success = function (callback) {
        socket.on(RESPONSE_SYNC, callback);
    }

    var bird_death = function (callback) {
        socket.on(RESPONSE_DEATH, callback);
    }

    var client_list_returned = function (callback) {
        socket.on(RESPONSE_CLIENT_LIST, callback);
    }

    var pipe_death_counter_info_returned = function (callback) {
        socket.on(RESPONSE_PIPE_DEATH_COUNTER, callback);
    }

    return {
        send : {
            jump : jump,
            
            update_state : update_state,
            
            start_game : start_game,
            
            death : death,
            
            new_pipe : new_pipe,
            
            register : register,

            sync : sync,

            client_list : client_list,

            update_pipe_death_counter : update_pipe_death_counter
        },

        on : {
            register_success : register_success,

            pipe_returned : pipe_returned,

            bird_jumped : bird_jumped,

            sync_success : sync_success,

            bird_death : bird_death,

            client_list_returned : client_list_returned,

            pipe_death_counter_info_returned : pipe_death_counter_info_returned
        },

        initialize : function () {
            socket = io.connect(url);
        }
    };
})();