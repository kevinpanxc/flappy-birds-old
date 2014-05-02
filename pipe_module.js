var all = new Array();

function generate_pipes () {
    var pipe_height = 90;
    var padding = 80;
    var constraint = 420 - pipe_height - (padding * 2); //double padding (for top and bottom)
    for (var i = 0; i < 50; i++) {
       var top_height = Math.floor((Math.random()*constraint) + padding); //add lower padding
       var bottom_height = (420 - pipe_height) - top_height;
       all.push({top_height: top_height, bottom_height: bottom_height, death_counter: 0});
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