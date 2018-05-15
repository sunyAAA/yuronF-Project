var pageData={type:0,step:0};
function msg(s){
	document.getElementById('msg').innerHTML=s;
}
function regevent(){
	$('[contenteditable="true"]').on('blur',function(){
		var s=getInp($(this).attr('id'));
		if(s==0)$(this).html('');			
		//msg($(this).html());
	});
}
function g(o){
	return document.getElementById(o);
}
function getInp(id){
	var s=html(id),b=1;
	if(s){
		if(s.indexOf('%')==s.length-1){
			b=100;
			s=s.substr(0,s.length-1);
		}
		if(isNaN(s))s=0;
		else{
			s=Math.round(s*1000)/1000;
		}
	}else{s=0;}
	return s/b;
}
function calc(){
	var v=Number($('#inpV').val()),t=Number($('#calcType').val());
	if(isNaN(v)){
		v=0;
		$('#inpV').val('');
	}
	if(t>2&&v<=0){
		alert('请输入步进值');
		return;
	}
	pageData.type=t;
	pageData.step=v;
	var p=pmt();
	html('G1',p.toFixed(2));
}

function showDetail(sdate,per,y,p,B1,D1,B2,D8,D9,D2,B3){
	var d=new Date(sdate),sd=new Date(sdate),type='m',step;
	if(p<=12&&12%p==0)
		step=12/p;
	else{
		type='d';
		step=(365/p).toFixed(2);
	}
	fillResult();	
	var td=0,nd=0,cst;
	var whscb=B1-D1;//未回收成本
	var hscb=0;//回收成本
	var xjll=D1+D2+D8+0-B1-D9;//0=G12
	var jiangeyue=0;
	var jiangeri=0;
	var zjzyts=0,_zjzyts=0;
	var lixsr=0;
	var totalpre=0;
	//	
	for (var i=0;i<p*y;i++){
		td+=Number(step);
		cst=Math.ceil(td)-nd;
		nd+=cst;
		if(type=='m'){
			d.setMonth(d.getMonth()+step);
		}
		else{
			d.setDate(d.getDate()+cst);
		}		
		zjzyts=(d.getTime()-sd.getTime())/(24*60*60*1000);		
		jiangeyue=(type=='m'?step:Math.round(cst/30));
		jiangeri=zjzyts-_zjzyts;
		_zjzyts=zjzyts;
		lixsr=(whscb*B2/12*jiangeyue).toFixed(2);	
		hscb=(per-lixsr).toFixed(2);
		whscb-=hscb;
		totalpre+=Number(per);		
		addResult(d,i,per,lixsr,hscb,whscb,xjll,jiangeri,jiangeyue,zjzyts);		
	}
	g('qzr_v').innerHTML=cnDate(sd);
	g('whscb_v').innerHTML=
	html('G2',totalpre.toFixed(2),1);
	var g3v=totalpre-B1-D1;
	html('G3',g3v.toFixed(2),1);
	var g4v=g3v+D8;
	html('G4',g4v.toFixed(2),1);
	var g5v=g4v/(B1-D1)/B3;	
	html('G5',(g5v*100).toFixed(2)+'%',1);
	var g6v=g3v/B3/(B1-D1);
	html('G6',(g6v*100).toFixed(2)+'%',1);
	
}

function cnDate(v){
	var m=v.getMonth()+1,d=v.getDate();
	if(m<10)m='0'+m;
	if(d<10)d='0'+d;
	return v.getFullYear()+'-'+m+'-'+d
}
function pmt(){
	var B2=getInp('B2');
	var B4=getInp('B4');
	var B3=getInp('B3');
	var B1=getInp('B1');
	var D1=getInp('D1');
	var B7=getInp('B7');
	var D2=getInp('D2');
	var D8=getInp('D8');
	var D9=getInp('D9');
	html('B5',B3*B4,0);
	html('B6',B3*12,0);
	var sd=g('sdata').value;
	if(B4==0||B2==0||B3==0||B1==0||sd=='')return -1;
	var p=B1-D1;
	var pn=B7;
	var i=B2/B4;
	var n=B3*B4;//总期数
	var a=p-pn;	
	var b=Math.pow(1+i,n)*i;	
	var c=Math.pow(1+i,n)-1;
	var per= a*(b/c)+pn*i;
	per=checkPer(per,n);
	showDetail(sd,per,B3,B4,B1,D1,B2,D8,D9,D2,B3);
	return per;
}
function checkPer(per,total){
	var sn=per*total;
	switch(per){
		case 3:
			per=sn-(total*total-1)*pageData.step/2;
			break;//等差
		case 4:
			break;//等比
		case 5:
			break;//纺锤
		case 6:
			break;//齿轮
	}
	return per;
}
function html(o,v,edit){
	if(o=g(o)){
		if(v==null)return o.innerHTML;
		o.innerHTML=v;
		if(edit!=null)
			o.setAttribute('contenteditable',!!edit);
	}
	return '';
}

