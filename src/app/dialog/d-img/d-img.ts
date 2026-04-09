import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ImportsModules } from "./../../class/modules";
import { Material } from "./../../class/material";
import { Primeng } from "./../../class/primeng";
import { Funciones } from "./../../class/funciones";

import { AppService } from "./../../app.service";


@Component({
   selector: 'app-d-img',
   imports: [ImportsModules, Material, Primeng],
   templateUrl: './d-img.html',
   styleUrl: './d-img.css'
})

export class DImg {
   constructor (@Inject(MAT_DIALOG_DATA) public data: any, private service:AppService, public fun: Funciones) {}

   // ============================================ GET ============================================ \\
   Get_Imagen(file:string, area:string): string {
      return this.service.Get_Imagen(file, area);
   }
}