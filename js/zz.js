function zzLeftBox() {
    document.write('<div style="width: 240px; height: 690px" class="fleft">\
    <div class="box bcw" style="overflow-y: scroll">\
        <div idx="0" class="item poi bline">\
            <img class="fleft" style="width: 22px; margin-left: 17px" src="img/zz0.png" alt=""/>\
            <span class="fpx14">创建组织</span>\
        </div>\
        <div idx="1" class="item poi">\
            <img class="fleft" style="width: 22px; margin-left: 17px" src="img/zz1.png" alt=""/>\
            <span class="fpx14">我创建的组织</span>\
            <img id="darr" src="img/downa.png" class="fright larrow">\
        </div>\
        <div style="height: 0px" id="corg" class="ctbox bline"></div>\
        <div idx="2" class="item poi">\
            <img class="fleft" src="img/zz2.png" alt=""/>\
            <span class="fpx14">我参与的组织</span>\
            <img id="darr1" src="img/downa.png" class="fright larrow">\
        </div>\
        <div style="height: 0px" id="jorg" class="ctbox bline"></div>\
    </div>\
</div>');
}

function zzInfo(t) {
    var s = "";
    if(t === 0) {
        s += '<div class="topbox bcw oh">\
                <span onclick="showedit();" class="cw poi" style="background-color: #FF6666">编辑详情</span>\
                <span onclick="closeorg();" class="cw poi" style="background-color: #AB669D">解散组织</span>\
                <span onclick="orginvite();"class="cw poi" style="background-color: #009AD0">邀请加入</span>\
            </div>';
    }
    document.write(s + '<div '+(t===1?'style="margin-top:0px"':'')+' class="zzbox bcw oh">'+(t===1?'<span onclick="exit()" class="fright poi bcf7 cw" style="padding: 5px 16px; border-radius: 5px">退出组织</span>':'')+'\
                        <div class="face">\
                            <img onerror="this.src=\'img/error.png\';this.onerror=null" id="gimg" alt=""/>\
                        </div>\
                        <div class="ct">\
                            <div><span class="tt c80">组织名称</span><span id="gname">&nbsp;</span></div>\
                            <div><span class="tt c80">创建人</span><span id="gcreator">&nbsp;</span></div>\
                            <div><span class="tt c80">创建时间</span><span id="gdate">&nbsp;</span></div>\
                            <div style="margin-bottom: 0px"><span class="tt c80">组织简介</span><span id="gdesc">&nbsp;</span></div>\
                        </div>\
                    </div>')
}


var leftitems = [];
function zzload() {
    var is = document.querySelectorAll(".box .item");
    leftitems = is;
    var corg = document.getElementById("corg");
    var org = document.getElementById("jorg");
    for(var i=0;i<is.length;i++) {
        is[i].onclick = function () {
            var idx = parseInt(this.getAttribute("idx"));
            switch (idx) {
                case 0:
                    var eok = document.querySelector(".ctbox>.ok");
                    if(eok) eok.className="";
                    ctframe.src = "zzcreate.html";
                    fiddict={};
                    is[0].className = "item poi bcf7";
                    is[0].querySelector("img").src = "img/zz0ok.png";
                    is[0].querySelector("span").className = "fpx14 cw";
                    break;
                case 1:
                    if(corg.clientHeight!=0) {
                        corg.style.height = '0px';
                        // jorg.style.height = '0px';
                        id_darr.src = 'img/downa.png';
                        // id_darr1.src = 'img/downa.png';
                    } else {
                        corg.style.height = 'auto';
                        // jorg.style.height = '0px';
                        id_darr.src = 'img/upa.png';
                        // id_darr1.src = 'img/downa.png';
                    }
                    break;
                default:
                    if(jorg.clientHeight!=0) {
                        // corg.style.height = '0px';
                        jorg.style.height = '0px';
                        id_darr1.src = 'img/downa.png';
                        // id_darr.src = 'img/downa.png';
                    } else {
                        // corg.style.height = '0px';
                        jorg.style.height = 'auto';
                        id_darr1.src = 'img/upa.png';
                        // id_darr.src = 'img/downa.png';
                    }
                    break;
            }
        }
    }

    createdorg();
}


