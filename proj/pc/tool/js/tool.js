function IRR(cashFlows, estimatedResult) {  
    var result = Number(',');  
    if (cashFlows != null && cashFlows.length > 0) {  
        // check if business startup costs is not zero:  
        if (cashFlows[0] != 0) {  
            var noOfCashFlows = cashFlows.length;  
            var sumCashFlows = 0;  
            // check if at least 1 positive and 1 negative cash flow exists:  
            var noOfNegativeCashFlows = 0;  
            var noOfPositiveCashFlows = 0;  
            for (var i = 0; i < noOfCashFlows; i++) {  
                sumCashFlows += cashFlows[i];  
                if (cashFlows[i] > 0) {  
                    noOfPositiveCashFlows++;  
                } else {  
                    if (cashFlows[i] < 0) {  
                        noOfNegativeCashFlows++;  
                    }  
                }  
            }  
  
            // at least 1 negative and 1 positive cash flow available?  
            if (noOfNegativeCashFlows > 0 && noOfPositiveCashFlows > 0) {  
                // set estimated result:  
                var irrGuess = 0.1; // default: 10%  
                if (!isNaN(estimatedResult)) {  
                    irrGuess = estimatedResult;  
                    if (irrGuess <= 0) {  
                        irrGuess = 0.5;  
                    }  
                }  
  
                // initialize first IRR with estimated result:  
                var irr = 0;  
                if (sumCashFlows < 0) { // sum of cash flows negative?  
                    irr = -irrGuess;  
                } else { // sum of cash flows not negative  
                    irr = irrGuess;  
                }  
  
                // iteration:  
                // the smaller the distance, the smaller the interpolation  
                // error  
                var minDistance = 1e-15;  
  
                // business startup costs  
                var cashFlowStart = cashFlows[0];  
                var maxIteration = 100;  
                var wasHi = false;  
                var cashValue = 0;  
                for (var i = 0; i <= maxIteration; i++) {  
                    // calculate cash value with current irr:  
                    cashValue = cashFlowStart; // init with startup costs  
  
                    // for each cash flow  
                    for (var j = 1; j < noOfCashFlows; j++) {  
                        cashValue += cashFlows[j] / Math.pow(1 + irr, j);  
                    }  
  
                    // cash value is nearly zero  
                    if (Math.abs(cashValue) < 0.01) {  
                        result = irr;  
                        break;  
                    }  
  
                    // adjust irr for next iteration:  
                    // cash value > 0 => next irr > current irr  
                    if (cashValue > 0) {  
                        if (wasHi) {  
                            irrGuess /= 2;  
                        }  
                        irr += irrGuess;  
                        if (wasHi) {  
                            irrGuess -= minDistance;  
                            wasHi = false;  
                        }  
                    } else {// cash value < 0 => next irr < current irr  
                        irrGuess /= 2;  
                        irr -= irrGuess;  
                        wasHi = true;  
                    }  
  
                    // estimated result too small to continue => end  
                    // calculation  
                    if (irrGuess <= minDistance) {  
                        result = irr;  
                        break;  
                    }  
                }  
            }  
        }  
    }  
    return result;  
} 

