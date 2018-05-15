//已选择项，防止冲突
var dosolveResult_sect='';
//验证用户输入
function dosolveResult_change(o){
	var v=window.parseFloat(o.value);
	if(v){
		if(o.value.indexOf('%')==-1)
			o.value+='%';
		o.setAttribute('val',v/100);
	}
	else{
		o.value='';
		o.setAttribute('val','');
	}
}
//执行单变量求解
function dosolveResult(){
	if(!event_showvip())return;
	if(pageData.data.length>0){
		showresultmovevalue(null);
		var a=g('mbg');
		a.className='show';
		if(!a.onclick)a.onclick=dosolveResult_click;
		pageData.solveType=1;
		g('msg').className='show';
		dosolveResult_1(1);
	}
	else
		alert('无效请求');
}
//选择求解项
function dosolveResult_1(v){
	var tit='单变量求解',h=190,r=null;
	switch(v){
		case 1:tit='请选择目标单元格';h=40;pageData.solveType=2;
			break;
		case 2:tit='请选择可变单元格';h=40;pageData.solveType=3;
			break;
		default:
			pageData.solveType=1;
			break;
	}
	$('.selectitem').removeClass('selectitem');
	g('inp_start').readOnly=g('inp_step').readOnly=false;
	if(h==40){
		r=dosolveResult_data();
		if(r==null)return;
		if(pageData.solveType==1)
			dosolveResult_sect='';
		else
			dosolveResult_sect=g('sov_'+(pageData.solveType==2?3:2)).getAttribute('tag');
		for(var i=0;i<r.length;i++){
			if(dosolveResult_sect==r[i])continue;
			$('#'+r[i]).addClass('selectitem');
		}
		//只在可变单元格及非D列情况下展示扩展属性
		if(pageData.solveType==3&&r.length>2){
			if(Math.round(pageData.inpType)==2){
				var cur=dosolveResult_curType();
				if(cur&&cur.type>=2&&cur.type<=6){
					if(pageData.inpType==2.1)
						g('inp_start').readOnly=true;
					if(cur.type>2)
						g('inp_step').readOnly=true;
				}
			}
		}
	}
	g('sovtitle').innerHTML=tit;
	g('msg').style.height=h+'px';
}
//返回可编辑项目
function dosolveResult_data(){
	if(pageData.solveType==2){
		return pageData.equalInterval? ['G8','G9']:['G9'];
	}
	var tag=g('sov_2').getAttribute('tag');
	if(tag){
		var s=['D1','D2','D3','D4','D5','D6','D7'],ipt=pageData.inpType;
		if(Math.floor(ipt)==2){
			var ct=ipt==2.1?pageData.inpTypeC:pageData.inpTypeF;
			//收手工调整还款
			if(ipt==2.1){
				s.push('B1');
				//手工调整还款
				if(ct.type==1){
					dosolveResult_dataList(s);
				}
			}
			else{
				s.push('B2');
			}
			return s;
		}
		else//手工调整
			s.push('B2');
		return s;
	}
	else{
		alert('请先选择目标单元格');
		return null;
	}
}
//生成每期还款收入项选择
function dosolveResult_dataList(s){
	for (var i=1;i<=pageData.data.length;i++)
		s.push('C_'+i);
} 
//获取当前调整类别
function dosolveResult_curType(){
	return pageData.inpType==2.1?pageData.inpTypeC:null;
}
//判断用户点击结果
function dosolveResult_click(e){
	e=e||event;
	var x=e.pageX,y=e.pageY,p,list=dosolveResult_data(),o,p;
	if(list==null)return;
	if(e.target.id=='mbg'&&pageData.solveType>1){
		for (var i=0;i<list.length;i++){
			o=g(list[i]);
			p=getPosition(o.id);
			if (x>p.x&&x<p.x+o.offsetWidth&&y>p.y&&y<p.y+o.offsetHeight&&o.id!=dosolveResult_sect){
				g('sov_'+pageData.solveType).setAttribute('tag',o.id);
				var stp=1;if(o.id.indexOf('E')==0)stp=2;
				if(o.id.indexOf('C_')==0)
					g('sov_'+pageData.solveType).value='还款收入第'+o.id.split('_')[1]+'期';
				else{
					x=String.fromCharCode(o.id.charCodeAt(0)-stp)+o.id.substr(1);
					g('sov_'+pageData.solveType).value=g(x).innerHTML.split('<')[0]+(stp==2?'占比':'');
					
				}
				dosolveResult_1(0);
				if(g('sov_value').value=='')g('sov_value').focus();
				return;
			}
		}
	}
	else{
		var cur=dosolveResult_curType();
		switch(e.target.id){
			case 'inp_start':
				g('sov_'+pageData.solveType).setAttribute('tag','start');
				g('sov_'+pageData.solveType).value='首期租金';
				break;
			case 'inp_step':
				if(cur){
					g('sov_'+pageData.solveType).setAttribute('tag','step');
					g('sov_'+pageData.solveType).value=(cur.type==3||cur.type==5)?'差值':'系数';
				}
				break;
			default:return;
		}
		dosolveResult_1(0);
	}
}
function dosolveResult_sub(){
	var s2,s3,sv;
	if((s2=dosolveResult_getsv(2))&&(s3=dosolveResult_getsv(3))){
		sv=g('sov_value').getAttribute('val');
		if(sv=Number(sv)){
			dosolveResult_close();
			showWaiting(true);
			setTimeout(function(){
				pageData.dosolve=1;
				console.log('锁定');
				dosolveResult_calc(s2,s3,sv);
				pageData.dosolve=0;
				console.log('解锁');
			},300);
		}
		else{
			g('sov_value').value='';
			alert('请输入目标值');
			return;
		}
	}
}
//计算自定义回收成本
function fillF(){
	//上限
	var tot=pageData.notreclaimed,cs=pageData.inpTypeF,ts=pageData.data.length;//ts=pageData.times*pageData.years;
	
	cs.start=0;
	for (var i=0;i<pageData.data.length;i++){
		switch(pageData.inpTypeF.type){
			case 0://自动
				pageData.data[i].F1='n';
				break;
		case 1://手动,不自动赋值直接返回null
			return;
		case 2://等额
			pageData.data[i].F1=tot/ts;
			break;
		case 3://等差
			if(i==0)
				cs.start=(tot-ts*(ts-1)*cs.step/2)/ts;
			pageData.data[i].F1=cs.start+i*cs.step;
			break;
		case 4://等比
			if(i==0)
				cs.start=tot/((1-Math.pow(cs.step,ts))/(1-cs.step));
			pageData.data[i].F1=cs.start*Math.pow(cs.step,i);
			break;
		}
	}
}
//目标单元格必须有公式s2
//可变单元格不能有公式s3
//执行运算
function dosolveResult_calc(s2,s3,sv){
	//备份数据
	change_back.data=CopyObject(pageData);
	g("showresult").style.display='none';
	var r=dosolveResult_init(s2,s3,sv,false);
	//如果是差值
	if(r&&s3=='step'&&pageData.inpTypeC){
		console.log('step--');
		var v=pageData.inpTypeC.step;
		g('inp_step').value=v.toFixed(2);
		showresultmovevalue(v);
	}
	////设置为单变量求解
	//关闭遮挡
	showWaiting(false);
	//pageData=change_back.data;
	//清空缓存 
	change_back.data=null;
}
//初始化演算数据
function dosolveResult_init(s2,s3,sv,isretry){
	var target=s2=='G8'?'IRR':'XIRR',opObj,step,opkey,optype,forward=true;
	//如果可变值为总金额
	if(s3=='B1'){
		opkey='total';
		opObj=pageData;
		step=pageData.total;
		optype=1;
		forward=false;
	}//如果可变值为税率
	else if(s3=='B2'){
		opkey='rate';
		opObj=pageData;
		step=pageData.rate;
		optype=2;
	}//如果为其它费用
	else if(s3.indexOf('D')==0){
		opkey=Number(s3.substr(1,1))-1;
		opObj=pageData.EV;
		step=pageData.total*0.1;
		optype=3;
		if(opkey==6)
			forward=false;
	}//如果是系数或期初值
	else if(s3=='start'||s3=='step'){
		opObj=pageData.inpType==2.1?pageData.inpTypeC:pageData.inpTypeF;
		opkey=s3;
		step=opObj[s3];
		optype=pageData.inpType==2.1?4:5;	
	}//用户输入还款收
	else if(s3.indexOf('C_')==0){
		opObj=pageData.data[Number(s3.split('_')[1])-1];
		opkey='C';
		//console.log(opObj);
		step=opObj[opkey];
		optype=6;
	}
	step=Math.abs(step);
	if(isretry)step=-step;
	return dosolveResult_run(target,forward,opObj,opkey,step,optype,sv,100,null,isretry,false,0,s2,s3);
}
//迭代运算
function dosolveResult_run(target,forward,opObj,opkey,step,optype,result,deep,lastresult,isretry,reduce,times,s2,s3){
	var tstep=Math.abs(step/2);
	opObj[opkey]=(deep==100?0: opObj[opkey])+step;
	if(optype<=2){
		if(optype==1){
			calcEV(opObj[opkey]);
			calcTop();
			pmt();
		}
		else if(pageData.inpType==4)
			pmt();
	}
	else if(optype==3){
		pageData.E[opkey]=opObj[opkey]/pageData.total;
		calcTop();
	}
	else if (optype==5){
		fillF();
	}
	//计算数据
	calcExt();
	deep--;
	//return true;
	//取出结果
	var newr=0;
	if(pageData[target]==null||isNaN(pageData[target])){
		times++;
		newr=0;
	}
	else{
		newr=F2(pageData[target],10);
		if(!isNaN(newr)){
			if(lastresult==pageData[target]){
				times++;
				var l=result.toString().split('.');
				if(l.length==2)
					l=l[1].length;
				else
					l=2;
				//兼容尾数
				if(times>2&&F2(newr,l)==result){
					newr=result;
				}
			}
			else
				times=0;
		}
	}
	if(newr==result){
		console.log('成功了');
		pageData.inpType=change_back.data.inpType;
		fillResult();
		return true;
	}
	//lastr==pageData[rKeys] 计算结果重复出现无需继续
	if(deep<=0||times>2){
		pageData=CopyObject(change_back.data);
		if(!isretry){
			console.log('--------计算重置---------');
			return dosolveResult_init(s2,s3,result,true);
		}
		else{
			console.log('--------计算失败了---------');
			alert('计算失败了');
			fillResult();
			return false;
		}
	}
	else{
		console.log('forward:'+forward);
		//输出结果
		console.log('--'+deep+'---------',
		'\ncur:'+opObj[opkey],
		'\nnewr:'+newr,
		'\nresult:'+result,
		'\nstep:'+step,
		'\ntstep:'+tstep,
		'\nreduce:'+reduce);
		
		//减
		if((!forward&&newr<result)||(forward&&newr>result)){
			if(!forward){
				if(isretry)reduce=true;
				//出现反复
				if(reduce)
					step=-tstep;
				else//未反复
					step=-pageData.total/10;
			}
			else{
				if(!isretry)reduce=true;
				if(isretry&&!reduce)
					step+=step;
				else
					step=-tstep;
			}
		}//增
		else{
			if(!forward){
				if(!isretry)reduce=true;
				if(reduce)
					step=tstep;
				else
					step+=step;
			}
			else{
				if(isretry)reduce=true;
				//出现反复
				if(reduce)
					step=tstep;
				else//未反复
					step+=step;
			}
		}
		//备份
		lastresult=pageData[target];
		//递归
		return dosolveResult_run(target,forward,opObj,opkey,step,optype,result,deep,lastresult,isretry,reduce,times,s2,s3);
	}
}
//单值运算
function dosolveResult_single(s2,s3,sv){
	var sn=Number(s2.substr(1,1)),r;
	var ind=sn-1;
	if(s3=='B1'){
		if(pageData.E[ind]==0){
			alert('未设置比例此操作无效');
			showWaiting(false);
			return;
		}
		pageData.total=sv/pageData.E[ind];
	}
	else{
		pageData.E[ind]=sv/pageData.total;
	}
	pageData.EV[ind]=sv;
	H(s2,sv);
	H('E'+sn,pageData.E[ind]);
	H(s3,pageData.total);
	calc();
	showWaiting(false);
}
function dosolveResult_getsv(ind){
	o=g('sov_'+ind);
	if(o.value==''){
		pageData.solveType=ind;
		dosolveResult_1(ind-2);
		return false;
	}
	return o.getAttribute('tag');
}
function dosolveResult_close(){
	var bg=g('mbg');
	bg.onclick=null;
	bg.className='hide';
	g('msg').className='hide';
	g('sov_2').value=g('sov_3').value=g('sov_value').value='';
	g('sov_2').setAttribute('tag','');
	g('sov_3').setAttribute('tag','');
	dosolveResult_sect='';
	$('.selectitem').removeClass('selectitem');
	pageData.solveType=0;
	g('inp_start').readOnly=g('inp_step').readOnly=false;
	g('sovtitle').innerHTML="单变量求解";
	g('msg').style.height='190px';
}