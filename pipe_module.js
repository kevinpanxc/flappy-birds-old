var all = new Array();

function generate_pipes () {
    var pipeheight = 90;
    var padding = 80;
    var constraint = 420 - pipeheight - (padding * 2); //double padding (for top and bottom)
    for (var i = 0; i < 50; i++) {
       var topheight = Math.floor((Math.random()*constraint) + padding); //add lower padding
       var bottomheight = (420 - pipeheight) - topheight;
       all.push({topheight: topheight, bottomheight: bottomheight});
    }
}

function get_pipe(index) {
    if (index >= all.length - 1) {
        generate_pipes();
    }
    return all[index];
}

module.exports = {
    get_pipe : get_pipe
}