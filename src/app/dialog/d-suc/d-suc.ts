import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog'; 

import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { ImportsModules } from "./../../class/modules";
import { Material } from "./../../class/material";
import { Primeng } from "./../../class/primeng";
import { Variables } from "./../../class/variables";
import { Funciones } from "./../../class/funciones";
import { Rutas } from "./../../class/rutas";

import { AppService } from "./../../app.service";

@Component({
  selector: 'app-d-suc',
  imports: [ImportsModules, Material, Primeng],
  templateUrl: './d-suc.html',
  styleUrl: './d-suc.css'
})

export class DSuc {
   private destroy$ = new Subject<void>();

   ruta = new Rutas;
   varb = new Variables;

   constructor(private dialogRef: MatDialogRef<DSuc>, private service:AppService, private router:Router, public fun:Funciones) {}

   ngOnInit() {
      this.Read_Sucursales();
   }

   ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
   }

   Read_Sucursales() {
      let sendDatas = {
         evento: "Read_Sucursal",
         datos: null
      };

      this.service.Read(this.ruta.sucursales, sendDatas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
         next: (res) => {
            if (res.code === 200) {
               
               res.data.forEach((params:any) => {
                  this.varb.sucursales.push({
                     cve_sucursal: params.cve_sucursal,
                     nombre: params.cve_sucursal+' - '+this.fun.toTitulo(params.nombre)
                  });
               });
               
            } else if (res.code === 201) {
               this.varb.sucursales = [];
            } else {
               this.fun.Swal_Advertencia(res.message);
            }
         },
         error: (error) => {
            this.fun.Swal_Error(error.message);
         }
      });
   }

   Select_Sucursal() {
      this.fun.Set_SessionStorage(this.varb.storageSucursal, JSON.stringify(this.varb.selectSuc));
      this.varb.sucursal = this.varb.selectSuc;
      this.dialogRef.close('ok');
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
         this.router.navigate(['home']);
      });
   }
}