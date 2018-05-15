//为后台计算
function ifrInit(){
	var s=parent.data,gt=0,ind,cost=0,start=query('start'),cb=query('callback');
	if(start&&cb){
		start=D(start);
		for(var i=1;i<=s.length;i++){
			ind=i-1;
			H('C_'+i,s[ind].C);
			H('D_'+i,s[ind].D);
			gt+=s[ind].F;
		}
		H('B1',gt);
		H('B8',0);
		pageData.inpType=3;
		doimport(false);
		pageData.start=start.getTime();
		ifrSetDate(s);
		if(parent[cb])
			parent[cb](pageData);
	}
	
}

function ifrSetDate(s){
	var last=D(pageData.start),now,cur,allDays=0;
	if(pageData.data.length>0){
		for (var i=0;i<s.length;i++){
			if(pageData.data.length>i){
				cur=pageData.data[i];
				now=D(s[i].B);
				cur.B=cnDate(now);
				cur.E=s[i].E;
				cur.F1=s[i].F;
				cur.G=s[i].G;
				cur.H=s[i].H;
				cur.I=s[i].I;
				if(now.getDate()==last.getDate()){
					cur.D1=1;
					cur.spy=differenceMonth(last,now);
				}
				else{
					cur.D1=0;
					cur.spy=(now.getTime()-last.getTime())/TimeSpanMonth;
				}
				cur.spd=Math.round((now.getTime()-last.getTime())/TimeSpanDay);
				last=new Date(now.getTime());
				cur.D=cur.spy;
				allDays+=cur.spd;
				cur.days=allDays;
			}
		}
		calcExt();
		calcChangeI1(2);
	}
}

