//获取税率
TaxObj=[];
function getTax(cb){
	var s='https://yuronfu.com/finance/api/tax/list';
	$.get(s,function(a){
		if(a.code==1){
			var se=g('taxType'),b;
			for (var i=0;i<a.data.length;i++){
				b=a.data[i];
				se.options.add(new Option(b.taxtype,i));
				TaxObj[i]=[Number(b.servertax),Number(b.asktax),Number(b.safetax),Number(b.othertax),Number(b.lixitax)];
			}
			cb();
		}
	},'json');
}
function NPV() {
  var args = [];
  for (i = 0; i < arguments.length; i++) {
    args = args.concat(arguments[i]);
  }
  var rate = args[0];
  var value = 0;
  for (var j = 1; j < args.length; j++) {
    value += args[j] / Math.pow(1 + rate, j);
  }
  return value;
}

//显示百分比
function toPercent(v){
	return (v*100).toFixed(2)+'%';
}
//获取默认日期
function getDefaultDate() {
	var d = new Date();
	d.setMonth(d.getMonth() + 1);
	d.setDate(10);
	return cnDate(d);
}
//格式化日期
function cnDate(v) {
	var m = v.getMonth() + 1,
		d = v.getDate();
	if(m < 10) m = '0' + m;
	if(d < 10) d = '0' + d;
	return v.getFullYear() + '-' + m + '-' + d;
}
//获取元素位置
function getPosition(o){
	o=g(o);
	return{ x:o.getBoundingClientRect().left+document.documentElement.scrollLeft,
	y :o.getBoundingClientRect().top+document.documentElement.scrollTop};
}
function g(o){return document.getElementById(o);}
//获取id里面的数字
function getIdNumber(id,tag){
	var show=tag=='B_';
	if(id.indexOf(tag)==0){
		var li=Number(id.replace(tag,''));
		if(!isNaN(li)&&li>=0)
			return li;
	}
	return -1;
}
//计算租金调整
function calcTypeMoney(item, total, step, type, first,i,d) {
	var temp = Math.ceil(total / 2);
	switch(type) {
		case 2:
			item.C = first;
			break; //等额			
		case 3:
			item.C = first + (step * (i - 1));
			break; //等差
		case 4:
			item.C = first * Math.pow(step, i - 1);
			break; //等比			
		case 5:
			if(i == 1)
				item.C = first;
			else {
				item.C = d[i - 2].C;
				if(total % 2 == 0 && i == temp + 1) {} else
					item.C += temp >= i ? step : -step;
			}
			break; //纺锤				
		case 6:
			item.C = first * (i % 2 == 1 ? 1 : step);
			break; //齿轮			
	}
}
function D(v){
	if(typeof(v)==typeof(''))
		v=v.replace(/-/g,'/')+' 00:00:000';
	return new Date(v);
}
//计算两条数据之间的spy,spd
//ind与sn的区别，ind为索引从0开始，sn为序号从1开始
// type 1输入日期B，2输入间隔时段（天、月），value实际值
function calcBD(ind,type,value){
	var s={B:'',spy:0,spd:0,D1:0};
	var last=D(ind==0?g('B9').innerHTML:pageData.data[ind-1].B);
	var cur;
	if(type==1){
		cur=D(value);
	}
	else{
		cur=D(last.getTime());
		//还款间隔为月
		if(pageData.IntervalUnit==1){
			cur.setMonth(cur.getMonth()+value);
		}
		//还款间隔为日
		else{
			cur.setDate(cur.getDate()+value);
		}
	}
	s.B=cnDate(cur);
	s.D1=cur.getMonth()==last.getMonth()?1:0;
	if(s.D1==1)
		s.spy=differenceMonth(last,cur);
	else
		s.spy=(cur.getTime()-last.getTime())/TimeSpanMonth;
	s.spd=(cur.getTime()-last.getTime())/TimeSpanDay;
	return s;
}
function isInt(v){
	return v==parseInt(v);
	//return v==Math.round(v);
}
//错误数据报警
function showError(id){
	var ecss='errorResult',id='#'+id;
	if($(id).html().indexOf('.')==-1)
		$(id).removeClass(ecss);
	else
		$(id).addClass(ecss);
}

