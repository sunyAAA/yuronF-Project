var TimeSpanDay=86400000,NumberType=typeof(0);
var TimeSpanMonth=TimeSpanDay*30;
var pageData={
	total:0,//项目总金额
	start:0,//起租日
	rate:0,//年利率
	years:0,//租期年
	times:0,//年还租次数
	rent:0,//等额（平均）租金
	step:0,//差值或系数
	remain:0,//资产余值
	residual:0,//残值收入
	cashflow:0,//现金流量
	cashAdjustment:0,//现金流调整
	isCFA:0,//是否调整现金流
	taxExpenditure:0,//税收支出
	E:[],//其它占比
	EV:[],//其它占比值
	Tax:[0.06,0.06,0.06,0.06,0.17],//税率 附加数据服务费收入6%,咨询费收入6%,保险收入	6%,其他收入6%,利息收入17%
	haveTax:0,//是否收税（默认税前）
	noInterestTotal:0,//非利息收入合计
	noInterestTotalRatio:0,//非利息收入合计占比
	notreclaimed:0,//未回收成本
	totalInterest:0,//利息总额
	totalRepayment:0,//还款总额
	totalIncome:0,//总收益额
	yearInterest:{},//年利息收小计
	yearIncome:0,//当年总收益
	yearCost:{},//年成本小计
	yearRent:{},//年租金小计
	totalBurden:0,//总负担率（年）
	flatRate:0,//平面率利
	capitalOccupation:0,//资金占用（月）
	IRR:0,//irr
	XIRR:0,//xirr
	IRRY:0,//irr逐月贴现
	IRRMAXM:0,//irr最大公约月
	IRRSPY:0,//irr实际间隔月
	IRRSPD:0,//irr 实际间隔天
	IRRobj:{s6:0,s7:0,s8:0,s9:0},//irr对象
	maxLine:120,//数据最大行
	IntervalUnit:1,//还款间隔单位1月2日
	InterestType:1,//利息回收类别1月2日
	numberType:typeof(0),//数字格式
	ys:0,//用户计算irr
	/*
	 * 1：手工输入，2：冻结列调整，3:导入,5:单变量求解(6,7)
	 */
	inpType:1,//用户操作类别，
	equalRent:0,//等额
	equalInterval:0,//等期
	taxType:1,//税率类别
	data:[]
};
// 是否等期，是否等额，税率类别,非利息率E8，
window.onload=function(){
	initTable();
	clsInp(false);
	reinitPageData();
	if(query('calc')=='1'){
		ifrInit();
	}
}
//重新初始化页面数据
function reinitPageData(){
	initPageData(0,0,0,0,0,0,2,true);
}
//调整租金
function changeType(obj){
	var v=Number(obj.value);
	showpopwindow('C_1',v);
	obj.blur();
}
//调整回收成本
function changeCost(obj){
	if(pageData.data.length>0){
		var v=Number(obj.value);
		switch(v){
			case 0:
				break;
			case 100:
				changeCost_1();
				break;
			case 200:
				changeCost_2();
				break;
			default:
				showpopwindow('F_1',v);
				break;
		}
	}
	//obj.value=0;
	obj.blur();
}
function showpopwindow(c,v){
	//输入框重置
	g('ch_1').value=v;
	g('ch_2').value=g('ch_3').value='';
	g('ch_2').className=g('ch_3').className='inpitem';
	if(v==2){
		g('calcTypeValueBox').className='vhide';
		g('ch_3').value=1;
		return;
	}
	g('calcTypeValueBox').className='vshow';
	g('calcTypeValueDs').innerHTML=(v==3||v==5)?'差值':'系数';
	//页面展示
	var p=getPosition(c);
	var m=g('mbg');
	m.className='show';
	m=g('box_repayment');
	m.style.top=p.y+'px';
	m.style.left=p.x+'px';
	m.className='show';
	__back.se='C';
}
function changeCost_1(){
	//公式，项目金额-首付款-未回本金末期）/总还款次数
	var temp=(pageData.total-pageData.EV[0]-I('G_'+pageData.data.length))/(pageData.years*pageData.times);
	for (var i=0;i<pageData.data.length;i++){
		pageData.data[i].F1=temp;
	}
	calcExt();
}
function changeCost_2(){
	pageData.inpType=2;
	setCanEditEditer(false);
	setChangeState(true);
	g('calcButton').className='left';
	g('cancelButton').className='left';
	setEdit('B_,C_,D_,I_',false);
	setEdit('F_',true);
	//备份
	__back.se='F';
	if(pageData.data.length>0){
		__back.data=[];
		for (var i=0;i<pageData.data.length;i++)
			__back.data.push(pageData.data[i].F);
	}
	else
		__back.data=null;
	closewindow();
}
var __back={se:'C',data:null};
//取消手工调整
function cancel(){
	if(pageData.inpType!=2)return;
	if(__back.data){
		for(var i=1;i<=__back.data.length;i++){
			H(__back.se+'_'+i,__back.data[i-1]);
		}
	}
	resumewindow();
}
//还原窗口样式
function resumewindow(){
	g('cancelButton').className='hide';
	g('calcButton').className='hide';
	setEdit('B_,C_,D_,I_',true);
	setEdit('F_',false);
	setCanEditEditer(true);
	setChangeState(false);
	__back.data=null;
	pageData.inpType=(pageData.data.length>0?4:1);
}
//关闭弹窗
function closewindow(){
	g('impbox').className=g('waiting').className=g('box_repayment').className=g('mbg').className='hide';
	g('impinp').value='';
}
//提交回收成本
function changeCostSub(){
	var v=g('cost_1').value.replace(/\s/g,'');
	if(v.length==0||isNaN(v=Number(v))){
		g('cost_1').className='error';
		g('cost_1').innerHTML='';
		return;
	}
	for(i=0;i<pageData.data.length;i++){
		pageData.data[i].F1=v;
	}
	calcExt();
	closewindow();
}
//提交更改租金方式
function changeTypeSub(){
	var data=[],v,err=0,o,css;
	for (var i=1;i<=3;i++){
		o=g('ch_'+i);
		v=Number(o.value);
		if(o.value==''||isNaN(v)||v==0){
			css='error';
			o.innerHTML='';
			err++;
		}
		else{
			css='inpitem';
			data.push(v);
		}
		o.className=css;
	}
	if(err==0){
		if(data[0]!=2&&data[0]!=3&&data[0]!=5){
			if(data[2]>10||data[2]<0){
				g('ch_3').className='error';
				alert('系数不能大于10或小于0');
				return;
			}
		}
		pageData.rent=0;
		//pageData.remain=0;
		//pageData.residual=0;
		pageData.type=data[0];
		pageData.first=data[1];
		pageData.step=data[2];
	
		for(var i=1;i<=pageData.data.length;i++){
			v=pageData.data[i-1];
			calcTypeMoney(v, pageData.total, pageData.step, pageData.type, pageData.first,i,pageData.data);
			I('C_'+i,v.C);
			v.F1='n';
		}
		calcExt();
		closewindow();
	}
}
//根据修改结果显示数据
function fillChangeForList(impdata){
	var first=pageData.first;
	var start=new Date(pageData.start);
	var years=pageData.years;
	var times=pageData.times;
	var type=pageData.type;
	var step=pageData.step;
	//
	var total=impdata?impdata.length:(years*times);
	var days=0,odays=0,temp=0;
	var lastdate=new Date(pageData.start);
	var stepm=12/times;
	g('B9').innerHTML=g('B_0').innerHTML=cnDate(start);
	var d=[],item;
	var allDays=0;
	
	for(var i=1;i<=total;i++){
		//D1 是否满月
		item={B:0,C:0,D:0,D1:1,E:0,F:0,F1:'n',G:0,H:0,I:0,I1:I('I_'+i),spy:0,spd:0,tax:0,y:0,days:0,mdays:0};
		//计算日期
		if(impdata){
			item.C=impdata[i-1].C;
			item.spy=impdata[i-1].D;
			item.D1=1;
			start=D(lastdate.getTime());
			start.setMonth(start.getMonth()+item.spy);
		}
		else{
			start.setMonth(start.getMonth()+stepm);
			item.spy=stepm;
		}
		item.spd=Math.round((start.getTime()-lastdate.getTime())/TimeSpanDay);
		//
		lastdate=new Date(start.getTime());
		item.B=cnDate(start);
		item.D=item.spy;
		allDays+=item.spd;
		item.days=allDays;
		//计算租金
		calcTypeMoney(item, total, step, type, first,i,d);
		//添加对像
		d.push(item);
	}
	pageData.data=d;
	//计算扩展数据
	calcExt();
}
//计算扩展数据,loop是否用于循环查询
function calcExt(loop){
	if(pageData.data.length==0)return;
	loop=!!loop;
	var temp,t,totalmdays=0,cf=[],hk=[],ys=[];
	calcExt0();
	cf.push(pageData.cashflow);
	hk.push(cnDate(new Date(pageData.start)));
	pageData.equalInterval=1;
	pageData.equalRent=1;
	var tm,tt;
	for (var i=0;i<pageData.data.length;i++){
		temp=pageData.data[i];
		//年
		temp.y=parseInt(temp.B);
		hk.push(temp.B);
		ys.push(temp.spy);
		//利息收入  --按月计算 
		t=i==0?pageData.notreclaimed:pageData.data[i-1].G;
		if(pageData.InterestType==1){
			temp.E=t*pageData.rate/12*temp.spy;
		}
		else{
			//按日计算
			temp.E=t*pageData.rate/360*temp.spd;
		}
		//税费
		temp.tax=temp.E/(1+pageData.Tax[4])*pageData.Tax[4];
		//现金流调整
		temp.I=temp.I1-(pageData.haveTax?temp.tax:0);
		//现金流变化
		pageData.isCFA+=temp.I;
		//年利息小计
		if(!pageData.yearInterest[temp.y])
			pageData.yearInterest[temp.y]=0;
		pageData.yearInterest[temp.y]+=temp.E;
		//回收成本
		if(temp.F1=='n')
			temp.F=temp.C-temp.E;
		else{//手工调整反计算
			temp.F=temp.F1;
			temp.C=temp.F+temp.E;
		}
		//temp.F=temp.F1=='n'?(temp.C-temp.E):temp.F1;
		//成本*占用天数
		temp.mdays=temp.F*temp.days/30;
		totalmdays+=temp.mdays;
		//年利成本回收小计
		if(!pageData.yearCost[temp.y]){
			pageData.yearCost[temp.y]=0;
			pageData.yearRent[temp.y]=0;
		}
		pageData.yearCost[temp.y]+=temp.F;	
		pageData.yearRent[temp.y]+=temp.C;
		//未回收成本
		temp.G=(i==0?pageData.notreclaimed:pageData.data[i-1].G)-temp.F;
		//现金流量
		if(i==pageData.data.length-1)
			temp.H=temp.C-pageData.EV[1]+pageData.residual+temp.I;
		else
			temp.H=temp.C+temp.I;
		cf.push(temp.H);
		//利息总额
		pageData.totalInterest+=temp.E;
		//还款总金额
		pageData.totalRepayment+=temp.C;
		//验算是否等额或等期
		if(i==0){
			tm=temp.C;
			tt=temp.spy;
		}
		else{
			if(pageData.equalRent)
				pageData.equalRent=(tm==temp.C?1:0);
			if(pageData.equalInterval)
				pageData.equalInterval=(tt==temp.spy?1:0);
		}
	}
	if(loop){
		return pageData.data[pageData.data.length-1].G;
	}
	calcExtFinish(totalmdays,cf,hk,ys);
}
//计算扩展数据归档
function calcExt0(){
	//计算未回收成本
	pageData.notreclaimed=pageData.total-pageData.EV[0];
	pageData.yearCost={};
	pageData.yearRent={};
	pageData.yearInterest={};
	//计算现金流量
	pageData.taxExpenditure=0;//税收支出
	for(var i=0;i<5;i++)
		pageData.taxExpenditure+=pageData.EV[i+2]*pageData.Tax[i];
	//现金流调整
	pageData.cashAdjustment=I('I_0')-(pageData.haveTax?pageData.taxExpenditure:0);
	pageData.cashflow=pageData.EV[0]+pageData.EV[1]+pageData.noInterestTotal+pageData.cashAdjustment-pageData.total;
	//计算其它费用
	pageData.totalInterest=pageData.totalRepayment=pageData.isCFA=0;
}
//扩展数据计算完成
function calcExtFinish(totalmdays,cf,hk,ys){
	//总收益额
	pageData.totalIncome=pageData.totalInterest+pageData.noInterestTotal;
	//当年总收益
	var t=pageData.yearInterest[new Date().getFullYear()];
	pageData.yearIncome=(t?t:0)+pageData.noInterestTotal;
	//总负担率（年）
	pageData.totalBurden=pageData.totalIncome/(pageData.total-pageData.EV[0]-pageData.EV[1])/pageData.years;
	//平面率利
	pageData.flatRate=pageData.totalInterest/pageData.years/(pageData.total-pageData.EV[0]-pageData.EV[1]);
	//资金占用月
	pageData.capitalOccupation=Math.round(totalmdays/(pageData.total-pageData.EV[0]));
	//是否调整现金流
	pageData.isCFA=(pageData.isCFA+pageData.cashAdjustment+(pageData.haveTax?pageData.taxExpenditure:0)==0?0:1);
	//irr
	pageData.IRR=IRR(cf,0.01)*pageData.times;
	//xirr
	pageData.XIRR=XIRR(cf,hk,0.01);
	//irrobj
	pageData.ys=ys;
	//填充数据	
	fillResult();
	//填充自动计算
	//reFillEdata();
}
//计算irr
function calcIRR(v,cur,step,deep,gcd){
	var l=pageData.data.length,result=Math.round(-pageData.cashflow),ns=0,tag=0.0000001;
	if(cur==null){
		deep=100;
		step=0.01;
		cur=pageData.XIRR-step;
		gcd=(v==7?MathGCD(pageData.ys):0);
	}
	var tx=[],xj=[];
	for (var i=l;i>=0;i--){
		switch(v){
			case 6:
				tx[i]=(i==l?0: xj[i+1]/Math.pow(1+cur/12,pageData.data[i].spy));
				xj[i]=(i==0?0:(pageData.data[i-1].H+tx[i]));
				break;
			case 7:
				tx[i]=(i==l?0: xj[i+1]/Math.pow(1+cur/12*gcd,pageData.data[i].spy/gcd));
				xj[i]=(i==0?0:(pageData.data[i-1].H+tx[i]));
				break;
			case 8:
				tx[i]=(i==l?0: NPV(cur*pageData.data[i].spy/12, xj[i+1]));
				xj[i]=(i==0?0:(pageData.data[i-1].H+tx[i]));
				break;
			case 9:
				tx[i]=(i==l?0: NPV(cur*pageData.data[i].spd/360, xj[i+1]));
				xj[i]=(i==0?0:(pageData.data[i-1].H+tx[i]));
				break;
		}
	}
	ns= Math.round(tx[0]);
	if(step===tag&&ns>result)
		ns=result;
	step/=2;
	if(step<tag)
		step=tag;
	if(result==ns){
		H('I'+v,toPercent(cur));
		switch(v){
			case 6:pageData.IRRY=cur;break;
			case 7:pageData.IRRMAXM=cur;break;
			case 8:pageData.IRRSPY=cur;break;
			case 9:pageData.IRRSPD=cur;break;
		}
	}
	else{
		if(deep<=0){
			g('I'+v).innerHTML='Error';
			return;
		}
		calcIRR(v,cur+((ns<result?-1:1)*step),step,deep-1,gcd);
	}
}
//展示最终结果
function fillResult(){
	clsInp(false);	
	pageData.inpType=1;
	H('B3',pageData.years,true);
	H('B4',pageData.times,true);
	H('B5',pageData.data.length);
	H('B6',pageData.years*12);
	H('B1',pageData.total);
	H('B2',pageData.rate);
	H('G1',pageData.equalRent? pageData.rent:'-');
	H('G4',pageData.yearIncome+pageData.noInterestTotal);
	H('B7',pageData.remain);
	H('B8',pageData.residual);
	g('B9').innerHTML=g('B_0').innerHTML=cnDate(D(pageData.start));
	H('G_0',pageData.notreclaimed);
	H('I_0',pageData.cashAdjustment);
	H('H_0', pageData.cashflow);
	H('D9', pageData.totalInterest);
	H('E9', toPercent(pageData.totalInterest/pageData.total));
	H('G2',pageData.totalRepayment);
	H('G3',pageData.totalIncome);
	H('G4',pageData.yearIncome);
	H('G5',toPercent(pageData.totalBurden));
	H('G6',toPercent(pageData.flatRate));
	H('G7',pageData.capitalOccupation);
	H('G8',toPercent(pageData.IRR));
	H('G9',toPercent(pageData.XIRR));
	H('I1',pageData.data[pageData.data.length-1].G);
	H('E8',pageData.noInterestTotalRatio);
	H('D8',pageData.noInterestTotal);
	if(pageData.IRRobj.s6)
		calcIRR(6);
	if(pageData.IRRobj.s7)
		calcIRR(7);
	if(pageData.IRRobj.s8)
		calcIRR(8);
	if(pageData.IRRobj.s9)
		calcIRR(9);
	g('I4').innerHTML=pageData.isCFA?'是':'否';
	var d=pageData.data,id;
	var dv=pageData.IntervalUnit==1?'spy':'spd';
	if(d.length>0){
		for (var i=0;i<d.length;i++){
			id=i+1;
			H('B_'+id,d[i].B,null,true);
			H('C_'+id,d[i].C,null,true);
			H('D_'+id,d[i][dv],true,true);
			H('E_'+id,d[i].E,null,true);
			H('F_'+id,d[i].F,null,true);
			H('G_'+id,d[i].G,null,true);
			H('H_'+id,d[i].H,null,true);
			H('I_'+id,d[i].I,null,true);
		}
	}
	//
	for(var i=1;i<=7;i++){
		H('D'+i,pageData.EV[i-1]);
		H('E'+i,pageData.E[i-1]);
	}
	g('I1').className='';
	g('I1').setAttribute('contenteditable','true');
	setChangeState(false);
}
//重新录入原始数据
//function reFillEdata(){
//	var c=0;
//	if(pageData.E.length==7){
//		for (var i=1;i<=7;i++){
//			if(pageData.E[i-1]!=0){
//				H('E'+i,pageData.E[i-1]);
//				c++;
//			}
//		}
//		if(c)
//			calcTop();
//	}
//}
//清空数据
function clsInp(conf){
	if(!conf||confirm('当前数据尚未保存，您确定要清空数据？')){
		$('[contenteditable="true"]').html('');
		$('.readonly').html('');
		g('I6').innerHTML=g('I7').innerHTML=g('I8').innerHTML=g('I9').innerHTML='-';
		g('I1').innerHTML=0;
		g('I1').setAttribute('contenteditable','false');
		g('I1').className='readonly';
		g('calcButton').className='button';
		if(conf){
			reinitPageData();
		}
		if(pageData.data.length==0){
			setEdit('I_,B_,E_,F_',false);
			setEdit('C_,D_',true);
			g('IntervalUnit').value=1;
			g('IntervalUnitDs').value=1;
			//
			g('taxswitch').value=1;
			g('taxType').value=1;
			g('taxType').disabled=true;
			pageData.taxType=1;
			pageData.haveTax=false;
			g('B9').innerHTML=getDefaultDate();
			H('B8',db('residual'));
		}
		else{
			pageData.inpType=1;
		}
		setChangeState(true);
		setCanEditEditer(true);
	}
}

