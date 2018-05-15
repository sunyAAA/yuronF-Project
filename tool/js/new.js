var TimeSpanDay=86400000,NumberType=typeof(0);
var TimeSpanMonth=TimeSpanDay*30,MyHistory=[],G_ids;
var pageData={
	total:0,//项目总金额
	start:0,//起租日
	rate:0,//年利率
	years:0,//租期年
	times:0,//年还租次数
	months:0,//期限月
	rent:0,//等额（平均）租金
	remain:0,//资产余值
	residual:0,//残值收入
	cashflow:0,//现金流量
	cashAdjustment:0,//现金流调整
	selfCash:0,//手工现金调整
	isCFA:0,//是否调整现金流
	taxExpenditure:0,//税收支出
	E:[],//其它占比
	EV:[],//其它占比值
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
	maxLine:500,//数据最大行
	IntervalUnit:1,//还款间隔单位1月2日
	InterestType:1,//利息回收类别1月2日
	numberType:typeof(0),//数字格式
	ys:0,//用户计算irr
	/*
	 * 1：手工输入，2：列调整 （2.1还款收，2.2收回成本） ，3:导入，4:自动计算,9:单变量示解
	 */
	dosolve:0,//是否在单变量求解
	inpType:1,//用户操作类别，
	inpTypeC:{},//还款收入调整方式默认0自动
	inpTypeF:{},//回收成本调整方式默认0自动
	/*
	 1.开始执行，2.目标列，3.可变列
	 * */
	solveType:0,//单变量求解类别
	equalRent:0,//等额
	equalInterval:0,//等期
	taxType:1,//税率类别
	data:[]
};
// 是否等期，是否等额，税率类别,非利息率E8，
window.onload=function(){
	initTable();
	getTax(function(){
		clsInp(false);
		reinitPageData();
		showlong();
		var act=query('calc');
		if(act=='1'){
			ifrInit();
		}
		else if(act=="2"){
			ifrFill();
		}
		else{
			//nothing
		}
	});
}
//重新初始化页面数据
function reinitPageData(){
	initPageData(0,0,0,0,0,0,1,true);
}
//关闭弹窗
function closewindow(){
	g('impbox').className=g('waiting').className=g('mbg').className='hide';
	g('impinp').value='';
}
//数据模板
function dataTemplate(i){
	//D1 是否满月,F1:'n'自动计算，如果为数字则为用户手工输入，J：手工调整现金流，spy：间隔月，std：间隔日，tax税收，
	//y：所在年份，days:从起租日到还款日的天数，mdays：中间变量
	/*var i1=0;
	if(i!=null){
		i1=g('I_'+i);
		if(i1)i1=I('I_'+i);else i1=0;
	}*/
	return {B:0,C:0,D:0,D1:1,E:0,F:0,F1:'n',G:0,H:0,I:0,J:0,spy:0,spd:0,tax:0,y:0,days:0,mdays:0};
}
//根据修改结果显示数据
function fillChangeForList(impdata){
	var total=impdata?impdata.length:(pageData.years*pageData.times);
	var days=0,odays=0,temp=0;
	if(pageData.inpType!=9)
		g('B9').value=g('B_0').value=cnDate(new Date(pageData.start));
	calcBspyd(total,null,impdata);
	//计算扩展数据
	calcExt();
}
//计算日期
function calcBspyd(total,dd,impdata){
	var stepm=12/pageData.times,start=new Date(pageData.start);
	var first=pageData.first;
	var type=pageData.type;
	var step=pageData.step;
	var lastdate=new Date(pageData.start);
	var d=[],item;
	var allDays=0;
	for(var i=1;i<=total;i++){
		if(dd)
			item=dd[i-1];
		else
			item=dataTemplate(i);
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
}
//计算扩展数据,loop是否用于循环查询
function calcExt(loop){
	if(pageData.data==null||pageData.data.length==0)return;
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
			temp.E=F2(t*pageData.rate/12*temp.spy);
		}
		else{
			//按日计算
			temp.E=F2(t*pageData.rate/360*temp.spd);
		}
		//税费
		temp.tax=F2(temp.E/(1+TaxObj[pageData.taxType][4])*TaxObj[pageData.taxType][4]);
		//现金流调整
		//temp.I= F2((temp.I1=='n'?0:temp.I1)-(pageData.haveTax?temp.tax:0));
		temp.I= 0-(pageData.haveTax?temp.tax:0);
		//现金流变化
		pageData.isCFA+=temp.I;
		//年利息小计
		if(!pageData.yearInterest[temp.y])
			pageData.yearInterest[temp.y]=0;
		pageData.yearInterest[temp.y]=F2(temp.E+pageData.yearInterest[temp.y]);
		//动态调整回收成本change_calc_item(ind,obj,last)
		if(pageData.inpType==2.2){
			temp.F=F2(temp.F1);
			temp.C=F2(temp.F+temp.E);
		}
		else{
			//动态还款收入
			if(pageData.inpType==2.1){
				t=change_calc_item(i,pageData.inpTypeC,i==0?pageData.inpTypeC.start:pageData.data[i-1].C);
				//console.log('--'+t+','+temp.C);
				if(t!=null)
					temp.C=F2(t);
			}
			else if(pageData.inpType!=3){//自动调整
				temp.C=F2(pageData.rent);
			}
			temp.F=F2(temp.C-temp.E);
		}
		//成本*占用天数
		temp.mdays=F2( temp.F*temp.days/30);
		totalmdays+=temp.mdays;
		//年利成本回收小计
		if(!pageData.yearCost[temp.y]){
			pageData.yearCost[temp.y]=0;
			pageData.yearRent[temp.y]=0;
		}
		pageData.yearCost[temp.y]=F2(temp.F+pageData.yearCost[temp.y]);	
		pageData.yearRent[temp.y]=F2(temp.C+pageData.yearRent[temp.y]);
		//未回收成本
		temp.G=F2((i==0?pageData.notreclaimed:pageData.data[i-1].G)-temp.F);
		//现金流量
		if(i==pageData.data.length-1){
			temp.H=F2(temp.C-pageData.EV[1]+pageData.residual+temp.I+temp.J+pageData.remain);
		}
		else
			temp.H=F2(temp.C+temp.I+temp.J);
		cf.push(temp.H);
		//利息总额
		pageData.totalInterest=F2(temp.E+pageData.totalInterest);
		//还款总金额
		pageData.totalRepayment=F2(temp.C+pageData.totalRepayment);
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
	
	//console.log(hk);
	//console.log(ys);
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
	var tti=TaxObj[pageData.taxType];
	for(var i=0;i<4;i++){
		pageData.taxExpenditure+=pageData.EV[i+2]/(1+tti[i])*tti[i];
	}
	//pageData.taxExpenditure-=pageData.EV[6];
	pageData.taxExpenditure=-pageData.taxExpenditure;
	//现金流调整
	pageData.cashAdjustment=(pageData.haveTax?pageData.taxExpenditure:0);
	pageData.cashflow=pageData.EV[0]+pageData.EV[1]+pageData.noInterestTotal+pageData.selfCash+pageData.cashAdjustment-pageData.total;
	//计算其它费用
	pageData.totalInterest=pageData.totalRepayment=pageData.isCFA=0;
}
//扩展数据计算完成
function calcExtFinish(totalmdays,cf,hk,ys){
	//总收益额
	pageData.totalIncome=F2(pageData.totalInterest+pageData.noInterestTotal);
	//当年总收益
	var t=pageData.yearInterest[new Date(pageData.start).getFullYear()];
	
	pageData.yearIncome=(t?t:0)+pageData.noInterestTotal;
	//总负担率（年）
	pageData.totalBurden=F2(pageData.totalIncome/(pageData.total-pageData.EV[0]-pageData.EV[1])/Math.round(pageData.years),4);
	//平面率利
	pageData.flatRate=F2(pageData.totalInterest/Math.round(pageData.years)/(pageData.total-pageData.EV[0]-pageData.EV[1]),4);
	//资金占用月
	pageData.capitalOccupation=Math.round(totalmdays/(pageData.total-pageData.EV[0]));
	//是否调整现金流
	pageData.isCFA=(pageData.isCFA+pageData.cashAdjustment+(pageData.haveTax?pageData.taxExpenditure:0)==0?0:1);
	//irr
	pageData.IRR=getIrr(1);//IRR(cf,0.01)*pageData.times;
	//xirr
	pageData.XIRR=getIrr(2);//XIRR(cf,hk,0.01);
	//irrobj
	pageData.ys=ys;
	//计算末期余数
	//if(pageData.IntervalUnit==1&&pageData.inpType==4){
	//	resetLastG();
	//}
	//填充数据	
	if(pageData.dosolve==0)
		fillResult();
}
//主动调整未回收成本末期余额
function resetLastG(){
	if(pageData.data.length>0){
		var item=pageData.data[pageData.data.length-1],b7=I('B7');
		var r=item.G-I('B7');
		if(r!=0){
			item.F=item.F+r;
			item.E=item.E-r;
		}
		item.G=b7;
		//重新计算
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
			//税费
			temp.tax=F2(temp.E/(1+TaxObj[pageData.taxType][4])*TaxObj[pageData.taxType][4]);
			//现金流调整
			//temp.I= F2((temp.I1=='n'?0:temp.I1)-(pageData.haveTax?temp.tax:0));
			temp.I= (temp.J==0?0:temp.J)-(pageData.haveTax?temp.tax:0);
			//现金流变化
			pageData.isCFA+=temp.I;
			//年利息小计
			if(!pageData.yearInterest[temp.y])
				pageData.yearInterest[temp.y]=0;
			pageData.yearInterest[temp.y]=F2(temp.E+pageData.yearInterest[temp.y]);
			//成本*占用天数
			temp.mdays=F2( temp.F*temp.days/30);
			totalmdays+=temp.mdays;
			//年利成本回收小计
			if(!pageData.yearCost[temp.y]){
				pageData.yearCost[temp.y]=0;
				pageData.yearRent[temp.y]=0;
			}
			pageData.yearCost[temp.y]=F2(temp.F+pageData.yearCost[temp.y]);	
			pageData.yearRent[temp.y]=F2(temp.C+pageData.yearRent[temp.y]);
			//未回收成本
			temp.G=F2((i==0?pageData.notreclaimed:pageData.data[i-1].G)-temp.F);
			//现金流量
			if(i==pageData.data.length-1){
				temp.H=F2(temp.C-pageData.EV[1]+pageData.residual+temp.I+pageData.remain);
			}
			else
				temp.H=F2(temp.C+temp.I);
			cf.push(temp.H);
			//利息总额
			pageData.totalInterest=F2(temp.E+pageData.totalInterest);
			//还款总金额
			pageData.totalRepayment=F2(temp.C+pageData.totalRepayment);
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
		calcExtFinish(totalmdays,cf,hk,ys);
	}
}
function tozerosh(){
	var css='hide',len=pageData.data.length-1;
	if(len>=0&&pageData.data[len].G!=0){
		var r=Math.abs(pageData.data[len].G-I('B7'));
		if(r>0&&r<pageData.data.length*0.01){
			css='left';
		}
	}
	g('tozero').className=css;
	g('I1').readOnly=(css!='hide');
}
//计算单irr
function getIrr(v,retry,cur,step,deep,ys,times,last){
	//初始化
	if(cur==null){
		deep=100;
		cur=(retry?-1:1)*pageData.rate;
		step=0;
		ys=Math.round(pageData.times);
		times=0;
		last=null;
		retry=!!retry;
	}
	//计算新值
	if(step==0)
		cur*=2;
	else{
		cur+=step;
	}
	//计算中间量
	var tot=0,temp=0,v1=1+cur/ys,item,ds=0;
	var b7=I('B7'),len=pageData.data.length,h;
	for (var i=0;i<len;i++){
		item=pageData.data[i];
		h=item.H;
		//if(b7!=0&&i==len-1)
		//	h+=b7;
		switch(v){
			case 1:
				tot+=h/Math.pow(v1,i+1);
				break;
			case 2:
				tot+=h/Math.pow(1+cur,(ds+=item.spd)/365);
				break;
		}
	}
	//计算结果，如果为0则计算成功
	temp=Number((tot+pageData.cashflow).toFixed(2));
	//console.log('\ncur:'+cur+'\ntot:'+tot+'\nresult:'+temp+'\nstep:'+step+'\ndeep:'+deep);
	if(temp==0){
		//console.log('操作成功：IRR='+cur);
		return cur;
	}
	else{
		//验算重复
		if(last!=null&&last==temp)
			times++;
		else
			times=0;
		//判断控制条件
		if((deep--)<=0||times>=2||isNaN(temp)){
			if(retry){
				//console.log('计算失败');
				deep=0;
				return null;
			}
			else{
				//console.log('重置计算');
				return getIrr(v,true);
			}
		}
		//计算步进值
		if(step!=0){
			step=Math.abs(step/2);
		}
		//计算向量
		if(temp>0){//+
			if(retry&&step==0){
				step=Math.abs(cur/2);
			}
		}
		else{//-
			if(!retry&&step==0)
				step=Math.abs(cur/2);
			step=-step;
		}
		//备份
		last=temp;
		//递归
		return getIrr(v,retry,cur,step,deep,ys,times,last);
	}
}
//计算irr
function calcIRR(v,cur,step,deep,gcd,times,last){
	//初始化
	if(cur==null){
		deep=100;
		cur=pageData.XIRR+pageData.IRR;
		step=cur/2;
		if(cur>0)
			step=-cur/2;
		else
			step=cur;
		gcd=(v==7?MathGCD(pageData.ys):0);
		last=null;
		times=0;
	}
	//计算新值
	cur+=step;
	//计算中单值
	var tx=[],xj=[],temp,l=pageData.data.length;
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
	//console.log(gcd);
	//计算结果，如果为0则计算成功
	temp=Number((tx[0]+pageData.cashflow).toFixed(2));
	//console.log('\ncur:'+cur+'\nresult:'+temp+'\nstep:'+step+'\ndeep:'+deep);
	//计算成功
	if(temp==0){
		H('I'+v,toPercent(cur));
		if(v!=9){
			var fi='';
			for(var i=0;i<pageData.data.length;i++){
				if (isInt(pageData.data[i].spy))
					continue;
				fi='errorResult';
				break;
			}
			g('I'+v).className= fi;
		}
		switch(v){
			case 6:pageData.IRRY=cur;break;
			case 7:pageData.IRRMAXM=cur;break;
			case 8:pageData.IRRSPY=cur;break;
			case 9:pageData.IRRSPD=cur;break;
		}
		return;
	}
	else{
		deep--;
		//验算重复
		if(last!=null&&last==temp)
			times++;
		else
			times=0;
		//判断控制条件
		if(deep<=0||times>2||isNaN(temp)){
			g('I'+v).innerHTML='Error';
			return;
		}
		//计算步进值
		if(step!=0){
			step=Math.abs(step/2);
		}
		//计算向量
		if(temp<0){//-
			step=-step;
		}
		//备份
		last=temp;
		//递归
		calcIRR(v,cur,step,deep,gcd,times,last);
	}
}
function showError(id,show){
	var o=g(id),cs=' errorResult';
	if(show&&o.className.indexOf(cs)==-1)
		o.className+=cs;
	if(!show&&o.className.indexOf(cs)>-1)
		o.className=o.className.replace(cs,'')
}
//展示最终结果
function fillResult(addrestore){
	clsInp(false);
	recalcYT();
	H('B1',pageData.total);
	H('B3',pageData.years,true);
	H('B4',pageData.times,true);
	H('B5',pageData.data.length);
	H('B6',pageData.months);
	fillFormatLong('B2');
	H('G1',pageData.rent);
	showError('G1',!pageData.equalRent);
	H('B7',pageData.remain);
	H('B8',pageData.residual);
	g('B9').value=g('B_0').value=cnDate(D(pageData.start));
	H('G_0',pageData.notreclaimed);
	H('I_0',pageData.cashAdjustment);
	H('J_0',pageData.selfCash);
	H('H_0', pageData.cashflow);
	H('D9', pageData.totalInterest);
	H('E9', toPercent(pageData.totalInterest/pageData.total));
	H('G2',pageData.totalRepayment);
	H('G3',pageData.totalIncome);
	H('G4',pageData.yearIncome);
	H('G5',toPercent(pageData.totalBurden));
	H('G6',toPercent(pageData.flatRate));
	H('G7',pageData.capitalOccupation);
	fillFormatLong('G8');
	fillFormatLong('G9');
	H('I1',pageData.data[pageData.data.length-1].G);
	H('E8',pageData.noInterestTotalRatio);
	H('D8',pageData.noInterestTotal);
	showError('G8',!pageData.equalInterval);
	g('I6').innerHTML='-';
	g('I7').innerHTML='-';
	g('I8').innerHTML='-';
	g('I9').innerHTML='-';
	/*
	if(pageData.IRRobj.s6)
		calcIRR(6);
	if(pageData.IRRobj.s7)
		calcIRR(7);
	if(pageData.IRRobj.s8)
		calcIRR(8);
	if(pageData.IRRobj.s9)
		calcIRR(9);*/
	g('I4').innerHTML=pageData.isCFA?'是':'否';
	var d=pageData.data,id;
	var dv=pageData.IntervalUnit==1?'spy':'spd';
	if(d.length>0){
		otherIrr(true);
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
			H('J_'+id,d[i].J,null,true);
		}
	}
	//
	for(var i=1;i<=7;i++){
		H('D'+i,pageData.EV[i-1]);
		H('E'+i,pageData.E[i-1]);
	}
	g('calcButton').className='hide';
	setChangeState(false);
	showlong();
	//历史
	if(!addrestore){
		HistoryOp.add();
	}
	//
	tozerosh();
}
//清空数据
function clsInp(conf){
	if(!conf||confirm('当前数据尚未保存，您确定要清空数据？')){
		for(var i=0;i<G_ids.length;i++)
			T_val(g(G_ids[i]),'');
		g('I6').innerHTML=g('I7').innerHTML=g('I8').innerHTML=g('I9').innerHTML='-';
		g('I4').innerHTML='否';
		g('calcButton').className='button';
		if(conf){
			tozerosh();
			reinitPageData();
			showresultmovevalue(null);
			pageData.dosolve=0;
			HistoryOp.add(true);
		}
		if(pageData.data.length==0){
			setEdit('B_,E_,F_,J_',false);
			setEdit('C_,D_',true);
			setIntervalUnit(1);
			//
			g('taxswitch').value=1;
			g('taxType').value=1;
			g('taxType').disabled=true;
			pageData.taxType=1;
			pageData.haveTax=false;
			g('B9').value=getDefaultDate();
			H('B8',db('residual'));
		}
		g('I1').value='';
		g('I1').readOnly=true;
		showlong();
		otherIrr(false);
		setChangeState(true);
		setCanEditEditer(true);
	}
}
//显示其它IRR计算
function otherIrr(show){
	for(var i=6;i<=9;i++){
		g('I'+i+'_s').style.display=show?'block':'none';
		if(show)g('I'+i).className='';
	}
}

