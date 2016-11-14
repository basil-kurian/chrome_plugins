function Model(id, opposite, datasourceCallBack) {
	this.id = id;
	this.opposite = opposite;
	if("function" !== typeof datasourceCallBack){
		throw "datasourceCallBack should be function";
	} 
	this.datasourceCallBack = datasourceCallBack;
	this.rows = 0;
	this.data = undefined;
}

Model.prototype.getId = function() {
	return this.id;
}

Model.prototype.getOpposite = function() {
	return this.opposite;
}

Model.prototype.getTableData = function() {
	return "undefined" !== typeof datasourceCallBack && (this.datasourceCallBack())
}

Model.prototype.setCounts = function() {
	$(this.getId() + "Count").html(this.getCount());
}

Model.prototype.getCount = function() {
	return this.datasourceCallBack().length
}

Model.prototype.registerSaveButtonEvents = function() {
	var callBack = this.saveButtonCallBack();
	var resetcallBack = this.resetButtonCallBack();
	"undefined" !== typeof callBack && ($(this.getId()+"Save").on("click", callBack));
	"undefined" !== typeof resetcallBack && ($(this.getId()+"Reset").on("click", resetcallBack));
}

Model.prototype.saveButtonCallBack = function() {
	return undefined;
}

Model.prototype.resetButtonCallBack = function() {
	var me = this;
	return function() {
		console.log(me.getId())
		$(me.getId()+"Form")[0].reset();
	}
}

Model.prototype.initialize = function() {
	this.registerSaveButtonEvents();
	this.setCounts();
	this.initializeTable()
}

Model.prototype.initializeTable = function() {
	var data = this.datasourceCallBack();
	for(var i = 0; i < data.length; i++ ){
		this.updateTable(data[i]);
	}
}

Model.prototype.remove = function(id) {
	console.log(id);
	console.log(this.datasourceCallBack());
	this.datasourceCallBack().splice(id, 1);
	console.log(this.datasourceCallBack());
	this.rows = 0;
	var content = $(this.getId() + "Content")[0];
	content.innerHTML = "";
	this.initializeTable();
	this.setCounts();
}

Model.prototype.getOrder = function() {
	return undefined;
}

Model.prototype.updateTable = function(data) {
	var i = 0;
	var index = this.rows;
	var me = this;
	var content = $(this.getId() + "Content");
	var row = $("<tr>");
	this.rows++;
	row.append("<td>"+ this.rows + "</td>");
	var order = this.getOrder();
	for (var v in data) {
		var value = order ? order[i++] : v;
		row.append("<td>"+data[value]+"</td>");
	}
	var btn = $('<a href="#" class="btn btn-xs btn-danger btn-block">');
	btn.on("click", function(r){me.remove(index)});
	btn.append('<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>');
	row.append(btn);
	content.append(row);
}

Model.prototype.validate = function(data, errorMessage, validation_callback){
	if (!this.internalValidation(data, validation_callback)) {
		console.log(errorMessage);
		$("#error").html(errorMessage);
		$('#myModal').modal('show');
		return false;
	}
	return true;
}

Model.prototype.internalValidation = function(data, validation_callback){
	return "function" === typeof validation_callback ? validation_callback(data) : "undefined" !== typeof data;
}


