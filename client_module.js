var all = {};

function Client() {
    this.id = this.random_string(16, 'aA');
    this.velocity = 0;
    this.position = 90;
    this.rotation = 0;
    this.time = new Date().getTime();
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

module.exports = {
    add_new : function () {
        var new_client = new Client();
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
    all : all
}