//填充html
function H(o,h,showerror,mustshow){
	if(o=g(o)){
		h=(h==0||h)?h:'';
		if(typeof(h)==NumberType){
			//hd表示该项不允许能输入-0
			if(h==0&&o.getAttribute('hd')&&!mustshow){
				h='';
				//h=(h==0&&!o.getAttribute('hd'))?h:'';
			}
			else{
				switch(o.getAttribute('type')){
					case 'int':h=Math.round(h).toLocaleString();
						break;
					case 'float':
						var tag=h<0&&h>-1;
						h=h.toFixed(2).split('.');
						h=Number(h[0]).toLocaleString()+'.'+h[1];
						if(tag)
							h='-'+h;
						break;
					case 'per':
						if(h==0)
							h='0.00%';
						else{
							h=(h*100).toFixed(o.id=='B2'?4:2)+'%';
						}
						break;
					default:
						h=h.toLocaleString();
						break;
				}
			}
		}
		o.innerHTML=h;
		if(showerror)
			showError(o.id);
	}
}
//获取用户输入
function I(id){
	var s=g(id).innerHTML.replace(/,/g,'').replace(/\s/g,''),b=1;
	if(s){
		if(s.indexOf('%')==s.length-1){
			b=100;
			s=s.substr(0,s.length-1);
		}
		if(isNaN(s))
			s=0;
		else{
			if(id=='B2')
				s=F2(s,6);
			else
				s=F2(s,4);
		}
	}
	else{
		s=0;
	}
	s/=b;
	return s;
}
//小数点后两位
function F2(v,l){
	//return v;
	if(v!=null&&!isNaN(v)){
		if(!l)
			l=100;
		else
			l=Math.pow(10,l);
		return Math.round(v*l)/l;
	}
	return v;
}
//计算两个日期间隔月
function differenceMonth(last,cur){
	return (cur.getFullYear()*12+cur.getMonth())-(last.getFullYear()*12+last.getMonth());
}
//初始化用户表单
function initTable(){
	var tb=g('workspace'),tr,ac=64,tds,cs;
	var letters='ABCDEFGHIJKLMNOPQRST'.split('');
	for (var i=1;i<=pageData.maxLine;i++){
		tr=document.createElement('TR');
		tds=[];
		cs='';
		for(var j=1;j<=9;j++){
			switch(j){
				case 1:cs='text';break;
				case 2:
				case 4:cs='center';break;
				case 7:
				case 8:cs='readonly';break;
				default:cs='';break;
			}
			tds.push('<td hd="1" '+(j>2&&j!=4?' type="float"':'')+' class="'+cs+'" id="'+String.fromCharCode(ac+j)+'_'+i+'">'+(j==1?i:'')+'</td>');
		}
		tr.innerHTML=tds.join('');
		tb.appendChild(tr);
	}
	regEvent();
	g('mbg').style.height=document.body.offsetHeight+'px';
}
//格式化日期
function FixedNumber(x,l){
	return Number(x.toFixed(l));
}
//导入数据
function doimport(calcLate){
	var B1=I('B1'),B2=I('B2'),B3,B4,per,B7;
	var type=1,total=0,ms=0;
	var data=[],a,t,total=0;
	for (var i=1;i<=pageData.maxLine;i++){
		a={C:I('C_'+i),D:I('D_'+i)};
		if(a.C==0||a.D==0)
			break;
		total+=a.C;
		ms+=a.D;
		data.push(a);
	}
	if(data.length>pageData.maxLine){
		alert('有效数据不应超过'+pageData.maxLine+'行');
		return false;
	}
	if(data.length>1){
		if(B1+B2==0){
			alert('项目总额或年利率必填其一');
			return false;
		}
		if(B1>0&&B1>=total){
			alert('项目总额不宜高于或等于还款总额');
			return false;
		}
		B3=FixedNumber(ms/12,2);
		B4=FixedNumber(data.length/B3,2);
		per=data[0].C;
		B7=I('B7');
		if(B1==0){
			B1=total/B2;
			type=1;
		}
		else{
			B2=total/B1/10;
			type=2;
		}
		//构造基本数据
		initPageData(B1,B2,B3,B4,per,B7,3);
		fillChangeForList(data);
		if(calcLate){
			pageData.inpType=2.1;
			pageData.inpTypeC.type=1;
			Select.set('changeTypeButton',1);
			H('I1',0);
			calcChangeI1(type);
		}
		return true;
	}
	return false;
}
//从excel导入
function importFromExcelSub(){
	var s=g('impinp').value;
	var d=s.replace(/,/g,'').replace(/\t/g,',').replace(/\n/g,'|');
	s=[];
	d=d.split('|');
	var item;
	for (var i=0;i<d.length;i++){
		if(item=calcimprotinp(d[i]))
			s.push(item);
	}
	if(s.length>0){
		if(s.length>pageData.maxLine){
			alert('数据太多,请控制在'+pageData.maxLine+'列以内');
			return;
		}
		clsInp(false);
		pageData.data=[];
		for (var i=1;i<=s.length;i++){
			H('C_'+i,s[i-1].C);
			H('D_'+i,s[i-1].D);
		}
		pageData.inpType=3;
		closewindow();
		g('impinp').value='';
	}
	else{
		alert('导入数据格式不正确');
	}
}
//转化用户导入数据是否有效
function calcimprotinp(v){
	var s=v.split(','),t,i={C:0,D:0};
	if (s.length==2){
		t=Number(s[0]);
		if (isNaN(t))return null;
		i.C=t;
		t=Number(s[1]);
		if (isNaN(t))return null;
		i.D=t;
		return i;
	}
	return null;
}
//设置专业版还是普通版
function setProfessional(isp){
	var s='FGHI',css=isp?'table-cell':'none',id;
	for(var i=0;i<s.length;i++){
		for (var j=1;j<=9;j++){
			id=s.charAt(i)+j;
			if(j>=6&&i==3)
				id+='1';
			g(id).style.display=css;
		}
	}
}
//设置调整工具显示状态
function setChangeState(disable){
	g('changeTypeButton').disabled=g('changeCostButton').disabled=disable;
//	g('IntervalUnit').disabled=g('IntervalUnitDs').disabled=disable;
	g('IntervalUnit').disabled=disable;
	g('solveResult').className=disable?'hide':'button';
}
function resumewindow(ncls){
	setEdit('B_,C_,D_,I_',true);
	setEdit('F_',false);
	setCanEditEditer(true);
	setChangeState(false);
	if(!ncls)
		change_back.data=null;
}
//对象拷贝
function CopyObject(o) { 
	var objstr='object';
	if(typeof(o)!=objstr)
		return o;
	var a=o instanceof Array?[]:{};
	for (var k in o) {
	      a[k] = (typeof(o[k])==='object'? CopyObject(o[k]):o[k]);
	}
	return a; 
}
//显示加载框
function showWaiting(show){
	if(show){
		g('mbg').className=g('waiting').className='show';
	}
	else
		closewindow();
}
//数据存储
function db(k,v){
	if(window.localStorage){
		if(v==null){
			v= window.localStorage[k];
			if(v==null||isNaN(Number(v)))return 0;
			return Number(v);
		}
		else
			window.localStorage[k]=v;
	}
	return 0;
}
function query(n, u) {
	var s = u; if (s == null) s = self.location.href;
	if (n) {
		var g = new RegExp("(\\?|&)" + n + "=([^&|#]*)");var r = s.match(g);
		if (r) {try { return decodeURIComponent(r[2]); } catch (err) { return unescape(r[2]); } } else return null;
	} else {
		var i = s.indexOf("?"); if (i === -1) return null; return s.substr(i + 1);
	}
}
//获取用户输入数字非0数值
function getNumber(id,isint){
	var inp=g(id),v;
	if(inp.value=='')return 0;
	v=inp.value.replace(/\s/g,'').replace(/,/g,'')
	if(isint)
		v=parseInt(v);
	else
		v=Number(v);
	if(isNaN(v)){
		inp.value='';
		v=0;
	}
	else
		inp.value=v;
	return v;
}
//最大公约数
function MathGCD(ys) {
	ys.sort(function(a, b) {return a - b;});
	var min = ys[0],r;
	for(var i = min; i > 0; i--) {
		r = true;
		for(var j = 0; j < ys.length; j++) {
			if(ys[j] % i > 0) {
				r = false;
				break;
			}
		}
		if(r){
			return i;　　
		}
	}
	return 1;
}
var Select={
	_txt:function(){return '请选择'},
	_set:function(o){
		var i=o.selectedIndex;
		o.setAttribute('v',o.value);
		o.setAttribute('ind',i);
		o.options[0].text=o.options[i].text;
		o.value="-1";
	},
	set:function(id,value){
		var obj=document.getElementById(id);
		obj.value=value;
		Select._set(obj);
	},
	get:function(id,tag){
		tag=tag?tag:'v';
		return Number(document.getElementById(id).getAttribute(tag))||0;
	},
	reg:function(id){
		id=document.getElementById(id);
		id.onblur=Select.blur;
		id.onfocus=Select.focus;
		id.onchange=Select.change;
		id.options[0].text=Select._txt();
	},
	obj:function(e){
		e=e||window.event;
		return e.target;
	},
	focus:function(e){
		Select.obj(e).options[0].text=Select._txt();
	},
	change:function(e){
		e=Select.obj(e);
		if(e.selectedIndex>0){
			Select._set(e);
			var cb=e.getAttribute('cb');
			if(cb)(new Function(cb))();
		}
		e.blur();
	},
	blur:function(e){
		e=Select.obj(e);
		if(e.options[0].text==Select._txt()){
			e.options[0].text=e.options[Select.get(e.id,'ind')].text;
		}
	}
};
var HistoryOp={
	_list:[],
	_last:null,
	add:function(nul){
		if(pageData.dosolve==1)return;
		var a=HistoryOp._list;
		if(a.length>=20)
			a.splice(0,1);
		if(pageData.data.length>0){
			if(HistoryOp._last)
				a.push(HistoryOp._last);
			HistoryOp._last=CopyObject(pageData);
		}
		else if(nul){
			HistoryOp._last=null;
			if(a[a.length-1]!=null)
				a.push(null);
		}
		HistoryOp.sb();
	},
	restore:function(){
		var a=HistoryOp._list,b=null;
		if(a.length>0){
			b=a.pop();
			if(b&&b.data.length>0){
				pageData=b;
				fillResult(true);
				Select.set('changeTypeButton',pageData.inpTypeC?pageData.inpTypeC.type:0);
				Select.set('changeCostButton',pageData.inpTypeF?pageData.inpTypeF.type:0);
				setIntervalUnit(pageData.IntervalUnit);
			}
			else
				b=null;
		}
		if(b==null)
			clsInp(true);
		HistoryOp.sb();
	},
	sb:function(){
		g('restoreButton').className=(HistoryOp._list.length>0?'button':'hide');
	}
};
