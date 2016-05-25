/*
 * jQuery postMessage - v0.5 - 9/11/2009
 * http://benalman.com/projects/jquery-postmessage-plugin/
 * 
 * Copyright (c) 2009 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function($) {
    var g, d, j = 1,
        a, b = this,
        f = !1,
        h = "postMessage",
        e = "addEventListener",
        c, i = b[h] && !window.opera;
    $[h] = function(k, l, m) {
        if (!l) {
            return
        }
        k = typeof k === "string" ? k : $.param(k);
        m = m || parent;
        if (i) {
            m[h](k, l.replace(/([^:]+:\/\/[^\/]+).*/, "$1"))
        } else {
            if (l) {
                m.location = l.replace(/#.*$/, "") + "#" + (+new Date) + (j++) + "&" + k
            }
        }
    };
    $.receiveMessage = c = function(l, m, k) {
        if (i) {
            if (l) {
                a && c();
                a = function(n) {
                    if ((typeof m === "string" && n.origin !== m) || ($.isFunction(m) && m(n.origin) === f)) {
                        return f
                    }
                    l(n)
                }
            }
            if (b[e]) {
                b[l ? e : "removeEventListener"]("message", a, f)
            } else {
                b[l ? "attachEvent" : "detachEvent"]("onmessage", a)
            }
        } else {
            g && clearInterval(g);
            g = null;
            if (l) {
                k = typeof m === "number" ? m : typeof k === "number" ? k : 100;
                g = setInterval(function() {
                    var o = document.location.hash,
                        n = /^#?\d+&/;
                    if (o !== d && n.test(o)) {
                        d = o;
                        l({
                            data: o.replace(n, "")
                        })
                    }
                }, k)
            }
        }
    }
})(jQuery);


jQuery(document).ready(function($) {
    $('#cta').prepend('<div id="scrolltopopup" class="scrollto hidden" data-target="#hashtag-content-body"></div><div id="scrollback" class="scrollto hidden" data-target=""></div>');
    // Get the parent page URL as it was passed in, for browsers that don't support
    // window.postMessage (this URL could be hard-coded).
    var page = document.referrer;
    var parent_url = page,
        domain_url = getDomain(parent_url),
        scrollbackto,
        scrollbacktrigger,
        link;

    console.log(parent_url);

    function getDomain(url) {
        var re = /^(https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im;
        var m;

        if ((m = re.exec(url)) !== null) {
            if (m.index === re.lastIndex) {
                re.lastIndex++;
            }
            return m[0]
        } else {
            return false;
        }
    }

    // The first param is serialized using $.param (if not a string) and passed to the
    // parent window. If window.postMessage exists, the param is passed using that,
    // otherwise it is passed in the location hash (that's why parent_url is required).
    // The second param is the targetOrigin.
    function setHeight() {
        $.postMessage({
            if_height: $('body').outerHeight(true)
        }, parent_url, parent);
    };

    function setScroll(x) {
        $.postMessage({
            if_scroll: x,
            if_offset: 50
        }, parent_url, parent);
    };


    // Now that the DOM has been set up (and the height should be set) invoke setHeight.
    setHeight();

    // Set up timer to see if height has been changed

    var iframe_height = $('body').outerHeight(true);

    setInterval(function() {
        if ($('body').outerHeight(true) != iframe_height) {
            iframe_height = $('body').outerHeight(true);
            setHeight();
            console.log("change");
        }
    }, 500);

    // Set up scroll listener

    $(document).on("click", ".scrollto", function() {
        console.log("scroll")
        setScroll($($(this).attr("data-target")).offset().top);
    });

    $(document).on("postmessage.scroll", function(e) {
        scrollbackto = e.postmessage.scrollbackto.offset().top;
        scrollbacktrigger = e.postmessage.scrollbacktrigger;
        $.postMessage({
            if_request_pos: true
        }, parent_url, parent);
        setScroll(e.postmessage.target.offset().top);
        console.log(scrollbacktrigger);
        $(document).on("click.scrollreturn", scrollbacktrigger, function() {
            console.log("return");
            setScroll(scrollbackto);
            $(document).off("click.scrollreturn");
        })
    })

    //setTimeout(function() { console.log("test"); $("<div class='scrollto' data-target='#headline-media'></div>").appendTo("body").trigger("click") }, 3000)
    function getMessageData(label, data, forcenumber) {
        forcenumber = typeof forcenumber !== 'undefined' ? forcenumber : false;
        var re = new RegExp(".*if_" + label + "=(.*?)(?:&|$)");
        var m;
        console.log(re);
        if ((m = re.exec(data)) !== null) {
            if (m.index === re.lastIndex) {
                re.lastIndex++;
            }
            return (forcenumber) ? Number(m[1]) : m[1]
        } else {
            return false;
        }
    }
    $.receiveMessage(function(e) {
        console.log(e.data);
        iframe_height -= 1;
        $("html, body").scrollTop(iframe_height + 1000);
        $("html, body").scrollTop(0);
    }, domain_url);

    $(document).on("click", ".gallery-item", function() {
        $("#scrolltopopup").click();
        $("#scrollback").attr("data-target", "#" + jQuery(this).attr("id"));
    });

    $(document).on("click", ".close", function() {
        $("#scrollback").click();
    });



});