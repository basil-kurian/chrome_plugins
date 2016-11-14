var Booking = {
	bookingData: undefined,
	fillOtherDetails: function(form) {
		console.log(form);
		if (form.id === "addPassengerForm"){
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
		}
	},
	fillPassengerDetails: function(form) {
		if (form.id === "addPassengerForm"){
			if (!(Booking.bookingData.passengers && Booking.bookingData.passengers.length > 0)) return;
			console.log("Filling Passenger details");
			var limit = parseInt(form['addPassengerForm:maxPassengersH'].value) < Booking.bookingData.passengers.length ? parseInt(form['addPassengerForm:maxPassengersH'].value) : Booking.bookingData.passengers.length;
			for (var num = 0; num < limit; num++){
					var p = Booking.bookingData.passengers[num];
					var fObject = { 
						  name: form.querySelector("input[size^=\'16\'][id^=\'addPassengerForm:psdetail:"+num+":\']"),
						  age: form["addPassengerForm:psdetail:"+num+":psgnAge"],
						  gender: form["addPassengerForm:psdetail:"+num+":psgnGender"],
						  berth: form["addPassengerForm:psdetail:"+num+":berthChoice"]
						}
					console.log(p);
					fObject.name.value = p.name;
					fObject.age.value = p.age;
					fObject.gender.value = p.gender;
					fObject.berth.value = p.berth;
				}
			}
	},
	fillChildrenDetails: function(form) {
		if (form.id === "addPassengerForm"){
			var num = 0;
			if ("undefined" === typeof Booking.bookingData.children || Booking.bookingData.children.length <= 0) return;
			console.log("Filling Children details");
			for (var i = 0; i < Booking.bookingData.children.length; i++){
					var p = Booking.bookingData.children[i];
					var fObject = { 
					  name: form["addPassengerForm:childInfoTable:"+i+":infantName"],
					  age: form["addPassengerForm:childInfoTable:"+i+":infantAge"],
					  gender: form["addPassengerForm:childInfoTable:"+i+":infantGender"]
					}
					console.log(p);
					fObject.name.value = p.name;
					fObject.age.value = p.age;
					fObject.gender.value = p.gender;
			
			}
		}
	},
	fillDetails: function(form) {
		console.log(form)
		if (form.id == "addPassengerForm"){
			Booking.fillPassengerDetails(form);
			Booking.fillChildrenDetails(form);
			Booking.fillOtherDetails(form);
		}
	}
}

var actions = {
	valid_urls : [/trainbetweenstns.jsf/, /jpInput.jsf/],
	loadHandler : function() {
						var len = actions.valid_urls.length;
						for (index = 0; index < len; index++) {
							patterns = actions.valid_urls[index];
							var path = window.location.pathname.match(patterns);
							console.log(path)
							if (path){
								chrome.runtime.sendMessage({'type': "content", 'path': path, 'doc': document}, actions.fillAllDetails);
								break;
							}
						}
					},
	fillAllDetails: function(data) {
		
		if (data && data.enabled){
			Booking.bookingData = data;
			console.log(Booking.bookingData)
			var form = document.forms['addPassengerForm'] || document.forms['jpBook'];
			console.log(form);
			if (form){
				Booking.fillDetails(form);
			}
		}
	}
}
actions.loadHandler();