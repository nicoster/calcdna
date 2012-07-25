var table_;

(function(){
	// <div><select id="kit"/><input type="submit" id="go" value="go"/></div>
	var ui = //'<div><div id="main"><div id="content"><table /></div></div></div>';
	 	'<div id="main">'+
							'<ul>'+
//								'<li><a href="#content">Default</a></li>'+
							'</ul>'+
							// '<div id="content">'+
							// '</div>'+
						'</div>';
	$(".mainpage").append(ui);
	
	function assert(b){
		if (! b) alert("Assertion failed! " + b);
	}
	
	function buildTable(table, loci, accessor){
		table.append('<tr><th id="loci">STR基因座</th><th>C</th><th>M</th><th>AF</th><th>公式</th><th>PI</th></tr>');
		for (var i in loci){
			table.append("<tr id='" + i +"'><td>" + (accessor ? accessor(loci, i) : i) + '</td><td class="p1"><input/ ></td><td class="p2"><input  /></td><td class="p3"><input /></td><td class="pattern"/><td class="pi"/></tr>"');
		}		
	}
	
	var main_ = $('#main').tabs({
		add : function(event, ui){
			var table = $('<table/>');
			table_ = table;
			buildTable(table, kits_[ui.panel.id], function(container, i){
				return container[i];
			});
			$(ui.panel).append(table);

			$('#' + ui.panel.id + ' input').keyup(evaluate);			
		},
		
		select : function(event, ui){
//			$(ui.panel).append(table_);
		}
	});
	
	var kits_ = {};
	jQuery.getJSON("kits.json", function(kits){
		kits_ = kits;
		
		for (var i in kits_){
			console.info(i);
			main_.tabs('add', '#' + i, i);		
		}
		
	});

	var lociData_ = {};
	jQuery.getJSON("loci.json", function(data){
		lociData_ = data;		
		
		// var options = $('#dna_type');
		// options.append(new Option('--', '', true, true));
		// var selected = null;
		// for (var i in lociData_)
		// {
		// 	if (!selected) selected = i;
		// 	options.append(new Option(i, i, true, true));
		// }
		// options.val(selected);
		// evaluate();
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
	
	var set = {
		minus : function(s1, s2){
			var ret = [];
			for (var i in s1){
				if (s2.indexOf(s1[i]) == -1){
					ret.push(s1[i]);
				}
			}
			return ret;
		},
		
		// make sure s1, s2 are sorted
		equal : function(s1, s2){
			if (s1.length != s2.length) return false;
			for (var i in s1){
				if (s1[i] != s2[i]) return false;
			}
			return true;
		},
		
		intersection : function(s1, s2){
			var ret = [];
			for (var i in s1){
				if (s2.indexOf(s1[i]) != -1){
					ret.push(s1[i]);
				}
			}
			return ret;
		},
		
		union : function(s1, s2){
			return s1.concat(s2);
		}
	};
	
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
		if (!p1 || !p2 || !p3) return;
		
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
		
		var lengths = '' + p1.length + p2.length + p3.length;
		switch(lengths)
		{
			case '121':
				var q = set.intersection(p2, p1);
				if (set.equal(q, p3)){
					return {
						pattern: "q pq q 1/q",
						param: q,
						format: calc_q	//(q[0])
					};
				}
				break;
			case '111':
				if (set.equal(p1, p2) && set.equal(p2, p3))
				{
					return {
						pattern: "q q q 1/q",
						param: p1,
						format: calc_q	//(p1[0])
					};
				}
				break;
			case '122':
				var q = set.intersection(p2, p3);
				if (set.equal(q, p1)){
					return {
						pattern: "q pq qr(pq) 1/2q",
						param: q,
						format: calc_2q	//(q[0])
					};
				}
				break;
			case '112':
				var q = set.intersection(p2, p3);
				if (set.equal(p1, q) && set.equal(q, p2))
				{
					return {
						pattern: "q q qr 1/2q",
						param: q,
						format: cacl_2q	//(q[0])
					};					
				}
				break;
			case '211':
				var q = set.minus(p1, p2);
				if (set.equal(q, p3)){
					return {
						pattern: "pq p q 1/q",
						param: q,
						format: calc_q	//(q[0])
					};
				}
				break;
			case '212':
				var all = set.union(p2, p3);
				var inter = set.intersection(all, p1);
				if (set.equal(inter, p1)){
					var q = set.minus(p1, p2);
					assert(q.lengh == 1);
					return {
						pattern: "pq p qr(pq) 1/2q",
						param: q,
						format: calc_2q	//(q[0])
					};
				}
				break;
				
		}
		
		return null;
	}
	
	function calc(type, result){
		var resolvedValue = [];
		var params = result.param;
		for (var i in params){
			resolvedValue.push(qlookup(type, params[i]));
		}
		result.resolved = resolvedValue;
		var pi = result.format(resolvedValue);
		$('#' + type + ' .pi').html(pi ? pi : "");
		$('#' + type + ' .pattern').html(result.pattern);
	}
		
	function evaluate(){
//		console.info($(this).attr('id') + $(this).val());
		
		for (var i in lociData_){
			$('#' + i + ' .pi').html('');
			var result = matchPattern(parseParam($('#' + i + ' .p1 input').val()), parseParam($('#' + i + ' .p3 input').val()), parseParam($('#' + i + ' .p3 input').val()));
			if (result){
				calc(i, result);
			}			
		}
	}
	
//	$('#go').click(evaluate);
})();