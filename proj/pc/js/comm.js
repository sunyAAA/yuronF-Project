
var Config = {
    baseUrl : "https://yuronfu.com/finance/",
    // baseUrl : "http://192.168.2.107:8080/",
    imgHost : "https://yuronfu.com/finance/",
    pageSize : 10
};

var Local = {
    save:function (k, v) {
        var vs = JSON.stringify(v);
        localStorage.setItem(k, vs);
    },
    get:function (k) {
        var v = localStorage.getItem(k);
        try {
            v = JSON.parse(v);
        } catch (e){}
        return v;
    },
    del:function (k) {
        localStorage.removeItem(k);
    },
    user:function (v) {
        if(v) {
            Local.save("jrpcu", v);
        } else {
            var u = Local.get("jrpcu");
            if(u && u.customerid)
                return u;
            else
                return null;
        }
    },
    deluser:function () {
        localStorage.removeItem("jrpcu");
    }
};
window.muser = Local.user();
if(!window.muser && self===top) {
    if(location.href.indexOf("login")<0 && location.href.indexOf("article")<0) {
        top.location.href="login.html";
    }
}

//ajax请求
var Http = {
    get:function (extra, obj, success, error, alert, page) {
        jQuery.support.cors = true;
        alert==null&&(alert=true);
        !obj&&(obj={});
        obj._t = new Date().getTime();
        var u = Local.user();
        if (u&&obj) 
            obj._token=u.token;
        obj._device = 4;
        (page&&!obj.pagesize)&&(obj.pagesize = Config.pageSize);
        if(extra.indexOf('http')!==0)
            extra = Config.baseUrl + extra;
        $.ajax({type: 'GET', timeout : 20000, url: extra , data: obj, dataType: 'json',
            success: function (data) {
                Http.handledata(data, success, error, alert, page, obj.pagesize);
            },
            error: function (err) {
                LoadingBox.hide();
                error&&error("网络异常");
                setTimeout(function () {
                    alert&&top.layer.msg("网络请求超时");
                }, 500);
            }
        });
    },
    post:function (extra, obj, success, error, alert, page) {
        jQuery.support.cors = true;
        alert==null&&(alert=true);
        !obj&&(obj={});
        obj._t = new Date().getTime();
        var u = Local.user();
        if (u&&obj) 
            obj._token=u.token;
        obj._device = 4;
        (page&&!obj.pagesize)&&(obj.pagesize = Config.pageSize);
        var ie = navigator.userAgent.indexOf("MSIE 9.0")>0 || navigator.userAgent.indexOf("MSIE 8.0")>0 || navigator.userAgent.indexOf("MSIE 7.0")>0;
        var a = "?";
        for (var i in obj) {
            a += (i + "=" + obj[i] + "&");
        }
        if(extra.indexOf('http')!==0)
            extra = Config.baseUrl + extra;
        $.ajax({type: 'POST', timeout : 20000, url: extra + (ie?a:""), data: ie?{}:obj, dataType: 'json',
            success: function (data) {
                Http.handledata(data, success, error, alert, page, obj.pagesize, obj._original);
            },
            error: function (err) {
                LoadingBox.hide();
                error&&error("网络异常");
                setTimeout(function () {
                    top.layer.msg("网络请求超时");
                }, 500);
            }
        });
    },
    handledata:function (data, success, error, alert, page, pagesize, or) {
        if(or) success&&success(data);
        else if (parseInt(data.code) === 1) {
            if (page && data.totalCount!=null) {
                var pages = 0;
                !data.data&&(data.data=[]);
                (data.data&&data.data.length>0)&&(pages=parseInt(data.totalCount / (pagesize+1) + 1));
                success&&success({list:data.data, pages:pages, total:data.totalCount});
            } else {
                success&&success(data.data);
            }
            return 0 ;
        } else if (parseInt(data.code) === 110) {
            //登录信息失效
            if(!Http.authErr) {
                Http.authErr = true;
                LoadingBox.hide();
                Local.save("authErr", "1");
                Local.deluser();
                top.location.href = "login.html";
            }
            return 0;
        } else {
            if (top.layer && alert) {
                top.layer.msg(data.msg);
            }
            LoadingBox.hide();
            error&&error(data.msg);
        }
    },
    authErr:false,
};