var ifCreate = 0;
function createdorg(gid) {

    Http.get("api/group/list",{pageno:1,pagesize:9999999,type:1}, function(r) {
        var es = [];
        for(var i=0;i<r.length;i++) {
            if((gid && gid==r[i].groupfid) || (zid && zid==r[i].groupfid)) {
                zid=r[i].groupfid;
                ctframe.src = "zzdetail.html?gid="+zid;
                leftitems[1].onclick();
                select();
                ifCreate = 1;
            }
            es.push('<div class="'+((i===0&&!zid&&!gid || zid==r[i].groupfid)?'ok':'')+'" onclick="select(this,'+r[i].groupfid+',0,'+r[i].projectid+')">'+r[i].groupname+'</div>');
        }
        if(!r || r.length<=0)
            corg.innerHTML = "<p style='padding-right: 50px;' class='fpx14 tc'>暂无已创建组织</p>";
        else
            corg.innerHTML = es.join("");
        if(!gid&&!zid&&r.length>0) {
            zid=r[0].groupfid;
            ifCreate = 1;
        }
        if(zid && ifCreate && !ctframe.src) {
            ctframe.src = "zzdetail.html?gid="+zid;
            leftitems[1].onclick();
        }
        if(!gid)
            joinedorg();
    })
}


function joinedorg() {
    Http.get("api/group/list",{pageno:1,pagesize:9999999,type:2}, function(r) {
        var es = [];
        var pjid = 0;
        for(var i=0;i<r.length;i++) {
            if(zid==r[i].groupfid)
                pjid = r[i].projectid;
            es.push('<div class="'+(i===0&&!zid || zid==r[i].groupfid?'ok':'')+'" onclick="select(this,'+r[i].groupfid+',1,'+r[i].projectid+')">'+r[i].groupname+'</div>')
        }

        if(!r || r.length<=0)
            jorg.innerHTML = "<p style='padding-right: 50px;' class='fpx14 tc'>暂无已加入组织</p>";
        else
            jorg.innerHTML = es.join("");

        if(!zid&&r.length>0) {
            zid=r[0].groupfid;
            pjid = r[0].projectid;
        }
        if(zid && !ctframe.src && r.length>0) {
            leftitems[2].onclick();
            ctframe.src = "zzjoin.html?gid="+zid+"&pid="+pjid;
        } else {
            if(!zid) {
                document.querySelector(".box .item").onclick();
            }
        }
    })
}

function select(e, gid, t, pid) {
    var eok = document.querySelector(".ctbox>.ok");
    if(eok) eok.className="";
    var a = document.querySelector(".box .item:first-child");
    a.className = "item poi";
    a.querySelector("img").src = "img/zz0.png";
    a.querySelector("span").className = "fpx14";
    if(e) {
        e.className = "ok";
        ctframe.src = t?"zzjoin.html?gid="+gid+"&pid="+pid:"zzdetail.html?gid="+gid+"&pid="+pid;
    }
}

var detail = null;
function orgshow(gid) {
    Http.get("api/group/show",{gid:gid}, function(r) {
        detail = r;
        id_gimg.src = Unit.getImgUrl(r.groupheader);
        id_gname.innerHTML = r.groupname;
        id_gdesc.innerHTML = r.groupdesc;
        id_gdate.innerHTML = Unit.time(r.subdate);
        Http.get("api/customer/selectCustomerList",{ids:r.groupcreatorid}, function(r) {
            if(r && r.length>0) {
                id_gcreator.innerHTML = r[0].realname;
            }
        });
        pid = detail.projectid;
        if(location.href.indexOf("detail")>-1)
            zzctiframe.src = 'zzmanage.html?gid='+gid+"&pid="+pid;
    })
}


function closeorg() {
    Prompt.confirm({text:"是否解散组织？"}, function(a) {
        if(parseInt(a)) {
            LoadingBox.show();
            Http.post("api/group/dissolve",{groupid:gid}, function() {
                top.location.href = top.location.href.split("?")[0];
            })
        }
    })
}

