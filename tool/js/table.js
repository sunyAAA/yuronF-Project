function initTable(){
	var letters='ABCDEFGHIJKLMNOPQRST'.split(''),s=[],id,ids=[],sn=[],li=[];
	initTable_h(letters,s,ids);
	initTable_title(s,li,sn);
	initTable_item(s,sn,li,ids,letters);
	g('box').innerHTML=s.join('');
	g('snbox').innerHTML=sn.join('');
	g('listbox').innerHTML=li.join('');
	initSetCenter('B2,B3,B4,B5,B6,B9,C_0,D_0,E_0,F_0');
	letters=['C','D','E','F'];
	for(var i=0;i<letters.length;i++)
		g(letters[i]+'_0').innerHTML=initTable_item_0(letters[i]);
	initSetInptype('G7','int');
	initSetInptype('E1,B2,E2,E3,E4,E5,E6,I6,E7,I7,E8,I8,E9,I9','per');
	event_reg(ids);
	G_ids=ids;
}
function initSetHB(){
	var s='B1,B2,B3,B4,B5,B6'.split(',');
	for(var i=0;i<s.length;i++)
		g(s[i]).setAttribute('hd',1);
}
function initSetCenter(ids){
	var li=ids.split(','),cs,o;
	for(var i=0;i<li.length;i++){
		o=g(li[i]);
		cs=o.className;
		if(cs.indexOf('center')==-1){
			cs+=' center';
		}
		o.className=cs;
	}
}
function initSetInptype(ids,type){
	var li=ids.split(','),o;
	for(var i=0;i<li.length;i++){
		if(o=g(li[i]))
			o.setAttribute('inptype',type);
	}
}
function initTable_h(letters,s,ids){
	var titles=('项目总额<b>*</b>,首付款金额,等额本息,未回收成本末期余额,年利率<b>*</b>,保证金额,'
		+'还款总额,现金流税收调整,期限（年）<b>*</b>,服务费收入,总收益额,税率调整,年还款次数<b>*</b>,咨询费收入,当年总收益额,'
		+'调整现金流,总还款次数,保险收入,总负担率（年）,存续XIRR,期限（月）,其它收入,平面利率（年）,IRR（逐月贴现）,资产余值,'
		+'其它支出,资金占用（月）,IRR（最大公约月）,残值收入,非利息收入合计,IRR,IRR（实际间隔月）,起租日<b>*</b>,利息总额,XIRR,IRR（实际间隔天）,').split(',');
	var temp,str,csss,cinp=' inptype="float"';
	s.push('<div id="headbox" class="relative">');
	for(var i=1,ind=0;i<=9;i++){
		for(var j=0;j<9;j++){
			id=letters[j]+i;
			if(j==0||j==2||j==5||j==7)
				s.push('<div id="'+id+'" class="title">'+titles[ind++]+'</div>');
			else{
				ids.push(id);
				str=[];
				if(j==6||j==8){
					if(j==8&&i==1)
						s.push('<input'+cinp+' maxlength="15" id="'+id+'" class="item" value="">');
					else{
						if(j==8)
							str.push('<div class="itembox">');
						str.push('<div'+cinp+(j==8&&i>5?'':' id="'+id+'"')+' class="item rdonly'+((j==6&&i>4)||(j==8&&i>1)?' center':'')+'">');
						if(j==8){
							if(i==2||i==3||i==5)
								ids.pop();
							str.push(initTable_h_I(i));
							str.push('</div>');
						}
						str.push('</div>');
						s.push(str.join(''));
					}
				}
				else{
					csss=j==4?' center':'';
					if(((j==3||j==4)&&i>7)||(j==1)&&(i==5||i==6))
						s.push('<div'+cinp+' id="'+id+'" class="item rdonly'+csss+'"></div>');
					else
						s.push('<input'+(id!='B3'&&id!='B4'?cinp:'')+(j==1&&i<5?' hd="1"':'')+' maxlength="15" id="'+id+'" class="item'+csss+'" value="">');
				}
				if(id=='B2'||id=='G8'||id=='G9'){
					var temp=s.pop();
					s.push('<div class="itembox">');
					s.push(temp);
					s.push('<div class="icon rightico" id="op_'+id+'" onclick="showlong(\''+id+'\')"></div></div>');
				}
			}
		}
		s.push('<br />');
	}
	s.push('<div id="canteditface"></div></div>');
	s.push('<div class="sp"></div>');
}
function initTable_h_I(i){
	switch(i){
		case 1:return '0';
		case 2:
			return '<select id="taxswitch" onchange="event_taxswitch(this)"><option value="1">税前</option><option value="2">税后</option></select>';
		case 3:
			return '<select id="taxType" onchange="event_tax(this)"></select>';
		case 4:
			return '';
		case 5:
			return '暂未开放';
		default:
			return '<span id="I'+i+'" type="per">-</span><div id="I'+i+'_s" v="'+i+'" onclick="event_calc_click(this)" class="icon calc"></div>';
	}
}
function initTable_title(s,li,sn){
	s.push('<div id="itemListBox"><div id="snbox"></div><div id="listbox"></div></div>');
	var titles='期次,还款日,还款收入,还款间隔,利息收入,回收成本,未回收成本,最终现金流量,税收现金流,手工现金流'.split(',');
	for(var i=0;i<10;i++){
		(i==0?sn:li).push('<div class="title center'+(i==0?' snitem':' '+(i==3?'d':'l')+'item')+'">'+titles[i]+'</div>');
	}
	li.push('<div>');
}
function initTable_item(s,sn,li,ids,letters){
	var id,csss,cinp;
	for(var i=0;i<=pageData.maxLine;i++){
		sn.push('<div class="snitem">'+(i==0?'':i)+'</div>');
		for(var j=1;j<10;j++){
			id=letters[j]+'_'+i;
			if(i>0||j==9)
				ids.push(id);
			cinp=j==3?'':(' inptype="float"'+(i==0?'':' hd="1"'));
			csss=(j==3||j==1)?' center':'';
			if(j==4||j==6||j==7||j==8||(i==0&&j!=9))
				li.push('<div'+cinp+' id="'+id+'" class="'+(j==3?'d':'l')+'item rdonly'+csss+'"></div>');
			else{
				li.push('<input'+cinp+' maxlength="15" id="'+id+'" '+(j==1||j==5?'readonly':'')+' class="'+(j==3?'ditem':'litem')+csss+'" value="">');
			}
		}
		li.push('<br />');
	}
	li.push('</div>')
}
function initTable_item_0(i){
	switch(i){
		case 'C':
			return '<select id="changeTypeButton" cb="change_event(2.1)" v="0" ind="1">\
							<option value="-1">自动调整</option>\
							<option value="0">自动调整</option>\
							<option value="1">手动调整</option>\
							<option value="2">等额调整</option>\
							<option value="3">等差调整</option>\
							<option value="4">等比调整</option>\
							<option value="5">纺&nbsp;锤&nbsp;形</option>\
							<option value="6">齿&nbsp;轮&nbsp;形</option>\
						</select>';
		case 'D':
			return '<select id="IntervalUnit" onchange="event_IntervalUnit(this)">\
							<option value="1">月</option>\
							<option value="2">日</option>\
						</select>';
		case 'E':
			return '<select id="IntervalUnitDs" disabled="disabled">\
							<option value="1">按月</option>\
							<option value="2">按日</option>\
						</select>';
		case 'F':
			return '<select id="changeCostButton" cb="change_event(2.2)" v="0" ind="1">\
							<option value="-1">自动调整</option>\
							<option value="0">自动调整</option>\
							<option value="1">手工调整</option>\
							<option value="100">等额本金</option>\
							<option value="3">等差调整</option>\
							<option value="4">等比调整</option>\
						</select>';
	}
	return '';
}
		