window.onload=function () {
    var id_es = document.querySelectorAll("[id]");
    for(var i=0;i<id_es.length;i++) window["id_"+id_es[i].getAttribute("id")] = id_es[i];
    $.ajaxSetup({cache:false});
    cload();
    window.pageload&&pageload();
    (window.laydate&&laydate.skin)&&laydate.skin("dahong");
    $('input, textarea').placeholder&&$('input, textarea').placeholder();
};

if(self != top) {
    window.LoadingBox = {
        show:top.LoadingBox.show,
        hide:top.LoadingBox.hide
    }
} else {
    window.LoadingBox = {
        tags:[],
        cover:0,
        show:function() {
            if(LoadingBox.cover<=0) {
                LoadingBox.tags.push(top.layer.load(1));
                LoadingBox.cover=0;
            }
            LoadingBox.cover++;
            console.log(LoadingBox.cover);
        },
        hide:function(){
            LoadingBox.cover--;
            console.log(LoadingBox.cover);
            setTimeout(function () {
                if(LoadingBox.cover<=0) {
                    var cs = LoadingBox.tags.length;
                    for(var i=0;i<cs;i++) {
                        top.layer.close(LoadingBox.tags.pop());
                    }
                    LoadingBox.cover=0;
                    setTimeout(function () {
                        var sl = top.document.querySelector(".layui-layer-loading");
                        if(sl) {
                            sl.style.display="none";
                            var ss = getPreviousElement(sl);
                            if(ss && ss.className.indexOf("layui-layer-shade")>-1)
                                ss.style.display="none";
                        }
                    },500)
                }
            },200);
        }
    }
}

//修复ie9与safari的sort方法
+function(window){
    var ua = window.navigator.userAgent.toLowerCase(),
        reg = /msie|applewebkit.+safari/;
    if(reg.test(ua)){
        var _sort = Array.prototype.sort;
        Array.prototype.sort = function(fn){
            if(!!fn && typeof fn === 'function'){
                if(this.length < 2) return this;
                var i = 0, j = i + 1, l = this.length, tmp, r = false, t = 0;
                for(; i < l; i++){
                    for(j = i + 1; j < l; j++){
                        t = fn.call(this, this[i], this[j]);
                        r = (typeof t === 'number' ? t : !!t ? 1 : 0) > 0 ? true : false;
                        if(r){
                            tmp = this[i];
                            this[i] = this[j];
                            this[j] = tmp;
                        }
                    }
                }
                return this;
            }else{
                return _sort.call(this);
            }
        };
    }
}(window);

//输入框验证
var InputVal = {
    test:function (inps, dict) {
        !dict&&(dict={});
        var err = null;
        var obj = {};
        for(var i=0;i<inps.length;i++) {
            var inp = inps[i];
            if(inp.className.indexOf("placeholder")<0) {
                var k = inp.getAttribute("k");
                if(!dict[k]) {
                    if(!inp.hasAttribute("empty") && inp.value.toString().length<=0) {
                        var empt = inp.getAttribute("emptext");
                        if(!empt) {
                            empt = inp.getAttribute("placeholder");
                        }
                        err = empt;
                        break;
                    }
                    if(inp.hasAttribute("reg")) {
                        var reg = inp.getAttribute("reg");
                        if(!eval(reg).test(inp.value)) {
                            err = inp.getAttribute("regtext");
                            break;
                        }
                    }
                }
                obj[k] = inp.value;
            }
        }
        if(err) {
            return {msg:err, data:null};
        } else
            return {data:obj};
    }
};

