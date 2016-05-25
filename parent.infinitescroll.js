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

    var re = /offerpop\.com/;
    var m;
    var page = document.location.href;
    var domain_url = getDomain(page)
    var targetiframe;
    var if_height;
    var newsrc;
    var get_width = $(window).width();

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


    hashsrc = '#' + encodeURIComponent(document.location.href);
    $("iframe").each(function(index) {
        oldsrc = $(this).attr("src");
        if ((m = re.exec(oldsrc)) !== null) {
            var httpsre = /^(http:\/\/|\/\/)/;
            if (document.location.href.indexOf(domain_url) == -1) {
                newsrc = oldsrc.replace(httpsre, "https://") + hashsrc;
                $(this).attr("src", newsrc);
            } else {
                if (oldsrc.indexOf("//") == 0) {
                    newsrc = window.location.protocol + oldsrc;
                } else {
                    newsrc = oldsrc;
                }
            }

            $(this).prop("scrolling", "no");
            $(this).css("border", "none");
            if (get_width <= 767) {
                $(this).css({
                    'width': '1px',
                    'min-width': '100%'
                });
            }
            //$( this ).css("min-height","1500px");
            targetiframe = $(this);
            //targetiframe.wrap('<div id="offerpop-iframe-holder"></div>')
            return false;
        }
    });
    $(window).on("scroll", function(e) {
        documentbound = $(window).scrollTop() >= $(document).height() - $(window).height() - 150;
        iframebound = $(window).scrollTop() >= $("iframe").offset().top + $("iframe").height() - $(window).height() - 150
        if (documentbound || iframebound) {
            targetiframe.height(targetiframe.height() - 1);
            if_height -= 1;
            $.postMessage('triggered', newsrc, targetiframe.get(0).contentWindow);
        }
    })

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
            // Get the height from the passsed data.
            var h = getMessageData("height", e.data, true);

            if (!isNaN(h) && h > 0 && h !== if_height) {
                // Height has changed, update the iframe.
                targetiframe.height(if_height = h);
                $("#offerpop-iframe-holder").height(if_height = h);
            }

            // Get the scroll from the passsed data.
            var s = getMessageData("scroll", e.data, true);
            var o = getMessageData("offset", e.data, true);
            if (!isNaN(s) && s !== false) {
                offset = (!isNaN(o) && o !== false) ? o : 0;
                $('html, body').animate({
                    scrollTop: targetiframe.offset().top + s - offset
                }, 1000);
            }
            // An optional origin URL (Ignored where window.postMessage is unsupported).
        },
        ((document.location.href.indexOf(domain_url) == -1) ? 'https' : window.location.protocol) + '//offerpop.com');

});