/***********************************
*
* -- This the jsList class
*
***********************************/

function jsListItem(id, values) {
	this.id    		= id;
    this.values		= values;
    this.selected 	= false;
	this.select		= jsListItem_select;
	this.ind;
	this.owner;
	
	// ==============-------------------------------
	// -------------- IMPLEMENTATION

	function jsListItem_select(flag) {
		if (flag != undefined && flag != null) this.selected = !flag;
		// select new
		if (this.selected) {
			this.selected = false;
			el = this.owner.box.ownerDocument.getElementById(this.owner.name +'_line_'+ this.ind);
			if (el) {
				el.style.cssText = el.getAttribute('custom_style');
				el.className = (this.ind%2 == 0 ? 'lstBody_odd' : 'lstBody_even');
				el.setAttribute('selected', 'no');
			}
		} else {
			this.selected = true;
			el = this.owner.box.ownerDocument.getElementById(this.owner.name +'_line_'+ this.ind);
			if (el) {
				el.style.cssText = '';
				el.className = 'lstBody_selected';
				el.setAttribute('selected', 'yes');
			}
		}
	}
}

function jsList(name, box) {
	// public properties
    this.name  	  		= name;
    this.box      		= box; // HTML element that hold this element
    this.items    		= [];
	this.colors			= [];
	this.recid			= null; // might be used by edit class to set sublists ids
	this.filters		= '';
    this.layout   		= 'table'; // can be 'table' or 'div'
    this.tmpl           = '';
    this.tmpl_start 	= '';
    this.tmpl_end		= '';
	this.tmpl_group		= '';
    this.tmpl_empty 	= '<div style="padding: 8px">~msg~</div>';
	this.style_list		= '';
	this.style_header	= '';
	this.style_body		= '';
	this.style_footer	= '';
    this.srvFile  		= '';
    this.srvParams      = [];
    this.header   		= 'List Title';
    this.searches		= [];
    this.controls 		= [];
    this.columns  		= [];
	this.toolbar		= null; // if not null, then it is toolbar object
    this.items_pp		= 50;
    this.page_num		= 0;
    this.page_count     = 0;
    this.showHeader 	= true;
	this.showToolbar	= false;
    this.showFooter 	= true;
    this.showTabHeader 	= true;
    this.showTabNumber 	= true;
	this.showKey		= false;
    this.smallPageCount = false;
    this.smallPageNav   = false;
    this.fixed      	= true;
    this.tblPadding 	= 4;
	this.divStyle 		= 'height: 13px; margin: 2px;';
    this.editable       = [];
    this.sortBy			= [];
    this.count      	= 0;
    this.time           = [];
    this.msgDelete      = 'Are you sure you want to delete selected record(s)?';
    this.msgNodata      = 'There is no data.';

    // events
	this.onOutput;
	this.onRefresh;
	this.onAddOrEdit;
    this.onClick;
    this.onDblClick;
    this.onSort;
    this.onData;
    this.onDataReceived;
	this.onDelete;
	this.onDeleteDone;
	this.onEditableChange;

    // public methods
    this.addColumn   	= jsList_addColumn;
    this.addControl  	= jsList_addControl;
    this.addSearch   	= jsList_addSearch;
    this.addItem     	= jsList_addItem;
	this.addNew			= jsList_addNew;
	this.applyFilter	= jsList_applyFilter;
    this.getData     	= jsList_getData;
	this.showPage		= jsList_showPage;
    this.dataReceived	= jsList_dataReceived;
    this.output      	= jsList_output;
    this.refresh     	= jsList_refresh;
	this.resize		 	= jsList_resize;
	this.selectAll		= jsList_selectAll;
	this.selectNone		= jsList_selectNone;
    this.getSelected 	= jsList_getSelected;
    this.getItem     	= jsList_getItem;
    this.serverCall  	= jsList_serverCall;
    this.saveData	 	= jsList_saveData;
    this.showStatus	 	= jsList_showStatus;
    this.hideStatus  	= jsList_hideStatus;
    this.openSearch  	= jsList_openSearch;
    this.clearSearch 	= jsList_clearSearch;
    this.submitSearch	= jsList_submitSearch;
	this.searchAll		= jsList_searchAll;
    this.findSearch  	= jsList_findSearch;

    // internal
    this.tmpLastInd;
    this.fieldList	 	= 0;
    this.showSearch  	= false;
	this.searchFlag 	= false;
	this.searchData		= [];
    this.searchFields   = [];
    this.lstClick    	= jsList_lstClick;
    this.lstDblClick 	= jsList_lstDblClick;
    this.columnClick 	= jsList_columnClick;
    this.getHeaders  	= jsList_getHeaders;
    this.getControls 	= jsList_getControls;
    this.getFilters 	= jsList_getFilters;
    this.getRecords  	= jsList_getRecords;
    this.getFooter   	= jsList_getFooter;
    this.getSearches 	= jsList_getSearches;
    this.delRecords  	= jsList_delRecords;
    this.getList	 	= jsList_getList;
    this.getListDone 	= jsList_getListDone;
	
	this.lookup_items 	= [];
	this.lookup_keyup  	= jsList_lookup_keyup;
	this.lookup_blur 	= jsList_lookup_blur;
	this.lookup_show 	= jsList_lookup_show
	this.initEvents		= jsList_initEvents;

    if (!top.jsUtils) alert('The jsUtils class is not loaded. This class is a must for the jsList class.');
    if (!top.jsField) alert('The jsField class is not loaded. This class is a must for the jsList class.');
    if (!top.elements) top.elements = [];
    if (top.elements[this.name]) alert('The element with this name "'+ this.name +'" is already registered.');
    top.elements[this.name] = this;
	
	// initialization
	if (this.box) { this.initEvents(); }
	
	// ==============-------------------------------
	// -------------- IMPLEMENTATION
	
	function jsList_initEvents() {
		/*
		if (window.addEventListener) {
			top.addEventListener('resize', 	new Function("if (top.elements) top.elements['"+ this.name + "'].resize()"), false);
			top.addEventListener('mousemove', 	new Function("event", "if (top.elements) top.elements['"+ this.name + "'].doResize(event)"), false);
			top.addEventListener('mouseup',   	new Function("event", "if (top.elements) top.elements['"+ this.name + "'].stopResize(event)"), false);
			if (this.box) this.box.addEventListener('resize', 	 new Function("if (top.elements) top.elements['"+ this.name + "'].resize()"), false);
			if (this.box) this.box.addEventListener('mousemove', new Function("event", "if (top.elements) top.elements['"+ this.name + "'].doResize(event)"), false);
			if (this.box) this.box.addEventListener('mouseup',   new Function("event", "if (top.elements) top.elements['"+ this.name + "'].stopResize(event)"), false);
		} else {
			window.attachEvent('onresize', 	  new Function("if (top.elements) top.elements['"+ this.name + "'].resize()"));
			window.document.attachEvent('onmousemove',  new Function("if (top.elements) top.elements['"+ this.name + "'].doResize()"));
			window.document.attachEvent('onmouseup',    new Function("if (top.elements) top.elements['"+ this.name + "'].stopResize()"));
		}
		*/
	}

	function jsList_addColumn(caption, size, type, attr) {
		var ind = this.columns.length;
		// initialize object if necessary
		if (size != null && typeof(size) == 'object' && String(size) == '[object Object]') { // javascript object
			this.columns[ind] = { caption: caption, size: size.size, type: size.type, attr: size.attr };
		} else {
			this.columns[ind] = { caption: caption, size: size, type: type, attr: attr };
		}
	}

	function jsList_addControl(type, caption, param, img) {
		var ind = this.controls.length;
		// initialize object if necessary
		if (caption != null && typeof(caption) == 'object' && String(caption) == '[object Object]') { // javascript object
			this.controls[ind] = { type: type, caption: caption.caption, param: caption.param, img: caption.img };		
		} else {
			this.controls[ind] = { type: type, caption: caption, param: param, img: img };		
		}
	}

	function jsList_addSearch(caption, type, fieldName, inTag, outTag, defValue, items) {
		var ind = this.searches.length;
		// initialize object if necessary
		if (type != null && typeof(type) == 'object' && String(type) == '[object Object]') { // javascript object
			this.searches[ind] = { caption: caption, type: type.type, fieldName: type.fieldName, inTag: type.inTag, outTag: type.outTag, defValue: type.defValue, items: type.items };
		} else {
			this.searches[ind] = { caption: caption, type: type, fieldName: fieldName, inTag: inTag, outTag: outTag, defValue: defValue, items: items };
		}
	}

	function jsList_addFilter(caption, img) {
		ind  = this.filters.length;
		html = '<div id="'+ this.name +'_filter'+ ind + '_div">'+
			   '<table cellpadding=0 cellspacing=0 class="lstButton"><tr>'+
			   (img != undefined ? '<td style="padding-left:3px;"><img src="'+ img +'"></td>' : '')+
			   '<td nowrap style="padding: 2px; padding-bottom: 1px; padding-left: 5px;">'+
			   '	<a style="padding-right: 5px; cursor: pointer; font-weight: bold" id="'+ this.name +'_filter'+ ind + '" '+
			   '		onclick="top.elements[\''+ this.name + '\'].applyFilter(\''+ caption +'\');">'+ caption +'</a>'+
			   '</td>'+
			   '</tr></table></div>';
		this.filters[this.filters.length] = html;
	}

	function jsList_applyFilter(param) {
		this.srvParams['filter'] = param;
		this.getData();
	}

	function jsList_lookup_show(name) {
		if (!this.box) return;
		var html;
		var div;
		var elid;
		div = this.box.ownerDocument.getElementById(name + '_div');
		html = '';
		var  k = 0;
		for (var item in this.lookup_items) {
			elid = name +'_item'+ k;
			if (this.currentField == k) { 
				addstyle = 'background-color: highlight; color: white;'; 
			} else { 
				addstyle = 'background-color: white; color: black;'; 
			}
			html += '<div id="'+ elid +'" style="padding: 2px; margin: 2px; cursor: default;'+ addstyle +'" '+
					'	onclick="this.style.backgroundColor = \'highlight\'; '+
					'			 this.style.color = \'white\'; '+
					'			 document.getElementById(\''+ name +'\').value = \''+ item +'\'; '+
					'			 document.getElementById(\''+ name +'_search\').value = \''+ this.lookup_items[item] +'\'; '+
					'			 document.getElementById(\''+ name +'_div\').style.display = \'none\'; '+
					'			 top.jsUtils.clearShadow(document.getElementById(\''+ name +'_div\')); '+
					'			 var el = document.getElementById(\''+ name +'\'); '+
					'	 		 if (el.onchange) el.onchange(el.value);\"'+
					'>'+
						this.lookup_items[item] +
					'</div>';
			k++;
		}
		if (div && div.innerHTML != html) {
			div.innerHTML = html;
			div.style.display = '';
			if (div.shadow) top.jsUtils.clearShadow(div);
			div.shadow = top.jsUtils.dropShadow(div);
		}
		if (html == '') {
			top.jsUtils.clearShadow(div);
			div.style.display = 'none';
		}
	}

	function jsList_lookup_keyup(el, name, evnt) {
		// events
		if (evnt.keyCode == 9 || evnt.keyCode == 37 || evnt.keyCode == 39 ||
			evnt.keyCode == 16||evnt.keyCode == 17|| evnt.keyCode == 18 || evnt.keyCode == 20) return; 
		if (evnt.keyCode == 38) { // up
			this.currentField -= 1;
			if (this.currentField <= 0) this.currentField = 0;
			this.lookup_show(name);
			evnt.cancelBubble = true;
			evnt.stopPropagation();
			return false;
		}
		if (evnt.keyCode == 40) { // down
			this.currentField += 1;
			var cnt = 0;
			for (item in this.lookup_items) cnt++;
			if (this.currentField >= cnt) { this.currentField -= 1; }
			this.lookup_show(name);
			evnt.cancelBubble = true;
			evnt.stopPropagation();
			return false;
		}
		if (evnt.keyCode == 13) { // enter
			// see if there is exact match
			var contFlag = true;
			fld = String(this.box.ownerDocument.getElementById(name +'_search').value);
			k = 0;
			for (var item in this.lookup_items) {
				if (String(this.lookup_items[item]).toLowerCase() == fld.toLowerCase()) {
					this.box.ownerDocument.getElementById(name +'_search').value = this.lookup_items[item];
					this.box.ownerDocument.getElementById(name).value 			 = item;
					this.box.ownerDocument.getElementById(name +'_div').style.display = 'none';
					top.jsUtils.clearShadow(this.box.ownerDocument.getElementById(name +'_div'));
					contFlag = false;
					break;
				}
				k++;
			}
			if (contFlag) {
				k = 0;
				for (var item in this.lookup_items) {
					if (k == this.currentField) {
						this.box.ownerDocument.getElementById(name +'_search').value = this.lookup_items[item];
						this.box.ownerDocument.getElementById(name).value 			 = item;
						this.box.ownerDocument.getElementById(name +'_div').style.display = 'none';
						top.jsUtils.clearShadow(this.box.ownerDocument.getElementById(name +'_div'));
						break;
					}
					k++;
				}
			}
			var el = this.box.ownerDocument.getElementById(name);
			if (el.onchange) el.onchange(el.value);
			
			evnt.cancelBubble = true;
			if (!document.all) evnt.stopPropagation();
			return false;
		}
		el.style.color = 'black';
		this.box.ownerDocument.getElementById(name).value = '';
		if (el.value != '') {
			if (this.timer > 0) clearTimeout(this.timer);
			this.timer = setTimeout("top.elements['"+ this.name + "'].currentField  = -1; "+
									"top.elements['"+ this.name + "'].lookup_items  = []; "+
									"top.elements['"+ this.name + "'].serverCall('edit_lookup', { lookup_name: '"+ name +"', lookup_search: '"+ el.value +"' });", 300);
		} else {
			this.lookup_items = [];
			this.lookup_show(name);
		}
	}

	function jsList_lookup_blur(el, name, evnt) {
		setTimeout("if (top.elements['"+ this.name +"'].box.ownerDocument.getElementById('"+ name +"').value == '') {" +
				   "	top.elements['"+ this.name +"'].box.ownerDocument.getElementById('"+ name +"_search').value = 'start typing...';" +
				   "	top.elements['"+ this.name +"'].box.ownerDocument.getElementById('"+ name +"_search').style.color = '#666666';" +
				   "	top.elements['"+ this.name +"'].box.ownerDocument.getElementById('"+ name +"_div').style.display = 'none';"+
				   "	top.jsUtils.clearShadow(top.elements['"+ this.name +"'].box.ownerDocument.getElementById('"+ name +"_div')); "+
				   "}", 400);
	}

	function jsList_addItem(id, values) {
		var ind = this.items.length;
		this.items[ind] = new top.jsListItem(id, (this.showKey ? Array(id).concat(values) : values));
		this.items[ind].ind   = ind;
		this.items[ind].owner = this;
	}
	
	function jsList_addNew() {
		var obj = this.onAddOrEdit; 
		if (typeof(obj) == 'function') { 
			obj(); 
		} else if (typeof(obj) == 'object') { 
			obj.box = this.box; 
			obj.recid = null; 
			obj.output(); 
		} else { 
			top.elements[obj].box = this.box;
			top.elements[obj].recid = null;
			top.elements[obj].output(); 
		}
	}

	function jsList_searchAll(val) {
		if (this.last_search == val) return;
		this.last_search = val;
		this.clearSearch();
		// build search fields name list
		var fields = [];
		for (s in this.searchFields) {
			// Possible types:  HIDDEN, TEXT, LOOKUP, TEXTAREA, HTMLAREA, PASSWORD, INT, INTRANGE, FLOAT, FLOATRANGE, LIST, RADIO, RADIO_YESNO, CHECK
			//   DATE, DATERANGE, TIME, TIMERANGE, BREAK, UPLOAD, READONLY, TITLE, FIELD
			// skipp all unknown values;
			var tmp = String(val).split('::');
			if (!top.jsUtils.inArray(String(this.searchFields[s].type).toUpperCase(), 
					['TEXT', 'TEXTAREA', 'HTMLAREA', 'INT', 'INTRANGE', 'FLOAT', 'FLOATRANGE', 'DATE', 'DATERANGE', 'TIME', 'TIMERANGE'])) continue;	
			// if not integer - do not search in integer fields
			if (!top.jsUtils.isFloat(tmp[0]) && top.jsUtils.inArray(String(this.searchFields[s].type).toUpperCase(), ['INT', 'INTRANGE', 'FLOAT', 'FLOATRANGE'])) continue;
			// if not date - do not search in dates fields
			if (!top.jsUtils.isDate(tmp[0]) &&	top.jsUtils.inArray(String(this.searchFields[s].type).toUpperCase(), ['DATE', 'DATERANGE'])) continue;
			// if not time - do not search in time fields
			if (!top.jsUtils.isTime(tmp[0]) &&	top.jsUtils.inArray(String(this.searchFields[s].type).toUpperCase(), ['TIME', 'TIMERANGE'])) continue;
			// --
			fields[fields.length] = this.searchFields[s].fieldName;
		}
		var value = val;
		// convert date into db format
		if (top.jsUtils.isDate(val)) {
			var tmp = String(val).split('/');
			value = tmp[2]+'/'+tmp[0]+'/'+tmp[1];
		}
		this.srvParams['req_search-all'] 	= value;
		this.srvParams['req_search-fields'] = fields;
		this.getData();
	}
	
	function jsList_submitSearch() {
		// -- clear all search field
		this.srvParams['req_search-all'] 	= '';
		this.srvParams['req_search-fields'] = [];
		var el = this.box.ownerDocument.getElementById(this.name + '_search_all');
		if (el) el.value = '';
		// -- submit search
		this.openSearch(false);
		this.items = [];
		this.page_num = 0;
		this.getData();
	}

	function jsList_clearSearch(flag) {
		if (!this.box) return;
		for (si = 0; si < this.searchFields.length; si++) {
			this.searchFields[si].value = null;
			if (this.box) {
				var el  = this.box.ownerDocument.getElementById(this.name + '_field' + this.searchFields[si].index);
				var el2 = this.box.ownerDocument.getElementById(this.name + '_field' + this.searchFields[si].index + '_2');
				if (flag) {
					if (el)  el.value  = '';
					if (el2) el2.value = '';
				} else {
					tmp = this.searchFields[si].defValue.split('::');
					if (el2) {
						el.value  = tmp[0];
						el2.value = tmp[1] ? tmp[1] : '';
					} else {
						el.value  = this.searchFields[si].defValue;
					}
				}
			}
		}
	}

	function jsList_openSearch(flag) {
		if (!this.box) return;
		if (flag != null) this.showSearch = !flag;
		if (this.searches.length == 0) return;
		// init searches (only if opening)
		if (!this.showSearch) {
			var i = 0;
			while(true) {
				sr1 = this.box.ownerDocument.getElementById(this.name+'_field'+i);
				sr2 = this.box.ownerDocument.getElementById(this.name+'_field'+i+'_2');
				if (!sr1 ) break;
				if (sr1.name != '' && String(this.searchData[sr1.name]) != 'undefined') {
					var tmp = String(this.searchData[sr1.name]).split('::');
					if (sr2) {
						sr1.value = tmp[0];
						sr2.value = tmp[1];
					} else {
						sr1.value = this.searchData[sr1.name];
					}
				}
				i++;
			}
		}
		// slide down
		var el = this.box.ownerDocument.getElementById('searches_'+ this.name);
		if (this.showSearch) {
			this.showSearch = false;
			if (el.shadow) el.shadow.style.display = 'none';
			top.jsUtils.slideUp(el); 
		} else {
			this.showSearch = true;
			fHeight = parseInt(el.style.clientHeight);
			el.style.display  = '';
			top.tmp_search_el = el;
			// slide down and drop shadow
			top.jsUtils.slideDown(el, new Function("var el = top.tmp_search_el; if (el.shadow) { el.shadow.style.display = ''; } else { el.shadow = top.jsUtils.dropShadow(el); }"));
			// focus first element
			top.tmp_sel = this.box.ownerDocument.getElementById(this.name + '_field' + this.searchFields[0].index);
			if (top.tmp_sel) { setTimeout("top.tmp_sel.focus();", 100); }
		}
	}

	function jsList_getList(fld) {
		if (!this.box) return;
		this.fieldList++;		
		// call server script
		this.serverCall('search_field_list', { req_index: fld.index, req_field: fld.fieldName });
	}

	function jsList_getListDone(nameOrIndex, param) {
		if (!this.box) return;
		this.fieldList--;
		fld = this.findSearch(nameOrIndex);
		fld.param = param;
		if (this.fieldList == 0) {
			var el = this.box.ownerDocument.getElementById('searches_'+ this.name);
			if (el) {
				el.innerHTML = this.getSearches();
				for (var ssi = 0; ssi < this.searchFields.length; ssi++) {
					ssel  = this.box.ownerDocument.getElementById(this.name + '_field' + this.searchFields[ssi].index);
					ssel2 = this.box.ownerDocument.getElementById(this.name + '_field' + this.searchFields[ssi].index + '_2');
					sstmp = this.searchFields[ssi].value != '' ? this.searchFields[ssi].value : this.searchFields[ssi].defValue;
					if (ssel.value == '' && sstmp != '' && sstmp != null) {
						sstmp = sstmp.split('::');
						ssel.value = sstmp[0];
						if (sstmp.length == 2) ssel2.sstmp[1];
					}
				}
			}
			this.getData();
		}
	}

	function jsList_findSearch(indOrName) {
		for (var i = 0; i < this.searchFields.length; i++) {
			fld = this.searchFields[i];
			if (fld.fieldName == indOrName) return fld;
			if (fld.index == indOrName) return fld;
		}
		return null;
	}

	function jsList_resize() {
		if (!this.box) return;
		// --
		var tmpHTML = this.box.innerHTML;
		this.box.innerHTML = '';
		var height = parseInt(this.box.clientHeight);
		var width  = parseInt(this.box.clientWidth);
		if (parseInt(height) == 0) height = parseInt(this.box.style.height);
		if (parseInt(width)  == 0) width  = parseInt(this.box.style.width);
		this.box.innerHTML = tmpHTML;
		
		// --
		var el  = this.box.ownerDocument.getElementById('body_'+ this.name);
		var el2 = this.box.ownerDocument.getElementById('toolbar_'+ this.name);
		//var el2 = this.box.ownerDocument.getElementById('mtbody_'+ this.name);
		//var els = this.box.ownerDocument.getElementById('mtcell_'+ this.name);
		if (height > 0 && el) {
			var newHeight = height 
				- (this.showHeader ? 28 : 0) 
				- (this.showFooter ? 25 : 0) 
				- (this.toolbar != null ? 30 : 0) 
				- (top.jsUtils.inArray(top.jsUtils.engine, ['IE5']) ? 2 : 4);
			if (newHeight < 0 ) newHeight = 0;
			el.style.height = newHeight + 'px';
		}
		if (width > 0 && el) {
			var newWidth = width 
				- (top.jsUtils.inArray(top.jsUtils.engine, ['IE5']) ? 2 : 4);
			if (newWidth < 0) newWidth = 0;
			// in FF4 - if width is set - it goes beyond borders
			// el.style.width = newWidth + 'px';
			// if (el2) el2.style.width = newWidth + 'px';
		}
		
		// -- mtbody
		/*
		if (el2) el2.style.overflow = '';
		if (el2 && parseInt(el2.clientHeight) > parseInt(el.clientHeight) && el.clientWidth > el2.clientWidth && 
					(navigator.userAgent.toLowerCase().indexOf('chrome') == -1)) {
			el2.style.overflow = 'auto';
			el2.style.height   = height - 22
				- (this.showHeader ? 27 : 0) 
				- (this.showFooter ? 25 : 0) 
				- (this.toolbar != null ? 30 : 0) 
				- (document.all ? 0 : 4);
			if (els) els.style.display = '';
		} else {
			if (els) els.style.display = 'none';
		}
		*/
	}

	function jsList_refresh() {
		if (!this.box) return;
		this.showSearch = false;
		
		// CHANGING PART: generate records
		var bodyHTML = '';
		if (this.layout == 'table') {
		   bodyHTML += '<table id="mtable_'+ this.name + '" cellpadding="0" cellspacing="0" style="width: 100%" class="lstBody_tbl">\n'+
							this.getHeaders() +
							this.getRecords() +
						'</table>\n';
		}
		if (this.layout == 'div') {
		   bodyHTML += '<table id="mtable_'+ this.name + '" style="width: 100%" class="lstBody_tbl"><tr><td>\n'+
							this.tmpl_start +
							this.getHeaders() +
							this.getRecords() +
							this.tmpl_end +
					   '</td></tr></table>\n';
		}
		var pages = this.getFooter();
		if (!this.smallPageCount) {
			var last = (this.page_num * this.items_pp + this.items_pp);
			if (last > this.count) last = this.count;
			pageCountDsp = (this.page_num * this.items_pp + 1) +'-'+ last +' of '+ this.count;
		} else {
			pageCountDsp = this.page_num + 1;
		}
		
		if (String(this.srvParams['req_search-all']) == 'undefined') {
			this.srvParams['req_search-all'] 	= '';
			this.srvParams['req_search-fields'] = [];
		}

		// OTHER PART: output or regenerate
		if (this.box.ownerDocument.getElementById('body_'+ this.name)) {
			// refresh Header
			if (this.showHeader) {
				el = this.box.ownerDocument.getElementById('title_'+ this.name);
				if (el) el.innerHTML = this.header +'&nbsp;';
				// controls
				el = this.box.ownerDocument.getElementById('controls_'+ this.name);
				if (el) el.innerHTML = this.getControls();
			}
			// refresh Footer
			if (this.showFooter) {
				el = this.box.ownerDocument.getElementById('footerR_'+ this.name);
				if (el) el.innerHTML = '<table cellpadding=0 cellspacing=0><tr><td class=rText>'+ this.getFilters() +'</td><td class=rText>'+ pageCountDsp +'</td></tr></table>';
			}
			el = this.box.ownerDocument.getElementById('footerL_'+ this.name);
			if (el) el.innerHTML = pages;
			// refresh body
			var body = this.box.ownerDocument.getElementById('body_'+ this.name);
			body.innerHTML = bodyHTML;
			// refresh toolbar if any
			if (this.toolbar != null) {
				// this.toolbar.box = this.box.ownerDocument.getElementById('toolbar_'+ this.name);
				// this.toolbar.output();
			}
			// make sure search is hidden
			this.showSearch = false;
			var el = this.box.ownerDocument.getElementById('searches_'+ this.name);
			if (el) {
				el.style.display = 'none';
				el.innerHTML = this.getSearches();
				el.parentNode.style.width = '1px';
				if (el.shadow) el.shadow.style.display = 'none';
			}
		} else {
			// output entire thing
			html =  '<div id="list_'+ this.name +'" class="lst_div" style="'+ this.style_list +'">';
			// generate header
			if (this.showHeader) {
				html += '<div id="header_'+ this.name +'" class="lstHeader_div" style="width: 100%; margin: 0px; padding: 0px; border: 0; height: 28px; overflow: hidden; '+ this.style_header +'">\n'+
						'   <table cellpadding=0 cellspacing=1 style="width: 100%; height: 28px;" class="lstHeader_tbl"><tr>\n'+
						'       <td id="title_td1_'+ this.name + '" style="padding-left: 5px; padding-top: 0px; width: 95%" class="lstHeader_td1">'+ 
						'		   <span ondblclick="top.elements.'+ this.name +'.getData()" id="title_'+ this.name +'">'+ this.header +'&nbsp;</span>'+
								   (this.searchFields.length && !this.showToolbar != 0 ? 
										'<span class="rText" id="searchLink_'+ this.name +'"> - <a href="javascript: top.elements[\''+ this.name +'\'].openSearch();">Search</a></span>' 
									  : '') +
						'		   <span style="display: none; font-size: 11px;" id="clearSearchLink_'+ this.name +'"> - '+
						'				<img style="position: absolute;" src="'+ top.jsUtils.sys_path +'/includes/silk/icons/cross.png">'+
						'				<span style="padding-left: 17px;"></span>'+
						'				<a href="javascript: var obj = top.elements[\''+ this.name +'\']; obj.clearSearch(); obj.submitSearch();">Clear Search</a></span>'+
						'		   <span style="font-variant: normal; font-size: 10px; font-family: verdana; padding: 3px; margin-left: 5px; width: auto;  display: none; background-color: red; color: white;" id="status_'+ this.name + '"></span>'+
						'       </td>\n'+
						'       <td align="right" style=" padding-top: 0px; width: 5%;" class="lstHeader_td2" id="controls_'+ this.name +'" nowrap="nowrap">'+ this.getControls() +'</td>\n'+
						'   </tr></table>\n'+
						'</div>\n';
			}
			if (this.toolbar != null || this.showToolbar) {
				html += '<div id="toolbar_'+ this.name +'" class="lstToolbar" style=""></div>';
			}
			html +=	'<div style="position: relative">'+
					'	<div style="margin-left: 22px; position: absolute; overflow: hidden; z-index: 100;">'+
					'	<div id="searches_'+ this.name +'" class="lstSearch_div" style="display: none; position: absolute; z-index: 100;">'+
							this.getSearches() +
					'	</div>'+
					'	</div>'+
					'</div>';
			html += '<div id="body_'+ this.name +'" class="lstBody_div" style="height: 250px; overflow: auto; '+ this.style_body +'">\n';

			html += bodyHTML + '</div>\n';
			// generate footer
			if (this.showFooter) {
				html += '<div id="footer_'+ this.name +'" class="lstFooter_div" style="height: 24px; overflow: hidden; '+ this.style_footer +'">\n'+
						'   <table cellpadding=0 cellspacing=1 style="height: 24px; width: 100%" class="lstFooter_tbl"><tr>\n'+
						'       <td id="footerL_'+ this.name +'" style="width: 70%" nowrap="nowrap" class="lstFooter_td1">'+ pages +'</td>\n'+
						'       <td id="footerR_'+ this.name +'" style="width: 30%" nowrap="nowrap" align=right class="lstFooter_td2">'+
						'			<table cellpadding=0 cellspacing=0><tr><td>'+ this.getFilters() +'</td><td>'+ pageCountDsp +'</td></tr></table>'+
						'		</td>\n'+
						'   </tr></table>'+
						'</div>';
			}

			html += '</div>';
			this.box.innerHTML = html;
			// init toolbar
			if (this.showToolbar) {
				if (!top.jsToolBar) {
					alert('The jsToolBar class is not loaded. To use toolbar with jsList you need to load jsToolBar.');
				} else {
					top.elements[this.name + '_toolbar'] = null;
					this.toolbar = new top.jsToolBar(this.name +'_toolbar', null);
					this.toolbar.addHTML('<table cellpadding=2 cellspacing=0><tr>'+
						'	<td><img src="'+ top.jsUtils.sys_path +'/includes/silk/icons/magnifier.png"></td>'+
						'	<td><input id="'+ this.name +'_search_all" value="'+ (String(this.srvParams['req_search-all']) != '' ? this.srvParams['req_search-all'] : '') +'"'+
						'			style="font-size: 11px; font-family: verdana; border: 1px solid silver; padding: 2px; margin: 0px;" '+
						'			onkeyup=\'if (this.timer > 0) clearTimeout(this.timer);	top.el = this; '+
						'					  this.timer = setTimeout("top.elements.'+ this.name +'.searchAll(top.el.value)", 300);\'></td>'+
						'</tr></table>');
					this.toolbar.addButton('Advanced', top.jsUtils.sys_path +'/includes/silk/icons/magnifier_zoom_in.png', 
						new Function("top.elements['"+ this.name +"'].openSearch();"), 'Advanced Search');
					this.getControls();
				}
			}
			// refresh toolbar if any
			if (this.toolbar != null) {
				this.toolbar.box = this.box.ownerDocument.getElementById('toolbar_'+ this.name);
				this.toolbar.output();
			}
			this.resize();
		}
		// show/hide clear search link
		var el = this.box.ownerDocument.getElementById('clearSearchLink_'+ this.name);
		if (el) if (this.searchFlag || this.srvParams['req_search-all'] != '') {
			el.style.display = ''; 
		} else {
			el.style.display = 'none';	
		}		
		if (this.onRefresh) this.onRefresh();
	}

	function jsList_output() {
		// convert searches array into objects (once per object
		if (this.searches.length != this.searchFields.length) {
			for (var i = 0; i < this.searches.length; i++) {
				var s = this.searches[i];			
				if (s.inTag    == null) s.inTag    = '';
				if (s.outTag   == null) s.outTag   = '';
				if (s.defValue == null) s.defValue = '';
				var ind = this.searchFields.length;
				this.searchFields[ind] = new top.jsField(s.caption, s.type, s.fieldName, s.inTag, s.outTag, s.defValue, false, 0);
				if (s.items) this.searchFields[ind].items = s.items;
				if (s.type.toUpperCase() != 'BREAK') {
					this.searchFields[ind].index    = ind;
					this.searchFields[ind].prefix   = this.name;
					this.searchFields[ind].owner    = this;
					this.searchFields[ind].td1Class = 'lstSearch_caption';
					this.searchFields[ind].td2Class = 'lstSearch_value';
					this.searchFields[ind].inTag   = ' onkeyup="if (event.keyCode == 13) { obj = top.elements[\''+ this.name +'\']; if (obj) { obj.submitSearch(); } }" '+ this.searchFields[ind].inTag;
				}
			}		
		}
		// fill search lists if any
		for (var i = 0; i < this.searchFields.length; i++) {
			fld = this.searchFields[i];
			if (String(fld.type).toUpperCase() == 'LIST' && !fld.items) {
				this.getList(fld);
				flag = true;
			}
			if (String(fld.type).toUpperCase() == 'RADIO' && !fld.items) {
				this.getList(fld);
				flag = true;
			}
			if (String(fld.type).toUpperCase() == 'CHECK' && !fld.items) {
				this.getList(fld);
				flag = true;
			}
		}
		if (this.onOutput) { this.onOutput(); }
		// finalize
		this.refresh();
		this.getData(this.page_num);
	}

	function jsList_getControls() {
		// -- if toolbar is true
		if (this.showToolbar && this.toolbar != null) {
			if (this.controls.length > 0) this.toolbar.addBreak();
			for (i=0; i<this.controls.length; i++) {	
				var cnt = this.controls[i];
				if (String(cnt.param) == 'undefined') cnt.param = '';
				if (String(cnt.caption) == 'undefined') cnt.caption = '';
				if (String(cnt.img) == 'undefined') cnt.img = '';
				if (cnt.img != '') cnt.img = (String(cnt.img).substr(0,1) == '/' ? cnt.img : top.jsUtils.sys_path +'/includes/silk/icons/'+ cnt.img);

				switch (String(cnt.type).toLowerCase()) {
					case 'add':
						this.toolbar.addButton(cnt.caption, top.jsUtils.sys_path +'/includes/silk/icons/add.png', 
							new Function("top.elements['"+ this.name +"'].addNew();"), cnt.caption);
						break;
					case 'delete':
						this.toolbar.addButton(cnt.caption, top.jsUtils.sys_path +'/includes/silk/icons/delete.png', 
							new Function("top.elements['"+ this.name +"'].delRecords();"), cnt.caption);
						break;
					case 'break':
						this.toolbar.addBreak(cnt.caption + cnt.param);
						break;
					case 'save':
						this.toolbar.addButton(cnt.caption, top.jsUtils.sys_path +'/includes/silk/icons/accept.png', 
							new Function("top.elements['"+ this.name +"'].saveData();"), cnt.caption);
						break;
					case 'server':
						this.toolbar.addButton(cnt.caption, cnt.img,
							new Function("top.elements['"+ this.name +"'].serverCall('"+ cnt.param +"');"), cnt.caption);
						break;
					case 'button':
					case 'custom':
					case 'link':
						this.toolbar.addButton(cnt.caption, cnt.img, new Function(cnt.param), cnt.caption);
						break;
					case 'select':						
						var tmp ='<table cellpadding=2 cellspacing=0 class=rtext>'+
							   '<tr><td>-</td><td nowarp>'+
							   '	<a href="javascript: top.elements[\''+ this.name +'\'].selectAll(); '+
							   '				top.elements[\''+ this.name +'\'].toolbar.hideDrop();">All Records</a>'+
							   '</td></tr>'+
							   '<tr><td>-</td><td nowrap>'+
							   '	<a href="javascript: top.elements[\''+ this.name +'\'].selectNone(); '+
							   '				top.elements[\''+ this.name +'\'].toolbar.hideDrop();">None</a>'+
							   '</td></tr>'+
							   '</table>';
						this.toolbar.addDrop(cnt.caption, cnt.img, null, cnt.caption, tmp);
						break;
					case 'choice':
						var choices = cnt.caption.split('|');
						cnt.caption = choices[0]+' <span id=\''+ this.name +'_but'+ i +'_drop\'>'+choices[1]+'</span>';
						var tmp ='<table cellpadding=2 cellspacing=0 class=rtext>';
						for (var k=1; k<choices.length; k++) {
							if (typeof(cnt.param) == 'function') {
								tmp += '<tr><td>-</td><td nowarp>'+
									   '	<a href="javascript: '+ cnt.param +'(\''+ choices[k] +'\');'+
									   '				document.getElementById(\''+ this.name +'_but'+ i +'_drop\').innerHTML = \''+ choices[k] +'\'; '+
									   '				top.elements[\''+ this.name +'\'].toolbar.hideDrop();">'+ choices[k] +'</a>'+
									   '</td></tr>';
							} else {
								if (cnt.param == '' || String(cnt.param) == 'undefined') cmd = 'choice'; else cmd = cnt.param;
								tmp += '<tr><td>-</td><td nowarp>'+
									   '	<a href="javascript: top.elements[\''+ this.name +'\'].serverCall(\''+ cnt.param +'\', { choice: \''+ choices[k] +'\' }); '+
									   '				document.getElementById(\''+ this.name +'_but'+ i +'_drop\').innerHTML = \''+ choices[k] +'\';'+
									   '				top.elements[\''+ this.name +'\'].toolbar.hideDrop();">'+ choices[k] +'</a>'+
									   '</td></tr>';
							}
						}
						tmp += '</table>';
						var but = this.toolbar.addDrop(cnt.caption, cnt.img, null, cnt.caption, tmp);
						break;
					default:
						this.toolbar.addHTML(cnt.caption + cnt.param);
				}
			}
		}
		// if no toolbar (old controls
		var html = '';
		if (!this.showToolbar) {
			html = '<table cellspacing="0" cellpadding="0" class="rText"><tr>';
			for (var i=0; i<this.controls.length; i++) {	
				var cnt = this.controls[i];
				if (String(cnt.param) == 'undefined') cnt.param = '';
				if (String(cnt.caption) == 'undefined') cnt.caption = '';
				if (String(cnt.img) == 'undefined') cnt.img = '';
				if (cnt.img != '') cnt.img = (String(cnt.img).substr(0,1) == '/' ? cnt.img : top.jsUtils.sys_path +'/includes/silk/icons/'+ cnt.img);

				// function jsList_addControl(type, caption, param, img) {

				switch (String(cnt.type).toLowerCase()) {
					case 'add':
						htmp = '<div id="'+ this.name +'_control'+ i + '_div">'+
							   '<table cellpadding=0 cellspacing=0 class="lstButton"><tr>'+
							   '<td style="padding-left:3px;"><img src="'+ top.jsUtils.sys_path +'/includes/silk/icons/add.png"></td>'+
							   '<td nowrap style="padding: 2px; padding-bottom: 1px; padding-left: 5px">'+
							   '	<a style="padding-right: 5px; cursor: pointer; font-weight: bold" id="'+ this.name +'_control'+ i + '" class="rText" '+
							   '		onclick="top.elements[\''+ this.name +'\'].addNew();" '+ cnt.param +'>'+ cnt.caption + '</a>'+
							   '</td>'+
							   '</tr></table></div>';
						break;
					case 'delete':
						htmp = '<div id="'+ this.name +'_control'+ i + '_div">'+
							   '<table cellpadding=0 cellspacing=0 class="lstButton"><tr>'+
							   '<td style="padding-left:3px;"><img src="'+ top.jsUtils.sys_path +'/includes/silk/icons/delete.png"></td>'+
							   '<td nowrap style="padding: 2px; padding-bottom: 1px; padding-left: 5px"><a style="padding-right: 5px; cursor: pointer; font-weight: bold" '+
							   '	id="'+ this.name +'_control'+ i + '" class="rText" onclick="top.elements[\''+ this.name +'\'].delRecords();" '+ cnt.param +'>'+ cnt.caption + '</a></td>'+
							   '</tr></table></div>';
						break;
					case 'save':
						htmp = '<div id="'+ this.name +'_control'+ i + '_div">'+
							   '<table cellpadding=0 cellspacing=0 class="lstButton"><tr>'+
							   '<td style="padding-left:3px;"><img src="'+ top.jsUtils.sys_path +'/includes/silk/icons/accept.png"></td>'+
							   '<td nowrap style="padding: 2px; padding-bottom: 1px; padding-left: 5px"><a style="padding-right: 5px; cursor: pointer; font-weight: bold" '+
							   '	id="'+ this.name +'_control'+ i + '" class="rText" onclick="top.elements[\''+ this.name +'\'].saveData();" '+ cnt.param +'>'+ cnt.caption + '</a></td>'+
							   '</tr></table></div>';
						break;
					case 'server':
						htmp = '<div id="'+ this.name +'_control'+ i + '_div">'+
							   '<table cellpadding=0 cellspacing=0 class="lstButton"><tr>'+
							   (cnt.img != '' ? '<td style="padding-left:3px;"><img src="'+ cnt.img +'"></td>' : '')+
							   '<td nowrap style="padding: 2px; padding-bottom: 1px; padding-left: 5px"><a style="padding-right: 5px; cursor: pointer; font-weight: bold" '+
							   '	id="'+ this.name +'_control'+ i + '" class="rText" onclick="top.elements[\''+ this.name +'\'].serverCall(\''+ cnt.param +'\');">'+ cnt.caption + '</a></td>'+
							   '</tr></table></div>';
						break;
					case 'button':
						htmp = '<div id="'+ this.name +'_control'+ i + '_div">'+
							   '<input id="'+ this.name +'_control'+ i + '" class="rButton" type="button" onclick="'+ cnt.param +'" value="'+ cnt.caption + '">'+
							   '</div>';
						break;
					case 'link':
						htmp = '<div id="'+ this.name +'_control'+ i + '_div">'+
							   '<table cellpadding=0 cellspacing=0 class="lstButton"><tr>'+
							   (cnt.img != '' ? '<td style="padding-left:3px;"><img src="'+ cnt.img +'"></td>' : '')+
							   '<td nowrap style="padding: 2px; padding-bottom: 1px; padding-left: 5px;"><a style="padding-right: 5px; cursor: pointer; font-weight: bold" '+
							   '	id="'+ this.name +'_control'+ i + '" href="'+ cnt.param + '">'+ cnt.caption + '</a></td>'+
							   '</tr></table></div>';
						break;
					case 'custom':
						htmp = '<div id="'+ this.name +'_control'+ i + '_div">'+
							   '<table cellpadding=0 cellspacing=0 class="lstButton"><tr>'+
							   (cnt.img != '' ? '<td style="padding-left:3px;"><img src="'+ cnt.img +'"></td>' : '')+
							   '<td nowrap style="padding: 2px; padding-bottom: 1px; padding-left: 5px;">'+ cnt.caption + '</td>'+
							   '</tr></table></div>';
						break;
					case 'select':
						var tmp  = '<b>'+ cnt.caption +'</b> <a href="javascript: top.elements[\''+ this.name +'\'].selectAll()">All</a> '+
							   '<span style="color: gray">|</span> '+
							   '<a href="javascript: top.elements[\''+ this.name +'\'].selectNone()">None</a>&nbsp;';
						htmp = '<div id="'+ this.name +'_control'+ i + '_div">'+
							   '<table cellpadding=0 cellspacing=0 class="lstButton"><tr>'+
							   (cnt.img != '' ? '<td style="padding-left:3px;"><img src="'+ cnt.img +'"></td>' : '')+
							   '<td nowrap style="padding: 2px; padding-bottom: 1px; padding-left: 5px;">'+ tmp + '</td>'+
							   '</tr></table></div>';
						break;
					case 'choice':
						var choices = cnt.caption.split('|');
						var tmp  = '<b>'+ choices[0] +'</b> ';
						for (var k=1; k<choices.length; k++) {
							if (k != 1) tmp += '<span style="color: gray">|</span> ';
							if (typeof(cnt.param) == 'function') {
								tmp += '<a href="javascript: '+ cnt.param +'(\''+ choices[k] +'\')">'+ choices[k] +'</a>&nbsp;';
							} else {
								if (cnt.param == '' || String(cnt.param) == '') cmd = 'choice'; else cmd = cnt.param;
								tmp += '<a href="javascript: top.elements[\''+ this.name +'\'].serverCall(\''+ cnt.param +'\', { choice: \''+ choices[k] +'\' })">'+ choices[k] +'</a>&nbsp;';
							}
						}
						htmp = '<div id="'+ this.name +'_control'+ i + '_div">'+
							   '<table cellpadding=0 cellspacing=0 class="lstButton"><tr>'+
							   (cnt.img != '' ? '<td style="padding-left:3px;"><img src="'+ cnt.img +'"></td>' : '')+
							   '<td nowrap style="padding: 2px; padding-bottom: 1px; padding-left: 5px;">'+ tmp + '</td>'+
							   '</tr></table></div>';
						break;
					case 'break':
						htmp = '<span style="width: 5px; padding: 5px; color: gray;">|</span>';
						break;
					default:
						htmp = cnt.caption;
						break;
				}
				html += '<td nowrap="nowrap" style="padding-left: 2px; padding-right: 2px;">'+ htmp + '</td>';
			}
			html += '</tr></table>';
		}
		return html;
	}

	function jsList_getFilters() {
		var html = '<select onchange="top.elements[\''+ this.name + '\'].applyFilter(this.value);" class=rText style="margin-right: 10px; padding: 1px; background: white;">';
		var filters = this.filters.split(',');	
		for (i=0; i<filters.length; i++) {
			html += '<option value="'+ filters[i] +'" '+ (this.srvParams['filter'] == filters[i] ? 'selected' : '')+'>'+ filters[i] +'</option>';
		}
		html += '</select>';
		return (this.filters == '' ? '' : 'Filter: ' + html);
	}

	function jsList_getSearches() {
		html = '';
		html = '<table cellspacing="0" cellpadding="2" class="lstSearch_tbl">';
		for (var i = 0; i < this.searchFields.length; i++) {
			btn = '';
			if (i == 0) btn = '<input type="button" value="X" class="rButton" onclick="obj = top.elements[\''+ this.name +'\']; if (obj) { obj.openSearch(false); }" style="width: 22px; text-align: center;">';
			html += '<tr>'+
					'<td width="20px" style="padding-right: 20px">'+ btn +'</td>' +
						 this.searchFields[i].build('nowrap="nowrap"') +
					'</tr>';
		}
		html += '<tr>'+
				'	<td colspan="2" class="lstSearch_caption"></td>'+
				'	<td class="lstSearch_caption" style="border-right: 0px"></td>'+
				'	<td colspan="2" class="lstSearch_value" style="padding-top: 10px; padding-bottom: 6px;" nowrap>'+
				'		<input type="button" onclick="obj = top.elements[\''+ this.name +'\']; if (obj) { obj.submitSearch(); }" style="width: 70px" class="rButton" value="Search">'+
				'		<input type="button" onclick="obj = top.elements[\''+ this.name +'\']; if (obj) { obj.clearSearch(); obj.submitSearch(); }" style="width: 70px" class="rButton" value="Clear">'+
				'	</td>'+
				'</tr></table>';
		return html;
	}

	function jsList_showPage(newPage) {
		if (newPage < 0) newPage = 0;
		if (newPage > this.page_count) newPage = this.page_count-1;
		this.items = [];  
		this.refresh(); 
		this.page_num = newPage; 
		this.getData();
	}

	function jsList_getFooter() {
		// generate footer
		var pages  = "";
		var pagesa = "";
		var istart = Math.floor(this.count / this.items_pp + 0.999);
		
		this.page_count = istart;
		if (istart > 8) {
			istart = 8;
			if (this.smallPageNav) {
				pagesa = "<div style=\"float: left; padding-left: 15px;\">"+
						 "		<input type=\"button\" value=\"<<\" class=\"sText\" style=\"width: 30px\" "+
						 "  		onclick=\"top.elements[\'"+ this.name +"\'].showPage(top.elements[\'"+ this.name +"\'].page_num - 1)\" "+
						 "		>"+
						 "		<input type=\"button\" value=\">>\" class=\"sText\" style=\"width: 30px\" "+
						 "  		onclick=\"top.elements[\'"+ this.name +"\'].showPage(top.elements[\'"+ this.name +"\'].page_num + 1)\" "+
						 "		>"+
						 "</div>";
			} else {
				pagesa = "<div style=\"float: left; padding-left: 15px;\">"+
						 "		<input type=\"button\" value=\"<<\" class=\"sText\" style=\"width: 30px\" "+
						 "  		onclick=\"top.elements[\'"+ this.name +"\'].showPage(top.elements[\'"+ this.name +"\'].page_num - 1)\" "+
						 "		>"+
						 "		<input type=\"text\" size=\"4\" class=\"sText\" value=\""+ (this.page_num+1) +"\" "+
						 "			onclick=\"this.select();\" style=\"text-align: center;\" "+
						 "			onkeyup=\"if (event.keyCode != 13) return;  "+
						 "					  if (this.value < 1) this.value = 1; "+
						 "					  top.elements[\'"+ this.name +"\'].showPage(parseInt(this.value-1)); \"> "+
						 "		<input type=\"button\" value=\">>\" class=\"sText\" style=\"width: 30px\" "+
						 "  		onclick=\"top.elements[\'"+ this.name +"\'].showPage(top.elements[\'"+ this.name +"\'].page_num + 1)\" "+
						 "		>"+
						 "</div>";
			}
		}
		if (!this.smallPageNav) {
			for (i=1; i<=istart; i++) {
				if (i == this.page_num+1) { cName = 'lstFooter_current_page'; } else { cName = 'lstFooter_page'; }
				pages += '<div class="'+ cName +'" style="float: left; cursor: pointer;" '+
						 '  onmouseover = "this.className = \'lstFooter_selected_page\';" '+
						 '  onmouseout  = "this.className = \''+ cName +'\';" '+
						 '	onclick = "top.elements[\''+ this.name +'\'].showPage('+ (i-1) +')"'+
						 '>' + i + '</div>';
			}
		} else {
			pages  = "<div style=\"float: left; padding-left: 15px;\">"+
				 "		<input type=\"button\" value=\"<<\" class=\"sText\" style=\"width: 30px\" "+
				 "  		onclick=\"top.elements[\'"+ this.name +"\'].showPage(top.elements[\'"+ this.name +"\'].page_num - 1)\" "+
				 "		>"+
				 "		<input type=\"button\" value=\">>\" class=\"sText\" style=\"width: 30px\" "+
				 "  		onclick=\"top.elements[\'"+ this.name +"\'].showPage(top.elements[\'"+ this.name +"\'].page_num + 1)\" "+
				 "		>"+
				 "</div>";
		}
		return pages + pagesa;
	}

	function jsList_getHeaders() {
		html = '';
		switch (this.layout) {
			case 'table':
				if (this.showTabHeader) {
					html += '<thead id="mthead_'+ this.name +'"><tr>';
					if (this.showTabNumber) html += '<td id="'+ this.name +'_cell_header_number" class="lstBody_head" width="18px" style="cursor: default;">'+
													'	<div class="lstBody_number" style="width: 18px; overflow: hidden; text-align: left;">#</div>'+
													'</td>';
					for (i=0; i<this.columns.length; i++) {
						var col = this.columns[i];
						if (this.sortBy[i] && this.sortBy[i] != '') {
							if (this.sortBy[i].indexOf('ASC') > 0) img = 'sort_down.png'; else img = 'sort_up.png';
							sortStyle = 'background-color: #edf5f9; background-image: url('+ top.jsUtils.sys_path +'/images/'+ img +'); background-repeat: no-repeat; background-position: center right; ';
						} else {
							sortStyle = '';
						}
						html += '<td id="'+ this.name +'_cell_header_'+ i +'" onclick="top.elements[\''+ this.name +'\'].columnClick('+ i +', event);" class="lstBody_head" width="'+ col.size +'" '+
								'		style="'+ sortStyle +'cursor: default;" nowrap="nowrap">'+
								'<div style="overflow: hidden; padding: 2px;">'+ col.caption +'</div>'+
								'</td>';
					}
					//html += '<td id="mtcell_'+ this.name +'" class="lstBody_head" style="padding-left: 10px; border-left: 0px;">&nbsp;</td>';
					html += '</tr></thead>';
				} else {
				}
				break;
			case 'div':
				break;
		}
		return html;
	}

	function jsList_getRecords() {
		html = '';
		switch (this.layout) {
			case 'table':
				html += '<tbody id="mtbody_'+ this.name + '">';
				for (i=0; i<this.items_pp; i++) {
					// empty line
					if (!this.items[i]) { continue; }
					// set text and bg color if any
					var	tmp_color = '';
					var tmp_colors = this.colors[this.items[i].id];
					if (tmp_colors != undefined && tmp_colors != '') {
						tmp_colors = tmp_colors.split('::');
						if (tmp_colors[0] != '') tmp_color += 'color: '+ tmp_colors[0] +';';
						if (tmp_colors[1] != '') tmp_color += 'background-color: '+ tmp_colors[1] + ';';
					}
					if (this.items[i].selected) {
						html += '<tr id="'+ this.name +'_line_'+ i +'" class="lstBody_selected" ' +
								'    onclick     = "top.elements[\''+ this.name +'\'].lstClick('+ i +', event);" '+
								'    ondblclick  = "top.elements[\''+ this.name +'\'].lstDblClick('+ i +', event);" '+
								'    onmouseup = "if (document.all) document.selection.empty(); else window.getSelection().removeAllRanges();" '+
								//'    onmousemove = "if (document.all) document.selection.empty(); else window.getSelection().removeAllRanges();" '+
								'	 custom_style="'+ tmp_color +'"'+
								'>';
					} else {
						html += '<tr id="'+ this.name +'_line_'+ i +'" class="'+ (i%2 == 0 ? 'lstBody_odd' : 'lstBody_even') + '" ' + 
								'    onmouseover = "if (this.getAttribute(\'selected\') == \'yes\') { return; } this.className = \''+ (i%2 == 0 ? 'lstBody_odd_hover' : 'lstBody_even_hover') + '\'; this.style.cssText = \'\';" '+
								'    onmouseout  = "if (this.getAttribute(\'selected\') == \'yes\') { return; } this.className = \''+ (i%2 == 0 ? 'lstBody_odd' : 'lstBody_even') + '\'; this.style.cssText = \''+ tmp_color +'\';" '+
								'    onclick     = "top.elements[\''+ this.name +'\'].lstClick('+ i +', event);" '+
								'    ondblclick  = "top.elements[\''+ this.name +'\'].lstDblClick('+ i +', event);" '+
								'    onmouseup = "if (document.all) document.selection.empty(); else window.getSelection().removeAllRanges();" '+
								//'    onmousemove = "if (document.all) document.selection.empty(); else window.getSelection().removeAllRanges();" '+
								'	 custom_style="'+ tmp_color +'"'+
								'	 style="'+ tmp_color +'"'+
								'>';
					}
					num = (parseInt(this.page_num) * parseInt(this.items_pp)) + parseInt(i+1);
					if (this.showTabNumber) html += '<td id="'+ this.name +'_cell_'+ i +'_number" width="20px" class="lstBody_head" style="padding-left: 0px;">'+
													'	<div class="lstBody_number" style="width: 20px; overflow: hidden; text-align: left; padding-left: 0px;">'+ num +'</div>'+
													'</td>';
					j = 0;
					while (true) {
						var col = this.columns[j];
						// prepare cell data
						printItem = this.items[i].values[j];
						switch (col.type.toUpperCase()) {
							case 'URL':
								pos = printItem.indexOf('/', 8);
								printItem = '<a href="' + printItem + '" target="_blank">'+
											printItem.substr(0, pos) + '</a>';
								break;

							case 'REPEAT':
								if (i > 0 && this.items[i].values[j] == this.items[i-1].values[j]
										  && this.items[i].values[j] != '')
									printItem = '-- // --';
								break;
						}
						// prepare cell
						if (this.editable[j] != undefined) { cellPadding = 0; }
													  else { cellPadding = this.tblPadding; }
						html += '<td valign=top id="'+ this.name +'_cell_'+ i +'_'+ j +'" class="lstBody_td" width="'+ col.size +'" '+
								'style="cursor: default;" '+ col.attr +'>';
						if (this.fixed) {
							// this is for editable controls
							tmp = String(this.editable[j]).split('::');
							switch (tmp[0].toUpperCase()) {
								case 'TEXT':
									var ttmp = printItem.split('::');
									if (!ttmp[1]) ttmp[1] = '';
									if (ttmp[0] != tmp[2]) {
										html +=	'<input id="'+ this.name +'_edit_'+ i +'_'+ j +'" class="rText" type="text" '+
												'	style="border: 1px solid #d2cedf; width: 100%; margin: 0; padding: '+ (this.tblPadding-2) +'; '+ (tmp[1] != undefined ? tmp[1] : '') +'" '+
												'	oldvalue="'+ printItem +'" value="'+ printItem +'" '+
												'	onclick="this.select(); this.focus();"'+
												'	onkeyup="if (event.keyCode == 40 || event.keyCode == 13) { el = document.getElementById(\''+ this.name +'_edit_'+ (i+1) +'_'+ j +'\'); if (el) {el.select(); el.focus(); } } '+
												'			 if (event.keyCode == 38) { el = document.getElementById(\''+ this.name +'_edit_'+ (i-1) +'_'+ j +'\'); if (el) {el.select(); el.focus(); } } "'+
												'	onfocus="obj = top.elements[\''+ this.name +'\']; obj.lstClick('+ i +', event);"'+
												'	onblur="if (this.getAttribute(\'oldvalue\') != this.value) { this.style.backgroundColor = \'#ffffb2\'; '+ (this.onEditableChange ? 'top.elements.'+ this.name +'.onEditableChange(this);' : '') +' } else { this.style.backgroundColor = \'white\'; }"'+
												'>';
									} else {
										html +=	'<div style="overflow: hidden; '+ this.divStyle + '">'+ ttmp[1] +'</div>';
									}
									break;
								case 'INT':
									var ttmp = printItem.split('::');
									if (!ttmp[1]) ttmp[1] = '';
									if (ttmp[0] != tmp[2]) {
										html +=	'<input id="'+ this.name +'_edit_'+ i +'_'+ j +'" class="rText" type="text" '+
												'	style="border: 1px solid #d2cedf; width: 100%; margin: 0; padding: '+ (this.tblPadding-2) +'; '+ (tmp[1] != undefined ? tmp[1] : '') +'" '+
												'	oldvalue="'+ printItem +'" value="'+ printItem +'" '+
												'	onclick="this.select(); this.focus();"'+
												'	onkeyup="if (event.keyCode == 40 || event.keyCode == 13) { el = document.getElementById(\''+ this.name +'_edit_'+ (i+1) +'_'+ j +'\'); if (el) {el.select(); el.focus(); } } '+
												'			 if (event.keyCode == 38) { el = document.getElementById(\''+ this.name +'_edit_'+ (i-1) +'_'+ j +'\'); if (el) {el.select(); el.focus(); } } "'+
												'	onfocus="obj = top.elements[\''+ this.name +'\']; obj.lstClick('+ i +', event);"'+
												'	onblur="if (!top.jsUtils.isInt(this.value)) { this.value = this.getAttribute(\'oldvalue\'); } if (this.getAttribute(\'oldvalue\') != this.value) { this.style.backgroundColor = \'#ffffb2\'; '+ (this.onEditableChange ? 'top.elements.'+ this.name +'.onEditableChange(this);' : '') +' } else { this.style.backgroundColor = \'white\'; }"'+
												'>';
									} else {
										html +=	'<div style="overflow: hidden; '+ this.divStyle + '">'+ ttmp[1] +'</div>';
									}
									break;
								case 'FLOAT':
									var ttmp = printItem.split('::');
									if (!ttmp[1]) ttmp[1] = '';
									if (ttmp[0] != tmp[2]) {
										html +=	'<input id="'+ this.name +'_edit_'+ i +'_'+ j +'" class="rText" type="text" '+
												'	style="border: 1px solid #d2cedf; width: 100%; margin: 0; padding: '+ (this.tblPadding-2) +'; '+ (tmp[1] != undefined ? tmp[1] : '') +'" '+
												'	oldvalue="'+ printItem +'" value="'+ printItem +'" '+
												'	onclick="this.select(); this.focus();"'+
												'	onkeyup="if (event.keyCode == 40 || event.keyCode == 13) { el = document.getElementById(\''+ this.name +'_edit_'+ (i+1) +'_'+ j +'\'); if (el) {el.select(); el.focus(); } } '+
												'			 if (event.keyCode == 38) { el = document.getElementById(\''+ this.name +'_edit_'+ (i-1) +'_'+ j +'\'); if (el) {el.select(); el.focus(); } } "'+
												'	onfocus="obj = top.elements[\''+ this.name +'\']; obj.lstClick('+ i +', event);"'+
												'	onblur="if (!top.jsUtils.isFloat(this.value)) { this.value = this.getAttribute(\'oldvalue\'); } if (this.getAttribute(\'oldvalue\') != this.value) { this.style.backgroundColor = \'#ffffb2\'; '+ (this.onEditableChange ? 'top.elements.'+ this.name +'.onEditableChange(this);' : '') +'} else { this.style.backgroundColor = \'white\'; }"'+
												'';
									} else {
										html +=	'<div style="overflow: hidden; '+ this.divStyle + '">'+ ttmp[1] +'</div>';
									}
									break;
								default:
									html +=	'<div style="overflow: hidden; '+ this.divStyle + '" '+
											' onmouseover="if (this.title == \'\' ) { if (top.jsUtils.stripTags) this.title = top.jsUtils.stripTags(this.innerHTML);} ">'+ printItem +'</div>';
									break;
							}
						} else {
							html +=	'<div style="padding: '+ this.tblPadding +';">' + printItem + '</div>';
						}
						html += '</td>';
						j++;
						if (this.items[i].values[j] == undefined) break;
						if (this.columns[j] == undefined) break;
					}
					html += '</tr>';
				}
				html += '</tbody>';
				break;

			case 'div':
				if (this.items.length == 0) html += this.tmpl_empty.replace('~msg~', this.msgNodata);
				var tmp_last_grp = '';
				for (i=0; i<this.items.length; i++) {
					var item = this.items[i].values;
					// prepare group section
					var tmp  = this.tmpl_group;
					while (tmp.indexOf('~field0~') > 0) { tmp = tmp.replace('~field0~', this.items[i].id); }
					while (tmp.indexOf('~FIELD0~') > 0) { tmp = tmp.replace('~FIELD0~', this.items[i].id); }
					while (tmp.indexOf('~class~') > 0)  { tmp = tmp.replace('~class~', (i % 2 == 0 ? 'lstBody_odd' : 'lstBody_even')); }
					while (tmp.indexOf('~CLASS~') > 0)  { tmp = tmp.replace('~CLASS~', (i % 2 == 0 ? 'lstBody_odd' : 'lstBody_even')); }
					for (var k=0; k<item.length; k++) {
						while (tmp.indexOf('~field'+(k+1)+'~') > 0) { tmp = tmp.replace('~field'+(k+1)+'~', item[k]); }
						while (tmp.indexOf('~FIELD'+(k+1)+'~') > 0) { tmp = tmp.replace('~FIELD'+(k+1)+'~', item[k]); }
					}
					if (tmp != tmp_last_grp) { html += tmp; tmp_last_grp = tmp; }
					// prepare repeatable section
					var tmp  = this.tmpl;
					while (tmp.indexOf('~field0~') > 0) { tmp = tmp.replace('~field0~', this.items[i].id); }
					while (tmp.indexOf('~FIELD0~') > 0) { tmp = tmp.replace('~FIELD0~', this.items[i].id); }
					while (tmp.indexOf('~class~') > 0)  { tmp = tmp.replace('~class~', (i % 2 == 0 ? 'lstBody_odd' : 'lstBody_even')); }
					while (tmp.indexOf('~CLASS~') > 0)  { tmp = tmp.replace('~CLASS~', (i % 2 == 0 ? 'lstBody_odd' : 'lstBody_even')); }
					for (var k=0; k<item.length; k++) {
						while (tmp.indexOf('~field'+(k+1)+'~') > 0) { tmp = tmp.replace('~field'+(k+1)+'~', item[k]); }
						while (tmp.indexOf('~FIELD'+(k+1)+'~') > 0) { tmp = tmp.replace('~FIELD'+(k+1)+'~', item[k]); }
					}
					html += tmp;
				}
				break;
		}
		return html;
	}

	function jsList_lstClick(ind, evnt) {
		if (!this.box) return;
		if (this.showSearch) this.openSearch(false); // show search if it is open
		if (document.all) this.box.ownerDocument.selection.empty(); else window.getSelection().removeAllRanges();
		if (this.onClick) {
			fl = this.onClick(this.items[ind].id, evnt);
			if (fl === false) return;
		}
		// clear other if necessary
		if (!evnt.ctrlKey && !evnt.shiftKey) {
			for (i=0; i<this.items.length; i++) { this.items[i].select(false); }
		}
		if (evnt.shiftKey) {
			var cnt = 0; var firsti = null;
			for (i=0; i<this.items.length; i++) { if (this.items[i].selected) { cnt++; if (!firsti) firsti = i; } }
			if (cnt >  1) {
				for (i=0; i<this.items.length; i++) { this.items[i].select(false); }
				//this.refresh();
			}
			if (cnt == 1) {
				if (ind > firsti) {
					for (i=firsti; i<=ind; i++) { this.items[i].select(true); }
				} else {
					for (i=ind; i<=firsti; i++) { this.items[i].select(true); }
				}
				//this.refresh();
				return;
			}
		}
		// select new
		if (this.items[ind]) this.items[ind].select();
	}

	function jsList_lstDblClick(ind, evnt) {
		if (!this.box) return;
		// if it is a function or a command
		if (typeof(this.onDblClick) == 'function') {
			if (this.items[ind]) {
				fl = this.onDblClick(this.items[ind].id, evnt);
				if (fl === false) return;
			}
		} else if (this.onDblClick != undefined && this.onDblClick != '') {
			this.serverCall(this.onDblClick);
			return;
		}
		// if nothing is defined, then use Edit URL function or command
		var obj = this.onAddOrEdit;
		if (obj) {
			if (typeof(obj) == 'function') {
				obj(this.items[ind].id);
			} else if (typeof(obj) == 'object') {
				obj.box = this.box;
				obj.recid = this.items[ind].id;
				obj.output(); 
			} else {
				top.elements[obj].box = this.box;
				top.elements[obj].recid = this.items[ind].id;
				top.elements[obj].output(); 
			}
		}
	}

	function jsList_columnClick(ind, evnt) {
		if (this.onSort) {
			fl = this.onSort(parseInt(ind) + 1, evnt);
			if (fl === false) return;
		}
		// if control key is not pressed
		tmp = this.sortBy[ind];
		if (!evnt.ctrlKey) this.sortBy = [];
		if (tmp) this.sortBy[ind] = tmp;
		indOrder = parseInt(ind) + 2;
		switch(this.sortBy[ind]) {
			case undefined: 
				this.sortBy[ind] = indOrder + ' ASC';
				break;
			case indOrder + ' ASC':
				this.sortBy[ind] = indOrder + ' DESC';
				break;
			case indOrder + ' DESC':
				this.sortBy.splice(ind);
				break;
		}
		this.getData();
	}
	
	function jsList_selectAll() {
		for (var i=0; i<this.items.length; i++) { this.items[i].select(true); }
	}

	function jsList_selectNone() {
		for (var i=0; i<this.items.length; i++) { this.items[i].select(false); }
	}

	function jsList_getSelected(sep) {
		if (!sep) sep = ',';
		recs = '';
		for (i=0; i<this.items.length; i++) {
			if (this.items[i].selected) recs += this.items[i].id + sep;
		}
		if (recs.length > 0 && recs.substr(recs.length-sep.length) == sep) recs = recs.substr(0, recs.length-sep.length);
		return recs;
	}

	function jsList_getItem(itemid) {
		for (i=0; i<this.items.length; i++) {
			if (this.items[i].id == itemid) return this.items[i];
		}
		return null;
	}

	function jsList_getData() {
		if (!this.box) return;
		if (this.fieldList > 0) return;
		if (this.onData) this.onData();
		this.showStatus('Refreshing...');
		this.items = [];
		this.serverCall('lst_get_data');
	}

	function jsList_dataReceived() {
		this.refresh();
		this.hideStatus();
		if (this.onDataReceived) { this.onDataReceived(); }
	}

	function jsList_delRecords() {
		if (!this.box) return;
		recs = this.getSelected();
		if (recs == '') return;
		if (this.msgDelete != '') {
			ans = confirm(this.msgDelete);
			if (!ans) return;
		}
		if (this.onDelete) this.onDelete();
		// call delete script
		this.serverCall('lst_del_records');
	}

	function jsList_serverCall(cmd, params) {
		if (!this.box) return;
		var param = [];
		// add list params
		param['req_name'] 	 = this.name;
		param['req_cmd']  	 = cmd;
		param['req_limit']   = this.items_pp;
		param['req_offset']  = this.page_num * this.items_pp;
		param['req_count']   = -1;
		param['req_ids']  	 = this.getSelected();
		// if there is a recid (some some edit connections)
		if (this.recid != null) param['req_recid'] = this.recid;
		// add custom params
		for (obj in this.srvParams) param[obj] = this.srvParams[obj];
		// get search data fields
		this.searchData = [];
		this.searchFlag = false;
		for (var si = 0; si < this.searchFields.length; si++) {
			var sel  = this.box.ownerDocument.getElementById(this.name + '_field' + this.searchFields[si].index);
			var sel2 = this.box.ownerDocument.getElementById(this.name + '_field' + this.searchFields[si].index + '_2');
			if ( (!sel || sel.value == '') &&
				 (this.searchFields[si].defValue == '' || this.searchFields[si].defValue == null) &&
				 (this.searchFields[si].value == '' || this.searchFields[si].value == null) ) continue;
			this.searchFlag = true;
			if (sel2) { if (sel2.value != '') el2dsp = '::' + sel2.value; else el2dsp = '::' + sel.value; } else el2dsp = '';
			if (sel) { 
				this.searchData[this.searchFields[si].fieldName] = sel.value + el2dsp; 
			} else {
				if (this.searchFields[si].value != null && this.searchFields[si].value != '') {
					this.searchData[this.searchFields[si].fieldName] = this.searchFields[si].value; 
				} else {
					this.searchData[this.searchFields[si].fieldName] = this.searchFields[si].defValue; 
				}
			}
			this.searchFields[si].value = this.searchData[this.searchFields[si].fieldName];
		}
		param['req_search']  = (this.searchFlag == true ? this.searchData : '');
		param['req_sort']    = (this.sortBy.length != 0 ? this.sortBy : '');
		// add passed params
		if (typeof(params) == 'object') {
			for(p in params) { param[p] = params[p]; }
		} else {
			if (params != undefined && params != '') {
				var tmp = params.split(';;');
				for (var i=0; i<tmp.length; i++) {
					var t = tmp[i].split('::');
					param[t[0]] = t[1];
				}
			}
		}
		// generate and append SCRIPT tag
		var req = this.box.ownerDocument.createElement('SCRIPT');
		req.src = this.srvFile + (this.srvFile.indexOf('?') > -1 ? '&' : '?') + 'cmd=' + top.jsUtils.serialize(param) + '&rnd=' + Math.random();
		this.box.ownerDocument.body.appendChild(req);
	}

	function jsList_saveData() {
		if (!this.box) return;
		// build new edits
		var editData = [];
		flag = false;
		for (i=0; i<this.items.length; i++) {
			tmp = this.items[i].id;
			for (j=0; j<this.columns.length; j++) {
				if (this.editable[j] != undefined) {
					el = this.box.ownerDocument.getElementById(this.name +'_edit_'+ i +'_'+ j);
					if (el) {
						if (el.getAttribute('oldvalue') == el.value) continue;
						flag = true;
						if (editData[tmp] == undefined) editData[tmp] = '';
						if (editData[tmp] != '') editData[tmp] += ';;';
						editData[tmp] += j+'^^'+el.value;
					}
				}
			}
		}
		if (!flag) return;
		// call server
		this.serverCall('lst_save_data', { req_data: editData });
	}

	function jsList_showStatus(msg) {
		if (!this.box) return;
		el = this.box.ownerDocument.getElementById('status_'+this.name);
		if (el) {
			el.innerHTML = msg;
			el.style.display = '';
		}
	}

	function jsList_hideStatus(msg) {
		if (!this.box) return;
		el = this.box.ownerDocument.getElementById('status_'+this.name);
		if (el) {
			el.style.display = 'none';
			el.innerHTML = '';
		}
	}
	
	// initialize object if necessary
	if (box != null && typeof(box) == 'object' && String(box) == '[object Object]') { // javascript object
		this.box = null;
		for (var e in box) { this[e] = box[e]; }
	}	
}
if (top != window) top.jsListItem = jsListItem;
if (top != window) top.jsList = jsList;