var Unit = {
    getImgUrl:function(u, ex) {
        if(!u) return 'img/error.png';

        if(u.indexOf("http")===0)
            return u;
        if(u.indexOf("storage/")<0)
            u = "storage/"+u;
        u = Config.imgHost + u + (ex?ex:'');
        return u;
    },
    time:function(t, format) {
        t = parseInt(t);
        !format&&(format = "yyyy-MM-dd HH:mm");
        var d = new Date(t);
        var date = {
            "M+": d.getMonth() + 1,
            "d+": d.getDate(),
            "H+": d.getHours(),
            "m+": d.getMinutes(),
            "s+": d.getSeconds(),
            "q+": Math.floor((d.getMonth() + 3) / 3),
            "S+": d.getMilliseconds()
        };
        if (/(y+)/i.test(format)) {
            format = format.replace(RegExp.$1, (d.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        for (var k in date) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1
                    ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
            }
        }
        return format;
    },
    query: function (n, u) {
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
    },
    chooseImg:function (cb, max) {
        var ei =top.layer.open({
            type: 2,
            title: '上传图片',
            area: ['400px', '400px'],
            content: 'inc/upimg/upimg.html'
        });
        
        max&&(top.window.querySelector(".layui-layer iframe").contentWindow.max_number = max);
        top.imgComplete = function (imglist) {
            if(imglist.length>0){
                top.layer.close(ei);
                cb&&(cb(imglist));
            } else {
                top.layer.msg("请先上传图片");
            }
        };
    }
};



function cload() {
    if(self===top) {
        var u = Local.user();
        if(u) {
            var us = document.querySelectorAll("[u]");
            for(var i=0;i<us.length;i++) {
                var p = us[i].getAttribute("u");
                if(p==='head') us[i].src = Unit.getImgUrl(u[p]);
                else us[i].innerHTML = u[p]?u[p]:'&nbsp;';
            }
            // if(!Local.get("autologin")) {
            //     var logintime = parseInt(Local.get("logintime"));
            //     isNaN(logintime)&&(logintime = 0);
            //     if(new Date().getTime() - 3*60*60*1000 > logintime) {
            //         Local.deluser();
            //         top.location.href = "login.html";
            //     }
            // }
            // Local.save("logintime", new Date().getTime())
        }
    }
}
var logintime = parseInt(Local.get("logintime"));
isNaN(logintime)&&(logintime = 0);
if(new Date().getTime() - 3*60*60*1000 > logintime) {
    Local.deluser();
    top.location.href = "login.html";
}
Local.save("logintime", new Date().getTime());

function getNextElement(element){
    var ele = element;
    if(ele.nextElementSibling) return ele.nextElementSibling;
    do{
        ele = ele.nextSibling;
    }while(ele && ele.nodeType !== 1);
    return ele;
}

// 获取上一个紧邻的兄弟元素
function getPreviousElement(element){
    var ele = element;
    if(ele.previousElementSibling) return ele.previousElementSibling;
    do{
        ele = ele.perviousSibling;
    }while(ele && ele.nodeType !== 1);
    return ele;
}

function setTBodyInnerHTML(tbody, html, table) {
    if(tbody) {
        var div = document.createElement('div');
        var l = tbody.rows.length;
        for(var i=0;i<l - 1;i++)
            tbody.removeChild(tbody.rows[tbody.rows.length-1]);
        div.innerHTML = '<table>' + tbody.innerHTML + html + '</table>';
        var tb = tbody.parentNode;
        tb.replaceChild(div.firstChild.firstChild, tbody);
        return tb.getElementsByTagName('tbody')[0];
    }
}



var Check = {
    tc:null,
    cs:[],
    noTH:0,
    init:function (cs) {
        Check.tc = document.querySelector("table th .checkbox");
        if(!cs)
            cs = document.querySelectorAll("table td .checkbox");
        if(Check.noTH) {
            if(document.querySelector("table .th .checkbox")) {
                Check.tc = cs[0];
                for(var i=0;i<cs.length;i++) {
                    if(i>0) Check.cs.push(cs[i]);
                }
            } else
                Check.cs = cs;
        } else
            Check.cs = cs;
        if(Check.tc) {
            Check.tc.onclick = function () {
                var cl = Check.ifCheckAll();
                Check.tc.className = cl ? "checkbox" : "checkbox ok";
                Check.setImg(Check.tc);
                Check.checkAll(!cl);
            };
        }
        for(var i=0;i<Check.cs.length;i++)
            Check.cs[i].onclick = function () {
                if(!Check.tc) {
                    var cok = document.querySelector("table .checkbox.ok");
                    if(cok) {
                        cok.className = "checkbox";
                        Check.setImg(cok);
                    }
                }
                this.className = this.className.indexOf("ok")>-1 ? "checkbox" : "checkbox ok";
                Check.setImg(this);
                if(Check.tc) {
                    if(Check.ifCheckAll())
                        Check.tc.className = "checkbox ok";
                    else
                        Check.tc.className = "checkbox";
                    Check.setImg(Check.tc);
                }
            }
    },
    setImg:function (e) {
        if(!e) return;
        var img = e.querySelector("img");
        if(img) {
            if(e.className.indexOf("ok")>-1)
                img.src = e.className.indexOf("radio")>-1 ? 'img/crok.png' :  'img/cok.png';
            else
                img.src = e.className.indexOf("radio")>-1 ? 'img/crno.png' :  'img/cno.png';
        }
    },
    ifCheckAll:function () {
        for(var i=0;i<Check.cs.length;i++)
            if(Check.cs[i].className.indexOf('ok')<=1)
                return false;
        return true;
    },
    checkAll:function (c) {
        for(var i=0;i<Check.cs.length;i++) {
            Check.cs[i].className = c ? "checkbox ok" : "checkbox";
            Check.setImg(Check.cs[i]);
        }
    },
    getCheckIds:function() {
        var cs = document.querySelectorAll(".checkbox.ok");
        var ids = [];
        for(var i=0;i<cs.length;i++) {
            var tid = cs[i].getAttribute("tid");
            if(tid) ids.push(tid);
        }
        return ids;
    }
};


function zzDomReset(zzid) {

    if(zzid) {
        var zzbtns = document.querySelectorAll("[zz]");
        for(var i=0;i<zzbtns.length;i++) {
            zzbtns[i].style.display="none";
        }
        var obtns = document.querySelectorAll(".bcw select, .bcw .btn");
        for(var i=0;i<obtns.length;i++) {
            obtns[i].style.width = '11%';
        }
        var bcwd = document.querySelector(".bcw>div");
        bcwd.style.paddingBottom='0px';
        bcwd.parentNode.style.marginBottom='0px';
        bcwd.style.margin = "0px 20px 0px 0px";
        document.querySelector(".bbox.bcw").style.padding = "25px 15px";
    }
}

function getObjectURL(file) {
    var url = null;
    if (window.createObjectURL != undefined) { // basic
        url = window.createObjectURL(file);
    } else if (window.URL != undefined) { // mozilla(firefox)
        url = window.URL.createObjectURL(file);
    } else if (window.webkitURL != undefined) { // webkit or chrome
        url = window.webkitURL.createObjectURL(file);
    }
    return url;
}

function sharePC() {
    Prompt.openIfr('casesharecode.html?sharelogin=1', {w:400,h:352,sc:true,sd:.3})
}


var projstages = [{i:0,t:'前期准备'},{i:1,t:'正在进行'},{i:2,t:'中止'},{i:3,t:'签约执行'},{i:4,t:'终止'}];
var projtypes = [{i:0,t:'个人'},{i:1,t:'民营企业'},{i:2,t:'上市公司'},{i:3,t:'国有企业'},{i:4,t:'公用事业单位'},{i:5,t:'政府信用类'},{i:6,t:'其他'}];
var casetypes = [{i:0,t:'未知'},{i:1,t:'租赁'},{i:2,t:'保理'},{i:3,t:'银行贷款'},{i:4,t:'其他'}];
var casesources = [{i:0,t:'自建'},{i:1,t:'接收'}];
var casestatus = [{i:0,t:'未知'},{i:1,t:'洽谈中'},{i:2,t:'已确认'},{i:3,t:'终止'},{i:4,t:'签约执行'}];

var caseModel = {
    base:[
        [{n:"融资方", c:"无", s:1, t:1}],
        [{n:"出资方", c:"无", s:1, t:1}],
        [{n:"担保人", c:"无", s:1, t:1}],
        {n:"物件", c:"无", s:1, t:1},
        {n:"增信措施", c:"无", s:1, t:1},
        {n:"项目总额", c:"无", s:0, t:2},
        {n:"期限（年）", c:"无", s:0, t:2},
        {n:"首付款金额", c:"无", s:0, t:2},
        {n:"总还款次数", c:"无", s:0, t:2},
        {n:"保证金金额", c:"无", s:0, t:2},
        {n:"年利率", c:"无", s:0, t:2},
        {n:"还款总额", c:"无", s:0, t:2},
        {n:"服务费收入", c:"无", s:0, t:2},
        {n:"利息总额", c:"无", s:0, t:2},
        {n:"咨询费收入", c:"无", s:0, t:2},
        {n:"残值收入", c:"无", s:0, t:2},
        {n:"保险收入", c:"无", s:0, t:2},
        {n:"起租日", c:"无", s:0, t:2},
        {n:"总负担率（年）", c:"无", s:0, t:2},
        {n:"", c:"", s:0, t:2},
        {n:"平面利率（年）", c:"无", s:0, t:2}],
    detail:[
        {n:"期次", s:0},
        {n:"还款日", s:0},
        {n:"还款收入", s:0},
        {n:"利息收入", s:1},
        {n:"回收成本", s:1}
    ]
};

var mutiDict = {'起租日':['起租日','起始日','起息日'],'融资方':['融资方','承租人','借款人','保理客户'], '出资方':['出资方', '出租人','贷款人','保理商'], '物件':['物件','租赁物件','质押物','抵押物']};

var u = Local.user();
if(u) {
    var msgno = document.querySelector('[num="msg"]');
    if(msgno) {
        Http.get("api/message/list", {pageno:1,pagesize:1,isread:0,type:''}, function (r) {
            msgno.innerHTML = r.total;
        },null,null,true);
    }

    var vip = document.querySelector("#vips .uicon>img");
    var tvip = document.querySelector(".topBox .v>img");
    if(u.level===0) {
        if(vip)
            vip.parentNode.parentNode.removeChild(vip.parentNode);
        if(tvip)
            tvip.parentNode.parentNode.removeChild(tvip.parentNode);
    } else if(u.level===1) {
        if(vip)
            vip.src = "img/gv.png";
        if(tvip)
            tvip.src = "img/gvip.png";
    } else if(u.level===2) {
        if(u.vipterm && u.vipterm>new Date().getTime()) {
            if(vip)
                vip.src = "img/v.png";
            if(tvip)
                tvip.src = "img/vip.png";
        } else {
            if(vip)
                vip.src = "img/gv.png";
            if(tvip)
                tvip.src = "img/gvip.png";
        }
    }
}

function toMoney(number, places, symbol, thousand, decimal) {
    places = !isNaN(places = Math.abs(places)) ? places : 2;
    symbol = symbol !== undefined ? symbol : "";
    thousand = thousand || ",";
    decimal = decimal || ".";
    negative = number < 0 ? "-" : "",
        i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
}


function radioNumber(a) {
    !a&&(a=0);
    return parseInt(parseFloat(a) * 10000)/100 + "%";
}


function userPrivilege(cb) {
    window.privilege = 0;
    var u = Local.user();
    if(u.level==2 && u.vipterm && u.vipterm > new Date().getTime()) window.privilege = 1;
    cb&&cb();
}


function resetTableSort() {
    var desOrder = Local.get("designIdx");
    if(desOrder)
        desOrder = desOrder.split(",");
    if(!desOrder || desOrder.length!=40) desOrder=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39];

    var datatb = false;
    if(window.innerTbBox)
        datatb = true;

    var tdlines = {};
    for(var i=0;i<tbd.rows.length;i++) {
        for(var j=0;j<tbd.rows[i].cells.length;j++) {
            var idx = datatb?j:j-2;
            var start = datatb?-1:1;
            if(j>start) {
                !tdlines[idx]&&(tdlines[idx] = []);
                tdlines[idx].push(tbd.rows[i].cells[j]);
            }
        }
    }

    for(var i in tdlines) {
        if(tdlines.hasOwnProperty(i)) {
            for(var j=0;j<tdlines[i].length;j++) {
                tdlines[i][j].parentNode.removeChild(tdlines[i][j]);
            }
        }
    }
    for(var i=0;i<desOrder.length;i++) {
        for(var j=0;j<tbd.rows.length;j++) {
            if(tdlines[desOrder[i]])
                tbd.rows[j].appendChild(tdlines[desOrder[i]][j]);
        }
    }
}


