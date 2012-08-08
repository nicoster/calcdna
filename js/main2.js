(function(){
	// <div><select id="kit"/><input type="submit" id="go" value="go"/></div>
	var tabbar = '<div id="main"><ul/></div>';
	$(".mainpage").append(tabbar);
	
	function assert(b){
		if (! b) alert("Assertion failed! " + b);
	}
	
	function accessor(vec, i){return vec[i];}
	
	function buildTriadTable(table, loci, accessor){
		table.append('<tr><th id="loci">STR基因座</th><th>C</th><th>M</th><th>AF</th><th>公式</th><th>PI</th></tr>');
		for (var i = 0; i < loci.length; i ++){
			var lo = (accessor ? accessor(loci, i) : i);
			table.append("<tr id='" + lo +"'><td>" + lo + "</td><td class='p1'><input/></td><td class='p2'><input/></td><td class='p3'><input /></td><td class='pattern'/><td class='pi'/></tr>");
		}
		
		table.append("<tr><td>累计父权指数(CPI)</td><td colspan='5' id='cpi'/></tr>");
	}
	
	function buildDyadTable(table, loci, accessor){
		table.append('<tr><th id="loci">STR基因座</th><th>C</th><th>AF</th><th>公式</th><th>PI</th></tr>');
		for (var i = 0; i < loci.length; i ++){
			var lo = (accessor ? accessor(loci, i) : i);
			table.append("<tr id='" + lo +"'><td>" + lo + "</td><td class='p1'><input/></td><td class='p2'><input/></td><td class='pattern'/><td class='pi'/></tr>");
		}
		
		table.append("<tr><td>累计父权指数(CPI)</td><td colspan='4' id='cpi'/></tr>");
	}
	
	function buildIdentyTable(table, loci, accessor){
		table.append('<tr><th id="loci">STR基因座</th><th>样本</th><th>样本</th><th>PI</th></tr>');
		for (var i = 0; i < loci.length; i ++){
			var lo = (accessor ? accessor(loci, i) : i);
			table.append("<tr id='" + lo +"'><td>" + lo + "</td><td class='p1'><input/></td><td class='p2'><input/></td><td class='pi'/></tr>");
		}
		
		table.append("<tr><td>LR=1/P(X)=</td><td colspan='3' id='cpi'/></tr>");
	}
	
	var calcTypes_ = {
		'triad':{
			'name': '三联体',
			'algo': evaluateTriad,
			'buildTable': buildTriadTable
		}, 
		'dyad':{
			'name': '二联体',
			'algo': evaluateDyad,
			'buildTable': buildDyadTable
		},
		'identification':{
			'name': '同一认定',
			'algo': evaluateIdenty,
			'buildTable': buildIdentyTable
		}
	};
	
	var main_ = $('#main').tabs({
		add : function(event, ui){
			var tabbar = '<div class="calctypes"><ul/></div>';
			$(ui.panel).append(tabbar);
			
			var lociId = ui.panel.id;
			
			var typetabs = $('.calctypes', $(ui.panel)).tabs({
				add : function(event, ui){
					var table = $('<table/>');
					var calcType = calcTypes_[ui.panel.id];
					if ( calcType && calcType.buildTable){
						calcType.buildTable(table, kits_[lociId], accessor);
						$(ui.panel).append(table);			
					}								
				}
			});
			
			for (var i in calcTypes_){
				if (calcTypes_.hasOwnProperty(i)){
					typetabs.tabs('add', '#' + i, calcTypes_[i].name);
					$('#' + lociId + ' #' + i + ' input').keyup(calcTypes_[i].algo);			
				}
				
			}
			
		},
		
		select : function(event, ui){
		}
	});
	
	var kits_ = {};
	jQuery.getJSON("kits.json", function(kits){
		kits_ = kits;
		
		for (var i in kits_){
			if (kits_.hasOwnProperty(i)){
				console.info(i);
				main_.tabs('add', '#' + i, i);
			}
		}
		
		main_.tabs('select', 0);
	});

	var lociData_ = {};
	jQuery.getJSON("loci.json", function(data){
		lociData_ = data;		
	});
	
	function parseParam(val){
		var reg = /([\d.]+)(\D+([\d.]+))?/;
		var match = reg.exec(val);
		var ret = [];
		if (match)
		{
			ret.push(match[1]);
			if (match[3]) ret.push(match[3]);
			ret.sort();
		}
		return ret;
	}

	function qlookup(type, val){
		if (type in lociData_){
			var map = lociData_[type];
			if (val in map){
				return map[val];
			}
		}
		return null;
	}
	
	// common helper functions
	function calc_q(q) { // 1/q
		var val = q[0];
		if (val && val !== 0.0) val = 1 / val;
		return val;
	}
	
	function calc_2q(q) { // 1/2q
		var val = q[0];
		if (val && val !== 0.0) val = 1 / (2 * val);
		return val;
	}
	
	function calc_pq(q) { // 1/(p + q)
		var ret = 0;
		var val = q[0];
		var val2 = q[1];
		if (val && val2 && (val + val2) !== 0.0)
			ret = 1 / (val * 1.0 + val2 * 1.0);
		return ret;
	}
	
	function calc_2pq(q) { // 1/2(p + q)
		var ret = 0;
		var val = q[0];
		var val2 = q[1];
		if (val && val2 && (val + val2) !== 0.0) 
			ret = 1 / ((val * 1.0 + val2 * 1.0) * 2);
		return ret;
	}
	
	function calc_4pq(q){
		var val = Number(q[0]);
		var val2 = Number(q[1]);
		if (val !== 0.0 && val2 !== 0.0)
			return (val + val2)/(4 * val * val2);
		else
			return 0;
	}
	
	function calc_4q(q){
		var val = Number(q[0]);
		if (val !== 0.0)
			return 1/ (4 * val);
		else
			return 0;		
	}
	
	Array.prototype.minus = function(s2){
		var ret = [];
		for (var i = 0, len = this.length; i < len; ++ i){
			if (s2.indexOf(this[i]) == -1){
				ret.push(this[i]);
			}
		}
		return ret;		
	};
	
	function minus(s1, s2){
		var ret = [];
		for (var i in s1){
			if (s2.indexOf(s1[i]) == -1){
				ret.push(s1[i]);
			}
		}
		return ret;
	}
	
	Array.prototype.equal = function(s2){
		if (this.length != s2.length) return false;
		for (var i = 0, len = this.length; i < len; ++ i){
			if (this[i] != s2[i]) return false;
		}
		return true;		
	};
	
	// make sure s1, s2 are sorted
	function equal(s1, s2){
		if (s1.length != s2.length) return false;
		for (var i in s1){
			if (s1[i] != s2[i]) return false;
		}
		return true;
	}
	
	Array.prototype.intersection = function(s2){
		var ret = [];
		for (var i = 0, len = this.length; i < len; ++ i){
			if (s2.indexOf(this[i]) != -1){
				ret.push(this[i]);
			}
		}
		return ret;		
	};
	
	function intersection(s1, s2){
		var ret = [];
		for (var i in s1){
			if (s2.indexOf(s1[i]) != -1){
				ret.push(s1[i]);
			}
		}
		return ret;
	}
	
	Array.prototype.union = function(s2){
		var ret = [];
		for (var i = 0, len = this.length; i < len; ++ i){
			if (s2.indexOf(this[i]) == -1){
				ret.push(this[i]);
			}
		}
		return ret.concat(s2);		
	};
	
	function union(s1, s2){
		var ret = [];
		for (var i in s1){
			if (s2.indexOf(s1[i]) == -1){
				ret.push(s1[i]);
			}
		}
		return ret.concat(s2);
	}
	
	function matchPatternIdenty(p1){
		if (!p1 || !p1.length) return;
		console.info (p1);
		
		function calc_q2(q){
			return q[0] * q[0];
		}
		
		function calc_2pq_2(q){
			return 2 * q[0] * q[1];
		}
		
		if (p1.length === 1){
			return {
				param: p1,
				formula: calc_q				
			};
		}
		else {
			return {
				param: p1,
				formula: calc_2pq_2								
			};
		}
	}
	
	function matchPatternDyad(p1, p2){
		if (!p1 || !p2 || !p1.length || !p2.length) return;
		console.info (p1, p2);
		
		var lengths = '' + p1.length + p2.length;
		switch(lengths){
			case '11':
				if (p1.equal(p2)){
					return {
						pattern: 'q q 1/q',
						param: p1,
						formula: calc_q
					};
				}
				break;
			case '12':
				if (p1.equal(p1.intersection(p2))){
					return {
						pattern: 'q qr 1/2q',
						param: p1,
						formula: calc_2q
					};					
				}
				break;
			case '21':
				if (p2.equal(p1.intersection(p2))){
					return {
						pattern: 'pq p 1/2q',
						param: p2,
						formula: calc_2q
					};					
				}
				break;
			case '22':
				if (p1.equal(p2)){
					return {
						pattern: 'pq pq (p+q)/4pq',
						param: p1,
						formula: calc_4pq
					};					
				}
				else{
					var q = p1.intersection(p2);
					if (q.length !== 0){
						return {
							pattern: 'pq qr 1/4q',
							param: q,
							formula: calc_4q							
						};
					}
				}
		}
		return null;
	}
	
	function matchPattern(p1, p2, p3){
		if (!p1 || !p2 || !p3 || !p1.length || !p2.length || !p3.length) return;
		console.info (p1, p2, p3);
		
		var lengths = '' + p1.length + p2.length + p3.length;
		switch(lengths)
		{
			case '121':
				if (p3.equal(p1.intersection(p2).sort())){
					return {
						pattern: "q pq q 1/q",
						param: p3,
						formula: calc_q	//(q[0])
					};
				}
				break;
			case '111':
				if (p1.equal(p2) && p2.equal(p3))
				{
					return {
						pattern: "q q q 1/q",
						param: p1,
						formula: calc_q	//(p1[0])
					};
				}
				break;
			case '122':
				if (p1.intersection(p2.intersection(p3).sort()).length){
					return {
						pattern: "q pq qr(pq) 1/2q",
						param: p1,
						formula: calc_2q	//(q[0])
					};
				}
				break;
			case '112':
				if (p1.equal(p2.intersection(p3).sort()) && p1.equal(p2)){
					return {
						pattern: "q q qr 1/2q",
						param: p1,
						formula: calc_2q	//(q[0])
					};					
				}
				break;
			case '211':
				if (p3.equal(p1.minus(p2).sort())){
					return {
						pattern: "pq p q 1/q",
						param: p3,
						formula: calc_q	//(q[0])
					};
				}
				break;
			case '212':
				if (p1.equal(p1.intersection(p2.union(p3)).sort())){
					var q212 = minus(p1, p2);
					return {
						pattern: "pq p qr(pq) 1/2q",
						param: q212,
						formula: calc_2q	//(q[0])
					};
				}
				break;
			case '221':
				var q221 = p1.minus(p1.intersection(p2)).sort();
				if (p3.equal(q221)){
					return {
						pattern: "pq pr q 1/q",
						param: p3,
						formula: calc_q
					};
				}
				else if (p2.equal(p1) &&
					p3.equal(p2.intersection(p3).sort())){
					return {
						pattern: "pq pq q 1/(p+q)",
						param: p1,
						formula: calc_pq
					};
				}
				break;
			case '222':
				if (p1.equal(p2)){
					if (p2.equal(p3)){
						return {
							pattern: "pq pq pq 1/(p+q)",
							param: p1,
							formula: calc_pq
						};
					}
					else{
						if (p2.intersection(p3).length !== 0){
							return {
								pattern: "pq pq qr 1/(2p+2q)",
								param: p1,
								formula: calc_2pq
							};
						}
					}
				}
				
				if (! p2.equal(p3) && 
					! p1.equal(p2) && 
					p1.intersection(p2).length !== 0 &&
					p1.intersection(p3).length !== 0){
					return {
						pattern: "pq pr qr(pq) 1/2q",
						param: p1.minus(p2),
						formula: calc_2q
					};
				}
				break;
				
		}
		
		return null;
	}
	
	function calc(type, result){
		var resolved = [];
		var params = result.param;
		for (var i in params){
			if (params.hasOwnProperty(i)){
				resolved.push(qlookup(type, params[i]));
			}
		}
		console.info('params: ' + params + ' resolved: ' + resolved);
		result.resolved = resolved;
	}
		
	function evaluateIdenty(){
		var root = $(this).parents("tr");
		if (! root) return;
		
		var p = $(this).val();
		root.find('.p1 input').val(p);
		root.find('.p2 input').val(p);
		
		root.find('.pi').html('');
		root.find('.pattern').html('');
		var result = matchPatternIdenty(
			parseParam(root.find('.p1 input').val()));
		if (result){
			calc(root[0].id, result);
			
			var pi = result.formula(result.resolved);
			root.find('.pi').html(pi ? Number(pi).toFixed(8) : "");
			root.find('.pattern').html(result.pattern);
			
			var pis = root.parent().find('tr .pi');
			var cpi = 1.0;
			for (var i = 0; i < pis.length; i ++){
				var val = Number($(pis[i]).text());
				if (val){ cpi *= val;}
			}
			console.info(cpi);
			root.parent().find('#cpi').text(cpi.toExponential(6));
		}
	}		
		
	function evaluateDyad(){
		var root = $(this).parents("tr");
		if (! root) return;
		
		root.find('.pi').html('');
		root.find('.pattern').html('');
		var result = matchPatternDyad(
			parseParam(root.find('.p1 input').val()),
			parseParam(root.find('.p2 input').val()));
		if (result){
			calc(root[0].id, result);
			
			var pi = result.formula(result.resolved);
			root.find('.pi').html(pi ? Number(pi).toFixed(8) : "");
			root.find('.pattern').html(result.pattern);
			
			var pis = root.parent().find('tr .pi');
			var cpi = 1.0;
			for (var i = 0; i < pis.length; i ++){
				var val = Number($(pis[i]).text());
				if (val){ cpi *= val;}
			}
			console.info(cpi);
			root.parent().find('#cpi').text(cpi.toExponential(6));
		}
	}
	
	function evaluateTriad(){
		var root = $(this).parents("tr");
		if (! root) return;
		
		root.find('.pi').html('');
		root.find('.pattern').html('');
		var result = matchPattern(
			parseParam(root.find('.p1 input').val()),
			parseParam(root.find('.p2 input').val()),
			parseParam(root.find('.p3 input').val()));
		if (result){
			calc(root[0].id, result);
			
			var pi = result.formula(result.resolved);
			root.find('.pi').html(pi ? Number(pi).toFixed(8) : "");
			root.find('.pattern').html(result.pattern);//.split(' ')[3]);
			
			var pis = root.parent().find('tr .pi');
			var cpi = 1.0;
			for (var i = 0; i < pis.length; i ++){
				var val = Number($(pis[i]).text());
				if (val){ cpi *= val;}
			}
			console.info(cpi);
			root.parent().find('#cpi').text(cpi.toExponential(6));
		}
	}
})();