/**
 * Created by lemon on 2017/10/20.
 */

if(self == top) {
    var thref = top.location.href;
    if(thref.indexOf("http://www.yuronfu.com")<0&&thref.indexOf("http://yuronfu.com")>-1) {
        top.location.href = thref.replace("http://yuronfu.com","http://www.yuronfu.com");
    } else if(thref.indexOf("www.yuronfu.com/index.html")>-1)
        top.location.href='https://www.yuronfu.com';
    else if(thref.indexOf("http://")>-1 && thref.indexOf("localhost")<0)
        top.location.href = thref.replace("http://","https://");
    window.setNav = function() {
        var topHtml = '<div class="content topBox">\
                <div class="right">\
                    <span onclick="exitUser()" >退出</span>\
                    <span onclick="location.href=\'about.html\'" >关于我们</span>\
                    <span onclick="location.href=\'personal.html?idx=1\'" >会员中心</span>\
                    <span onclick="location.href=\'msg.html\'">消息<span style="color: #999999;" num="msg">0</span></span>\
                    <div class="fright" style="width:40px">\
                        <div class="v">\
                            <img style="width: 15px; height: auto" src="img/v.png" alt=""/>\
                        </div>\
                        <div class="v" id="honTop">\
                        </div>\
                    </div>\
                    <span onclick="location.href=\'personal.html\'" style="margin-left: 5px" u="realname" class="fpx14 name"></span>\
                    <div class="fright">\
                        <div class="v">\
                            <img onerror="this.src=\'img/error.png\';this.onerror=null" class="face" u="head" alt=""/>\
                        </div>\
                    </div>\
                </div>\
                <div class="left">\
                    <img onclick="location.href=\'index.html\'" class="poi" src="img/logo.png" alt=""/>\
                </div>\
            </div>\
            <div class="bcf7 topNav">\
                <div class="content oh"></div>\
            </div>';
        document.write(topHtml);
        var idx = parseInt(mquery("idx"));
        isNaN(idx)&&(idx=0);
        var topNavs = [{name:'工作台', img:'index'},{name:'测算表', img:'csb'},{name:'项目管理', img:'xmgl'},{name:'临时文件', img:'lswj'},{name:'方案模板', img:'famb'},{name:'组织', img:'zz'},{name:'好友', img:'hy'},{name:'统计', img:'tj'}];
        var tes = [];
        for(var i=0;i<topNavs.length;i++) {
            var select = false;
            if(location.href.indexOf(topNavs[i].img+".html")>-1) select=true;
            else if(topNavs[i].img==="hy" && location.href.indexOf("hydetail")>-1) select=true;
            else if(topNavs[i].img==="index" && location.href.indexOf('.html')<0) select=true;
            tes.push('<div tag="'+topNavs[i].img+'" class="fleft item tc '+(select?'ok':'')+'">\
                    <div class="imgbox">\
                        <img src="img/'+topNavs[i].img+'.png">\
                    </div>\
                    <div class="cw">'+topNavs[i].name+'</div>' +
            '</div>')
        }
        document.querySelector(".topNav>.content").innerHTML = tes.join("");
        var is = document.querySelectorAll(".topNav .item");

        for(var i=0;i<is.length;i++)
            is[i].onclick = function () {
                Local.del("page");
                location.href = this.getAttribute("tag")+".html";
            }
        

        function mquery(n, u) {
            if (n == null) {
                n = self.location.search; if (n && n !== "") try {return decodeURIComponent(n.replace("?", ""))} catch (err) {};return null;
            }
            var s = u; if (s == null) s = self.location.href;
            if (n) {
                var g = new RegExp("(\\?|&)" + n + "=([^&|#]*)"); 
                var r = s.match(g);
                if (r) { try { return decodeURIComponent(r[2]); } catch (err) { return unescape(r[2]); } } else return null;
            } else {
                var i = s.indexOf("?"); if (i === -1) return null; return decodeURIComponent(s.substr(i + 1));
            }
        }
    }
}

