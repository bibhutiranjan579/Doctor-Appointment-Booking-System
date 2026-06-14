import { Injectable } from '@angular/core';

export interface StateData {
  name: string;
  cities: string[];
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  readonly countries = ['India'];

  readonly states: StateData[] = [
    { name: 'Andhra Pradesh', cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Rajahmundry', 'Kakinada', 'Kadapa', 'Anantapur'] },
    { name: 'Arunachal Pradesh', cities: ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro'] },
    { name: 'Assam', cities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tezpur', 'Tinsukia'] },
    { name: 'Bihar', cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Arrah', 'Begusarai'] },
    { name: 'Chhattisgarh', cities: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon'] },
    { name: 'Goa', cities: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'] },
    { name: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Anand', 'Navsari'] },
    { name: 'Haryana', cities: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Hisar', 'Rohtak', 'Sonipat'] },
    { name: 'Himachal Pradesh', cities: ['Shimla', 'Dharamshala', 'Manali', 'Mandi', 'Solan', 'Kullu'] },
    { name: 'Jharkhand', cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh'] },
    { name: 'Karnataka', cities: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubli', 'Belagavi', 'Davangere', 'Shimoga', 'Tumkur'] },
    { name: 'Kerala', cities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Kannur'] },
    { name: 'Madhya Pradesh', cities: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna'] },
    { name: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Navi Mumbai'] },
    { name: 'Manipur', cities: ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur'] },
    { name: 'Meghalaya', cities: ['Shillong', 'Tura', 'Jowai', 'Nongpoh'] },
    { name: 'Mizoram', cities: ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip'] },
    { name: 'Nagaland', cities: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang'] },
    { name: 'Odisha', cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri'] },
    { name: 'Punjab', cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot'] },
    { name: 'Rajasthan', cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Alwar', 'Bhilwara'] },
    { name: 'Sikkim', cities: ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan'] },
    { name: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore'] },
    { name: 'Telangana', cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Mahbubnagar'] },
    { name: 'Tripura', cities: ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar'] },
    { name: 'Uttar Pradesh', cities: ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Allahabad', 'Meerut', 'Noida', 'Ghaziabad', 'Bareilly', 'Aligarh'] },
    { name: 'Uttarakhand', cities: ['Dehradun', 'Haridwar', 'Rishikesh', 'Roorkee', 'Haldwani', 'Nainital'] },
    { name: 'West Bengal', cities: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Kharagpur'] },
    { name: 'Andaman and Nicobar Islands', cities: ['Port Blair', 'Diglipur', 'Rangat'] },
    { name: 'Chandigarh', cities: ['Chandigarh'] },
    { name: 'Dadra and Nagar Haveli and Daman and Diu', cities: ['Silvassa', 'Daman', 'Diu'] },
    { name: 'Delhi', cities: ['New Delhi', 'Delhi'] },
    { name: 'Jammu and Kashmir', cities: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Sopore'] },
    { name: 'Ladakh', cities: ['Leh', 'Kargil'] },
    { name: 'Lakshadweep', cities: ['Kavaratti', 'Agatti'] },
    { name: 'Puducherry', cities: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'] },
  ];

  getStateNames(): string[] {
    return this.states.map(s => s.name);
  }

  getCities(stateName: string): string[] {
    return this.states.find(s => s.name === stateName)?.cities || [];
  }

  filterStates(query: string): string[] {
    if (!query) return this.getStateNames();
    const q = query.toLowerCase();
    return this.getStateNames().filter(s => s.toLowerCase().includes(q));
  }

  filterCities(stateName: string, query: string): string[] {
    const cities = this.getCities(stateName);
    if (!query) return cities;
    const q = query.toLowerCase();
    return cities.filter(c => c.toLowerCase().includes(q));
  }
}
