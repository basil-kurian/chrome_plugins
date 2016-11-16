var Booking = {
	bookingData: undefined,
	fillOtherDetails: function(form) {
		if (form.id === "addPassengerForm"){
			new Event("content.details.fill.other.start", Booking.bookingData).fire();
			Booking.bookingData.mobileNumber && (form['addPassengerForm:mobileNo'].value = Booking.bookingData.mobileNumber);
			Booking.bookingData.boardingStation && (form['addPassengerForm:boardingStation'] = Booking.bookingData.boardingStation);
			if (form['addPassengerForm:travelInsurance']){
				if (Booking.bookingData.travel_insurance) {
					form['addPassengerForm:travelInsurance:0'].checked = true;
				} else {
					form['addPassengerForm:travelInsurance:1'].checked = true;
				}
			}
			
			form['addPassengerForm:autoUpgrade']&& (form['addPassengerForm:autoUpgrade'].checked = Booking.bookingData.consider_auto_upgrade);
			form['addPassengerForm:onlyConfirmBerths'] && ( form['addPassengerForm:onlyConfirmBerths'].checked = Booking.bookingData.onlyConfirmBerths);
			form['addPassengerForm:bookingCond'] && (form['addPassengerForm:bookingCond'][Booking.bookingData.bookingCond].checked = true);
			if (Booking.bookingData.preferedCoach && form['addPassengerForm:prefCoachOpt']){
				form['addPassengerForm:prefCoachOpt'].checked = true;
				form['addPassengerForm:coachID'].value = Booking.bookingData.preferedCoach;
			}
			new Event("content.details.fill.other.end", Booking.bookingData).fire();
		}
	},
	fillPassengerDetails: function(form) {
		if (form.id === "addPassengerForm"){
			new Event("content.details.fill.passenger.start", Booking.bookingData.passengers).fire();
			if (!(Booking.bookingData.passengers && Booking.bookingData.passengers.length > 0)) return;
			new Event("content.details.fill.passenger.success", Booking.bookingData.passengers).fire();
			var limit = parseInt(form['addPassengerForm:maxPassengersH'].value) < Booking.bookingData.passengers.length ? parseInt(form['addPassengerForm:maxPassengersH'].value) : Booking.bookingData.passengers.length;
			for (var num = 0; num < limit; num++){
					var p = Booking.bookingData.passengers[num];
					var fObject = { 
						  name: form.querySelector("input[size^=\'16\'][id^=\'addPassengerForm:psdetail:"+num+":\']"),
						  age: form["addPassengerForm:psdetail:"+num+":psgnAge"],
						  gender: form["addPassengerForm:psdetail:"+num+":psgnGender"],
						  berth: form["addPassengerForm:psdetail:"+num+":berthChoice"]
						}
					
					fObject.name.value = p.name;
					fObject.age.value = p.age;
					fObject.gender.value = p.gender;
					fObject.berth.value = p.berth;
				}
			}
			new Event("content.details.fill.passenger.end", { 'count': limit }).fire();
	},
	fillChildrenDetails: function(form) {
		if (form.id === "addPassengerForm"){
			var num = 0;
			new Event("content.details.fill.children.start", Booking.bookingData.children).fire();
			if ("undefined" === typeof Booking.bookingData.children || Booking.bookingData.children.length <= 0) return;
			new Event("content.details.fill.children.success", Booking.bookingData.children).fire();
			for (var i = 0; i < Booking.bookingData.children.length; i++){
					var p = Booking.bookingData.children[i];
					var fObject = { 
					  name: form["addPassengerForm:childInfoTable:"+i+":infantName"],
					  age: form["addPassengerForm:childInfoTable:"+i+":infantAge"],
					  gender: form["addPassengerForm:childInfoTable:"+i+":infantGender"]
					}
					
					fObject.name.value = p.name;
					fObject.age.value = p.age;
					fObject.gender.value = p.gender;
			
			}
			new Event("content.details.fill.children.end", Booking.bookingData.children.length).fire();
		}
	},
	fillDetails: function(form) {
		if (form.id == "addPassengerForm"){
			new Event("content.details.fill.details.start", form).fire();
			Booking.fillPassengerDetails(form);
			Booking.fillChildrenDetails(form);
			Booking.fillOtherDetails(form);
			new Event("content.details.fill.details.end", form).fire();
		}
	}
}

function Event(eventType, description){
	this.eventType = eventType;
	this.description = description;
	this.time = Date();
}

Event.prototype.fire = function() {
	chrome.runtime.sendMessage({'type': 'event', 'context': this});
}

var actions = {
	valid_urls : [/trainbetweenstns.jsf/, /jpInput.jsf/],
	loadHandler : function() {
						var len = actions.valid_urls.length;
						for (index = 0; index < len; index++) {
							patterns = actions.valid_urls[index];
							var path = window.location.pathname.match(patterns);
							if (path){
								chrome.runtime.sendMessage({'type': 'content', 'path': path, 'context': document}, actions.fillAllDetails);
								break;
							}
						}
					},
	findAndShowCaptcha : function() {
			captcha = document.getElementById("addPassengerForm:dynamicCapatchaPanel");
			window.scrollBy(0,800);
			setTimeout(function(){
				var identifier = $("#nlpIdentifier");
				if (identifier != undefined && identifier.length){
					input = $("input#nlpAnswer");
					if (captcha && input.length){
							input.blur(function() {
								if (input.val() && input.val() != ""){
									$("#validate").click();
								}
							});
							input.focus();
					}
				}
			}, 1000);
	},
	fillAllDetails: function(data) {
		new Event("content.details.fill.all.start", data).fire();
		if (data && data.enabled){
			Booking.bookingData = data;
			console.log(Booking.bookingData)
			var form = document.forms['addPassengerForm'] || document.forms['jpBook'];
			new Event("content.details.fill.all.pass", form).fire();
			actions.findAndShowCaptcha();
			if (form){
				Booking.fillDetails(form);
			}
		}
		new Event("content.details.fill.all.end", data).fire();
	}
}
actions.loadHandler();