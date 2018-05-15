//注册基础事件
function regEvent(){
	$('[contenteditable="true"]').on('blur',function(){
		var isdate=false,s;
		if(this.id.indexOf('B_')==0||this.id=='B9'){
			isdate=true;
			s=new Date(this.innerHTML.replace(/\//g,'-'));
			if(isNaN(s)){
				if(this.id=='B9'){
					this.innerHTML=getDefaultDate();
					s=new Date(this.innerHTML);
				}
				else{
					this.innerHTML='';
					s=-1;
				}
			}
			else{
				this.innerHTML=cnDate(s);
				s=s.getTime();
			}
		}
		else{
			s=I(this.id);
			var type=this.getAttribute('type');
			if(s==0&&$(this).html()!='0'){
				H(this.id,0);
			}
			else if(type=='per'){
				if(this.innerHTML.indexOf('%')==-1)
					s/=100;
				H(this.id,s);
				s=this.innerHTML;
			}
			else
				H(this.id,s);
		}		
		var o=$(this).attr('value').replace(/,/g,'');
		if(isdate){
			if(s==-1){
				this.innerHTML=o;
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
			changeEvent(this,o,s,isdate);
		}
	}).on('focus',function(){
		$(this).attr('value',$(this).html());
		autoSelect(this);
	}).on('keydown',function(e){
		if(e.keyCode==13||(e.keyCode>=37&&e.keyCode<=40)){
			if ( e && e.stopPropagation )
				e.stopPropagation();
			else
				window.event.cancelBubble = true;
			autogoNext(this,e.keyCode);
			return false;
		}
	});
	$('#impbutton').click(function(){
		if(pageData.data.length==0||(pageData.data.length>0&&confirm('批量导入会清除您当前工作表'))){
			g('impbox').className='show';
			g('mbg').className='show';
		}
	});
	$('.switchbox').click(function(){
		var v=$(this).attr('v'),tag,r;
		if(!v)return;
		tag='s'+v;
		r=pageData.IRRobj[tag]= pageData.IRRobj[tag]==0?1:0;
		$(this).val(r==1?'隐藏':'显示');
		g('I'+v).innerHTML='-';
		if(r==1){
			if(pageData.data.length>0){
				calcIRR(Number(v));
			}
		}
	});
	g('taxType').onchange=function(){
		var i=Number(this.value);
		var taxconfig=[
			[0.06,0.06,0.06,0.06,0.17],//直租
			[0.06,0.06,0.06,0.06,0.6],//回租
			[0.06,0.06,0.06,0.06,0.6],//保理
			[0.06,0.06,0.06,0.06,0.6],//贷款
			[0,0,0,0,0]//税前
		];
		if(isNaN(i)||i>taxconfig.length)
			i=1;
		pageData.taxType=i;
		pageData.Tax=taxconfig[i-1];
		if(pageData.data.length>0){
			calcExt();
		}
	}
	g('IntervalUnitDs').onchange=function(){
		pageData.InterestType=this.value=='1'?1:2;
		calcExt();
	}
	g('taxswitch').onchange=function(){
		pageData.haveTax=this.value=='2'?1:0;
		g('taxType').disabled=!pageData.haveTax;
		if(pageData.haveTax)
			pageData.haveTax.value=1;
		calcExt();
	}
	g('IntervalUnit').onchange=function(){
		pageData.IntervalUnit=Number(this.value);
		if(pageData.data.length){
			for(var i=0;i<pageData.data.length;i++){
				H('D_'+(i+1),pageData.data[i][this.value=='1'?'spy':'spd'],true);				
			}
		}
	}
	//
	g('I1').setAttribute('contenteditable','false');
	g('I1').className='readonly';
}
//输入值发生变化
function changeEvent(obj,oldv,newv,isdate){
	if(isdate&&new Date(oldv).getTime()==newv)
		return;
	if(oldv==newv&&!isdate)
		return;
	var temp=0,len=pageData.data.length;
	if(obj.id=='B4'){
		if(newv<1||newv>12||12%newv>0){
			alert('请输入能被12整除的数字');
			obj.innerHTML=oldv;
			return;
		}
		pageData.inpType=1;
		calc();
		return;
	}
	//主数据调整
	temp=getIdNumber(obj.id,'B',pageData.maxLine);
	if(temp>0){
		changeEventB(temp,obj,newv);
		return;
	}
	//租金调整
	temp=getIdNumber(obj.id,'C_',pageData.maxLine);
	if(temp>0){
		changeEvent_C(temp,newv,len);
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
			obj.innerHTML=oldv;
			alert('请输有效的整数');
			return;
		}
		if(pageData.IntervalUnit==1&&(newv<1||newv>12)){
			obj.innerHTML=oldv;
			alert('请输入1-12之间的数值');
			return;
		}
		if(pageData.IntervalUnit==2&&(newv<1||newv>365)){
			obj.innerHTML=oldv;
			alert('请输入1-365之间的数值');
			return;
		}
		changeEvent_D(temp-1,newv,len);
		return;
	}
	//现金流调整
	if(obj.id=='I_0'){
		pageData.cashAdjustment=newv;
		calcExt();
		return;
	}
	temp=getIdNumber(obj.id,'I_',len);
	if(temp>0){
		changeEvent_I(temp-1,newv,len);
		return;
	}
}
function changeEventB(temp,obj,newv){
	if(temp==1){
		calcEV();
		calcTop();
	}
	if(obj.id=='B1'||obj.id=='B3'||obj.id=='B4'||obj.id=='B7'){
		pageData.inpType=1;
		calc();
	}
	else{
		if(obj.id=='B9'){
			pageData.start=newv;
			if(pageData.data.length>0){
				var d=pageData.data[0],st=D(pageData.start);
				if(d.D1)
					st.setMonth(st.getMonth()+d.spy);
				else
					st.setDate(st.getDate()+d.spd);
				changeEvent_B(0,st.getTime(),pageData.data.length,0,g('B_1'));
			}
		}
		else{
			if(obj.id=='B2')
				pageData.rate=I('B2');
			else if (obj.id=='B8'){
				pageData.residual=I('B8');
				db('residual',pageData.residual);
			}
			calcExt();
		}
	}
}
function changeEvent_B(i,newv,len,oldv,obj){
	//if(i>=pageData.data.length)return;
	if(pageData.start<0){
		obj.innerHTML='';
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
			if(g('B_'+i).innerHTML==''){
				obj.innerHTML='';
				alert('请先设置上期日期');
				return;
			}
			last=D(g('B_'+i).innerHTML);
		}
	}
	a=Math.floor((cur.getTime()-last.getTime())/TimeSpanDay);
	if(a<=0&&oldv!=0){
		alert('新日期必须大于上期');
		obj.innerHTML=oldv;
		return;
	}
	if(a>360){
		alert('与上期间隔不能大于360天');
		obj.innerHTML=oldv;
		return;
	}
	if(i<pageData.data.length){
		a=pageData.data[i];
		//整月
		if(last.getDate()==cur.getDate()){
			a.spy=differenceMonth(last,cur);
			a.spd=Math.round((cur.getTime()-last.getTime())/TimeSpanDay);
		}
		else{
			a.spd=Math.round((cur.getTime()-last.getTime())/TimeSpanDay);
			a.spy=a.spd/30;
		}
		//重置所有数据
		for (;i<len;i++){
			a=pageData.data[i];
			cur=D(last.getTime());
			if(isInt(a.spy)){
				cur.setMonth(cur.getMonth()+a.spy);
			}
			else{
				cur.setDate(cur.getDate()+a.spd);
			}
			a.days=Math.round((cur.getTime()-s.getTime())/TimeSpanDay);
			a.B=cnDate(cur);
			a.D=a.spy;
			last=D(cur.getTime());
		}
		recalcYT(cur,s);
		calcExt();
	}
}
function changeEvent_C(j,newv,len){
	if(len>0){
		j--;
		pageData.data[j].C=newv;
		for(var i=0;i<len;i++)
			pageData.data[i].F1='n';
		calcExt();
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
	calcExt();
}
function changeEvent_D(j,newv,len){
	if(pageData.data.length==0)return;
	var a,s=D(pageData.start);
	var last=(j==0?s:D(pageData.data[j-1].B));
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
	recalcYT(cur,s);
	calcExt();
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
	calcExt();
}
function changeEvent_I(j,newv,len){
	if(pageData.data.length>j){
		pageData.data[j].I1=newv;
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
		//年利率
		calcChangeI1(2);
	}
}
//调整末期余额
function calcChangeI1(type){
	var r=Math.round(I('I1')*100)/100;
	H('I1',r);
	var step=type==1?pageData.total:pageData.totalRepayment/pageData.total,last=I('G_'+pageData.data.length);
	if(r!=last){
		showWaiting(true);
		var back=CopyObject(pageData);
		if(!runChangeI(type,step,r,0,last,step,1)){
			pageData=CopyObject(back);
			fillResult();
		}
		back=null;
		showWaiting(false);
	}
}
//递归计算
function runChangeI(type,step,r,deep,last,os,k){
	var maxdeep=300;
	last=Number(last.toFixed(4));
	if(Number(step.toFixed(16))==0){
		if(os!=0){
			step=-os;
			k=-k;
			os=0;
		}
		else
			deep=maxdeep;
	}
	if(++deep>maxdeep||isNaN(last)||isNaN(r)){
		alert('数据异常，无法计算出结果');
		return false;
	}
	//重置数据
	step/=2;
	var coefficient=last> r?-1:1;
	if(type==1){
		pageData.total=pageData.total+step*coefficient;
	}
	else{
		pageData.rate=pageData.rate+step*coefficient;
	}
	last=Math.round(calcExt(true)*100)/100;
	console.log(deep+'last:'+last.toFixed(2));
	console.log(deep+'step:'+step.toFixed(8));
	if(last==r){
		calcExt();
		return true;
	}
	else{
		return runChangeI(type,step,r,deep,last,os,k);
	}
}
//重新计算源数据中的年，次数
function recalcYT(cur,s){
	pageData.years=(cur.getTime()-s.getTime())/(86400000*365);
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
function autogoNext(obj,dict){
	autoFormat(obj);
	obj.blur();
	//up38 left37 down13-40 right39 
	var id=obj.id;
	var ind=id.match(/\d+/),ck=id.charCodeAt(0);
	if(ind){
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
		if(id=g(id))
			id.focus();
	}
}
//自动格式化
function autoFormat(obj){
	var inp=Number(obj.innerHTML);
	if(!isNaN(inp)){
		if(obj.getAttribute('type')=='per')
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
			temp=I('D'+i);
			if(temp!=0){
				pageData.EV[i-1]=temp;
				pageData.E[i-1]=temp/total;
				H('E'+i,pageData.E[i-1]);
			}
			else{
				temp=I('E'+i);
				if(temp!=0){
					pageData.E[i-1]=temp;
					pageData.EV[i-1]=total*temp;
					H('D'+i,pageData.EV[i-1]);
				}
			}
		}
	}
}
//重新计算额外收数据
function calcTop(){
	//pageData.noInterestTotalRatio=I('E3')+I('E4')+I('E5')+I('E6')-I('E7');
	pageData.noInterestTotalRatio=pageData.E[3-1]+pageData.E[4-1]+pageData.E[5-1]+pageData.E[6-1]-pageData.E[7-1];
	H('E8',pageData.noInterestTotalRatio);
	//pageData.noInterestTotal=I('D3')+I('D4')+I('D5')+I('D6')-I('D7');
	pageData.noInterestTotal=pageData.EV[3-1]+pageData.EV[4-1]+pageData.EV[5-1]+pageData.EV[6-1]-pageData.EV[7-1];
	H('D8',pageData.noInterestTotal);
}