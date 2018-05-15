//创建还原点
var change_back={type:0,ct:0,typev:null,data:null};
//接收change事件
function change_event(type){
	var o=g(type==2.1?'changeTypeButton':'changeCostButton');
	var ov=Select.get(o.id);
	change_back.type=pageData.inpType;
	change_back.typev=(Math.round(pageData.inpType)==2?pageData[type==2.1?'inpTypeC':'inpTypeF'].type:0);
	change_init();
	Select.set(o.id,ov);
	//等额本金
	if(ov==100){
		change_calc_100(type);
		return;
	}
	//等额
	if(type==2.2&&ov==2){
		change_calc_2(type);
		return;
	}
	change_back.ct=type==2.1?'C':'F';
	change_back.data=CopyObject(pageData.data);
	change_showpopwindow(change_back.ct,ov);
}
//重置可调节内容为默认值
function change_init(){
	Select.set('changeTypeButton',0);
	Select.set('changeCostButton',0);
	g('inp_start').value=g('inp_step').value='';
	pageData.inpTypeC={type:0,start:0,step:0};
	pageData.inpTypeF={type:0,start:0,step:0};
}
function setIntervalUnit(v){
	pageData.IntervalUnit=pageData.InterestType=v;
	g('IntervalUnit').value=g('IntervalUnitDs').value=v;
}
//计算列值
function change_calc_item(ind,obj,last,item){
	var v=null;
	switch(obj.type){
		case 0://自动
			v=pageData.equalRent;
			break;
		case 1://手动返回原值
			break;
		case 2://等额
			v=obj.start;
			break;
		case 3://等差
			v=last+(ind==0?0:obj.step);
			break;
		case 4://等比
			v=last*(ind==0?1:obj.step);
			break;
		case 5://纺锤
			if(ind<pageData.data.length/2)
				v=obj.start+ind*obj.step;
			else if(ind==pageData.data.length/2)
				v=last;
			else
				v=last-obj.step;
			break;
		case 6://齿轮
			v=obj.start;
			if(ind%2==1)
				v*=obj.step;
			break;
	}
	return v;
}
//F等额本金
function change_calc_100(type){
	pageData.inpType=type;
	pageData.inpTypeF.type=100;
	//公式，项目金额-首付款-未回本金末期）/总还款次数
	var temp=(pageData.total-pageData.EV[0]-I('G_'+pageData.data.length))/(pageData.years*pageData.times);
	for (var i=0;i<pageData.data.length;i++){
		pageData.data[i].F1=temp;
	}
	calcExt();
}
//F等额
function change_calc_2(type){
	pageData.inpType=type;
	pageData.inpTypeF.type=2;
	fillF();
	calcExt();
}
//显示或还原回收成本按钮
function change_showpopwindowButton(show){
	var bts=g('header').getElementsByTagName('INPUT'),b,mb=show?'button':'hide',ob='hide',tag='backcss';
	for (var i=0;i<bts.length;i++){
		b=bts[i];
		if(b.id=='calcButton'||b.id=='cancelButton'){
			b.className=mb;
		}
		else{
			if(show){
				b.setAttribute(tag,b.className);
			}
			else{
				ob=b.getAttribute(tag);
			}
			b.className=ob;
		}
	}
}
//显示用户调整窗口
function change_showpopwindow(c,v){
	var s1='C_1',s2='D_1';
	if(c=='C'){
		pageData.inpType=2.1;
		pageData.inpTypeC.type=v;
	}
	else{
		pageData.inpType=2.2;
		pageData.inpTypeF.type=v;
		s1='F_1';
		s2='G_1';
	}
	if(v==0){
		pageData.inpType=4;
		calcExt();
		return;
	}
	else if(v==1){
		if(c=='F'){
			setCanEditEditer(false);
			setChangeState(true);
			setEdit('B_,C_,D_,J_',false);
			setEdit('F_',true);
			change_showpopwindowButton(true);
		}
		return;
	}
	else{
		if(pageData.inpType==2.1)
			change_setinp('inp_start',s1,true);
		if(v==2){
			g('inp_step').value=1;
		}else{
			change_setinp('inp_step',s2,true,true);
			g('inp_step').style.backgroundImage='url(img/'+(v==3||v==5?'cz':'xs')+'.png)';
		}
		g('mbg').className='show';
		if(pageData.inpType==2.1){
			g('inp_start').value=pageData.data[0].C.toFixed(2);
			g('inp_start').focus();
		}
		else{
			g('inp_start').value='1';
			g('inp_step').focus();
		}
	}
}
//用户取消手工输入
function chnage_cancel(){
	if(pageData.inpType!=2.2)return;
	if(change_back.data){
		for(var i=1;i<=change_back.data.length;i++){
			H('F_'+i,change_back.data[i-1].F);
		}
	}
	change_showpopwindowButton(false);
	change_close(true);
}
//为用户调整布局改变属性
function change_setinp(cur,re,cls,len){
	var p=getPosition(re);
	cur=g(cur);
	re=g(re);
	cur.style.top=p.y+'px';
	cur.style.left=p.x+'px';
	cur.style.height=(re.offsetHeight-2)+'px';
	cur.style.width=(re.offsetWidth+(len?15:-12))+'px';
	if(cls)cur.value='';
	cur.className='';
	cur.readOnly=false;
}
//验证用户调整
function change_inpchange(o){
	var inp=getNumber('inp_start'),step=getNumber('inp_step');
	if(inp==0||step==0)return;
	var o=null;
	if(pageData.inpType==2.1)
		o=pageData.inpTypeC;
	else if(pageData.inpType==2.2)
		o=pageData.inpTypeF;
	if(o.type==4||o.type==6){
		if(step<0||step>10){
			alert('系数只允许0-10以内的有效数字');
			g('inp_step').focus();
			return;
		}
	}
	if(o){
		o.start=inp;
		o.step=step;
		if(pageData.inpType==2.2)
			fillF();
		calcExt();
	}
	change_close(false);
	if(pageData.inpType==2.1)
		Select.set('changeTypeButton',pageData.inpTypeC.type);
	else if(pageData.inpType==2.2)
		Select.set('changeCostButton',pageData.inpTypeF.type);
}
//取消用户调整/用户按键调整
function change_esc(e){
	e=window.event||e;//系数、差值
	switch(e.keyCode){
		case 27://esc
			change_close(true);
			break;
		case 39://left
		case 37://right
			change_next(change_getother(this));
			break;
		case 13://enter
			var lr=change_getother(this);
			if(lr.value=='')
				change_next(lr);
		//	else
		//		this.blur();
			break;
	}
}
//获取另外的输入对象
function change_getother(cur){
	return g(cur.id=='inp_start'?'inp_step':'inp_start');
}
function change_next(lr){
	if(lr.className!='hide')
		lr.focus();
}
//关闭用户调整
function change_close(cancel){
	if(cancel){
		pageData.inpType=change_back.type;
		if(pageData.inpType==2.1)
			pageData.inpTypeC.type=change_back.typev;
		else if(pageData.inpType==2.2)
			pageData.inpTypeF.type=change_back.typev;
		if(change_back.ct)
			Select.set(change_back.ct=='C'?'changeTypeButton':'changeCostButton',change_back.typev);
	}
	g('inp_start').className=g('inp_step').className=g('mbg').className='hide';
	resumewindow();
}