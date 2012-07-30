(function(){
	// <div><select id="kit"/><input type="submit" id="go" value="go"/></div>
	var ui = 
		'<div id="main">'+
			'<ul>'+
			'</ul>'+
		'</div>';
	$(".mainpage").append(ui);
	
	function assert(b){
		if (! b) alert("Assertion failed! " + b);
	}
	
	function buildTable(table, loci, accessor){
		table.append('<tr><th id="loci">STR基因座</th><th>C</th><th>M</th><th>AF</th><th>公式</th><th>PI</th></tr>');
		for (var i in loci){
			var lo = (accessor ? accessor(loci, i) : i);
			table.append("<tr id='" + lo +"'><td>" + lo + '</td><td class="p1"><input/></td><td class="p2"><input/></td><td class="p3"><input /></td><td class="pattern"/><td class="pi"/></tr>"');
		}		
	}
	var activeTabId_;
	var main_ = $('#main').tabs({
		add : function(event, ui){
			var table = $('<table/>');
			buildTable(table, kits_[ui.panel.id], function(container, i){
				return container[i];
			});
			$(ui.panel).append(table);

			$('#' + ui.panel.id + ' input').keyup(evaluate);			
		},
		
		select : function(event, ui){
			activeTabId_ = ui.panel.id;
		}
	});
	
	var kits_ = {};
	jQuery.getJSON("kits.json", function(kits){
		kits_ = kits;
		
		for (var i in kits_){
			console.info(i);
			main_.tabs('add', '#' + i, i);		
		}
		
		main_.tabs('select', 0);
	});

	var lociData_ = {};
	jQuery.getJSON("loci.json", function(data){
		lociData_ = data;		
	});
	
	function parseParam(val){
		var reg = /(\d+)(\D+(\d+))?/;
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
	
	function matchPattern(p1, p2, p3){
		if (!p1 || !p2 || !p3 || !p1.length || !p2.length || !p3.length) return;
		console.info (p1, p2, p3);
		
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
			var val = qlookup(q[0]);
			var val2 = qlookup(q[1]);
			if (val && val2 && (val + val2) !== 0.0) val = 1 / (val + val2);
			return val;
		}
		
		function calc_2pq(q) { // 1/2(p + q)
			var val = qlookup(q[0]);
			var val2 = qlookup(q[1]);
			if (val && val2 && (val + val2) !== 0.0) val = 1 / (val + val2) / 2;
			return val;
		}
		
		function minus(s1, s2){
			var ret = [];
			for (var i in s1){
				if (s2.indexOf(s1[i]) == -1){
					ret.push(s1[i]);
				}
			}
			return ret;
		}
		
		// make sure s1, s2 are sorted
		function equal(s1, s2){
			if (s1.length != s2.length) return false;
			for (var i in s1){
				if (s1[i] != s2[i]) return false;
			}
			return true;
		}
		
		function intersection(s1, s2){
			var ret = [];
			for (var i in s1){
				if (s2.indexOf(s1[i]) != -1){
					ret.push(s1[i]);
				}
			}
			return ret;
		}
		
		function union(s1, s2){
			return s1.concat(s2);
		}
		
		var lengths = '' + p1.length + p2.length + p3.length;
		switch(lengths)
		{
			case '121':
				var q = intersection(p2, p1);
				if (equal(q, p3)){
					return {
						pattern: "q pq q 1/q",
						param: q,
						formula: calc_q	//(q[0])
					};
				}
				break;
			case '111':
				if (equal(p1, p2) && equal(p2, p3))
				{
					return {
						pattern: "q q q 1/q",
						param: p1,
						formula: calc_q	//(p1[0])
					};
				}
				break;
			case '122':
				var q = intersection(p2, p3);
				if (equal(q, p1)){
					return {
						pattern: "q pq qr(pq) 1/2q",
						param: q,
						formula: calc_2q	//(q[0])
					};
				}
				break;
			case '112':
				var q = intersection(p2, p3);
				if (equal(p1, q) && equal(q, p2))
				{
					return {
						pattern: "q q qr 1/2q",
						param: q,
						formula: cacl_2q	//(q[0])
					};					
				}
				break;
			case '211':
				var q = minus(p1, p2);
				if (equal(q, p3)){
					return {
						pattern: "pq p q 1/q",
						param: q,
						formula: calc_q	//(q[0])
					};
				}
				break;
			case '212':
				var all = union(p2, p3);
				var inter = intersection(all, p1);
				if (equal(inter, p1)){
					var q = minus(p1, p2);
					assert(q.lengh == 1);
					return {
						pattern: "pq p qr(pq) 1/2q",
						param: q,
						formula: calc_2q	//(q[0])
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
			resolved.push(qlookup(type, params[i]));
		}
		result.resolved = resolved;
	}
		
	function evaluate(){
		var root = $(this).parents("tr");
		if (! root) return;
		
		root.find('.pi').html('');
		var result = matchPattern(
			parseParam(root.find('.p1 input').val()),
			parseParam(root.find('.p2 input').val()),
			parseParam(root.find('.p3 input').val()));
		if (result){
			calc(root[0].id, result);
			
			var pi = result.formula(result.resolved);
			root.find('.pi').html(pi ? pi : "");
			root.find('.pattern').html(result.pattern.split(' ')[3]);
		}
	}
	
//	$('#go').click(evaluate);
})();