function fillResult(){
	var html='<table>\
			<tbody id="tbody">\
				<tr class="title">\
					<td><b>租金日</b><span id="qzr_v">-</span></td>\
					<td><b>租金期次</b></td>\
					<td><b>租金收入</b></td>\
					<td><b>利息收入</b></td>\
					<td><b>回收成本</b></td>\
					<td><b>未回收成本</b><span id="whscb_v">-</span></td>\
					<td><b>现金流调整</b></td>\
					<td><b>现金流量</b><span id="">-</span></td>\
					<td><b>间隔（天）</b></td>\
					<td><b>间隔（月）</b></td>\
					<td><b>资金占用天数</b></td>\
					<td><b>成本*占用天数/30</b></td>\
					<td colspan="2"><b>时间调整</b><div class="chbox"><span>调整月数</span><span>调整天数</span></div></td>\
					<td colspan="2"><b>修正IRR-1</b><div class="chbox"><span>贴现值</span><span>贴现小计</span></div></td>\
					<td colspan="2"><b>修正IRR-2</b><div class="chbox"><span>贴现值</span><span>贴现小计</span></div></td>\
					<td colspan="2"><b>修正IRR-3</b><div class="chbox"><span>贴现值</span><span>贴现小计</span></div></td>\
					<td colspan="2"><b>修正IRR-4</b><div class="chbox"><span>贴现值</span><span>贴现小计</span></div></td>\
				</tr>\
			</tbody>\
		</table>';
	g('resultbox').innerHTML=html;
}
function addResult(d,i,per,lixsr,hscb,whscb,xjll,jiangeri,jiangeyue,zjzyts){
	var tb=g('tbody'),tr=document.createElement('TR');
	var s=[];
	i=i+1;//租金次数	
	//租金收入
	switch(pageData.type){
		case 3:per+=(pageData.step*(i-1));break;//等差
		case 4:per+=pageData.step;break;//等比
		case 5:per+=pageData.step;break;//纺锤
		case 6:per+=pageData.step;break;//齿轮		
	}
	
	
	s.push('<td>'+cnDate(d)+'</td>');//租金日
	s.push('<td>'+i+'</td>');//租金期次
	s.push('<td>'+per.toFixed(2)+'</td>');//租金收入		
	s.push('<td>'+lixsr+'</td>');//利息收入
	s.push('<td>'+hscb+'</td>');//回收成本
	s.push('<td>'+whscb.toFixed(2)+'</td>');//未回收成本
	s.push('<td contenteditable="true"></td>');//现金流调整
	s.push('<td>'+xjll+'</td>');//现金流量		
	s.push('<td>'+jiangeri+'</td>');//间隔天
	s.push('<td>'+jiangeyue+'</td>');//间隔月
	s.push('<td>'+zjzyts+'</td>');//资金占用天数
	s.push('<td>'+(hscb*zjzyts/30).toFixed(2)+'</td>');//成本*占用天数/30
	s.push('<td contenteditable="true"></td><td contenteditable="true"></td>');
	s.push('<td></td><td></td>');
	s.push('<td></td><td></td>');
	s.push('<td></td><td></td>');
	s.push('<td></td><td></td>');
	tr.innerHTML=s.join('');
	tb.appendChild(tr);
}

window.onload=function(){
	var d=new Date();
	d.setMonth(d.getMonth()+1);
	d.setDate(10);	
	document.getElementById('sdata').value=cnDate(d);
}