//计算pmt
function pmt(){
	var B1=I('B1');
	var B2=I('B2');
	var B3=I('B3');
	var B4=I('B4');
	var B7=I('B7');
	var D1=I('D1');
	var D2=I('D2');
	var D8=I('D8');
	var D9=I('D9');
	if(B4==0||B2==0||B3==0||B1==0){return false;}
	if(B3*B4>pageData.maxLine){
		alert('有效数据不应超过'+pageData.maxLine+'行');
		return false;
	}
	var p=B1-D1;
	var pn=B7;
	var i=B2/B4;
	var n=B3*B4;//总期数
	var a=p-pn;
	var b=Math.pow(1+i,n)*i;	
	var c=Math.pow(1+i,n)-1;
	var per= a*(b/c)+pn*i;
	initPageData(B1,B2,B3,B4,per,B7,2,false);
	return true;
}
//重新构建pageData
function initPageData(B1,B2,B3,B4,per,B7,type,initEV){
	pageData.total=B1;
	pageData.rate=B2;
	pageData.years=B3;
	pageData.times=B4;
	pageData.start=new Date(g('B9').innerHTML).getTime();
	pageData.type=type;//2等额,1手工
	pageData.setp=0;
	pageData.first=per;
	pageData.rent=per;
	pageData.remain=B7;
	pageData.residual=I('B8');
	pageData.E=[];
	pageData.EV=[];
	pageData.data=[];
	for (var i=1;i<=7;i++){
		pageData.E[i-1]=pageData.EV[i-1]=0;
		if(initEV){
			g('D'+i).innerHTML='0.00';
			g('E'+i).innerHTML='0.00%';
		}
	}
	if(pageData.total!=0)
		calcEV(pageData.total);
}
//默认计算
function calc(retry){
	//手工调整
	if(pageData.inpType==1){
		//基本数据有效，执行等额运算
		if(pmt()){
			calcTop();
			fillChangeForList();
			resumewindow();
			setChangeState(false);
		}
		//如果等额失败且code为0或null,检查是否存在列表输入
		else if(!retry){
			for (var i=1;i<=pageData.maxLine;i++){
				a={C:I('C_'+i),spy:I('D_'+i),B:0};
				if(a.C>0&&a.spy>0){
					if(i>1){
						pageData.inpType=3;
						calc(true);
						return;
					}
				}
				else
					break;
			}
		}
	}
	//导入
	else if (pageData.inpType==3){
		if(doimport(true)){
			resumewindow();
			setChangeState(false);
		}//如果code==1则表示已尝试等额无需求再尝试
		else if (!retry){
			pageData.inpType=1;
			calc(true);
		}
	}
	//冻结列
	else if(pageData.inpType==2){
		for (var i=1;i<=pageData.data.length;i++){
			pageData.data[i-1].F1=I('F_'+i);
		}
		resumewindow();
		calcExt();
	}
}
//禁用列表列
function setEdit(tag,enable){
	enable=!!enable;
	var cn= 'readonly',a,ts=tag.split(','),j;
	for (var i=1;i<=pageData.maxLine;i++){
		for(j=0;j<ts.length;j++){
			if(a=g(ts[j]+i)){
				if(enable)
					$('#'+a.id).removeClass(cn);
				else
					$('#'+a.id).addClass(cn);
				a.setAttribute('contenteditable',enable);
			}
		}
	}
	if(tag.indexOf('I_')!=-1){
		a=g('I_0');
		a.className=enable?'':cn;
		a.setAttribute('contenteditable',enable);
	}
}
//上栏是否可编辑
function setCanEditEditer(enable){
	g('canteditface').style.display=enable?'none':'block';
}





































