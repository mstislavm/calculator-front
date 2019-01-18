import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Country} from './model/Country';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Form, FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatAutocompleteSelectedEvent, MatChipInputEvent, MatAutocomplete} from '@angular/material';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent implements OnInit, OnDestroy {
  screenWidth: number;
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  calcForm: FormGroup;
  travelers: FormArray;
  allCountries: Country[] = [new Country()];
  countries: Country[] = [];
  filteredCountries: Observable<Country[]>;
  startDate: Date;
  endDate: Date;
  minDate: Date;
  minEndDate: Date;
  formSubscription;
  numTravelers = 1;
  total = 0;
  activePlan = 'extended';
  activePlanName = 'Extended';
  /* no critic */
  /* endpointURL = 'http://localhost:8080/engine-rest/decision-definition/key/'; */
  endpointURL = 'https://demo.reunico.com/engine-rest/decision-definition/key/';
  activities = [
    { type: 'standart', value: 'Standard: Relaxing trip'},
    { type: 'active', value: 'Active: football, cycling'},
    { type: 'sport', value: 'Dangerous types of sport: diving, snowboarding'},
  ];
  plans = [
    { type: 'standart',
      name: 'Standard',
      isPopular: false,
      options: ['Overseas Emergency Assistance',
        'Overseas Emergency Medical & Hospital Expenses'],
      info: 'Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum'},
    { type: 'extended',
      name: 'Extended',
      isPopular: true,
      options: ['Overseas Emergency Assistance',
        'Overseas Emergency Medical & Hospital Expenses',
        'Cancellation',
        'Travel Delay Expenses',
      ],
      info: 'Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum'},
    {
      type: 'premium',
      name: 'Premium',
      isPopular: false,
      options: ['Overseas Emergency Assistance',
        'Overseas Emergency Medical & Hospital Expenses',
        'Cancellation',
        'Travel Delay Expenses',
        'Luggage & Personal Effects',
        'Theft of Cash',
        'Rental Vehicle Excess',
        'Personal Liability'
      ],
      info: 'Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum'}
  ];
  @ViewChild('countryInput') countryInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;


  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.screenWidth = window.innerWidth;
    window.onresize = () => {
      // set screenWidth on screen size change
      this.screenWidth = window.innerWidth;
    };
    this.minDate = new Date(Date.now());
    this.minEndDate = new Date(Date.now());
    this.startDate = new Date();
    this.endDate = new Date();
    this.travelers = this.fb.array( [ this.createTraveler() ]);
    this.calcForm = this.fb.group({
      countriesControl: [''],
      sportsControl: ['standart'],
      startDate: [this.startDate],
      endDate: [this.endDate],
      travelers: this.travelers
    });
    this.getCountries().subscribe(data => {
      this.allCountries = data;
    });
    this.filteredCountries = this.calcForm.controls['countriesControl'].valueChanges
      .pipe(
        startWith(null),
        map(country => country ? this._filter(country) : this.allCountries.slice())
      );
  }
  ngOnInit() {
    this.calculate();
    this.onChanges();
  }
  private createTraveler(): FormGroup {
    return this.fb.group( {
      name: ['', Validators.required],
      age: ['', Validators.required]
    });
  }
  addTraveler(): void {
    this.travelers = this.calcForm.get('travelers') as FormArray;
    this.travelers.push(this.createTraveler());
  }
  removeTraveler(i: number) {
    this.travelers.removeAt(i);
  }
  public getCountries(): Observable<any> {
    return this.http.get('./assets/slim-3.json');
  }
  add(event: MatChipInputEvent): void {
    /*
    // Add fruit only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;

      // Add our fruit
      if ((value || '').trim()) {
        this.countries.push(value.trim());
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.calcControl.setValue(null);
    }
    */
  }

  remove(country: Country): void {
    const index = this.countries.indexOf(country);

    if (index >= 0) {
      this.countries.splice(index, 1);
    }
    this.calculate();
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.countries.push(event.option.value);
    this.countryInput.nativeElement.value = '';
    this.calcForm.controls['countriesControl'].setValue(null);
  }

  private _filter(countryName: any): Country[] {
    // no critic
    if (!countryName.name) {
      const filterValue = countryName.toLowerCase();
      return this.allCountries.filter(country => country.name.toLowerCase().indexOf(filterValue) === 0);
    }
  }
  onChanges(): void {
    this.formSubscription = this.calcForm.valueChanges.subscribe(
      x => {
        this.calculate();
      }
    );
  }
  calculate() {
    // calculate days
    const oneDay = 1000 * 60 * 60 * 24;
    const startDate = this.calcForm.get('startDate').value.getTime();
    const endDate = this.calcForm.get('endDate').value.getTime();
    const travelDays = (Math.ceil((endDate - startDate) / oneDay)) + 1;
    this.countTravelers();
    let baseAmount = 0;
    const countriesISO = ['USA'];
    for (const c of this.countries) {
      countriesISO.push(c['alpha-3']);
    }
    const amountRequest = { variables:
        {
          days: { value: travelDays, type: 'Integer' },
          plan: { value: this.activePlan, type: 'String' },
          sportType: { value: this.calcForm.controls['sportsControl'].value, type: 'String'},
          travelersNum: { value: this.numTravelers, type: 'Integer' },
          countries: { value: countriesISO, type: 'String' }
      }
    };
    this.getRule(amountRequest, 'amount').subscribe(resp => {
      baseAmount = resp[0].amount.value;
      this.total = baseAmount;
    });
  }
  countTravelers() {
    // to prevent IDE errors
    const fArray = <FormArray>this.calcForm.get('travelers');
    this.numTravelers = fArray.length;
  }
  /* no critic - FormArray fix */

  ngOnDestroy() {
    this.formSubscription.unsubscribe();
  }
  getRule(request: any, ruleType: string): Observable<any> {
    return this.http.post(this.endpointURL + ruleType + '/evaluate', request);
  }
  changePlan(activePlan: string) {
    this.activePlan = activePlan;
    for (const plan of this.plans) {
      if (plan.type === activePlan) {
        this.activePlanName = plan.name;
      }
    }
    this.calculate();
  }
}


