import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { KnobModule } from "primeng/knob";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { ImportsModules } from "./../../class/modules";
import { Material } from "./../../class/material";
import { Primeng } from "./../../class/primeng";
import { Funciones } from "./../../class/funciones";
import { Variables } from "./../../class/variables";
import { Rutas } from "./../../class/rutas";

import { AppService } from "./../../app.service";

@Component({
   selector: 'app-d-audkpi',
   imports: [ImportsModules, Material, KnobModule, Primeng],
   templateUrl: './d-audkpi.html',
   styleUrl: './d-audkpi.css'
})

export class DAudkpi {
   private destroy$ = new Subject<void>();

   ruta = new Rutas;
   varb = new Variables;

   constructor(@Inject(MAT_DIALOG_DATA) public data: any, private service:AppService, public fun: Funciones) {}

   ngOnInit() {
      if (this.fun.Verify_Session()) {

         this.varb.loading = false;
         this.varb.loading_2 = false;
         this.varb.message_2 = 'Sin Información';
         this.Read_KPI();

      }
   }

   ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
   }

   // ============================================ READ ============================================ \\
   Read_Encuesta() {
      this.varb.loading_2 = true;

      let sendDatas = {
         evento: 'Read_Encuesta',
         datos: {
            cve_auditado: this.data.cve_auditado,
            cve_auditor: this.data.cve_auditor, 
            cve_sucursal: this.data.cve_sucursal,
            evaluacion: this.data.evaluacion,
            tipo: this.data.tipo
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
               
               this.Generar_Encuesta(this.varb.encuesta, res.Area);

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

   Read_KPI () {
      this.varb.table = [];
      this.varb.loading = true;

      let sendDatas = {
         evento: 'Read_KPI',
         datos: {
            cve_sucursal: this.data.cve_sucursal,
            evaluacion: this.data.evaluacion,
            fecha: this.data.fecha,
            tipo: this.data.tipo
         }
      }

      this.service.Read(this.ruta.evaluaciones, sendDatas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
         next: (res) => {
            if (res.code === 200) {

               let KPI1 = 0;
               let KPI2 = 0;
               let KPI3 = 0;
               let TOTAL = 0;

               this.varb.fechaFin = res.tiempo[0].fechaFin;
               this.varb.horaFin = this.fun.Horas(res.tiempo[0].horaFin);
               this.varb.fecha = res.tiempo[0].fechaInicio;
               this.varb.horaInicio = this.fun.Horas(res.tiempo[0].horaInicio);
               this.varb.tiempo = res.tiempo[0].tiempo;

               this.varb.table = res.kpi;
               this.varb.table.forEach((item:any) => {
                  KPI1 += parseFloat(item.KPI1);
                  KPI2 += parseFloat(item.KPI2);
                  KPI3 += parseFloat(item.KPI3);
                  TOTAL += parseFloat(item.Total);
               });

               let vkpi1 = KPI1 / this.varb.table.length;
               let vkpi2 = KPI2 / this.varb.table.length;
               let vkpi3 = KPI3 / this.varb.table.length;
               let vtotal = TOTAL / this.varb.table.length;

               this.varb.kpi1 = Number.isInteger(vkpi1) ? vkpi1.toString() : vkpi1.toFixed(2);
               this.varb.kpi2 = Number.isInteger(vkpi2) ? vkpi2.toString() : vkpi2.toFixed(2);
               this.varb.kpi3 = Number.isInteger(vkpi3) ? vkpi3.toString() : vkpi3.toFixed(2);
               this.varb.totalPuntos = Number.isInteger(vtotal) ? vtotal.toString() : vtotal.toFixed(2);
               
            } else if (res.code === 201) {
               this.varb.table = [];
               this.varb.message_2 = res.message;
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

   // ============================================ EXCEL ============================================ \\
   async Generar_Encuesta (item:any, area:any) {
      const sizeHeader = 13.5;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Auditoría');

      worksheet.mergeCells('B2:C2');
      worksheet.getCell('B2').value = 'Sucursal:';
      worksheet.getCell('B2').alignment = { vertical: 'middle' };
      worksheet.getCell('B2').font = { bold: true, size: sizeHeader };

      worksheet.mergeCells('D2:H2');
      worksheet.getCell('D2').value = `${this.data.cve_sucursal} - ${this.data.sucursal}`;
      worksheet.getCell('D2').alignment = { vertical: 'middle' };
      worksheet.getCell('D2').font = { size: sizeHeader };

      worksheet.mergeCells('B3:E3');
      worksheet.getCell('B3').value = this.data.tipo;
      worksheet.getCell('B3').alignment = { vertical: 'middle' };
      worksheet.getCell('B3').font = { bold: true, size: sizeHeader };

      worksheet.mergeCells('B4:E4');
      worksheet.getCell('B4').value = this.data.evaluacion;
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
      worksheet.getCell('H3').value = this.fun.toTitulo(this.data.auditor);
      worksheet.getCell('H3').alignment = { vertical: 'middle' };
      worksheet.getCell('H3').font = { size: sizeHeader };

      worksheet.mergeCells('H4:K4');
      worksheet.getCell('H4').value = this.fun.toTitulo(this.data.auditado);
      worksheet.getCell('H4').alignment = { vertical: 'middle' };
      worksheet.getCell('H4').font = { size: sizeHeader };

      worksheet.getCell('L4').value = 'Puesto:';
      worksheet.getCell('L4').alignment = { vertical: 'middle' };
      worksheet.getCell('L4').font = { bold: true, size: sizeHeader };

      worksheet.mergeCells('M4:P4');
      worksheet.getCell('M4').value = this.fun.toTitulo(this.data.puesto_auditado);
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
      saveAs(new Blob([buffer]), `Encuesta_${this.data.tipo}_${this.data.evaluacion}_${new Date().getTime()}.xlsx`);
   }
}