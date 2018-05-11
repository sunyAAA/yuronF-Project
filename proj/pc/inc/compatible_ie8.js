/**
 * Created by lemon on 2017/1/19.
 */


var e = "abbr, article, aside, audio, canvas, datalist, details, dialog, eventsource, figure, footer, header, hgroup, mark, menu, meter, nav, output, progress, section, time, video, check, cite".split(', ');
var i= e.length;
while (i--){
    document.createElement(e[i])
}
document.write('<scri'+'pt src="inc/json2.js" type="text/javascript"></s'+'cript>');
document.write('<scri'+'pt src="inc/jquery.xdomainrequest.min.js" type="text/javascript"></s'+'cript>');
document.write('<scri'+'pt src="inc/jquery.placeholder.min.js" type="text/javascript"></s'+'cript>');
//兼容IE8的空console对象
window._console = window.console;//将原始console对象缓存
window.console = (function (orgConsole) {
    return {//构造的新console对象
        log: getConsoleFn("log"),
        debug: getConsoleFn("debug"),
        info: getConsoleFn("info"),
        warn: getConsoleFn("warn"),
        exception: getConsoleFn("exception"),
        assert: getConsoleFn("assert"),
        dir: getConsoleFn("dir"),
        dirxml: getConsoleFn("dirxml"),
        trace: getConsoleFn("trace"),
        group: getConsoleFn("group"),
        groupCollapsed: getConsoleFn("groupCollapsed"),
        groupEnd: getConsoleFn("groupEnd"),
        profile: getConsoleFn("profile"),
        profileEnd: getConsoleFn("profileEnd"),
        count: getConsoleFn("count"),
        clear: getConsoleFn("clear"),
        time: getConsoleFn("time"),
        timeEnd: getConsoleFn("timeEnd"),
        timeStamp: getConsoleFn("timeStamp"),
        table: getConsoleFn("table"),
        error: getConsoleFn("error"),
        memory: getConsoleFn("memory"),
        markTimeline: getConsoleFn("markTimeline"),
        timeline: getConsoleFn("timeline"),
        timelineEnd: getConsoleFn("timelineEnd")
    };
    function getConsoleFn(name) {
        return function actionConsole() {
            if (typeof (orgConsole) !== "object") return;
            if (typeof (orgConsole[name]) !== "function") return;//判断原始console对象中是否含有此方法，若没有则直接返回
            return orgConsole[name].apply(orgConsole, Array.prototype.slice.call(arguments));//调用原始函数
        };
    }
}(window._console));

!window.innerHeight&&(window.innerHeight=window.screen.availHeight);
!window.innerWidth&&(window.innerWidth=window.screen.availWidth);

//兼容localStorage
var userdataobj = null;
if(typeof(localStorage)=='undefined')
{

    var  box = document.body || document.getElementsByTagName("head")[0] || document.documentElement;

    userdataobj = document.createElement('input');
    userdataobj.type = "hidden";
    userdataobj.addBehavior ("#default#userData");
    box.appendChild(userdataobj);


    //设定对象
    var localStorage= {
        setItem:function(nam,val)
        {
            userdataobj.load(nam);
            userdataobj.setAttribute(nam,val);
            var d= new Date();
            d.setDate( d.getDate()+700);
            userdataobj.expires=d.toUTCString();
            userdataobj.save(nam);
            userdataobj.load("userdata_record");
            var dt=userdataobj.getAttribute("userdata_record");
            if(dt==null)dt='';
            dt=dt+nam+",";
            userdataobj.setAttribute("userdata_record",dt);
            userdataobj.save("userdata_record");
        },
//模拟 setItem

        getItem:function(nam)
        {
            userdataobj.load(nam);
            return userdataobj.getAttribute(nam);
        },
//模拟 getItem

        removeItem:function(nam)
        {userdataobj.load(nam);
            clear_userdata(nam);
            userdataobj.load("userdata_record");
            var dt=userdataobj.getAttribute("userdata_record");
            if (dt) {
                var reg=new RegExp(nam+",","g");
                dt=dt.replace(reg,'');
                var d= new Date();
                d.setDate( d.getDate()+700);
                userdataobj.expires= d.toUTCString();
                userdataobj.setAttribute("userdata_record",dt);
                userdataobj.save("userdata_record");
            }
        },
//模拟 removeItem

        clear:function(){
            userdataobj.load("userdata_record");
            var dt=userdataobj.getAttribute("userdata_record").split(",");
            for (var i in dt)
            {if(dt[i]!='')clear_userdata(dt[i]) }
            clear_userdata("userdata_record")
        }
//模拟 clear();

    };

    function clear_userdata(keyname)//将名字为keyname的变量消除
    {var keyname;
        var d= new Date();
        d.setDate( d.getDate()-1);
        userdataobj.load(keyname);
        userdataobj.expires=d.toUTCString();
        userdataobj.save(keyname);
    }

}


//兼容Object.keys()
var DONT_ENUM =  "propertyIsEnumerable,isPrototypeOf,hasOwnProperty,toLocaleString,toString,valueOf,constructor".split(","),
    hasOwn = ({}).hasOwnProperty;
for (var i in {
    toString: 1
}){
    DONT_ENUM = false;
}
Object.keys = Object.keys || function(obj){//ecma262v5 15.2.3.14
    var result = [];
    for(var key in obj ) if(hasOwn.call(obj,key)){
        result.push(key) ;
    }
    if(DONT_ENUM && obj){
        for(var i = 0 ;key = DONT_ENUM[i++]; ){
            if(hasOwn.call(obj,key)){
                result.push(key);
            }
        }
    }
    return result;
};
function extend(dst) {
    var h = dst.$$hashKey;
    for (var i = 1, ii = arguments.length; i < ii; i++) {
        var obj = arguments[i];
        if (obj) {
            var keys = Object.keys(obj);
            for (var j = 0, jj = keys.length; j < jj; j++) {
                var key = keys[j];
                dst[key] = obj[key];
            }
        }
    }
    setHashKey(dst, h);
    return dst;
}

