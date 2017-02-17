import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { AppComponent,
  AlphaPipe} from './app.component';
import { AngularFireModule, AuthProviders, AuthMethods } from 'angularfire2';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule }   from '@angular/forms';

import { MaterialModule } from '@angular/material';


import 'hammerjs';
import { ManageTastingComponent } from './manage-tasting/manage-tasting.component';
import { ViewTastingComponent } from './view-tasting/view-tasting.component';
import { NewTastingComponent } from './new-tasting/new-tasting.component';
import { TasteEntryComponent } from './taste-entry/taste-entry.component';
import { HeatMapComponent } from './heat-map/heat-map.component';
import { DiagnosticComponent } from './diagnostic/diagnostic.component';


// Must export the config
export const firebaseConfig = {
  apiKey: 'AIzaSyAICxTUYT4PXfd4JN9rshgV1mNdHC1Kuhc',
  authDomain: 'taste-blind.firebaseapp.com',
  databaseURL: 'https://taste-blind.firebaseio.com',
  storageBucket: 'taste-blind.appspot.com',
  messagingSenderId: '765234187761'
};

const firebaseAuthConfig = {
  provider: AuthProviders.Google,
  method: AuthMethods.Redirect
};

const appRoutes: Routes = [
  { path: 'create', component: NewTastingComponent },
  { path: 'taste/:name', component: ViewTastingComponent },
  { path: 'manage/:name', component: ManageTastingComponent }
];

@NgModule({
  imports: [
    BrowserModule,
    MaterialModule.forRoot(),
    FormsModule,
    AngularFireModule.initializeApp(firebaseConfig, firebaseAuthConfig),
    RouterModule.forRoot(appRoutes)
  ],
  declarations: [ AppComponent, NewTastingComponent, ViewTastingComponent, AlphaPipe, ManageTastingComponent, ViewTastingComponent, TasteEntryComponent, HeatMapComponent, DiagnosticComponent,],
  bootstrap: [ AppComponent ]
})

export class AppModule { }
