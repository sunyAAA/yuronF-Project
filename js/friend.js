var frino = null;
function getfriends() {
    frino = document.getElementById("frino");
    Http.get("api/friend/list", {pageno:1,pagesize:999999,key:''}, function (r) {
        frino.innerHTML = r.length;
        if(r.length>0) {
            var fs = [];
            for(var i=0;i<r.length;i++) {
                fs.push('<div onclick="mframe.src=\'hydetail.html?fid='+r[i].friendid+'\'" class="fitem poi">\
                            <img class="fleft" src="'+Unit.getImgUrl(r[i].friendheader)+'" alt=""/>\
                            <div class="info">'+r[i].friendname+(r[i].friendremark?'('+r[i].friendremark+')':'')+'<br/>\
                                <span>'+r[i].friendphone+'</span>\
                            </div>\
                        </div>')
            }
            document.querySelector(".flist").innerHTML = fs.join("");
        }
        if(fid) mframe.src="hydetail.html?fid="+fid;
        else mframe.src="hyrecordlist.html";
    })
}

function getFriendsBox() {
    document.write('<div class="leftbox fleft bcw">\
                        <div onclick="addNew();" class="item poi">\
                            <span style="width:16px; margin:0px 1px" class="icon">\
                                <img src="img/tjhy.png" alt=""/>\
                            </span>\
                            <span style="margin-left: 5px" class="fpx14">添加好友</span>\
                        </div>\
                        <div onclick="mframe.src=\'hyrecordlist.html\'" class="item poi">\
                            <span class="icon">\
                                <img src="img/sfjl.png" alt=""/>\
                            </span>\
                            <span style="margin-left: 5px" class="fpx14">收发记录</span>\
                        </div>\
                        <div style="border-bottom: none" class="item">\
                            <span class="icon">\
                                <img src="img/wdhy1.png" alt=""/>\
                            </span>\
                            <span style="margin-left: 5px" class="fpx14">我的好友（<span id="frino">0</span>）</span>\
                        </div>\
                        <div class="flist"></div>\
                    </div>');
}


function getPopBox() {
    document.write('<div class="popbox hide bcw pop1" style="border-radius: 8px">\
    <div style="width: 100%" class="hsearch">\
        <div class="inpbox fleft">\
            <span onclick="searchfriends()" class="fright tc fpx14 c73 poi">搜索</span>\
            <div class="inp">\
                <input id="phoneInp" maxlength="11" class="w100" type="text" placeholder="输入手机号码"/>\
            </div>\
        </div>\
    </div>\
    <div style="margin-top: 25px" class="finfo hide oh">\
        <div class="fleft face">\
            <img src="img/error.png" alt=""/>\
        </div>\
        <div class="ct">\
            <span class="fpx14">&nbsp;</span><br/>\
            <span class="cf7">&nbsp;</span><br/>\
            <span onclick="applyadd()" style="padding: 4px 6px; border-radius: 5px" class="bcf7 cw poi"><span class="cw fpx16" style="font-weight: 600">+</span>加为好友</span>\
        </div>\
    </div>\
</div>\
<div class="popbox bcw pop2 hide" style="border-radius: 8px">\
    <div style="line-height: 40px">你需要发送验证申请，等对方通过</div>\
    <div class="inp">\
        <input id="valapply" type="text" placeholder="请输入验证信息"/>\
    </div>\
    <div class="hide" style="line-height: 40px">为朋友设置备注</div>\
    <div class="inp hide">\
        <input id="valremark" type="text" placeholder="语融服总经理"/>\
    </div>\
    <div class="btns tc">\
        <span onclick="layer.close(infoTag)" style="margin-right: 65px" class="tc poi gray c73">取消</span>\
        <span onclick="sure(1)" class="bcf7 cw tc poi">发送</span>\
    </div>\
</div>')
}



var newTag = 0;
function addNew() {
    document.querySelector(".pop1 input").value = "";
    document.querySelector(".finfo").style.display="none";
    newTag = layer.open({
        area: ['auto', 'auto'],
        type: 1,
        shade: .3,
        shadeClose: true,
        closeBtn: 0,
        title: false,
        content: $('.pop1'),
        cancel: function(){}
    });
}
var infoTag = 0;
function addInfo() {
    infoTag = layer.open({
        area: ['auto', 'auto'],
        type: 1,
        shade: .3,
        shadeClose: true,
        closeBtn: 0,
        title: false,
        content: $('.pop2'),
        cancel: function(){}
    });
}

var phoneInp = null;
var finfo = null;
function searchfriends() {
    phoneInp = document.getElementById("phoneInp");
    var u = Local.user();
    if(phoneInp.value == u.phone) {
        top.layer.msg("不能搜索自己");
        return;
    }
    finfo = document.querySelector(".finfo");
    if(/^1[34578]\d{9}$/.test(phoneInp.value.toString())) {
        LoadingBox.show();
        Http.post("api/customer/search", {phone:phoneInp.value, pagesize:1, pageno:1}, function(r) {
            LoadingBox.hide();
            if(r.length>0) {
                finfo.style.display="block";
                finfo.setAttribute("cid", r[0].customerid);
                finfo.setAttribute("val", r[0].addvalidate);
                finfo.className="finfo oh";
                finfo.querySelector(".face>img").src=Unit.getImgUrl(r[0].head);
                finfo.querySelector(".ct>.fpx14").innerHTML=r[0].realname?r[0].realname:'&nbsp;';
                finfo.querySelector(".ct>.cf7").innerHTML=r[0].phone;
            } else {
                finfo.className="finfo hide oh";
                finfo.removeAttribute("cid");
                layer.msg("没有搜索到好友");
            }
        })
    } else layer.msg("输入的手机号码不符合规则");
}


var u = null;
var valapply = null;
var valremark = null;
function applyadd() {
    if(!valapply) valapply = document.getElementById("valapply");
    if(!valremark) valremark = document.getElementById("valremark");
    valapply.value="";
    valremark.value="";
    var val = parseInt(finfo.getAttribute("val"));
    u = Local.user();
    if(val===1) {
        document.querySelector(".pop2 input").setAttribute("placeholder", "我是"+u.realname);
        addInfo();
    } else sure();
}

function sure(v) {
    var cid = finfo.getAttribute("cid");
    u = Local.user();
    if(cid && u) {
        LoadingBox.show();
        Http.post("api/friend/add", {friendid:cid,nickname:valapply.value?valapply.value:"我是"+u.realname}, function(r) {
            LoadingBox.hide();
            layer.closeAll();
            layer.msg(v?'申请添加用户好友成功！等待对方同意':'添加用户好友成功！');
            getfriends();
        })
    }
}