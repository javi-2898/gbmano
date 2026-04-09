import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import * as XLSX  from "xlsx";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { ImportsModules } from "./../../class/modules";
import { Material } from "./../../class/material";
import { Primeng } from "./../../class/primeng";
import { Funciones } from "./../../class/funciones";
import { Variables } from "./../../class/variables";
import { Rutas } from "./../../class/rutas";

import { AppService } from "./../../app.service";

/* Se define una interfaz para los datos del Excel */
interface ExcelRow {
   Area: string;
   Apartado: string;
   Seccion: string;
   Pregunta: string;
   Imagen: string;
   ArchivoObjeto: File | null, // <-- El objeto File real
   ArchivoNombre: string | null
}

@Component({
   selector: 'app-d-visor-encuestas',
   imports: [ImportsModules, Material, Primeng],
   templateUrl: './d-visor-encuestas.html',
   styleUrl: './d-visor-encuestas.css'
})

export class DVisorEncuestas {
   @ViewChild('fileInput') fileInput!: ElementRef;
   private destroy$ = new Subject<void>();

   /* Variable para almacenar los datos leídos */
   data: ExcelRow[] = [];
   
   ruta = new Rutas;
   varb = new Variables;

   constructor (@Inject(MAT_DIALOG_DATA) public datas: any, private dialogRef: MatDialogRef<DVisorEncuestas>, private service:AppService, public fun: Funciones) {}

   ngOnInit () {
      if (this.fun.Verify_Session()) {

         this.varb.loading = false;
         this.varb.loading_2 = false;
         this.varb.loading_3 = false;
         this.varb.message = 'Sin Información.';
         this.varb.message_2 = 'Sin Información.';
         this.Read_Tipo();

      }
   }

   ngOnDestroy () {
      this.destroy$.next();
      this.destroy$.complete();
   }

   // ============================================ CREATE ============================================ \\
   Create_Evaluacion_Encuesta () {      
      if (this.varb.selectTipo == null) {
         return this.fun.Swal_Advertencia('El campo Tipo no puede estar vacío.');
      }

      if (this.varb.evaluacion == '') {
         return this.fun.Swal_Advertencia('El campo Evaluación no puede estar vacío.');
      }

      if (this.varb.sucursalesText == '') {
         return this.fun.Swal_Advertencia('El campo Sucursales no puede estar vacío.');
      }

      if (this.varb.evaluacion !== '') {
         const nombreAComparar = this.fun._quitarAcentos(this.varb.evaluacion).toUpperCase().trim(); 
         const evaluacionesExistentes: string[] = Array.isArray(this.datas.Evaluacion) ? this.datas.Evaluacion : [];

         if (evaluacionesExistentes.length > 0) {
            const nombreDuplicado = evaluacionesExistentes.find((itemExiste: string) => itemExiste.toUpperCase().trim() === nombreAComparar);

            if (nombreDuplicado) {
               return this.fun.Swal_Advertencia(`El nombre: "${nombreAComparar}" ya existe.`);
            }
         }
      }

      if (this.varb.encuesta.length == 0) {
         return this.fun.Swal_Advertencia('La tabla no puede estar vacío.');
      }

      const isEjecucion = this.varb.selectTipo?.value === 'EJECUCION';

      if (isEjecucion) {
         // Buscamos si existe alguna fila que NO tenga un archivo adjunto
         const missingFileItem = this.varb.encuesta.find(item => !item.ArchivoObjeto);

         if (missingFileItem) {
            return this.fun.Swal_Advertencia(`Falta la imagen de ejecución para el Área: ${missingFileItem.Area}.`);
         }
      }

      this.varb.loading_3 = true;
      const sendDatas = new FormData();
      const encuestaDataToSend = JSON.parse(JSON.stringify(this.varb.encuesta));

      if (isEjecucion) {

         encuestaDataToSend.forEach((item:any, index:any) => {
            // Adjuntamos el archivo real del objeto original (this.varb.encuesta)
            const originalItem = this.varb.encuesta[index];

            if (originalItem.ArchivoObjeto) {
               // Adjuntamos el objeto File usando un identificador único (file_0, file_1, etc.)
               // para que tu backend pueda distinguirlos.
               sendDatas.append(`file_${index}`, originalItem.ArchivoObjeto, originalItem.ArchivoNombre);
            }
            
            // Eliminamos las propiedades de archivo de la COPIA del objeto 
            // para que no causen error al serializar a JSON.
            delete item.ArchivoObjeto; 
            delete item.ArchivoNombre;
         });

      } else {
         sendDatas.append(`file_0`, '');
      }
      
      sendDatas.append('evento', 'Create_Evaluacion_Encuesta');
      sendDatas.append('encuesta', JSON.stringify(this.varb.encuesta));
      sendDatas.append('evaluacion', this.varb.evaluacion);
      sendDatas.append('tipo', this.varb.selectTipo.value);
      sendDatas.append('sucursales', this.varb.sucursalesText);

      this.service.Create(this.ruta.encuestas, sendDatas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
         next: (res) => {
            if (res.code === 200) {
               this.dialogRef.close('ok');
               this.fun.Swal_Exito(res.message);
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
         }
      });
   }

