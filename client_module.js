var all = {};

var states = Object.freeze({
    IDLE: 0,
    PLAYING: 1
});

function Client(username, client_id) {
    if (client_id == null) this.id = this.random_string(16, 'aA'); // undefined == null
    else this.id = client_id;

    this.username = username;

    this.velocity = 0;
    this.y_position = 180;
    this.rotation = 0;
    this.score = 0;

    this.state = states.IDLE;

    this.state_timestamp = new Date().getTime();
    this.start_game_timestamp = null;
}

Client.prototype.random_string = function (length, chars) {
    var mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))];
    return result;
}

Client.prototype.update_state = function (state) {
    if (state === "IDLE") this.state = states.IDLE;
    else if (state === "PLAYING") this.state = states.PLAYING;

    this.state_timestamp = new Date().getTime();
}

Client.prototype.update_score = function (score) {
    this.score = score;
}

function username_is_valid (username) {
    if (typeof username === 'string'
        && username.length > 0
        && username.length < 20) {
        return true;
    } else {
        return false;
    }
}

module.exports = {
    add_new : function (username, client_id) {
        var new_client = null;
        if (username_is_valid(username)) {
            new_client = new Client(username, client_id);
            all[new_client.id] = new_client;
            return new_client;
        } else {
            return false;
        }
    },
    generate_client_package : function (from_client_id) {
        var client_package = {};
        for (client_id in all) {
            client = all[client_id];
            if (from_client_id !== client_id && client.state === states.PLAYING) {
                client.time_diff = all[from_client_id].start_game_timestamp - client.start_game_timestamp;
                client_package[client_id] = client;
            }
        }
        return client_package;
    },
    scan_states : function (socket) {
        for (client_id in all) {
            client = all[client_id];
            state_time_diff = new Date().getTime() - client.state_timestamp;
            if (client.state === states.IDLE) {
                if (state_time_diff > 12000) delete all[client_id];
            } else if (client.state === states.PLAYING) {
                if (state_time_diff > 10000) client.update_state("IDLE");
            }
        }
    },
    client_exists : function (client_id) {
        return !(all[client_id] == undefined);
    },
    all : all
}