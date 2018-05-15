//注册基础事件
function event_reg(ids){
	var o,tag='INPUT';
	for(var i=0;i<ids.length;i++){
		if(o=g(ids[i])){
			if(o.tagName==tag){
				o.onkeydown=event_keydonw;
				o.onblur=event_blur;
				o.onfocus=event_focus;
			}
		}
	}
	g('inp_start').onkeyup=change_esc;
	g('inp_step').onkeyup=change_esc;
	Select.reg('changeTypeButton');
	Select.reg('changeCostButton');
	g('mbg').style.height=document.body.offsetHeight+'px';
}
function event_showvip(){
	if(top.u&&top.u.level!=2){
		if(top.u.level==0)
			alert('您尚未认证专业资格');
		else
			alert('请升级为专业会员');
		return false;
	}
	return true;
}
function event_IntervalUnit(o){
	setIntervalUnit(Number(o.value));
	if(pageData.data.length>0){
		calcExt();
	}
}
function event_tax(o){
	var i=Number(o.value);
	if(isNaN(i)||i>=TaxObj.length)
		i=0;
	pageData.taxType=i;
	if(pageData.data.length>0){
		calcExt();
	}
}
function event_taxswitch(o){
	pageData.haveTax=o.value=='2'?1:0;
	g('taxType').disabled=!pageData.haveTax;
	if(pageData.haveTax)			
		pageData.haveTax.value=1;
	calcExt();
}
function event_import(){
	if(pageData.data.length==0||(pageData.data.length>0&&confirm('批量导入会清除您当前工作表'))){
		g('impbox').className='show';
		g('mbg').className='show';
	}
}
function event_calc_click(o){
	var v=o.getAttribute('v'),tag,r;
	if(!v)return;
	tag='s'+v;
	g('I'+v).innerHTML='-';
	if(pageData.data.length>0){
		calcIRR(Number(v));
	}
	o.style.display='none';
}
function event_focus(e){
	this.setAttribute('val',this.value);
	this.select&&this.select();
	//autoSelect(this);
}
function event_blur(e){
	var isdate=false,s;
	if(this.id.indexOf('B_')==0||this.id=='B9'){
		isdate=true;
		s=new Date(this.value.replace(/\//g,'-'));
		if(isNaN(s)){
			if(this.id=='B9'){
				this.value=getDefaultDate();
				s=new Date(this.value);
			}
			else{
				this.value='';
				s=-1;
			}
		}
		else{
			this.value=cnDate(s);
			s=s.getTime();
		}
	}
	else{
		s=I(this.id);
		var type=this.getAttribute('inptype');
		if(s==0&&this.value!='0'){
			H(this.id,0);
		}
		else if(type=='per'){
			if(this.value.indexOf('%')==-1)
				s/=100;
			H(this.id,s);
			s=this.value;
		}
		else{
			H(this.id,s);
		}
	}
	var o=this.getAttribute('val').replace(/,/g,'');
	if(isdate){
		if(s==-1){
			this.value=o;
			return;
		}
		if(cnDate(D(s))==o)
			return;
	}
	//末期余额调整
	if(this.id=='I1'){
		changeEvent_I1(this,o,s);
		return;
	}
	if(s+o!='0'&&s.toString()!=o){
		event_changeEvent(this,o,s,isdate);
	}
}
function event_keydonw(e){
	if(e.keyCode==13||(e.keyCode>=37&&e.keyCode<=40)){
		if ( e && e.stopPropagation )
			e.stopPropagation();
		else
		window.event.cancelBubble = true;
		event_autogoNext(this,e.keyCode);
		return false;
	}
}
//输入值发生变化
function event_changeEvent(obj,oldv,newv,isdate){
	if((isdate&&new Date(oldv).getTime()==newv)||(oldv==newv&&!isdate)){
		obj.value=oldv;
		return;
	}
	var temp=0,len=pageData.data.length;
	if(obj.id=='B4'){
		if(newv<1||newv>12||12%newv>0){
			alert('请输入能被12整除的数字');
			obj.value='';
			obj.focus();
			return;
		}
		pageData.inpType=1;
		calc();
		return;
	}
	//主数据调整
	temp=getIdNumber(obj.id,'B',pageData.maxLine);
	if(temp>0){
		if(temp<5&&newv==0){
			obj.value=oldv;
		}
		else
			changeEventB(temp,obj,newv);
		return;
	}
	//租金调整
	temp=getIdNumber(obj.id,'C_',pageData.maxLine);
	if(temp>0){
		changeEvent_C(temp-1,newv,len);
		return;
	}
	//调整其它费用D
	temp=getIdNumber(obj.id,'D',pageData.maxLine);
	if(temp>0){
		changeEventD(temp,newv);
		return;
	}
	//调整其它费用E
	temp=getIdNumber(obj.id,'E',pageData.maxLine);
	if(temp>0){
		changeEventE(temp,I(obj.id));
		return;
	}
	//调整日期
	temp=getIdNumber(obj.id,'B_',len);
	if (temp>0&&newv>0){
		changeEvent_B(temp-1,newv,len,oldv,obj);
		return;
	}
	//间隔月、日
	temp=getIdNumber(obj.id,'D_',len);
	if(temp>0){
		if(!isInt(newv)){
			obj.value=oldv;
			alert('请输有效的整数');
			return;
		}
		if(pageData.IntervalUnit==1&&(newv<0||newv>36)){
			obj.value=oldv;
			alert('请输入1-36之间的数值');
			return;
		}
		var maxdays=1096;
		if(pageData.IntervalUnit==2&&(newv<1||newv>maxdays)){
			obj.value=oldv;
			alert('请输入1-'+maxdays+'之间的数值');
			return;
		}
		changeEvent_D(temp-1,newv,len);
		return;
	}
	//现金流调整
	if(obj.id=='J_0'){
		pageData.selfCash=newv;
		calcExt();
		H(obj.id,newv);
		//obj.value=newv;
		return;
	}
	//现金流调整
	temp=getIdNumber(obj.id,'J_',len);
	if(temp>0){
		changeEvent_J(temp-1,newv,len);
		return;
	}
}
function changeEventB(temp,obj,newv){
	if(temp==1||temp==2){
		if(pageData.inpType==3){
			calc();
			return;
		}
	}
	if(temp==1){
		pageData.total=newv;
		calcEV();
		calcTop();
	}
	if(temp<5||temp==7){
		if(temp==2){
			pageData.rate=I('B2');
		}
		if(temp==7)
			pageData.remain=newv;
		if(temp==7&&pageData.inpType!=4){
			calcExt();
		}
		else if(pageData.data.length>0&&temp!=3&&temp!=4&&temp!=7){
			if(temp<=2){
				pmt();
			}
			calcExt();
		}
		else{
			if(pageData.inpType!=3)
				pageData.inpType=1;
			calc();
		}
	}
	else{
		if(temp==9){
			pageData.start=newv;
			if(pageData.data.length>0){
				var d=pageData.data[0],st=D(pageData.start);
				if(d.D1)
					st.setMonth(st.getMonth()+d.spy);
				else
					st.setDate(st.getDate()+d.spd);
				changeEvent_B(0,st.getTime(),pageData.data.length,0,g('B_1'),true);
			}
		}
		else{
			if (temp==8){
				pageData.residual=I('B8');
				db('residual',pageData.residual);
			}
			calcExt();
		}
	}
}
function changeEvent_B(i,newv,len,oldv,obj,b9){
	if(i>len&&pageData.data.length>0){H('B_'+(i+1),'');return;}
	if(pageData.start<0){
		obj.value='';
		alert('请先设置起租日');
		return;
	}
	var a,s=D(pageData.start==0? getDefaultDate(): pageData.start);
	var last,cur=D(newv);
	if(i==0){
		last=D(s.getTime());
	}
	else{
		if (i<pageData.data.length){
			last=D(pageData.data[i-1].B);
		}
		else{
			if(g('B_'+i).value==''){
				obj.value='';
				alert('请先设置上期日期');
				return;
			}
			last=D(g('B_'+i).value);
		}
	}
	a=Math.floor((cur.getTime()-last.getTime())/TimeSpanDay);
	if(a<=0&&oldv!=0){
		alert('新日期必须大于上期');
		obj.value=oldv;
		return;
	}
	if(a>360){
		alert('与上期间隔不能大于360天');
		obj.value=oldv;
		return;
	}
	if(i<len){
		reCalcB(i,last,cur,len,s);
		recalcYT();
		if(!b9)
			setInpType211();
		calcExt();
	}else if(i==len){
		setInpType211();
		addNewItem(i,newv,'B');
	}
}
function reCalcB(i,last,cur,len,s){
	var a=pageData.data[i];
	//整月
	if(last.getDate()==cur.getDate()){
		a.D1=1;
		a.spy=differenceMonth(last,cur);
		a.spd=Math.round((cur.getTime()-last.getTime())/TimeSpanDay);
	}
	else{
		a.D1=0;
		a.spd=Math.round((cur.getTime()-last.getTime())/TimeSpanDay);
		a.spy=a.spd/30;
	}
	//重置所有数据
	for (var j=0;i<len;i++,j++){
		a=pageData.data[i];
		if(j>0){
			cur=D(last.getTime());
			if(isInt(a.spy)){
				cur.setMonth(cur.getMonth()+a.spy);
				//---
				a.spd=Math.round((cur.getTime()-last.getTime())/TimeSpanDay);
			}
			else{
				cur.setDate(cur.getDate()+a.spd);
			}
		}
		a.days=Math.round((cur.getTime()-s.getTime())/TimeSpanDay);
		a.B=cnDate(cur);
		a.D=a.spy;
		last=D(cur.getTime());
	}
}
function changeEvent_C(j,newv,len){
	if(len>0&&j>len){H('C_'+(j+1),'');return;}
	if(len>0){
		setInpType211();
		if(j<len){
			//对原数据赋值
			pageData.data[j].C=newv;
			//重新计算
			calcExt();
		}
		if(j==len){
			addNewItem(j,newv,'C');
		}
	}
}
function changeEventD(j,newv){
	pageData.EV[j-1]=newv;
	var total=I('B1');
	if(total!=0){
		pageData.E[j-1]=newv/total;
	}
	else
		pageData.E[j-1]=0;
	
	H('E'+j,toPercent(pageData.E[j-1]));
	calcTop();
	if(pageData.data.length>0){
		if(pageData.inpType==4)
			pmt();
		calcExt();
	}
}
function changeEvent_D(j,newv,len){
	if(pageData.data.length==0)return;
	if(j>len&&pageData.data.length>0){H('D_'+(j+1),'');return;}
	var a,s=D(pageData.start),cur;
	var last=(j==0?s:D(pageData.data[j-1].B));
	//删除
	if(j>0&&newv==0){
		pageData.data.splice(j,1);
		//recalcYT();
		setInpType211();
		calcExt();
		return;
	}
	//重置所有数据
	for(var i=j;i<len;i++){
		cur=new Date(last.getTime());
		a=pageData.data[i];
		if(j==i){
			a[pageData.IntervalUnit==1?'spy':'spd']=newv;
		}
		//按月
		if(pageData.IntervalUnit==1){
			if(a.D1)
				cur.setMonth(cur.getMonth()+a.spy);
			else
				cur.setDate(cur.getDate()+a.spy*30);
		}
		//按日
		else{
			if(i==j||!a.D1){
				cur.setDate(cur.getDate()+a.spd);
			}
			else
				cur.setMonth(cur.getMonth()+a.spy);
		}
		if(i==j){
			//是否破坏间隔格式
			a.D1=cur.getDate()==last.getDate()?1:0;
			//重置相关数据
			if(pageData.IntervalUnit==1){//按月
				a.spd=Math.round((cur.getTime()- last.getTime())/TimeSpanDay);
			}
			else{//按日
				if(a.D1)
					a.spy=differenceMonth(last,cur);
				else
					a.spy=(cur.getTime()- last.getTime())/TimeSpanMonth;
			}
		}
		a.days=(cur.getTime()-s.getTime())/86400000;
		a.B=cnDate(cur);
		a.D=a.spy;
		last=new Date(cur.getTime());
	}
	if(cur){
		//recalcYT();
		setInpType211();
		calcExt();
	}
	if(j==len){
		setInpType211();
		addNewItem(j,newv,'D');
	}
}
//当用调整BCD列均设置为手动
function setInpType211(){
	if(pageData.data.length==0)return;
	//重置change对象
	change_init();
	if(pageData.inpType==2.2){
		//将每列还款收入默认为自动
		for(var i=0;i<pageData.data.length;i++)
			pageData.data[i].F1='n';
	}
	//重置规则数据调整为手动调整还款租金C
	pageData.inpType=2.1;
	pageData.inpTypeC.type=1;
	Select.set('changeTypeButton',1);
}
function changeEventE(j,newv){
	pageData.E[j-1]=newv;
	var total=I('B1');
	if(total!=0)
		pageData.EV[j-1]=total*newv;
	else
		pageData.EV[j-1]=0;
	H('D'+j,pageData.EV[j-1]);
	calcTop();
	if(pageData.data.length>0){
		if(pageData.inpType==4)
			pmt();
		calcExt();
	}
}
function changeEvent_J(j,newv,len){
	if(pageData.data.length>j){
		pageData.data[j].J=newv;
		calcExt();
	}
}
function changeEvent_I1(obj,oldv,newv){
	if(pageData.data.length>0){
		if(newv>=Math.abs(pageData.notreclaimed)){
			alert('无效输入');
			H(obj.id,oldv);
			return;
		}
		if(pageData.inpType==2.2){
			changeEvent_I2_2();
		}
		else{
			//如果按日计算，则必须调整为手动计算方式
		//	if(pageData.IntervalUnit==2&&pageData.inpTypeC.type==0){
				Select.set('changeTypeButton',1);
				change_event(2.1);
				//pageData.inpTypeC.type=1;
		//	}
			//年利率
			calcChangeI1(2);
		}
	}
}
//如果在调整回收成本
function changeEvent_I2_2(){
	if(pageData.data.length>0){
		Select.set('changeCostButton',1);
		var item=pageData.data[pageData.data.length-1];
		item.F1=item.F+item.G;
		calcExt();
	}
}
//调整末期余额
//type=1:调整项目总额
//type=2:调整年利率
function calcChangeI1(type){
	var result=Math.round(I('I1')*100)/100;
	H('I1',result);
	var step=type==1?pageData.total:pageData.rate,last=I('G_'+pageData.data.length);
	if(result!=last){
		showWaiting(true);
		change_back.data=CopyObject(pageData);
		//debugger
		setTimeout(function (){
			pageData.dosolve=1;
			runChangeI(type,step,step,result,300,null,false,false,0,pageData.data.length*0.01);
			change_back.data=null;
			showWaiting(false);
			pageData.dosolve=0;
		},300);
	}
}
//递归计算
function runChangeI(target,step,oldstep,result,deep,lastresult,isretry,reduce,times,flt){
	var tstep=Math.abs(step/2);
	if(target==1){
		pageData.total+=step;
		calcTop();
	}
	else{
		pageData.rate+=step;
	}
	if(pageData.inpType==4)
		pmt();
	var newr=Math.round(calcExt(true)*100)/100;
	
	if(!isNaN(newr)&&(lastresult==newr))
		times++;
	else 
		times=0;
		
	if(newr==result ||(times>2&& Math.abs(newr-result)<flt) ){
		console.log('成功了'+pageData.inpType);
		calcExt();
		//if(pageData.IntervalUnit==1)
		//	resetLastG();
		fillResult();
	}
	else if(deep--<0||times>3){
		if(!isretry){
			isretry=true;
			step=-oldstep;
			deep=300;
			reduce=false;
			lastresult=null;
			times=0;
			if(change_back.data){
				pageData=CopyObject(change_back.data);
				console.log('--------计算重置---------');
				runChangeI(target,step,oldstep,result,deep,lastresult,isretry,reduce,times,flt);
			}
		}
		else{
			alert('计算失败了');
			pageData=CopyObject(change_back.data);
			fillResult();
		}
	}
	else{
		//输出结果
		console.log('c:'+pageData.rate,'n:'+newr,'r:'+result,step);
		//减
		if(isNaN(newr)||newr>result){
			if(!isretry)reduce=true;
			if(isretry&&!reduce)
				step+=step;
			else
				step=-tstep;
		}//增
		else{
			if(isretry)reduce=true;
			//出现反复
			if(reduce)
				step=tstep;
			else//未反复
				step+=step;
		}
		//备份
		lastresult=newr;
		//递归
		runChangeI(target,step,oldstep,result,deep,lastresult,isretry,reduce,times,flt);
	}
}
//重新计算源数据中的年，次数
function recalcYT(){
	var m=0,d=0,item,m2;
	for (var i=0;i<pageData.data.length;i++){
		item=pageData.data[i];
		if(item.D1)
			m+=item.spy;
		else
			d+=item.spd;
	}
	m2=m;
	if(d>0){
		m+=Math.ceil(d/30);
		m2+=d/30;
	}
	pageData.months=m;
	pageData.years=m2/12;
	pageData.times=pageData.data.length/pageData.years;
}
//让当前项自动选中
function autoSelect(obj){
	if (window.getSelection) {//ie11 10 9 ff safari
       // obj.focus(); 
        var range = window.getSelection();
        range.selectAllChildren(obj);
      //  range.collapseToEnd();
    }
    else if (document.selection) {//ie10 9 8 7 6 5
        var range = document.selection.createRange();
        //var range = document.body.createTextRange();
        range.moveToElementText(obj);
       // range.collapse(false);//collapse(toStart)
        range.select();
    }
}
//自动转到下一列输入,对象方向
function event_autogoNext(obj,dict){
	autoFormat(obj);
	obj.blur();
	//up38 left37 down13-40 right39 
	var id=obj.id;
	var ind=id.match(/\d+/),ck=id.charCodeAt(0);
	if(ind){
		ind=ind[0];
		id=id.replace(ind,'').substr(1);
		ind=Number(ind);
		switch(dict){
			case 38:ind--;break;
			case 37:ck--;break;
			case 13:
			case 40:ind++;break;
			case 39:ck++;break;
		}
		id=String.fromCharCode(ck)+id+ind;
		if(id=g(id)){
			//id.focus();
			//this.blur();
			id.select&&id.select();
			//id.focus();
		}
	}
}
//自动格式化
function autoFormat(obj){
	var inp=Number(obj.value);
	if(!isNaN(inp)){
		if(obj.getAttribute('inptype')=='per')
			inp/=100;
		H(obj.id,inp);
	}
}
//重新计算EV值
function calcEV(total){
	if(total==null)
		total=I('B1');
	var temp;
	if(total!=0){
		for (var i=1;i<=7;i++){
			temp=I('E'+i);
			if(temp!=0){
				pageData.E[i-1]=temp;
				pageData.EV[i-1]=total*temp;
				H('D'+i,pageData.EV[i-1]);
			}
			else{
				temp=I('D'+i);
				if(temp!=0){
					pageData.EV[i-1]=temp;
					pageData.E[i-1]=temp/total;
					H('E'+i,pageData.E[i-1]);
				}
			}
		}
	}
}
//重新计算额外收数据
function calcTop(){
	//pageData.noInterestTotalRatio=I('E3')+I('E4')+I('E5')+I('E6')-I('E7');
	pageData.noInterestTotalRatio=pageData.E[2]+pageData.E[3]+pageData.E[4]+pageData.E[5]-pageData.E[6];
	H('E8',pageData.noInterestTotalRatio);
	//pageData.noInterestTotal=I('D3')+I('D4')+I('D5')+I('D6')-I('D7');
	pageData.noInterestTotal=pageData.EV[2]+pageData.EV[3]+pageData.EV[4]+pageData.EV[5]-pageData.EV[6];
	H('D8',pageData.noInterestTotal);
}
//添加新列
function addNewItem(j,newv,type){
	if(pageData.data.length==0)return;
	var item=dataTemplate(j),cur=null;
	switch(type){
		case 'B':cur=addNewItem_B(j,newv,item);break;
		case 'C':cur=addNewItem_C(j,newv,item);break;
		case 'D':cur=addNewItem_D(j,newv,item);break;
		default :return;
	}
	pageData.data.push(item);
	//recalcYT();
	//console.log(pageData.inpType);
	calcExt();
}
function addNewItem_B(j,newv,a){
	var last=D(pageData.data[j-1].B),cur=D(newv);
	a.B=cnDate(cur);
	//整月
	if(last.getDate()==cur.getDate()){
		a.D1=1;
		a.spy=differenceMonth(last,cur);
		a.spd=Math.round((cur.getTime()-last.getTime())/TimeSpanDay);
	}
	else{
		a.D1=0;
		a.spd=Math.round((cur.getTime()-last.getTime())/TimeSpanDay);
		a.spy=a.spd/30;
	}
	calcTypeMoney(a, j+1, pageData.setp, pageData.type, pageData.first,j,pageData.data);
	return cur;
}
function addNewItem_C(j,newv,a){
	var l=pageData.data[j-1];
	a.D1=l.D1;
	a.B=l.B;
	a.C=newv;
	a.spd=l.spd;
	a.spy=l.spy;
	var last=D(l.B);
	return addNewItem_calcDate(a,last);
}
function addNewItem_D(j,newv,a){
	var last=D(pageData.data[j-1].B),cur;
	a.D1=isInt(newv)?1:0;
	a.spy=newv;
	cur=addNewItem_calcDate(a,last);
	calcTypeMoney(a, j+1, pageData.setp, pageData.type, pageData.first,j,pageData.data);
	return cur;
}
function addNewItem_calcDate(a,last){
	var cur=D(last.getTime());
	//整月
	if(a.D1)
		cur.setMonth(cur.getMonth()+a.spy);
	else
		cur.setDate(cur.getDate()+a.spy*30);
	a.spd=Math.round((cur.getTime()-last.getTime())/TimeSpanDay);
	a.B=cnDate(cur);
	return cur;
}
//设置显示位数
function showlong(v){
	if(v==null){
		var s=['B2','G8','G9'],p,o;
		for(var i=0;i<s.length;i++){
			o=g('op_'+s[i]);
			o.style.display=pageData.data.length==0?'none':'block';
		}
	}
	else{
		var o=g('op_'+v);
		if(o.className.indexOf('leftico')==-1)
			o.className='icon leftico';
		else
			o.className='icon rightico';
		fillFormatLong(v);
	}
}
//显示有效位数
function fillFormatLong(v){
	var r=0;
	switch(v){
		case 'B2':
			r=pageData.rate;
			break;
		case 'G8':
			r=pageData.IRR;
			break;
		case 'G9':
			r=pageData.XIRR;
			break;
	}
	if(r){
		r*=100;
		r=r.toFixed(getLongLength(v))+'%';
		var o=g(v);
		T_val(o,r);
	}
}
//获取位数
function getLongLength(v){
	if(v=g('op_'+v)){
		return v.className.indexOf('leftico')==-1?2:4;
	}
	return 2;
}
//移动系数层
function showresultmove(){
	var o=g('showresult');
	o.className='';
	o.onmousedown=function(e){
		var e = e || event;
		var distanceX = e.clientX - o.offsetLeft;
		var distanceY = e.clientY - o.offsetTop;
		g('mbg').className='';
		document.onmousemove = function(ev){
			var oevent = ev || event;
			var x=oevent.clientX - distanceX;
			var y= oevent.clientY - distanceY;
			if(x<0)x=0;
			if(x+o.offsetWidth>document.body.offsetWidth)x=document.body.offsetWidth-o.offsetWidth;
			if(y<0)y=0;
			if(y+o.offsetHeight>document.body.offsetWidth)y=document.body.offsetHeight-o.offsetHeight;
			o.style.left = x+'px';
			o.style.top = y+'px'; 
　　　　};
　　　　document.onmouseup = function(){
			document.onmousemove = null;
			document.onmouseup = null;
			g('mbg').className='hide';
　　　　};
	}
}
//显示移动层
function showresultmovevalue(v){
	if(v!=null){
		var p=getPosition('C_0'),o=g('showresult');
		o.style.top=p.y+'px';
		o.style.left=(p.x+g('C_0').offsetWidth)+'px';
		showresultmove();
		g('showresult_out').innerHTML=v.toFixed(2);
	}
	g('showresult').style.display=(v==null?'none':'block');
}