   // ============================================ READ ============================================ \\
   Read_Tipo () {
      this.varb.type = [];

      let sendDatas = {
         evento: 'Read_Tipo',
         datos: null
      }

      this.service.Read(this.ruta.general, sendDatas)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
         next: (res) => {
            if (res.code === 200) {
               this.varb.type = res.data;
            } else {
               this.fun.Swal_Advertencia(res.message);
            }
         },
         error: (error) => {
            this.fun.Swal_Error(error.message);
         }
      });
   }
   
   // ============================================ FUNCIONES ============================================ \\
   Export_Excel (event:any) {
      const target: DataTransfer = <DataTransfer>(event.target);
      
      if (target.files.length !== 1) {
         return this.fun.Swal_Error('No se puede usar múltiples archivos.');
      }

      const file: File = target.files[0];
      const reader: FileReader = new FileReader(); // configurar FileReader para leer el archivo como un array buffer binario
      reader.onload = (e:any) => {
         /* leer el array buffer */
         const bstr: string = e.target.result;
         const workbook: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

         /* obtener la primera hoja de trabajo */
         const wsname: string = workbook.SheetNames[0];
         const ws: XLSX.WorkSheet = workbook.Sheets[wsname];

         /* convertir la hoja a un array de objetos JSON */
         this.data = XLSX.utils.sheet_to_json<ExcelRow>(ws, { header: 2 }) as ExcelRow[];

         const tempCounts: { [key: string]: { Numero:number, Area: string, Apartado: string, NoPregunta: number, Imagen:any, Preguntas:any} } = {};
         var tempNo = 1;

         this.data.forEach((item) => {
            const area = (item.Area || '').toString().replace(/[?\/:*|"]/g, '').trim();
            const apartado = (item.Apartado || '').toString().replace(/[?\/:*|"]/g, '').trim();;

            // Creamos una clave única que combina el área y el apartado.
            const uniqueKey = `${area}|${apartado}`;

            if (!tempCounts[uniqueKey]) {
               
               // Si la clave no existe, la inicializamos con un conteo de 1.
               tempCounts[uniqueKey] = {
                  Numero: tempNo++,
                  Area: area,
                  Apartado: apartado,
                  Imagen: null,
                  NoPregunta: 1,
                  Preguntas: [{Seccion: item.Seccion, Pregunta: item.Pregunta}]
               };

            } else {
               
               // Si la clave ya existe, incrementamos el contador.
               tempCounts[uniqueKey].Preguntas.push({Seccion: item.Seccion, Pregunta: item.Pregunta});
               tempCounts[uniqueKey].NoPregunta++;
               
            }
         });
      
         // Convertir el objeto de conteo (tempCounts) a un array con el formato deseado.
         this.varb.encuesta = Object.values(tempCounts);
         
      }

      // Iniciar la lectura del archivo
      reader.readAsBinaryString(file);
   }

   Delete_Table_Excel () {
      this.varb.view = false
      this.fileInput.nativeElement.value = '';
      this.varb.fileName = null;
      this.varb.encuesta = [];
   }

   File_Select (event: any) {
      const files = event.files;

      if (files && files.length > 0) {
         this.varb.selectFile = files[0];
      }
   }

   File_Validate (event: any, fileUploader: any): void {
      const file = event.originalEvent.target.files[0];

      if (!file) return;

      const forbiddenTypes = [
         'application/pdf',
         'application/msword',
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
         'application/vnd.ms-excel',
         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (forbiddenTypes.includes(file.type)) {
         event.originalEvent.target.value = '';
         this.varb.selectFile = null;
         fileUploader.clear();

         this.fun.Swal_Error('No se permiten archivos PDF, Word ni Excel.');
         return;
      }

      this.varb.selectFile = file;
   }

   File_View (event: Event): void {
      const inputElement = event.target as HTMLInputElement;
      const selectedFile = inputElement.files?.[0];

      if (selectedFile) {
         this.varb.fileName = selectedFile.name;
      } else {
         this.varb.fileName = null;
      }
   }
   
   onImageSelected(event: any, item: any, rowIndex: number) {
      const fileList: FileList = event.target.files;

      if (fileList.length > 0) {
         const file: File = fileList[0];
         
         // 1. Almacenar el objeto File y el nombre en la fila
         // ESTO ES CLAVE: Asocia el archivo directamente a la fila 'item'.
         item.ArchivoObjeto = file;
         item.ArchivoNombre = file.name;
         
         // 2. Opcional: Limpiar el input para permitir subir el mismo archivo otra vez
         event.target.value = null; 
      }
   }
}