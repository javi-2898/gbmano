import { Injectable } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Variables } from './class/variables';

@Injectable({
   providedIn: 'root'
})

export class AppService {
   private url = Variables.url;

   constructor (private http: HttpClient) {}

   Create (ruta:string, params:any) {
      let res = this.http.post(`${this.url}${ruta}`, params);
      return res.pipe(
         tap((res: any) => {
            return res;
         }),
         catchError((err) => {
            return throwError(() => err);
         })
      );
   }

   Read (ruta:string, params:any) {
      let res = this.http.post(`${this.url}${ruta}`, params);
      return res.pipe(
         tap((res: any) => {
            return res;
         }),
         catchError((err) => {
            return throwError(() => err);
         })
      );
   }

   Update (ruta:string, params:any) {
      let res = this.http.post(`${this.url}${ruta}`, params);
      return res.pipe(
         tap((res: any) => {
            return res;
         }),
         catchError((err) => {
            return throwError(() => err);
         })
      );
   }

   Get_Imagen(filename:string, area:string): string {
      const encodedFilename = encodeURIComponent(filename);
      const encodedArea = encodeURIComponent(area); 

      return `${this.url}imagen.php?filename=${encodedFilename}&area=${encodedArea}`;
      //return `https://e-smap.grupolagranbodega.com.mx/gbmano_2/core_gbmano/imagen.php?filename=${encodedFilename}&area=${encodedArea}`;
   }
}