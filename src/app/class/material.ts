import { NgModule } from '@angular/core';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';

@NgModule({
   imports: [
      MatCardModule,
      MatButtonModule,
      MatIconModule,
      MatToolbarModule,
      MatListModule,
      MatSidenavModule,
      MatAutocompleteModule,
      MatDialogModule,
      MatTableModule,
      MatExpansionModule,
      MatFormFieldModule,
      MatDatepickerModule,
      MatInputModule
   ],
   exports: [
      MatCardModule,
      MatButtonModule,
      MatIconModule,
      MatToolbarModule,
      MatListModule,
      MatSidenavModule,
      MatAutocompleteModule,
      MatDialogModule,
      MatTableModule,
      MatExpansionModule,
      MatFormFieldModule,
      MatDatepickerModule,
      MatInputModule
   ]
})

export class Material {}