//分页函数
var pagerDict = {};
function Pager(e) {
    this.ele = e;
    if(e.id)
        pagerDict[e.id] = this;
    this.cur = 1;
}
var pagerData = {
    get:function(cur, total) {
        if(cur > total)
            return [];
        var p = [];
        if(total > 5) {
            if(cur>3)
                p.push(1);
            if(cur===5)
                p.push(2);
            if(cur>5)
                p.push("...");
            var s = cur-2>0?cur-2:1;
            var end = cur+2>total?total:cur+2;
            for(var i=s;i<=end;i++) 
                p.push(i);
            if(total-cur>4)
                p.push("...");
            if(total-cur===4)
                p.push(total-1);
            if(total-cur>2)
                p.push(total);
        } else {
            for(var i=1;i<=total;i++)
                p.push(i);
        }
        return p;
    }
}
Pager.prototype.config = function (cur, total) {
    var e = this.ele;
    this.total = total;
    var sp = Local.get("page");
    if(sp && sp.url !== p.getTag()) {
        sp.num = 1;
        Local.del("page");
    }
    if(sp && sp.num && cur)
        cur = sp.num;
    this.cur = cur;
    var pgs = [];
    var end = false;
    if(cur!==1)
        pgs.push('<span class="pre">\
                                    <img src="img/pager-pre.png" alt=""/>\
                                </span>');
    var ps = pagerData.get(cur, total);
    for(var i=0;i<ps.length;i++) {
        pgs.push('<span class="pg '+(ps[i]===cur?'cur':'')+'">'+ps[i]+'</span>')
    }
    // if(cur<6) {
    //     var tts = total>4?6:total+1;
    //     for(var i=1;i<tts;i++)
    //         pgs.push('<span class="pg '+(i===cur?'cur':'')+'">'+i+'</span>');
    //     if(cur>4) {
    //         for(var i=1;i<cur-2;i++)
    //             pgs.push('<span class="pg '+(i===cur?'cur':'')+'">'+(i+5)+'</span>')
    //     }
    //     if(total>5)
    //         end = true;
    // } else {
    //     for(var i=1;i<3;i++)
    //         pgs.push('<span class="pg">'+i+'</span>');
    //     pgs.push('<span class="pg skip">...</span>');
        
    //     for(var i=1;i<(total-cur>4?6:4+(total-cur));i++)
    //         pgs.push('<span class="pg '+(i===3?'cur':'')+'">'+(cur+i-3)+'</span>');
    //     if(total>cur+4)
    //         end = true;
    // }
    // if(end) {
    //     pgs.push('<span class="pg skip">...</span>');
    //     for(var i=1;i<3;i++)
    //             pgs.push('<span class="pg">'+(total-2+i)+'</span>');
    // }
    if(cur<total) {
        pgs.push('<span class="next">\
                                    <img src="img/pager-next.png" alt=""/>\
                                </span>')
    }
    e.innerHTML = '<span class="ct">'+pgs.join("")+
        '<span class="num">共'+total+'页</span>'+(total>1?'\
                                <span class="pginpbox">\
                                    <span class="fleft">到</span>\
                                    <span class="pginp">\
                                        <input min="0" max="'+total+'" type="number"/>\
                                    </span>页\
                                </span>\
                                <span class="okbtn">确认</span>':'')+'\
                            </span>';
    var gs = this.ele.querySelectorAll(".pager span.pg");
    var po = this;
    for(var i=0;i<gs.length;i++) {
        gs[i].eleId = this.ele.id;
        gs[i].onclick = function () {
            if(this.eleId && pagerDict[this.eleId])
                po = pagerDict[this.eleId];
            if(this.className.indexOf('cur')<0) {
                var n = parseInt(this.innerHTML);
                if(!isNaN(n)) {
                    po.change(n, function (a, b) {
                        Local.save("page", {num:n, url:po.getTag()});
                        po.config(n, b);
                    });
                }
            }
        }
    }
    var ok = this.ele.querySelector(".okbtn");
    if(ok) {
        ok.eleId = this.ele.id;
        ok.onclick = function () {
            if(this.eleId && pagerDict[this.eleId])
                po = pagerDict[this.eleId];
            var v = document.querySelector(".pginp>input");
            var n = parseInt(v.value);
            if(!isNaN(n) && n!=cur && n<=po.total) {
                po.change(n, function (a, b) {
                    Local.save("page", {num:n, url:po.getTag()});
                    po.config(n, b);
                })
            } else top.layer.msg("超过最大页数");
        }
    }
    var pre = this.ele.querySelector(".pre");
    if(pre) {
        pre.eleId = this.ele.id;
        pre.onclick = function () {
            if(this.eleId && pagerDict[this.eleId])
                po = pagerDict[this.eleId];
            po.cur--;
            po.change(po.cur, function (a, b) {
                Local.save("page", {num:po.cur, url:po.getTag()});
                po.config(po.cur, b);
            })
        }
    }
    var next = this.ele.querySelector(".next");
    if(next) {
        next.eleId = this.ele.id;
        next.onclick = function () {
            if(this.eleId && pagerDict[this.eleId])
                po = pagerDict[this.eleId];
            po.cur++;
            po.change(po.cur, function (a, b) {
                Local.save("page", {num:po.cur, url:po.getTag()});
                po.config(po.cur, b);
            })
        }
    }
};
Pager.prototype.change = function (pageno, cb) {};
Pager.prototype.refresh = function () {
    var po = this;
    po.change(1, function (a, b) {
        !b&&(b=1);
        Local.save("page", {num:1, url:po.getTag()});
        po.config(1, b);
    })
};
Pager.prototype.getTag = function () {
    var pres = location.href.split(".html")[0].split("/");
    return pres[pres.length-1];
};
Pager.prototype.pageok = function () {
    var p = this;
    var sp = Local.get("page");
    if(sp && sp.url !== p.getTag()) {
        sp.num = 1;
        Local.del("page");
    }
    this.change(sp&&sp.num?sp.num:1, function (cur, total) {
        total<=0&&(total=1);
        p.config(cur, total);
    })
};