var UI = {
	'background' : undefined,
	'validateAndSaveTextBoxData' : function(event) {
		var target = event.target;
		var id = event.target.id;
		var value = event.target.value;
		UI.background.BookingData[id] = value;
		UI.save();
		if (value && id === "mobileNumber"){
			target.classList.remove("invalid");
		} else if (id === "mobileNumber") {
			target.classList.add("invalid");
		} 
	},
	'validateAndSaveCheckBoxData' : function(event) {
		var target = event.target;
		var id = event.target.id;
		var value = event.target.checked;
		if (id){
			UI.background.BookingData[id] = value;
			UI.save();
		}
	},
	'validateAndSaveRadioData' : function(event) {
		UI.background.BookingData.bookingCond = parseInt(event.target.value);
		UI.save();
	},
	"save" : function() {
		chrome.storage.local.set(UI.background.BookingData);
	},
	"initialize": function() {
		$(document).ready(function(){
			 UI.background = chrome.extension.getBackgroundPage();
			 var passenger = new Model("#passenger", "#children", function () {
				 return UI.background.BookingData.passengers;
			 });
			 passenger.saveButtonCallBack = function() {
				 var me = this;
				 return function() {
						if (!me.validate(me.getCount(), "Cannot add more than 6 passengers", function(data){return data < 6;})) return;
						var name 	= 	$("#passengerName").val();
						var age 	= 	$("#passengerAge").val();
						var gender 	= 	$("input[name='passengerGender']:checked")[0].defaultValue;
						var berth 	= 	$("#passengerBerth").val();
						if (!me.validate(name, "Name cannot be empty",  function (data) {return "undefined" !== typeof data && data !== "" && data.length !== 0;}) || !me.validate(age, "Age cannot be empty",  function (data) {return "undefined" !== typeof data && data !== "" && data.length !== 0;})) return;
						var passenger = new UI.background.Passenger(name, age, gender, berth);
						UI.background.BookingData.passengers.push(passenger);
						me.setCounts();
						me.updateTable(passenger);
						$("#passengerForm")[0].reset();
						UI.save();
						$("#passengerName").focus();
					};
			 }
			 passenger.getOrder = function() {
				 return ["name", "age", "gender", "berth"];
			 };
			 passenger.removeBackup = passenger.remove;
			 passenger.remove = function(index) {
				 console.log("Remove called");
				 passenger.removeBackup(index);
				 UI.save();
			 };
			 passenger.initialize();
			 
			 
			var children = new Model("#children", "#passenger", function (){
				return UI.background.BookingData.children;
			});
			children.saveButtonCallBack = function() {
				 var me = this;
				 return function() {
					 if (!me.validate(me.getCount(), "Cannot add more than 2 Children", function(data){return data < 2;})) return;
						
						var name 	= 	$("#childrenName").val();
						var age 	= 	$("#childrenAge").val();
						var gender 	= 	$("input[name='childrenGender']:checked")[0].defaultValue;
						if (!me.validate(name, "Name cannot be Empty for children", function (data) {return "undefined" !== typeof data && data !== "" && data.length !== 0;}) || !(me.validate(age, "Age cannot be empty",  function (data) {return "undefined" !== typeof data && data !== "" && data.length !== 0;}) && me.validate(age, "Children whose age is more than 4 is not considered as infant", function(data){return parseInt(data) >= 0 && parseInt(data) < 5; }))) return;
						var child = new UI.background.Children(name, age, gender);
						UI.background.BookingData.children.push(child);
						me.setCounts();
						me.updateTable(child);
						$("#childrenForm")[0].reset();
						UI.save();
						$("#childrenName").focus();
					};
			};
			children.getOrder = function() {
				 return ["name", "age", "gender"];
			 };
			children.removeBackup = children.remove;
			children.remove = function(index) {
				 console.log("Remove called");
				 children.removeBackup(index);
				 UI.save();
			 }
			children.initialize();
		
			$('input[type="text"].otherInfo').each(function(number, target){
				var data = UI.background.BookingData[target.id];
				data && (target.value = data);
			});
			$('input[type="checkbox"].otherInfo').each(function(number, target){
				target.checked = UI.background.BookingData[target.id];
			});
			$('input[name="bookingCond"]')[UI.background.BookingData.bookingCond].checked = true;
			
			$('input[type="text"].otherInfo').blur(UI.validateAndSaveTextBoxData);
			$('input[type="checkbox"].otherInfo').change(UI.validateAndSaveCheckBoxData);
			$('input[name="bookingCond"]').change(UI.validateAndSaveRadioData);
			console.log(UI.background.BookingData);
		});
	}
}

UI.initialize();