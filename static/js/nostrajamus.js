// Countdown Timer

// set the date we're counting down to
var target_date = new Date('Jan, 21, 2015').getTime();

// variables for time units
var days, hours, minutes, seconds;

// get tag element
var countdown = document.getElementById('countdown');

// update the tag with id "countdown" every 1 second
setInterval(function () {

    // find the amount of "seconds" between now and target
    var current_date = new Date().getTime();
    var seconds_left = (target_date - current_date) / 1000;

    // do some time calculations
    days = parseInt(seconds_left / 86400);
    seconds_left = seconds_left % 86400;

    hours = parseInt(seconds_left / 3600);
    seconds_left = seconds_left % 3600;

    minutes = parseInt(seconds_left / 60);
    seconds = parseInt(seconds_left % 60);

    // format countdown string + set tag value
    countdown.innerHTML = '<span class="days">' + days +  ' <b>Days</b></span> <span class="hours">' + hours + ' <b>Hours</b></span> <span class="minutes">'
    + minutes + ' <b>Minutes</b></span> <span class="seconds">' + seconds + ' <b>Seconds</b></span>';  

}, 1000);

// Soundcloud Function

$(function() {
    SC.initialize({
        client_id: 'f0b7083f9e4c053ca072c48a26e8567a'
    });

    $("#search").autocomplete({
        source: function(request, response) {
          // find all sounds of buskers licensed under 'creative commons share alike'
          // alert("Source");
          SC.get('/tracks', { q: request.term}, function(tracks) {
            // alert(tracks);
            var titles = [];
            for (var i = 0; i < tracks.length; i++) {
              if (i > 20) { break; }
              var item = { label: tracks[i].title, value: tracks[i] };
              titles[i] = item;
            }
            response(titles);
          });
        },

        select: function(event, ui) {
            // var song_title = ui.item.label;
            var song_id = ui.item.value.id;
            var sc_frame = '<iframe width="50%" height="50%" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + song_id + '&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true"></iframe>';
            // var modal_btn = '<button type="button" class="btn btn-primary btn-lg btn-sc" data-toggle="modal" data-target="#myModal">Preview Song<img src="img/sm-sc.png" class="sc-img"/></button>';
            // document.getElementById("search").innerHTML = song_title;
            document.getElementById("sc-embed").innerHTML = sc_frame;
            event.preventDefault();
            $(this).val(ui.item.label);
        },

        focus: function( event, ui ) { 
            // console.log(ui);
            event.preventDefault();
            $(this).val(ui.item.label);
        }
    });
});