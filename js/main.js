(function(){
	var ver_ = '1.0';
	var tag_ = 'cpifile';
	var left_default_ = '陕西省西安市公安司法鉴定中心';
	var right_default_ = '控制编号: XAFSTC/R-06-05-1 第1版第0次修订';

	var calcTypes_ = {
		'triad':{
			'name': '三联体',
			'algo': evaluate(3, matchPattern),
			'buildTable': buildTriadTable,
			'format' : {
				'left': left_default_,
				'right': right_default_,
				'title': '亲缘鉴定亲权指数数值报告表'
			}
		},
		'dyad':{
			'name': '二联体',
			'algo': evaluate(2, matchPatternDyad),
			'buildTable': buildDyadTable,
			'format' : {
				'left': left_default_,
				'right': right_default_,
				'title': '二联体报告表'
			}
		},
		'identification':{
			'name': '同一认定',
			'algo': evaluate(1, matchPatternIdenty, function(root, current){
				var p = $(current).val();
				root.find('.p1 input').val(p);
				root.find('.p2 input').val(p);
			}),
			'format' : {
				'left': left_default_,
				'right': right_default_,
				'title': '本案比中个体识别统计学参数数值报告表'
			},
			'buildTable': buildIdentyTable
		},
		'bothdoubts':{
			'name': '双亲皆疑',
			'algo': evaluate(3, matchPatternBothdoubts),
			'buildTable': buildBothdoubtsTable,
			'format' : {
				'left': left_default_,
				'right': right_default_,
				'title': '双亲皆疑报告表'
			}
		}
	};


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
			table.append("<tr id='" + lo +"'><td>" + lo +
				"</td><td class='p1'><input/></td><td class='p2'><input/></td>" +
				"<td class='p3'><input /></td><td class='p4 pattern'/><td class='p5 pi'/></tr>");
		}
		
		table.append("<tr><td>累计父权指数(CPI)</td><td colspan='4' id='cpi'/><td><input type='button' value='保存'/></tr>");
	}
	
	function buildDyadTable(table, loci, accessor){
		table.append('<tr><th id="loci">STR基因座</th><th>C</th><th>AF</th><th>公式</th><th>PI</th></tr>');
		for (var i = 0; i < loci.length; i ++){
			var lo = (accessor ? accessor(loci, i) : i);
			table.append("<tr id='" + lo +"'><td>" + lo + "</td><td class='p1'><input/></td>" +
				"<td class='p2'><input/></td><td class='p3 pattern'/><td class='p4 pi'/></tr>");
		}
		
		table.append("<tr><td>累计父权指数(CPI)</td><td colspan='4' id='cpi'/></tr>");
	}
	
	function buildIdentyTable(table, loci, accessor){
		table.append('<tr><th id="loci">STR基因座</th><th>样本</th><th>样本</th><th>PI</th></tr>');
		for (var i = 0; i < loci.length; i ++){
			var lo = (accessor ? accessor(loci, i) : i);
			table.append("<tr id='" + lo +"'><td>" + lo + "</td><td class='p1'><input/></td>" +
				"<td class='p2'><input/></td><td class='p3 pi'/></tr>");
		}
		
		table.append("<tr><td class='cpi_row'>LR=1/P(X)=</td><td colspan='3' id='cpi'/></tr>");
	}

	function buildBothdoubtsTable(table, loci, accessor){
		table.append('<tr><th id="loci">STR基因座</th><th>C</th><th>AM</th><th>AF</th><th>公式</th><th>PI</th></tr>');
		for (var i = 0; i < loci.length; i ++){
			var lo = (accessor ? accessor(loci, i) : i);
			table.append("<tr id='" + lo +"'><td>" + lo +
				"</td><td class='p1'><input/></td><td class='p2'><input/></td>" +
				"<td class='p3'><input /></td><td class='p4 pattern'/><td class='p5 pi'/></tr>");
		}
		
		table.append("<tr><td>累计父权指数(CPI)</td><td colspan='5' id='cpi'/></tr>");
	}
	
	var main_ = $('#main').tabs({
		add : function(event, ui){
			var tabbar = '<div class="calctypes"><ul/></div>';
			$(ui.panel).append(tabbar);
			
			var kitId = ui.panel.id;
			
			var typetabs = $('.calctypes', $(ui.panel)).tabs({
				add : function(event, ui){
					var table = $('<table/>');
					var calcTypeId = ui.panel.id;
					var calcType = calcTypes_[calcTypeId];
					if ( calcType && calcType.buildTable){
						calcType.buildTable(table, kits_[kitId], accessor);
						$(ui.panel).append(table);
					}
					calcType.id = calcTypeId;
					$('input[type="button"]', table).click(saveTable({
						"calcType": calcType, 
						kit:kitId
					}));
				}
			});
			
			for (var i in calcTypes_){
				if (calcTypes_.hasOwnProperty(i)){
					typetabs.tabs('add', '#' + i, calcTypes_[i].name);
					$('#' + kitId + ' #' + i + ' input').keyup(calcTypes_[i].algo);
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

	function calc_2q2(q){
		if (q[0])
			return 1/(2 * q[0] * q[0]);
		else
			return 0;
	}

	function calc_q2(q){
		if (q[0])
			return 1/(q[0] * q[0]);
		else
			return 0;
	}

	function calc_8pq(q){
		if (q[0] && q[1])
			return 1 / (8 * Number(q[0]) * Number(q[1]));
		else
			return 0;
	}

	function calc_4q2(q){
		if (q[0])
			return 1 / (4 * q[0] * q[0]);
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

	Array.prototype.empty = function(){
		return this.length === 0;
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
	
	function matchPatternIdenty(p){
		var p1 = p[0];
		if (!p1 || !p1.length) return;
		console.info (p1);
		
		function calcq2(q){
			return q[0] * q[0];
		}
		
		function calc2pq(q){
			return 2 * q[0] * q[1];
		}
		
		if (p1.length === 1){
			return {
				param: p1,
				formula: calcq2
			};
		}
		else {
			return {
				param: p1,
				formula: calc2pq
			};
		}
	}
	
	function matchPatternDyad(p){
		var p1 = p[0], p2 = p[1];
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
	function matchPatternBothdoubts(p){
		var p1 = p[0], p2 = p[1], p3 = p[2];
		if (!p1 || !p2 || !p3 || !p1.length || !p2.length || !p3.length) return;
		console.info (p1, p2, p3);
		
		var lengths = '' + p1.length + p2.length + p3.length;
		switch(lengths){
			case '111':
				if (p1.equal(p2) && p2.equal(p3)){
					return {
						pattern: "q q q 1/2q*q",
						param: p1,
						formula: calc_2q2
					};
				}
				break;
			case '112':
				if (p1.equal(p2) && ! p1.intersection(p3).empty()){
					return {
						pattern: "q q qr 1/2q*q",
						param: p1,
						formula: calc_2q2
					};
				}
				break;
			case '121':
				if (p1.equal(p3) && ! p1.intersection(p2).empty()){
					return {
						pattern: "q q qr 1/2q*q",
						param: p1,
						formula: calc_2q2
					};					
				}
				break;
			case '122':
				if ((p2.equal(p3) && ! p1.intersection(p2).empty()) ||
					(p1.intersection(p2).equal(p1.intersection(p3)))) {
					return {
						pattern: "q pq qr(pq) 1/4q*q",
						param: p1,
						formula: calc_4q2
					};
				}
				break;
			case '211':
				if (p1.equal(p2.union(p3))){
					return {
						pattern: "pq p q 1/2pq",
						param: p1,
						formula: calc_2pq
					};
				}
				break;
			case '212':
				if ((p1.equal(p3) && ! p2.intersection(p3).empty()) ||
					(! p1.intersection(p2).empty() && ! p1.intersection(p3).empty())) {
					return {
						pattern: "pq p pq(qr) 1/4pq",
						param: p1,
						formula: calc_4pq
					};
				}
				break;
			case '221':
				if (p1.equal(p2) && ! p1.intersection(p3).empty()){
					return {
						pattern: "pq pq q 1/2pq",
						param: p1,
						formula: calc_2pq
					};
				}
				else if (! p2.union(p3).minus(p1).empty()){
					return {
						pattern: "pq pr q 1/4pq",
						param: p1,
						formula: calc_4pq
					};
				}
				break;
			case '222':
				if (p1.equal(p2)){
					if (p2.equal(p3)){
						return {
							pattern: "pq pq pq 1/4pq",
							param: p1,
							formula: calc_4pq
						};
					}
					else if (! p2.intersection(p3).empty()){
						return {
							pattern: "pq pq qr 1/8pq",
							param: p1,
							formula: calc_8pq
						};
					}
				}
				else if ((p1.equal(p3) && !p1.intersection(p2).empty()) ||
					! (p2.union(p3).minus(p1).empty())){
					return {
						pattern: "pq pr qr(pq) 1/8pq",
						param: p1,
						formula: calc_8pq
					};
				}
				break;

		}

		return null;
	}
	
	function matchPattern(p){
		var p1 = p[0], p2 = p[1], p3 = p[2];
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

	function evaluate(count, match, preCalc){
		return function(){
			var root = $(this).parents("tr");
			if (! root) return;
			
			if (preCalc) preCalc(root, this);

			root.find('.pi').html('');
			root.find('.pattern').html('');
			root.parent().find('#cpi').text('');

			var param = [];
			for (var n = 1; n <= count; ++ n){
				param.push(parseParam(root.find('.p' + n + ' input').val()));
			}

			var result = match(param);
			if (result){
				calc(root[0].id, result);
				
				var pi = result.formula(result.resolved);
				root.find('.pi').html(pi ? Number(pi).toFixed(8) : "");
				var fields = result.pattern.split(' ');
				root.find('.pattern').html(fields[fields.length - 1]);
				
				var pis = root.parent().find('tr .pi');
				var cpi = 1.0;
				for (var i = 0; i < pis.length; i ++){
					var val = Number($(pis[i]).text());
					if (val){ cpi *= val;}
				}
				console.info(cpi);
				if (cpi != 1.0)
					root.parent().find('#cpi').text(cpi.toExponential(6));
			}
		};
	}

	function saveTable(meta){
		return function(){
			var data = {
				"tag" : tag_,
				"version" : ver_
			};
			for (var i in meta) if (meta.hasOwnProperty(i)){
				data[i] = meta[i];
			}

			var $table = $(this).parents('table');
			var $rows = $table.find('tr');

			data.locus = {};
			// m, n starts from 1 to ignore the headers
			for (var m = 1, len = $rows.length; m < len - 1; ++ m){
				var $cols = $($rows[m]).find('td');
				var line = data.locus[$cols[0].innerText] = [];
				for (var n = 1; n < $cols.length; ++ n){
					var $field = $($cols[n]);
					if ($field.children('input').length){
						line.push($field.children('input').val());
					}
					else {
						line.push($field.text());
					}
				}
			}
			data.cpi = $table.find('#cpi').text();

			var bb = new BlobBuilder();
			bb.append(JSON.stringify(data, null, 2));

			var d = new Date();
			var month = d.getMonth() + 1;
			var df = d.getFullYear() + (month < 10 ? '0' + month : '' + month) + (d.getDate() < 10 ? '0' : '') + d.getDate() + '.' + d.getHours() + d.getMinutes();

			saveAs(bb.getBlob("text/plain;charset=utf-8"), meta.kit + '.' + meta.calcType.name + '.' + df + '.txt');
		};
	}

	$('#loadFiles').change(function(evt) {
		var files = evt.target.files; // FileList object
		var file = files[0];
		console.dir(file);

		var reader = new FileReader();
		reader.onerror = function(event) {
			console.error("File could not be read! Code " + event.target.error.code);
		};
		reader.onload = function(event) {
			var contents = event.target.result;
			var data = JSON.parse(contents);

			if (! data) {
				alert('不正确的文件格式或文件已损坏.');
				return;
			}

			if (! data.tag || data.tag !== tag_) {
				alert('该文件格式无效. 请确认后重试.');
				return;
			}

			if(! data.version || data.version != ver_){
				alert('该文件版本为 ' + data.version + ', 请使用版本迁移工具升级该文件到 ' + ver_ + ' 后再试.');
				return;
			}


			if (data){
				main_.tabs('select', '#' + data.kit);
				$('#' + data.kit + ' .calctypes').tabs('select', '#' + data.calcType.id);
				var table = $('#' + data.kit + ' .calctypes #' + data.calcType.id);
				for (var loci in data.locus){
					if (data.locus.hasOwnProperty(loci)){
						var tr = table.find('#' + loci);
						for (var i = 0, len = data.locus[loci].length; i < len; ++ i){
							var td = tr.find('.p' + (i + 1));
							if (td.children('input').length){
								td.children('input').val(data.locus[loci][i]);	
							} 
							else {
								td.text(data.locus[loci][i]);
							}
						}
					}
				}
				table.find('#cpi').text(data.cpi);
			}
		};
		reader.readAsText(file);
	});

})();









