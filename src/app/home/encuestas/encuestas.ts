import { Component, inject, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import Swal from "sweetalert2";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { ImportsModules } from "./../../class/modules";
import { Material } from "./../../class/material";
import { Primeng } from "./../../class/primeng";
import { Variables } from "./../../class/variables";
import { Funciones } from "./../../class/funciones";
import { Rutas } from "./../../class/rutas";

import { AppService } from "./../../app.service";
import { Spinner } from "./../../spinner/spinner";

import { DImg } from "./../../dialog/d-img/d-img";
import { DVisorEncuestas } from "./../../dialog/d-visor-encuestas/d-visor-encuestas";
import { DPreguntas } from "./../../dialog/d-preguntas/d-preguntas";

@Component({
   selector: 'app-encuestas',
   imports: [ImportsModules, Material, Primeng, Spinner],
   templateUrl: './encuestas.html',
   styleUrl: './encuestas.css'
})

export class Encuestas {
   @ViewChild('spinner') spinner!: Spinner;
   private destroy$ = new Subject<void>();
   readonly dialog = inject(MatDialog);

   ruta = new Rutas;
   varb = new Variables;

   constructor (public fun: Funciones, private service: AppService) {}

   ngOnInit () {
      if (this.fun.Verify_Session()) {

         this.varb.loading = false;
         this.varb.loading_2 = false;
         this.varb.loading_3 = false;
         this.varb.message = 'Sin Información.';
         this.varb.message_2 = 'Sin Información.';
         this.varb.user = this.fun.Get_LocalStorage(this.varb.storageSesion, 'json');
         this.Create_Menu();
         this.Read_Evaluacion();

      }
   }

   ngOnDestroy () {
      this.destroy$.next();
      this.destroy$.complete();
   }

   // ============================================ READ ============================================ \\
   Create_Menu () {
      let sendData = {
         evento: "Create_Menu",
         datos: {
            cve_sucursal: this.varb.user.cve_sucursal,
            menu: 'Encuestas',
            usuario: this.varb.user.usuario
         }
      };

      return this.service.Read(this.ruta.views, sendData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
         next: (res) => {
            console.log(res.message);
            
         }, 
         error: (err) => {
            console.log(err.message);
               
         },
      });
   }

   // ============================================ READ ============================================ \\
   Read_Evaluacion () {
      this.varb.table = [];
      this.varb.loading_2 = true;

      let sendDatas = {
         evento: 'Read_Evaluacion',
         datos: {
            estatus: null,
            sucursales: null,
            tipo: null
         }
      }

      this.service.Read(this.ruta.encuestas, sendDatas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
         next: (res) => {
            if (res.code === 200) {

               this.varb.table = res.data;
               res.data.forEach((d:any) => {
                  this.varb.encuesta.push(d.Evaluacion);
               });

            } else if (res.code === 201) {
               this.varb.message = res.message;
            } else {
               this.fun.Swal_Advertencia(res.message);
            }
         },
         error: (error) => {
            this.fun.Swal_Error(error.message);
            this.varb.loading_2 = false;
         },
         complete: () => {
            this.varb.loading_2 = false;
         }
      });
   }

   Read_Evaluacion_Preguntas (item:any) {
      // Verificamos si los datos ya están cargados para evitar recargas
      if (item.PreguntasDetalle && item.PreguntasDetalle.length > 0) {
         return; 
      }
    
      // Inicializar la propiedad en el ítem si no existe (opcional, pero buena práctica)
      item.PreguntasDetalle = []; 
      this.varb.loading_3 = true;

      let sendDatas = {
         evento: 'Read_Evaluacion_Preguntas',
         datos: {
            evaluacion: item.Evaluacion,
            tipo: item.Tipo
         }
      }

      this.service.Read(this.ruta.encuestas, sendDatas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
         next: (res) => {
            if (res.code === 200) {

               const tempCounts: { [key: string]: { Numero:number, Area:string, Apartado:string, NoPregunta:number, Imagen:any, Preguntas:any} } = {};
               var tempNo = 1;
               
               res.data.forEach((d:any) => {
                  const area = d.Area;
                  const apartado = d.Apartado;
                  const Imagen = d.Imagen;
                  const uniqueKey = `${area}|${apartado}`;

                  if (!tempCounts[uniqueKey]) {

                     tempCounts[uniqueKey] = {
                        Numero: tempNo++,
                        Area: area,
                        Apartado: apartado,
                        Imagen: Imagen,
                        NoPregunta: 1,
                        Preguntas: [{Seccion: d.Seccion, Pregunta: d.Pregunta}] 
                     };

                  } else {
                     tempCounts[uniqueKey].Preguntas.push({Seccion: d.Seccion, Pregunta: d.Pregunta});
                     tempCounts[uniqueKey].NoPregunta++;
                  }
               });
               
               item.PreguntasDetalle = Object.values(tempCounts); 
               
            } else if (res.code === 201) {
               this.varb.message = res.message; 
            } else {
               this.fun.Swal_Advertencia(res.message);
            }
         },
         error: (error) => {
            this.fun.Swal_Error(error.message);
            this.varb.loading_3 = false;
         },
         complete: () => {
            this.varb.loading_3 = false;
         },
      });
   }

   // ============================================ UPDATE ============================================ \\
   Update_Evaluacion (item:any) {
      let clase:any = {
         'Activo': 'Inactivo',
         'Inactivo': 'Activo',
      };

      let status = clase[item.Estatus] || 'En Proceso';
      
      Swal.fire({
         title: "¿Seguro de cambiar el estatus a "+status+"?",
         icon: 'question',
         cancelButtonText: "<i class='bi bi-x-circle'></i> No",
         confirmButtonText: "<i class='bi bi-check-circle'></i> Sí",
         customClass: {
            popup: 'sweet-popup',
            title: 'sweet-title',
            confirmButton: 'sweet-confirm',
            cancelButton: 'sweet-cancel'
         },
         showCancelButton: true,
         reverseButtons: true,
      }).then((result) => {
         if (result.isConfirmed) {

            this.varb.loading = true;

            let sendDatas = {
               evento: 'Update_Evaluacion',
               datos: {
                  estatus: status,
                  evaluacion: item.Evaluacion, 
                  tipo: item.Tipo
               }
            }

            this.service.Update(this.ruta.encuestas, sendDatas)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
               next: (res) => {
                  if (res.code === 200) {
                     this.fun.Swal_Exito(res.message);
                     this.Read_Evaluacion();
                  }  else {
                     this.fun.Swal_Advertencia(res.message);
                  }
               },
               error: (error) => {
                  this.fun.Swal_Error(error.message);
                  this.varb.loading = false;
               },
               complete: () => {
                  this.varb.loading = false;
               },
            });
            
         }
      });
      
   }

   // ============================================ DIALOG ============================================ \\
   Open_Dialog_Img (img:any, area:any) {
      this.dialog.open(DImg, {
         data: {
            img: img,
            area: area
         },
         maxWidth: '95vw',
         maxHeight: '95vh'
      });
   }

   Open_Dialog_Preguntas (item:any, tipo:string) {
      this.dialog.open(DPreguntas, {
         data: {
            Preguntas: item,
            Tipo: tipo
         },
         width: '1000px',
         maxWidth: '90vw'
      });
   }

   Open_Dialog_Visor_Encuestas () {
      const dialogRef =  this.dialog.open(DVisorEncuestas, {
         data: {
            Evaluacion: this.varb.encuesta
         },
         width: '1000px',
         maxWidth: '90vw'
      });

      dialogRef.afterClosed().subscribe((resultado) => {
         if (resultado === 'ok') this.Read_Evaluacion();
      });
   }
}