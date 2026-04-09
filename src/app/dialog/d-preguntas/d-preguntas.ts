import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ImportsModules } from "./../../class/modules";
import { Material } from "./../../class/material";
import { Primeng } from "./../../class/primeng";
import { Funciones } from "./../../class/funciones";
import { Variables } from "./../../class/variables";

@Component({
   selector: 'app-d-preguntas',
   imports: [ImportsModules, Material, Primeng],
   templateUrl: './d-preguntas.html',
   styleUrl: './d-preguntas.css'
})

export class DPreguntas {
   varb = new Variables;

   constructor(@Inject(MAT_DIALOG_DATA) public data: any, public fun: Funciones) {}

   ngOnInit() {
      if (this.fun.Verify_Session()) {
         this.varb.loading = false;
         this.varb.message = 'Sin Información';
      }
   }
}