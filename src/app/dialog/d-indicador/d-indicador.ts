import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { ImportsModules } from "./../../class/modules";
import { Material } from "./../../class/material";
import { Primeng } from "./../../class/primeng";
import { Funciones } from "./../../class/funciones";
import { Variables } from "./../../class/variables";
import { Rutas } from "./../../class/rutas";

import { AppService } from "./../../app.service";

import { DMermaGrupo } from "./../d-merma-grupo/d-merma-grupo";
import { DVentaDepartamento } from "./../d-venta-departamento/d-venta-departamento";

@Component({
   selector: 'app-d-indicador',
   imports: [ImportsModules, Material, Primeng],
   templateUrl: './d-indicador.html',
   styleUrl: './d-indicador.css'
})

export class DIndicador {
   private destroy$ = new Subject<void>();
   readonly dialog = inject(MatDialog);

   ruta = new Rutas;
   varb = new Variables;
   cols: number = 5;

   constructor(@Inject(MAT_DIALOG_DATA) public data: any, private service:AppService, public fun: Funciones) {}

   ngOnInit() {
      if (this.fun.Verify_Session()) {

         this.varb.loading = false;
         this.varb.loading_2 = false;
         this.varb.message = 'Sin Información';
         this.varb.sucursal = this.fun.Get_SessionStorage(this.varb.storageSucursal, 'json');

         if (this.data.title === 'Venta') {
            this.cols = 7;
            this.Read_Venta();
         } else if (this.data.title === 'Merma Abarrote') {
            this.cols = 6;
            this.Read_Merma_Abarrote_Familia();
         } else if (this.data.title === 'Merma Perecdero') {
            this.cols = 7;
            this.Read_Merma_Perecedero_Familia();
         } else if (this.data.title === 'Rotacion Personal') {
            this.cols = 4;
            this.Read_Rotacion();
         } else if (this.data.title === 'Ejecucion' || this.data.title === 'Inocuidad') {
            this.cols = 8;
            this.Read_Ejecucion_Inocuidad();
         }
         
      }
   }

   ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
   }

   // ============================================ READ ============================================ \\
   Read_Encuesta (data:any) {
      this.varb.loading_2 = true;

      let sendDatas = {
         evento: 'Read_Encuesta',
         datos: {
            cve_auditado: data.cve_auditado,
            cve_auditor: data.cve_auditor, 
            cve_sucursal: data.cve_sucursal,
            evaluacion: data.evaluacion,
            tipo: data.tipo
         }
      }

      this.service.Read(this.ruta.evaluaciones, sendDatas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
         next: (res) => {
            if (res.code === 200) {
               res.Area.forEach((area:any) => {
                  const apartadosMap: any = {};

                  res.Preguntas.filter((p: any) => p.area === area).forEach((p: any) => {
                     // Agrupar por apartado
                     if (!apartadosMap[p.apartado]) {

                        apartadosMap[p.apartado] = {
                           apartado: p.apartado,
                           seccion: {} // ← mapa de secciones dentro del apartado
                        };

                     }

                     // Agrupar por sección dentro del apartado
                     if (!apartadosMap[p.apartado].seccion[p.seccion]) {

                        apartadosMap[p.apartado].seccion[p.seccion] = {
                           descripcion: p.seccion,
                           preguntas: []
                        };
                        
                     }

                     // Agregar la pregunta
                     apartadosMap[p.apartado].seccion[p.seccion].preguntas.push({
                        orden: p.orden,
                        descripcion: p.pregunta,
                        respuesta: p.respuesta
                     });
                  });

                  // Convertir mapas a arreglos y (opcional) ordenar
                  this.varb.encuesta[area] = Object.values(apartadosMap).map((ap: any) => {
                     const seccionArr = Object.values(ap.seccion).map((sec: any) => {
                        sec.preguntas.sort((a: any, b: any) => Number(a.orden) - Number(b.orden));
                        return sec;
                     });

                     return {
                        apartado: ap.apartado,
                        seccion: seccionArr
                     };
                  });
               });
               
               this.Generar_Encuesta(this.varb.encuesta, res.Area, data);

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
         },
      });
   }

   Read_Ejecucion_Inocuidad () {
      this.varb.table = [];
      this.varb.loading = true;

      let datos = this.data.formato != undefined ? 
         {
            //formato: this.data.formato,
            cve_sucursal: this.data.cve_sucursal,
            fecha_fin: this.fun.Ultimo_Dia_Mes(this.data.month+'/'+this.data.year),
            fecha_inicio: this.fun.Primer_Dia_Mes(this.data.month+'/'+this.data.year),
            tipo: this.data.title,
         } 
      : { 
            cve_sucursal: this.varb.sucursal.cve_sucursal,
            fecha_fin: this.fun.Ultimo_Dia_Mes(this.data.month+'/'+this.data.year),
            fecha_inicio: this.fun.Primer_Dia_Mes(this.data.month+'/'+this.data.year),
            tipo: this.data.title,
         };

      let sendDatas = {
         evento: 'Read_Ejecucion_Inocuidad',
         datos: datos
      }

      this.service.Read(this.ruta.evaluaciones, sendDatas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
         next: (res) => {
            if (res.code === 200) {
               this.varb.table = res.data;
            } else if (res.code === 201) {
               this.varb.message = res.message;
            } else {
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

   Read_Merma_Abarrote_Familia () {
      this.varb.loading = true;
      let datos = this.data.formato != undefined ? 
         {
            //formato: this.data.formato,
            cve_sucursal: this.data.cve_sucursal,
            month: this.data.month,
            year: this.data.year
         } 
      : { 
            cve_sucursal: this.varb.sucursal.cve_sucursal,
            month: this.data.month,
            year: this.data.year
         };

      let sendDatas = {
         evento: 'Read_Merma_Abarrote_Familia',
         datos: datos
      }

      this.service.Read(this.ruta.dashboard, sendDatas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
         next: (res) => {
            if (res.code === 200) {
               this.varb.table = res.data;
            } else if (res.code === 201) {
               this.varb.message = res.message;
            } else {
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

   Read_Merma_Perecedero_Familia () {
      this.varb.loading = true;

      let datos = this.data.formato != undefined ? 
         {
            //formato: this.data.formato,
            cve_sucursal: this.data.cve_sucursal,
            month: this.data.month,
            year: this.data.year
         } 
      : { 
            cve_sucursal: this.varb.sucursal.cve_sucursal,
            month: this.data.month,
            year: this.data.year
         };

      let sendDatas = {
         evento: 'Read_Merma_Perecedero_Familia',
         datos: datos
      }

      this.service.Read(this.ruta.dashboard, sendDatas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
         next: (res) => {
            if (res.code === 200) {
               this.varb.table = res.data;
            } else if (res.code === 201) {
               this.varb.message = res.message;
            } else {
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

   Read_Rotacion () {
      this.varb.loading = true;

      let datos = this.data.formato != undefined ? 
         {
            //formato: this.data.formato,
            cve_sucursal: this.data.cve_sucursal,
            month: this.data.month,
            year: this.data.year
         } 
      : { 
            cve_sucursal: this.varb.sucursal.cve_sucursal,
            month: this.data.month,
            year: this.data.year
         };

      let sendDatas = {
         evento: 'Read_Rotacion',
         datos: datos
      }

      this.service.Read(this.ruta.dashboard, sendDatas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
         next: (res) => {
            if (res.code === 200) {
               this.varb.table = res.Personal;
               this.varb.total = res.Total;
            } else if (res.code === 201) {
               this.varb.message = res.message;
            } else {
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

   Read_Venta () {
      this.varb.loading = true;
      let datos = this.data.formato != undefined ? 
         {
            //formato: this.data.formato,
            cve_sucursal: this.data.cve_sucursal,
            month: this.data.month,
            year: this.data.year
         } 
      : { 
            cve_sucursal: this.varb.sucursal.cve_sucursal,
            month: this.data.month,
            year: this.data.year
         };

      let sendDatas = {
         evento: 'Read_Venta',
         datos: datos
      }

      this.service.Read(this.ruta.dashboard, sendDatas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
         next: (res) => {
            if (res.code === 200) {
               this.varb.table = res.data;
            } else if (res.code === 201) {
               this.varb.message = res.message;
            } else {
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

   // ============================================ DIALOG ============================================ \\
   Open_Dialog_Merma_Grupo (data:any) {
      this.dialog.open(DMermaGrupo, {
         data: {
            cve_familia: data.cve_familia,
            formato: this.data.formato,
            title: this.data.title,
            title_sub: data.descripcion,
            month: this.data.month,
            year: this.data.year
         },
         width: '1300px',  
         maxWidth: '100vw',
         panelClass: 'dialogo-sin-padding'
      });
   }

   Open_Dialog_Venta_Departamento (data:any) {
      this.dialog.open(DVentaDepartamento, {
         data: {
            clave: data.Clave,
            title: data.Descripcion,
            month: this.data.month,
            year: this.data.year
         },
         width: '1300px',  
         maxWidth: '100vw',
         panelClass: 'dialogo-sin-padding'
      });
   }

   // ============================================ EXCEL ============================================ \\
   async Generar_Encuesta (item:any, area:any, data:any) {
      const sizeHeader = 13.5;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Auditoría');

      worksheet.mergeCells('B2:C2');
      worksheet.getCell('B2').value = 'Sucursal:';
      worksheet.getCell('B2').alignment = { vertical: 'middle' };
      worksheet.getCell('B2').font = { bold: true, size: sizeHeader };

      worksheet.mergeCells('D2:H2');
      worksheet.getCell('D2').value = `${data.cve_sucursal} - ${data.sucursal}`;
      worksheet.getCell('D2').alignment = { vertical: 'middle' };
      worksheet.getCell('D2').font = { size: sizeHeader };

      worksheet.mergeCells('B3:E3');
      worksheet.getCell('B3').value = data.tipo;
      worksheet.getCell('B3').alignment = { vertical: 'middle' };
      worksheet.getCell('B3').font = { bold: true, size: sizeHeader };

      worksheet.mergeCells('B4:E4');
      worksheet.getCell('B4').value = data.evaluacion;
      worksheet.getCell('B4').alignment = { vertical: 'middle' };
      worksheet.getCell('B4').font = { bold: true, size: sizeHeader };

      worksheet.mergeCells('F3:G3');
      worksheet.getCell('F3').value = 'Auditor:';
      worksheet.getCell('F3').alignment = { vertical: 'middle' };
      worksheet.getCell('F3').font = { bold: true, size: sizeHeader };

      worksheet.mergeCells('F4:G4');
      worksheet.getCell('F4').value = 'Auditado:';
      worksheet.getCell('F4').alignment = { vertical: 'middle' };
      worksheet.getCell('F4').font = { bold: true, size: sizeHeader };

      worksheet.mergeCells('H3:K3');
      worksheet.getCell('H3').value = this.fun.toTitulo(data.auditor);
      worksheet.getCell('H3').alignment = { vertical: 'middle' };
      worksheet.getCell('H3').font = { size: sizeHeader };

      worksheet.mergeCells('H4:K4');
      worksheet.getCell('H4').value = this.fun.toTitulo(data.auditado);
      worksheet.getCell('H4').alignment = { vertical: 'middle' };
      worksheet.getCell('H4').font = { size: sizeHeader };

      worksheet.getCell('L4').value = 'Puesto:';
      worksheet.getCell('L4').alignment = { vertical: 'middle' };
      worksheet.getCell('L4').font = { bold: true, size: sizeHeader };

      worksheet.mergeCells('M4:P4');
      worksheet.getCell('M4').value = this.fun.toTitulo(data.puesto_auditado);
      worksheet.getCell('M4').alignment = { vertical: 'middle' };
      worksheet.getCell('M4').font = { size: sizeHeader };

      // Dibujar celdas
      ['B2','B3', 'B4', 'D2', 'F3','F4','H3','H4', 'L4', 'M4'].forEach(cell => {
         worksheet.getCell(cell).border = {
            top:    { style: 'thin' },
            left:   { style: 'thin' },
            bottom: { style: 'thin' },
            right:  { style: 'thin' }
         };
      });

      
      // ====== INICIO DE TABLAS ====== \\
      let rowIndex = 6; // aquí arranca la tabla

      area.forEach((nombreArea: any) => {
         // Fila del nombre del área
         worksheet.mergeCells(`B${rowIndex}:N${rowIndex}`);
         worksheet.getCell(`B${rowIndex}`).value = this.fun.toTitulo(nombreArea);
         worksheet.getCell(`B${rowIndex}`).font = { bold: true, size: 14 };
         worksheet.getCell(`B${rowIndex}`).alignment = { vertical: 'middle', horizontal: 'left' };
         
         [`B${rowIndex}`].forEach(cell => {
            worksheet.getCell(cell).border = {
               top:    { style: 'thin' },
               left:   { style: 'thin' },
               bottom: { style: 'thin' },
               right:  { style: 'thin' }
            };

            worksheet.getCell(cell).fill = {
               type: 'pattern',
               pattern: 'solid',
               fgColor: { argb: 'FFD9D9D9' }
            };
         });

         rowIndex++;         

         // Encabezado de la tabla
         worksheet.mergeCells(`B${rowIndex}:D${rowIndex}`);
         worksheet.getCell(`B${rowIndex}`).value = 'Apartado';

         worksheet.mergeCells(`E${rowIndex}:G${rowIndex}`);
         worksheet.getCell(`E${rowIndex}`).value = 'Sección';

         worksheet.mergeCells(`H${rowIndex}:M${rowIndex}`);
         worksheet.getCell(`H${rowIndex}`).value = 'Pregunta';

         worksheet.getCell(`N${rowIndex}`).value = 'Respuesta';

         // estilo encabezado
         ['B', 'E', 'H', 'N'].forEach(col => {
            const cell = worksheet.getCell(`${col}${rowIndex}`);
            cell.font = { bold: true, size: 12 };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
               top: { style: 'thin' },
               left: { style: 'thin' },
               bottom: { style: 'thin' },
               right: { style: 'thin' }
            };
            cell.fill = {
               type: 'pattern',
               pattern: 'solid',
               fgColor: { argb: 'FFD9D9D9' }
            };
         });

         rowIndex++;

         // Ahora recorrer los apartados del área
         item[nombreArea].forEach((apartadoObj: any) => {
            const apartado = apartadoObj.apartado;

            apartadoObj.seccion.forEach((seccionObj: any) => {
            const seccion = seccionObj.descripcion;

               seccionObj.preguntas.forEach((pregunta: any) => {
                  worksheet.mergeCells(`B${rowIndex}:D${rowIndex}`);
                  worksheet.getCell(`B${rowIndex}`).value = apartado;

                  worksheet.mergeCells(`E${rowIndex}:G${rowIndex}`);
                  worksheet.getCell(`E${rowIndex}`).value = seccion;

                  worksheet.mergeCells(`H${rowIndex}:M${rowIndex}`);
                  worksheet.getCell(`H${rowIndex}`).value = pregunta.descripcion;

                  worksheet.getCell(`N${rowIndex}`).value = pregunta.respuesta;

                  // Bordes de toda la fila
                  ['B', 'E', 'H', 'N'].forEach(col => {
                     const cell = worksheet.getCell(`${col}${rowIndex}`);
                     cell.alignment = { vertical: 'middle', wrapText: true };
                     cell.border = {
                     top: { style: 'thin' },
                     left: { style: 'thin' },
                     bottom: { style: 'thin' },
                     right: { style: 'thin' }
                     };
                  });

                  rowIndex++;
               });
            });
         });

         // Espacio entre áreas
         rowIndex++;
      });

      // Exportar archivo
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `Encuesta_${data.tipo}_${data.evaluacion}_${new Date().getTime()}.xlsx`);
   }
}