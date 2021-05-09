var scriptUrl = 'https:\/\/www.youtube.com\/s\/player\/838cc154\/www-widgetapi.vflset\/www-widgetapi.js';try{var ttPolicy=window.trustedTypes.createPolicy("youtube-widget-api",{createScriptURL:function(x){return x}});scriptUrl=ttPolicy.createScriptURL(scriptUrl)}catch(e){}if(!window["YT"])var YT={loading:0,loaded:0};if(!window["YTConfig"])var YTConfig={"host":"https://www.youtube.com"};
    if(!YT.loading){YT.loading=1;(function(){var l=[];YT.ready=function(f){if(YT.loaded)f();else l.push(f)};window.onYTReady=function(){YT.loaded=1;for(var i=0;i<l.length;i++)try{l[i]()}catch(e$0){}};YT.setConfig=function(c){for(var k in c)if(c.hasOwnProperty(k))YTConfig[k]=c[k]};var a=document.createElement("script");a.type="text/javascript";a.id="www-widgetapi-script";a.src=scriptUrl;a.async=true;var c=document.currentScript;if(c){var n=c.nonce||c.getAttribute("nonce");if(n)a.setAttribute("nonce",n)}var b=
    document.getElementsByTagName("script")[2];b.parentNode.insertBefore(a,b)})()};
    
    
        var yt_videoData = (typeof(yt_videoData) !== "undefined" && yt_videoData instanceof Array) ? yt_videoData : [];
        var video_prev_time = 0;
        var video_time = 0;
        // OPTIONAL: Enable JSAPI if it's not already on the URL
        // note: this will cause the Youtube player to "flash" on the page when reloading to enable the JS API
        for (var e = document.getElementsByTagName("iframe"), x = e.length; x--;)
          if (/youtube.com\/embed/.test(e[x].src))
             if(e[x].src.indexOf('enablejsapi=') === -1)
                e[x].src += (e[x].src.indexOf('?') ===-1 ? '?':'&') + 'enablejsapi=1';
        
        var gtmYTListeners = []; // support multiple players on the same page
        // attach our YT listener once the API is loaded
        function onYouTubeIframeAPIReady() {
            for (var e = document.getElementsByTagName("iframe"), x = e.length; x--;) {
                if (/youtube.com\/embed/.test(e[x].src)) {
                    gtmYTListeners.push(new YT.Player(e[x], {
                        events: {
                            onStateChange: onPlayerStateChange,
                            onError: onPlayerError
                        }
                    }));
                    YT.gtmLastAction = "p";
                }
            }
        }
        
        // listen for play/pause, other states such as rewind and end could also be added
        // also report % played every second
        function onPlayerStateChange(e) {
        //console.log(YT.PlayerState.PLAYING);
            if(e.data == YT.PlayerState.PLAYING){setTimeout(onPlayerPercent, 1000, e.target);}
            var video_data = e.target.getVideoData(),
                label = video_data.video_id+':'+video_data.title;
            if (e.data == YT.PlayerState.PLAYING && YT.gtmLastAction == "p") {
                YT.gtmLastAction = "";
            }
            if (e.data == YT.PlayerState.PAUSED) {
                yt_videoData.push({
                    videoName: video_data.title,
                    videoStatus: "pause",
                    videoTime:video_time - video_prev_time
                });
              video_prev_time = video_time;
                YT.gtmLastAction = "p";
            }
        }
        
        function onPlayerError(e) {
            yt_videoData.push({
                event: "error",
                action: "adobe",
                label: "youtube:" + e
            })
        }
        
        // report the % played if it matches 0%, 25%, 50%, 75% or completed
        function onPlayerPercent(e) {
            if (e.getPlayerState() == YT.PlayerState.PLAYING) {
              video_time =  e.getCurrentTime();
              //console.log("playyy");
                var t = e.getDuration() - e.getCurrentTime() <= 1.5 ? 1 : (Math.floor(e.getCurrentTime() / e.getDuration() * 4) / 4).toFixed(2);  
                  //console.log(t);
               if (!e.lastP || t > e.lastP) {
                    var video_data = e.getVideoData(),
                        label = video_data.video_id+':'+video_data.title;
                    e.lastP = t;
                    yt_videoData.push({
                       videoName:video_data.title,
                        videoStatus: t * 100 + "%",
                        videoTime:e.getCurrentTime() - video_prev_time
                    })
                 
                  video_prev_time = e.getCurrentTime();
                   if(t > 0.75){
                     e.lastP = -1;
                    video_prev_time = 0
                  }
                }
                //console.log("lastP"+e.lastP);
                if(e.lastP != 1){setTimeout(onPlayerPercent, 1000,e);}
            }
        }
        
        
        // Crossbrowser onbeforeunload hack/proxy
        // https://developer.mozilla.org/en-US/docs/WindowEventHandlers.onbeforeunload
        window.onbeforeunload = function (e) {
          e = e || window.event;
         // For IE and Firefox prior to version 4
         if(e)
         e.returnValue = 'na';
         // For Safari
         return 'na';
        };
        window.onbeforeunload = trackYTUnload;
         
        function trackYTUnload() {
         for (var i = 0; i < gtmYTListeners.length; i++)
         if (gtmYTListeners[i].getPlayerState === 1) { // playing
         var video_data = gtmYTListeners[i].getVideoData(),
         label = video_data.video_id+':'+video_data.title;
         yt_videoData.push({
         event: 'youtube',
         action: 'exit',
         label: label
         });
         }
        }