//计算pmt
function pmt(){
	var B1,B2,B3,B4,B7,D1,D2,D8,D9;
	if(pageData.inpType==1){
		B1=I('B1');
		B2=I('B2');
		B3=I('B3');
		B4=I('B4');
		B7=I('B7');
		D1=I('D1');
		D2=I('D2');
		D8=I('D8');
		D9=I('D9');
	}
	else{
		B1=pageData.total;
		B2=pageData.rate;
		B3=pageData.years;
		B4=pageData.times;
		B7=pageData.remain;
		D1=pageData.EV[0];
		D2=pageData.EV[1];
		D8=pageData.noInterestTotal;
		D9=pageData.totalInterest;
	}
	if(B4==0||B2==0||B3==0||B1==0){return false;}
	if(B3*B4>pageData.maxLine&&pageData.inpType!=9){
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
	var per=F2(a*(b/c)+pn*i);
	if(pageData.inpType==1){
		initPageData(B1,B2,B3,B4,per,B7,pageData.inpType,false);
		setEdit('B_,J_',true);
	}
	else{
		pageData.equalRent=per;
		pageData.rent=per;
	}
	return true;
}
//重新构建pageData
function initPageData(B1,B2,B3,B4,per,B7,type,initEV){
	pageData.total=B1;
	pageData.rate=B2;
	pageData.years=B3;
	pageData.times=B4;
	pageData.inpType=type;//2等额,1手工
	change_init();
	pageData.setp=0;
	pageData.equalRent=per;
	pageData.rent=per;
	pageData.remain=B7;
	pageData.selfCash=0;
	if(pageData.inpType==1||pageData.inpType==3){
		pageData.start=new Date(g('B9').value).getTime();
		pageData.residual=I('B8');
		pageData.E=[];
		pageData.EV=[];
		pageData.data=[];
		for (var i=1;i<=7;i++){
			pageData.E[i-1]=pageData.EV[i-1]=0;
			if(initEV){
				g('D'+i).value='0.00';
				g('E'+i).value='0.00%';
			}
		}
		if(pageData.total!=0)
			calcEV(pageData.total);
	}
}
//默认计算
function calc(retry){
	//手工调整
	if(pageData.inpType==1||pageData.inpType==9){
		calcTop();
		//基本数据有效，执行等额运算
		if(pmt()){
			if(pageData.inpType==1)
				pageData.inpType=4;
			fillChangeForList();
			if(pageData.inpType==1){
				resumewindow();
				setChangeState(false);
			//	pageData.inpType=4;
			}
			//console.log('111111111');
		}
		//如果等额失败且code为0或null,检查是否存在列表输入
		else if(!retry){
			//console.log('2222222---');
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
			console.log('33333---');
			resumewindow(true);
			setChangeState(false);
		}//如果code==1则表示已尝试等额无需求再尝试
		else if (!retry){
			console.log('4444---');
			pageData.inpType=1;
			calc(true);
		}
	}
	//冻结列
	else if(pageData.inpType==2.2&&pageData.inpTypeF.type==1){
		for (var i=1;i<=pageData.data.length;i++){
			pageData.data[i-1].F1=I('F_'+i);
		}
		resumewindow();
		change_showpopwindowButton(false);
		calcExt();
	}
	else{
		pageData.inpType=1;
		calc();
	}
}
//禁用列表列
function setEdit(tag,enable){
	enable=!enable;
	var cn= 'readonly',a,ts=tag.split(','),j;
	for (var i=1;i<=pageData.maxLine;i++){
		for(j=0;j<ts.length;j++){
			if(a=g(ts[j]+i)){
				a.readOnly=enable;
			}
		}
	}
	if(tag.indexOf('J_')>-1)
		g('J_0').readOnly=enable;
}
//上栏是否可编辑
function setCanEditEditer(enable){
	g('canteditface').style.display=enable?'none':'block';
}





































