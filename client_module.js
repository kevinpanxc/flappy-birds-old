var all = {};

var states = Object.freeze({
    IDLE: 0,
    PLAYING: 1
});

function Client(client_id) {
    if (arguments.length === 0) this.id = this.random_string(16, 'aA');
    else this.id = client_id;

    this.velocity = 0;
    this.position = 90;
    this.rotation = 0;
    this.time = new Date().getTime();

    this.state = states.IDLE;

    this.state_timestamp = new Date().getTime();
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

module.exports = {
    add_new : function (client_id) {
        var new_client = null;

        if (arguments.length === 1) new_client = new Client(client_id);
        else new_client = new Client();
        all[new_client.id] = new_client;
        return new_client.id;
    },
    generate_client_package : function (from_client_id) {
        var client_package = {};
        for (client_id in all) {
            if (from_client_id !== client_id) {
                all[client_id].time_diff = all[client_id].time - all[from_client_id].time;
                client_package[client_id] = all[client_id];
            }
        }
        return client_package;
    },
    scan_states : function () {
        for (client_id in all) {
            client = all[client_id];
            state_time_diff = new Date().getTime() - client.state_timestamp;
            if (client.state === states.IDLE) {
                if (state_time_diff > 600000) delete all[client_id];
            } else if (client.state === states.PLAYING) {
                if (state_time_diff > 10000) client.change_state("IDLE");
            }
        }
    },
    all : all
}