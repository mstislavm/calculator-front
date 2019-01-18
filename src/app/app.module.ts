import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {HttpClientModule} from '@angular/common/http';
import {
  MatAutocompleteModule, MatBadgeModule,
  MatButtonModule, MatCardModule,
  MatCheckboxModule,
  MatChipsModule, MatDatepickerModule, MatDividerModule,
  MatFormFieldModule,
  MatIconModule, MatInputModule, MatNativeDateModule, MatRippleModule, MatSelectModule, MatSidenavModule, MatToolbarModule
} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatRippleModule,
    MatBadgeModule,
    MatToolbarModule,
    MatSelectModule,
    MatSidenavModule
  ],
  providers: [
    MatDatepickerModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