if(self == top) {
    window.Prompt = {
        alert:function (o, cb) {
            var a = document.querySelector(".pt-box");
            if(!a) {
                a = document.createElement("DIV");
                a.className = "pt-box";
                a.innerHTML = o.text + "<div class='pt-btns'><span onclick='Prompt.ok(1, this, \"a\")' class='pt-btn red poi'>确认</span></div>";
                document.body.appendChild(a);
            }
            var n = Prompt.open($(a));
            Prompt.winDict.a[n] = cb;
            var pops = document.querySelectorAll(".layui-layer-content");
            var pop = pops[pops.length-1];
            var bs = pop.querySelectorAll(".pt-btn");
            for(var i=0;i<bs.length;i++)
                bs[i].setAttribute("idx", n);
        },
        confirm:function (o, cb) {
            var a = document.querySelector(".pt-box");
            if(!a) {
                a = document.createElement("DIV");
                a.className = "pt-box";
                document.body.appendChild(a);
            }
            a.innerHTML = o.text + "<div class='pt-btns'><span  onclick='Prompt.ok(0, this)' class='pt-btn gray poi'>取消</span><span style='margin-left: 50px'  onclick='Prompt.ok(1, this)' class='pt-btn red poi'>确认</span></div>";
            var n = Prompt.open($(a));
            Prompt.winDict.c[n] = cb;
            var pops = document.querySelectorAll(".layui-layer-content");
            var pop = pops[pops.length-1];
            var bs = pop.querySelectorAll(".pt-btn");
            for(var i=0;i<bs.length;i++)
                bs[i].setAttribute("idx", n);
        },
        open:function (e) {
            console.log(e);
            return layer.open({
                area: ['auto', 'auto'],
                type: 1,
                shade: .3,
                shadeClose: false,
                closeBtn: 0,
                title: false, //不显示标题
                content: e, //捕获的元素，注意：最好该指定的元素要存放在body最外层，否则可能被其它的相对元素所影响
                cancel: function(){e.style.display="";}
            });
        },
        winDict:{a:[],c:[]},
        ok:function (t, e, a) {
            var n = parseInt(e.getAttribute("idx"));
            if(n) {
                var p = 'c';
                if(a) p = a;
                Prompt.winDict[p][n]&&Prompt.winDict[p][n](t);
                layer.close(n);
            } else
                layer.closeAll();
            document.querySelector(".pt-box").style.display="";
        },
        ifrDict:{},
        ifrTags:[],
        tempObj:null,
        openIfr:function(src, o, cb) {
            var ifrDict = Prompt.ifrDict;
            var ifrTags = Prompt.ifrTags;
            Prompt.tempObj = o.o;
            var k = src.split(".")[0];
            var tag = layer.open({type: 2,title: false, shadeClose: o.sc?true:false,closeBtn: 0,shade: [o.sd?o.sd:0],area: [o.w+"px", o.h+"px"],anim: 2,resize: false,content: [src, 'no']});
            ifrDict[k] = {tag:tag,cb:cb};
            ifrTags.push(tag);
        },
        closeIfr:function(d, u) {
            var ifrDict = Prompt.ifrDict;
            var ifrTags = Prompt.ifrTags;
            if(u && a) {
                var a = ifrDict[u];
                layer.close(a.tag);
                for(var i=0;i<ifrTags.length;i++) {
                    if(ifrTags[i]==a.tag) {
                        ifrTags.splice(i, 1);
                        break;
                    }
                }
                a.cb&&a.cb(d);
            } else {
                var tag = ifrTags.pop();
                layer.close(tag);
                for(var i in ifrDict) {
                    if(ifrDict.hasOwnProperty(i)) {
                        if(ifrDict[i].tag==tag) {
                            ifrDict[i].cb&&ifrDict[i].cb(d);
                            break;
                        }
                    }
                }
            }
            
        }
    };
} else {
    window.Prompt = {
        alert:top.Prompt.alert,
        confirm:top.Prompt.confirm,
        open:top.Prompt.open,
        openIfr:top.Prompt.openIfr,
        closeIfr:top.Prompt.closeIfr,
        getObj:function () {
            return top.Prompt.tempObj;
        }
    }
}


function setIframeHeight(iframe, ex) {
    !ex&&(ex=0);
    if (iframe) {
        var iframeWin = iframe.contentWindow || iframe.contentDocument.parentWindow;
        if (iframeWin.document.body) {
            iframe.style.height = ((iframeWin.document.body.scrollHeight || iframeWin.document.documentElement.scrollHeight) + ex) + "px";
        }
    }
}
function exitUser() {
    Local.deluser();
    top.location.href = "login.html";
}