function XIRR(values, dates, guess) {
  // Credits: algorithm inspired by Apache OpenOffice
  
  // Calculates the resulting amount
  var irrResult = function(values, dates, rate) {
    var r = rate + 1;
    var result = values[0];
    for (var i = 1; i < values.length; i++) {
      result += values[i] / Math.pow(r, moment(dates[i]).diff(moment(dates[0]), 'days') / 365);
    }
    return result;
  }

  // Calculates the first derivation
  var irrResultDeriv = function(values, dates, rate) {
    var r = rate + 1;
    var result = 0;
    for (var i = 1; i < values.length; i++) {
      var frac = moment(dates[i]).diff(moment(dates[0]), 'days') / 365;
      result -= frac * values[i] / Math.pow(r, frac + 1);
    }
    return result;
  }

  // Check that values contains at least one positive value and one negative value
  var positive = false;
  var negative = false;
  for (var i = 0; i < values.length; i++) {
    if (values[i] > 0) positive = true;
    if (values[i] < 0) negative = true;
  }
  
  // Return error if values does not contain at least one positive value and one negative value
  if (!positive || !negative) return '#NUM!';

  // Initialize guess and resultRate
  var guess = (typeof guess === 'undefined') ? 0.1 : guess;
  var resultRate = guess;
  
  // Set maximum epsilon for end of iteration
  var epsMax = 1e-10;
  
  // Set maximum number of iterations
  var iterMax = 50;

  // Implement Newton's method
  var newRate, epsRate, resultValue;
  var iteration = 0;
  var contLoop = true;
  do {
    resultValue = irrResult(values, dates, resultRate);
    newRate = resultRate - resultValue / irrResultDeriv(values, dates, resultRate);
    epsRate = Math.abs(newRate - resultRate);
    resultRate = newRate;
    contLoop = (epsRate > epsMax) && (Math.abs(resultValue) > epsMax);
  } while(contLoop && (++iteration < iterMax));

  if(contLoop) return '#NUM!';

  // Return internal rate of return
  return resultRate;
}
function NPV() {
  // Cast arguments to array
  var args = [];
  for (i = 0; i < arguments.length; i++) {
    args = args.concat(arguments[i]);
  }
  
  // Lookup rate
  var rate = args[0];

  // Initialize net present value
  var value = 0;
  
  // Loop on all values
  for (var j = 1; j < args.length; j++) {
    value += args[j] / Math.pow(1 + rate, j);
  }

  // Return net present value
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
function isInt(v){
	return v==Math.round(v);
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
			if(h==0&&!o.getAttribute('hd')&&!mustshow)
				h='';
			else{
				switch(o.getAttribute('type')){
					case 'int':h=Math.round(h).toLocaleString();
						break;
					case 'float':
						h=(Math.round(h*100)/100).toLocaleString();
						if(h.indexOf('.')==-1)
							h+='.00';
						break;
					case 'per':
						if(h==0)
							h='0.00%';
						else{
							h=(h*100).toFixed(o.id=='B2'?3:2)+'%';
						}
						break;
					default:
						if(h.toString().indexOf('.')>-1)
							h=(Math.round(h*100)/100).toLocaleString();
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
	var s=g(id).innerHTML.replace(/,/g,''),b=1;
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
//计算两个日期间隔月
function differenceMonth(last,cur){
	return (cur.getFullYear()*12+cur.getMonth())-(last.getFullYear()*12+last.getMonth());
}
//初始化用户表单
function initTable(){
	var tb=g('workspace'),tr,ac=64,tds,cs;
	var letters='ABCDEFGHIJKLMNOPQRST'.split('');
	for (var i=1;i<=120;i++){
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
			tds.push('<td '+(j>2&&j!=4?' type="float"':'')+' class="'+cs+'" id="'+String.fromCharCode(ac+j)+'_'+i+'">'+(j==1?i:'')+'</td>');
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
		initPageData(B1,B2,B3,B4,per,B7,1);
		fillChangeForList(data);
		if(calcLate){
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
	var d=s.replace(/\t/g,',').replace(/\n/g,'|');
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
	g('IntervalUnit').disabled=g('IntervalUnitDs').disabled=disable;
	g('solveResult').className=disable?'hide':'button';
}
//执行单变量求解
function dosolveResult(){
	alert('暂未开放，请稍候');return;
	if(pageData.data.length>0){
		var a=g('mbg');
		a.className='show';
		if(!a.onclick)a.onclick=dosolveResult_click;
		pageData.inpType=5;
		g('msg').className='show';
	}
	else
		alert('无效请求');
}
//选择求解项
function dosolveResult_1(v){
	var tit='单变量求解',h=190,r=null;
	switch(v){
		case 1:tit='请选择目标单元格';h=40;pageData.inpType=6;
			break;
		case 2:tit='请选择可变单元格';h=40;pageData.inpType=7;
			break;
		default:
			pageData.inpType=5;
			break;
	}
	$('.selectitem').removeClass('selectitem');
	if(h==40){
		r=dosolveResult_data();
		for(var i=0;i<r.length;i++)
			$('#'+r[i]).addClass('selectitem');
	}
	g('sovtitle').innerHTML=tit;
	g('msg').style.height=h+'px';
}
function dosolveResult_data(){
	if(pageData.inpType==6)
		return ['G8','G9'];
	return ['D1','D2','D3','D4','D5','D6','D7','B1','B2'];
}
function dosolveResult_click(e){
	e=e||event;
	var x=e.pageX,y=e.pageY,p,list=dosolveResult_data(),o,p;
	for (var i=0;i<list.length;i++){
		o=g(list[i]);
		p=getPosition(o.id);
		if (x>p.x&&x<p.x+o.offsetWidth&&y>p.y&&y<p.y+o.offsetHeight){
			g('sov_'+pageData.inpType).setAttribute('tag',o.id);
			g('sov_'+pageData.inpType).value=g(String.fromCharCode(o.id.charCodeAt(0)-1)+o.id.substr(1)).innerHTML ;
			dosolveResult_1(0);
			return;
		}
	}
}
function dosolveResult_sub(){
	var s6,s7,sv,temp;
	if((s6=dosolveResult_getsv(6))&&(s7=dosolveResult_getsv(7))){
		temp=g('sov_value').value.replace(/\s/g,'');
		sv=Number(temp);
		if(temp==''||isNaN(sv)){
			g('sov_value').value='';
			alert('请输入目标值');
			return;
		}
		pageData.inpType=1;
		console.log(s6,s7,sv);
		dosolveResult_close();
		
		showWaiting(true);
		setTimeout(function(){
			showWaiting(false);
		},2000);
		
		
	}
}
function dosolveResult_getsv(ind){
	o=g('sov_'+ind);
	if(o.value==''){
		pageData.inpType=ind;
		dosolveResult_1(ind-5);
		return false;
	}
	return o.getAttribute('tag');
}
function dosolveResult_close(){
	var bg=g('mbg');
	bg.onclick=null;
	bg.className='hide';
	g('msg').className='hide';
	g('sov_6').value=g('sov_7').value=g('sov_value').value='';
	$('.selectitem').removeClass('selectitem');
	pageData.inpType=1;
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