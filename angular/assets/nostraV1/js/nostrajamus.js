$(function() {

    $.ajaxSetup({
         beforeSend: function(xhr, settings) {
             function getCookie(name) {
                 var cookieValue = null;
                 if (document.cookie && document.cookie != '') {
                     var cookies = document.cookie.split(';');
                     for (var i = 0; i < cookies.length; i++) {
                         var cookie = jQuery.trim(cookies[i]);
                         // Does this cookie string begin with the name we want?
                     if (cookie.substring(0, name.length + 1) == (name + '=')) {
                         cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                         break;
                     }
                 }
             }
             return cookieValue;
             }
             if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                 // Only send the token to relative URLs i.e. locally.
                 xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
             }
         }
    });

    $("#loginForm").submit(function(event) {
        console.log(event);
        console.log($("#username_login").val());
        console.log($("#password_login").val());

        $.ajax({
            type: 'POST',
            url: '/login/', //http://127.0.0.1:8000/
            dataType: 'json',
            crossDomain: 'true',
            contentType: "application/json",
            data: JSON.stringify({
                    "username": $("#username_login").val(),
                    "password": $("#password_login").val()
            }),
            success: function(data) {
                console.log('SUCCESS: ' + data);
                window.location.href = "/#/dashboard";
            },
            error: function(error) {
                console.log(error);
                alert("Sorry, we could not find you. Try again.")
            }
        });
        return false;
    });

    SC.initialize({
        client_id: 'f0b7083f9e4c053ca072c48a26e8567a'
    });

    function insertCommas(s) {

        // get stuff before the dot
        var d = s.indexOf('.');
        var s2 = d === -1 ? s : s.slice(0, d);

        // insert commas every 3 digits from the right
        for (var i = s2.length - 3; i > 0; i -= 3)
          s2 = s2.slice(0, i) + ',' + s2.slice(i);

        // append fractional part
        if (d !== -1)
          s2 += s.slice(d);

        return s2;

    }

    var songObj;
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
            var song_play_count = ui.item.value.playback_count;
            var user_id = ui.item.value.user.id;
            var sc_frame = '<iframe width="100%" height="166px" scrolling="no" frameborder="yes" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + song_id + '&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true"></iframe>';
            // var modal_btn = '<button type="button" class="btn btn-primary btn-lg btn-sc" data-toggle="modal" data-target="#myModal">Preview Song<img src="img/sm-sc.png" class="sc-img"/></button>';
            // document.getElementById("search").innerHTML = song_title;
            SC.get("/users/"+user_id, {limit: 1}, function(user){
                document.getElementById("follower_count_embed").innerHTML = "&nbsp | &nbsp Follower Count: " + user.followers_count;
            });
            document.getElementById("playcount_embed").innerHTML = "Play Count: "+song_play_count;
            document.getElementById("sc-embed").innerHTML = sc_frame;
            event.preventDefault();
            $(this).val(ui.item.label);
            songObj = ui.item;
        },

        focus: function( event, ui ) {
            // console.log(ui.item);
            event.preventDefault();
            $(this).val(ui.item.label);
        }
    });


    $("#registrationForm").submit(function( event ) {
        var errorMessage = '';
        for (var i = 0; i < event.target.length-1; i++) {
            event.preventDefault();
            if (event.target[i].value == null || event.target[i].value == '') {
                errorMessage = "Please fill out all fields.";
                document.getElementById("errors").innerHTML = "<div><b style='color:red'>" + errorMessage + "</b>";
                $('#errors').fadeIn('fast').delay(5000).fadeOut('fast');
                return false;
            }
        }
        if ($("#first_name").val().length == 0) {
            errorMessage = "Please enter your first name.";
            document.getElementById("errors").innerHTML = "<div><b style='color:red'>" + errorMessage + "</b>";
            $('#errors').fadeIn('fast').delay(5000).fadeOut('fast');
        }
        else if ($("#last_name").val().length == 0) {
            errorMessage = "Please enter your last name.";
            document.getElementById("errors").innerHTML = "<div><b style='color:red'>" + errorMessage + "</b>";
            $('#errors').fadeIn('fast').delay(5000).fadeOut('fast');
        } else if ($("#password1").val() != $("#password2").val()) {
            errorMessage = "Your passwords do not match.";
            document.getElementById("errors").innerHTML = "<div><b style='color:red'>" + errorMessage + "</b>";
            $('#errors').fadeIn('fast').delay(5000).fadeOut('fast');
        } else if ($("#email").val().length == 0) {
            errorMessage = "Please enter an email.";
            document.getElementById("errors").innerHTML = "<div><b style='color:red'>" + errorMessage + "</b>";
            $('#errors').fadeIn('fast').delay(5000).fadeOut('fast');
        } else if($("#email").val().indexOf('@') === -1) {
            errorMessage = "Invalid email address."
            document.getElementById("errors").innerHTML = "<div><b style='color:red'>" + errorMessage + "</b>";
            $('#errors').fadeIn('fast').delay(5000).fadeOut('fast');
        } else if (songObj === null) {
            console.log("Song is null");
            errorMessage = "Please select a valid song";
            document.getElementById("errors").innerHTML = "<div><b style='color:red'>" + errorMessage + "</b>";
            $('#errors').fadeIn('fast').delay(5000).fadeOut('fast');
        } else {
            console.log(JSON.stringify(
                {
                    "username": $("#username").val(),
                    "first_name": $("#first_name").val(),
                    "last_name": $("#last_name").val(),
                    "email": $("#email").val(),
                    "password": $("#password1").val(),
                    "profile_picture": null,
                    "location": ""
                }
            ));

            $.ajax({
                type: 'POST',
                url: '/api/users/', //http://127.0.0.1:8000/
                dataType: 'json',
                crossDomain: 'true',
                contentType: "application/json",
                data: JSON.stringify(
                    {
                        "username": $("#username").val(),
                        "first_name": $("#first_name").val(),
                        "last_name": $("#last_name").val(),
                        "email": $("#email").val(),
                        "password": $("#password1").val(),
                        "profile_picture": null,
                        "location": ""
                    }
                ),
                success: function(data) {
                    console.log('SUCCESS: ' + data);
                    window.location.href = "/#/dashboard";
                    window.location.reload();
                },
                error: function(error) {
                    console.log(error);
                    alert("Sorry there was an issue during registration. It may have been an issue on our side or it may help to clear your cookies and try again.")
                }
            });
            return false;

        }
    });


    $("#contestEntryForm").submit(function( event ) {
        var errorMessage = '';
        for (var i = 0; i < event.target.length-1; i++) {
            event.preventDefault();
            if (event.target[i].value == null || event.target[i].value == '') {
                errorMessage = "Please fill out all fields.";
                document.getElementById("errors").innerHTML = "<div><b style='color:red'>" + errorMessage + "</b>";
                $('#errors').fadeIn('fast').delay(5000).fadeOut('fast');
                return false;
            }
        }
        if ($("#first_name").val().length == 0) {
            errorMessage = "Please enter your first name.";
            document.getElementById("errors").innerHTML = "<div><b style='color:red'>" + errorMessage + "</b>";
            $('#errors').fadeIn('fast').delay(5000).fadeOut('fast');
        }
        else if ($("#last_name").val().length == 0) {
            errorMessage = "Please enter your last name.";
            document.getElementById("errors").innerHTML = "<div><b style='color:red'>" + errorMessage + "</b>";
            $('#errors').fadeIn('fast').delay(5000).fadeOut('fast');
        } else if ($("#password1").val() != $("#password2").val()) {
            errorMessage = "Your passwords do not match.";
            document.getElementById("errors").innerHTML = "<div><b style='color:red'>" + errorMessage + "</b>";
            $('#errors').fadeIn('fast').delay(5000).fadeOut('fast');
        } else if ($("#email").val().length == 0) {
            errorMessage = "Please enter an email.";
            document.getElementById("errors").innerHTML = "<div><b style='color:red'>" + errorMessage + "</b>";
            $('#errors').fadeIn('fast').delay(5000).fadeOut('fast');
        } else if($("#email").val().indexOf('@') === -1) {
            errorMessage = "Invalid email address."
            document.getElementById("errors").innerHTML = "<div><b style='color:red'>" + errorMessage + "</b>";
            $('#errors').fadeIn('fast').delay(5000).fadeOut('fast');
        } else if (songObj === null) {
            console.log("Song is null");
            errorMessage = "Please select a valid song";
            document.getElementById("errors").innerHTML = "<div><b style='color:red'>" + errorMessage + "</b>";
            $('#errors').fadeIn('fast').delay(5000).fadeOut('fast');
        } else {
            console.log(JSON.stringify(
                {
                    "username": $("#username").val(),
                    "first_name": $("#first_name").val(),
                    "last_name": $("#last_name").val(),
                    "email": $("#email").val(),
                    "password": $("#password1").val(),
                    "profile_picture": null,
                    "location": ""
                }
            ));

            $.ajax({
                type: 'POST',
                url: '/api/users/', //http://127.0.0.1:8000/
                dataType: 'json',
                crossDomain: 'true',
                contentType: "application/json",
                data: JSON.stringify(
                    {
                        "username": $("#username").val(),
                        "first_name": $("#first_name").val(),
                        "last_name": $("#last_name").val(),
                        "email": $("#email").val(),
                        "password": $("#password1").val(),
                        "profile_picture": null,
                        "location": ""
                    }
                ),
                success: function(data) {
                    console.log('SUCCESS: ' + data);
                    window.location.href = "/#/dashboard";
                },
                error: function(error) {
                    console.log(error);
                    alert("Sorry there was an issue during registration. It may have been an issue on our side or it may help to clear your cookies and try again.")
                }
            });
            return false;

        }



//                if (event.target[2].value != event.target[3].value) {
//                    event.preventDefault();
//                    errorMessage = "Emails do not match.";
//                    document.getElementById("errors").innerHTML = "<div><b style='color:red'>" + errorMessage + "</b>";
//                    $('#errors').fadeIn('fast').delay(5000).fadeOut('fast');
//                }
//                else {
//                    if(event.target[2].value.indexOf('@') === -1) {
//                        event.preventDefault();
//                        errorMessage = "Invalid email address."
//                        document.getElementById("errors").innerHTML = "<div><b style='color:red'>" + errorMessage + "</b>";
//                        $('#errors').fadeIn('fast').delay(5000).fadeOut('fast');
//                    }
//                    else if (songObj == null) {
//                        console.log(songObj);
//                        event.preventDefault();
//                        errorMessage = "Invalid song selection."
//                        document.getElementById("errors").innerHTML = "<div><b style='color:red'>" + errorMessage + "</b>";
//                        $('#errors').fadeIn('fast').delay(5000).fadeOut('fast');
//                    }
//                    else {
//
//                        // MICHAEL: AJAX CALL FOR FORM SUBMISSION
//                        console.log(JSON.stringify({
//                                "track": songObj.value,
//                                "user": {
//                                    "first_name": event.target[0].value,
//                                    "last_name": event.target[1].value,
//                                    "username": event.target[4].value,
//                                    "email": event.target[2].value
//                                }
//                            }));
//                        $.ajax({
//                            type: 'POST',
//                            url: '/api/contests/1/enter/', //http://127.0.0.1:8000/
//                            dataType: 'json',
//                            crossDomain: 'true',
//                            contentType: "application/json",
//                            data: JSON.stringify({
//                                "track": songObj.value,
//                                "user": {
//                                    "first_name": event.target[0].value,
//                                    "last_name": event.target[1].value,
//                                    "username": event.target[4].value,
//                                    "email": event.target[2].value
//                                }
//                            }),
//                            success: function(data) {
////                                alert('data: ' + data);
//                                console.log('SUCCESS: ' + data);
//                            },
//                            error: function(error) {
////                                alert(error);
//                                console.log(error);
//                            }
//                        });
//
//                        // /MICHAEL: AJAX CALL FOR FORM SUBMISSION
//
//                        event.preventDefault();
//                    }
//
//                }
    });

    $("#forgotPasswordForm").submit(function( event ) {
        var errorMessage = '';

        if ($("#email_forgotten").val().length == 0) {
            errorMessage = "Please enter an email.";
            document.getElementById("errors").innerHTML = "<div><b style='color:red'>" + errorMessage + "</b>";
            $('#errors').fadeIn('fast').delay(5000).fadeOut('fast');
        } else {
            console.log(JSON.stringify(
                {
                    "email": $("#email_forgotten").val()
                }
            ));

            $.ajax({
                type: 'POST',
                url: '/api/users/initiate_password_reset/', //http://127.0.0.1:8000/
                dataType: 'json',
                crossDomain: 'true',
                contentType: "application/json",
                data: JSON.stringify(
                    {
                        "email": $("#email_forgotten").val()
                    }
                ),
                success: function(data) {
                    console.log('SUCCESS: ' + data);
                    window.location.href = "/forgot/";
//                    window.location.replace("/forgot/");
                },
                error: function(error) {
                    console.log(error);
//                    window.location.href = "/forgot/";
                    window.location.href = "/forgot/";
//                    alert("Sorry there was an issue. It may have been an issue on our side or it may help to clear your cookies and try again.")
                }
            });

        }
        return false;

    });

    $("#resetPasswordForm").submit(function( event ) {
        var errorMessage = '';
        for (var i = 0; i < event.target.length - 1; i++) {
            event.preventDefault();
            if (event.target[i].value == null || event.target[i].value == '') {
                errorMessage = "Please fill out all fields.";
                document.getElementById("errors").innerHTML = "<div><b style='color:red'>" + errorMessage + "</b>";
                $('#errors').fadeIn('fast').delay(5000).fadeOut('fast');
                return false;
            }
        }
        if ($("#new_password").val() != $("#confirm_password").val()) {
            errorMessage = "Your passwords do not match.";
            document.getElementById("errors").innerHTML = "<div><b style='color:red'>" + errorMessage + "</b>";
            $('#errors').fadeIn('fast').delay(5000).fadeOut('fast');
        } else {
            console.log(JSON.stringify(
                {
                    "token": $("#token").val(),
                    "new_password": $("#new_password").val()
                }
            ));

            $.ajax({
                type: 'POST',
                url: '/api/users/reset_password/', //http://127.0.0.1:8000/
                dataType: 'json',
                crossDomain: 'true',
                contentType: "application/json",
                data: JSON.stringify(
                    {
                        "token": $("#token").val(),
                        "new_password": $("#new_password").val()
                    }
                ),
                success: function (data) {
                    alert("You've successfully reset your password.")
                    console.log('SUCCESS: ' + data);
                    window.location.href = "/login/";
                },
                error: function (error) {
                    console.log(error);
                    alert("Incorrect token, try again.");
                    // alert("Sorry there was an issue uploading that song. It may have been an issue on our side or it may help to clear your cookies and try again.")
                }
            });

        }
    });
});