var serverPath = "http://localhost/karaokewebapp/";

angular.module('app', [])
    .controller('SearchController', function($scope) {
        var that = this;

        that.playerUrl = "http://www.deezer.com/plugins/player?format=classic&autoplay=false&playlist=true&width=700&height=290&color=1990DB&layout=dark&size=medium&type=playlist&id=2153967&title=&app_id=1";
        that.searchTitle  = "Top of the world";
        that.searchArtist = "Carpenters";
        that.songID = 0;
        that.doSearch = function () {
            //get music

            $.ajax({
                url: "http://developer.echonest.com/api/v4/song/search?bucket=tracks",
                data: {
                    "api_key":"QR3H8MYBUZDYTDWUB",
                    "format":"xml",
                    "results": "1",
                    "bucket": "id:deezer",
                    "artist": that.searchArtist,
                    "title": that.searchTitle
                },
                beforeSend: function(){
                    console.log("Find song: " + that.searchTitle + "-" + that.searchArtist);
                },
                success: function(data){
                    that.songID = $(data).find("songs song track foreign_id").html().split(":")[2];
                    console.log("Found song ID: " + that.songID + ".And play with URL: " + "http://www.deezer.com/plugins/player?format=classic&autoplay=false&playlist=true&width=700&height=290&color=1990DB&layout=dark&size=medium&type=tracks&id="+ that.songID +"&title=&app_id=1");

                    DZ.player.playTracks([that.songID]);
                },
                complete: function(xhr, status){
                    console.log("Find song: " + that.searchTitle + "-" + that.searchArtist + " completed");
                    console.log(status);
                    console.log(xhr);
                }
            });

            //try get lyrics from server first
            $.ajax({
                url: serverPath + "load.php",
                data: {
                    songID: that.songID
                },
                success: function(data){
                    console.log("Got lyric content.")

                    if(data != ""){
                        that.lines = parseLines(data);
						console.log("We have data" + songID);
                        console.log(that);
                        $scope.$apply();

                        (".line li").first().addClass("current");
                        return;
                    }

                    alert("We don't have lyric for this song, please help us to compose it.")
                    //get lyric ID, then get Lyric Url
                    $.ajax({
                        url: "http://developer.echonest.com/api/v4/song/search?bucket=tracks",
                        data: {
                            "api_key":"QR3H8MYBUZDYTDWUB",
                            "format":"xml",
                            "results": "1",
                            "bucket": "id:musixmatch-WW",
                            "artist": that.searchArtist,
                            "title": that.searchTitle
                        },
                        beforeSend: function(){
                            console.log("Find lyric: " + that.searchTitle + "-" + that.searchArtist);
                        },
                        success: function(data) {
                            that.lyricId = $(data).find("foreign_id foreign_id").html().split(":")[2];

                            var url = "http://api.musixmatch.com/ws/1.1/track.get?" +
                                "apikey=d5679e8998d0b8496aacb84ad6a209a7" +
                                "&track_id=" + that.lyricId +
                                "&format=xml";


                            console.log("Found lyric ID: " + url + ".And continue get lyric URL (by proxy): " + url);

                            $.ajax({
                                url: serverPath + "proxy.php",
                                data: {
                                    url: url,
                                    mode: "native"
                                },
                                success: function(data){
                                    that.songLyricsURL = $(data).find("track_share_url").html();

                                    console.log("Found lyric URL: " + that.songLyricsURL + ".Try get its content by proxy.");
                                    $("#lyricWeb").attr("src", that.songLyricsURL);
                                    $.ajax({
                                        url: "http://localhost/karaokewebapp/proxy.php",
                                        data: {
                                            url: that.songLyricsURL,
                                            mode: "native"
                                        },
                                        success: function(data){
                                            console.log("Got HTML content, trying to get lyric from it.")

                                            that.lines = parseLines($(data).find("#lyrics-html").html());
                                            console.log(that);
                                            console.log($scope);
                                            $scope.$apply();

                                            (".line li").first().addClass("current");
                                        }
                                    });

                                },
                                complete: function(xhr, status){

                                }
                            });

                        },
                        complete: function(xhr, status){
                            console.log("Find lyric: " + that.searchTitle + "-" + that.searchArtist + " completed");
                            console.log(status);
                            console.log(xhr);
                        }
                    });
                },
                error: function(){

                }
            });



        };

        that.lines = [
            {time: "0.00", text: "no-lyric"},
        ];

        $scope.$watch('lines' , function(oldV, newV){
            console.log(oldV, newV);
        })

        that.addNewLineBelow = function(id, event){
            console.log(id, event);
            that.lines.splice(id + 1, 0, {time: "", text: ""});
        };

        that.toString = function(){
            var st = ""
            for(var i=0; i<that.lines.length; i++){
                st += that.lines[i].time + ": " + that.lines[i].text + '\n';
            }
            return st;
        }
    })

function parseLines(st){
    var lines = [];
    var sts = st.split("\n");
    for(var s in sts){
        var st = sts[s];
        var stt = st.split(":");
        if(stt.length == 1){
            if(s == 0) time = 0;
            else time = lines[s-1].time;
            text = st;
            lines.push({time: time, text: text});
        }
        if(stt.length > 1){
            time = stt[0];
            text = stt[1];
            lines.push({time: time, text: text});
        }
    }

    return lines;
}

$(function(){
    $("#sync").on("click", function(){
        console.log(currentSecond, totalSeconds);
        $li = $("#lyric .lines .current");
        if($li.length == 0) $li = $("#lyric .lines li").first();
        else $li = $li.next();
        $("#lyric .current").removeClass("current");
        $li.addClass("current");
        //$li.find(".time input").val(currentSecond);
        angular.element($li).scope().line.time = currentSecond;

        $li.nextAll().each(function(){
            angular.element($(this)).scope().line.time = currentSecond;
        })

        //angular.element($("#lyric")).scope().$digest();
        angular.element($("#lyric")).scope().$apply();
    })

    $("#save").on("click", function(){
        var search = angular.element($("#lyric")).scope().search;

        $.ajax({
            url: serverPath + "save.php",
            method: "post",
            data: {
                lyric: search.toString(),
                songID: search.songID
            },
            success: function(data){
                alert("your lyrics has been saved successfully. Thank for your support!");
            },
            complete: function(xhr, status){

            }
        });
    })


})

function updateShow(time, total){
    var $li;
    var fromTime = 0;
    var toTime = 0;
    $("#show li").each(function(){
        //$(this).find(".mask").css("width", $(this).find(".text").width() + "px");
        var lineTime = parseFloat($(this).find(".time").html());
        if(lineTime > time) return;
        $li = $(this);
        fromTime = lineTime;
        toTime = parseFloat($li.next().find(".time").html());
        if(isNaN(toTime)) toTime = total;
    });

    //$li.prevAll().each(function(){
    //    $(this).find(".mask").css("width", $(this).find(".text").width() + "px");
    //})

    $mask = $li.find(".mask");
    $text = $li.find(".text");
    //$mask.css("width", "10000px");
    $mask.css("width", (time-fromTime) / (toTime-fromTime) * ($text.width() + 20) + "px");
}