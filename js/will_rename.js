function Passenger (name, age, gender, berth){
	this.name = name;
	this.age = age;
	this.gender = gender;
	this.berth = berth;
}
function Children (name, age, gender) {
 this.name = name;
 this.age = age;
 this.gender = gender;
}

var BookingData =  {
	enabled: true,
	mobileNumber: "",
	boardingStation: "",
	preferedCoach: "",
	bookingCond: 0,
	consider_auto_upgrade: false,
	onlyConfirmBerths: false,
	travel_insurance: false,
	passengers: [],
	children: [],
	payment_details: {}
}

// Reading from chrome local storage
chrome.storage.local.get(BookingData, function(result) {
  result.mobileNumber && (BookingData.mobileNumber = result.mobileNumber);
  result.consider_auto_upgrade && (BookingData.consider_auto_upgrade = result.consider_auto_upgrade);
  result.onlyConfirmBerths && (BookingData.onlyConfirmBerths = result.onlyConfirmBerths);
  result.bookingCond && (BookingData.bookingCond = result.bookingCond);
  result.preferedCoach && (BookingData.preferedCoach = result.preferedCoach);
  result.travel_insurance && (BookingData.travel_insurance = result.travel_insurance);
  result.boardingStation && (BookingData.boardingStation = result.boardingStation);
  result.passengers && (BookingData.passengers = result.passengers);
  result.children && (BookingData.children = result.children);
  result.payment_details && (BookingData.payment_details = result.payment_details);
});

chrome.runtime.onMessage.addListener(function (msg, sender, callBack) {
   callBack(BookingData);
});