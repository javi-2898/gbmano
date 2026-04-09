import { Component, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PowerBIEmbedModule } from 'powerbi-client-angular';
import { models, IReportEmbedConfiguration } from 'powerbi-client';

import { ImportsModules } from "./../../class/modules";
import { Material } from "./../../class/material";
import { Primeng } from "./../../class/primeng";
import { Funciones } from "./../../class/funciones";
import { Variables } from "./../../class/variables";
import { Rutas } from "./../../class/rutas";

import { AppService } from "./../../app.service";

@Component({
   selector: 'app-power-bi',
   imports: [ImportsModules, Material, Primeng, PowerBIEmbedModule],
   templateUrl: './power-bi.html',
   styleUrl: './power-bi.css',
   encapsulation: ViewEncapsulation.None
})

export class PowerBi {
   private destroy$ = new Subject<void>();
   private ReportId = 'c68aebb002d6d1ba0e09'; 
   private EmbedUrl = 'https://app.powerbi.com/view?r=eyJrIjoiZTFjNDJkY2YtMzdmNy00N2I2LTkwMDUtYjE2MTM1OWM3ODc3IiwidCI6ImIxNDY0NzJiLWJhNjktNDdlNi1iOGY5LTFlODAxMjQ1MTUzZSJ9'; 
   private AccessToken = ''; 

   // Configuración de la inserción
   public embedConfig: IReportEmbedConfiguration = {
      type: 'report',
      id: this.ReportId,
      embedUrl: this.EmbedUrl,
      accessToken: this.AccessToken,
      permissions: 0,
      tokenType: models.TokenType.Embed, // Casi siempre 'Embed' o 'Aad'
      settings: {
         panes: {
            filters: {
               expanded: false, // El panel de filtros no se expande por defecto
               visible: true
            },
            pageNavigation: { visible: true }
         }
      }
   };

   // Opcional: Manejadores de eventos (bueno para depuración)
   public eventHandlers = new Map<string, (event: any) => void>([
      ['loaded', () => console.log('El informe de Power BI ha cargado completamente.')],
      ['rendered', () => console.log('El informe de Power BI se ha renderizado.')],
      ['error', (event) => console.error('Error de Power BI:', event.detail)],
      // Un ejemplo de interacción después de la carga
      ['buttonClicked', (event) => {
         console.log('Se hizo clic en un botón en Power BI:', event.detail);
      }]
   ]);

   ruta = new Rutas;
   varb = new Variables;

   constructor (public fun:Funciones, private http: HttpClient, private service:AppService) {}

   ngOnInit () {
      if (this.fun.Verify_Session()) {
         this.varb.user = this.fun.Get_LocalStorage(this.varb.storageSesion, 'json');
         this.Create_Menu();
         this.Read_Token();
      }
   }

   // ============================================ READ ============================================ \\
   Create_Menu () {
      let sendData = {
         evento: "Create_Menu",
         datos: {
            cve_sucursal: this.varb.user.cve_sucursal,
            menu: 'Power BI',
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
   Read_Token () {
      const url = 'https://e-smap.com/informaciongb/token/gettokenIA.php';

      this.http.get<any>(url).subscribe({
         next: (response) => {

            // Por ejemplo, si el JSON trae el token en response.cadena
            const texto = response.cadena; // Tu bloque de texto largo
            const tenantId = this.extraerValor(texto, 'TenantId');
            const bearer = this.extraerBearer(texto);

            this.ReportId = tenantId ?? ''; // o el valor que realmente necesites para el Report
            this.AccessToken = bearer ?? '';

            // 👉 Actualizamos la configuración del Power BI
            this.embedConfig = {
               ...this.embedConfig,
               accessToken: this.AccessToken
            };
         },
         error: (error) => {
            console.error('Error al obtener token:', error);
         }
      });
   }

   extraerValor (texto: string, clave: string): string | null {
      const regex = new RegExp(`${clave}\\s*:\\s*(.*)`);
      const match = texto.match(regex);
      return match ? match[1].trim() : null;
   }

   // Función especial para extraer el token "Bearer <jwt>"
   extraerBearer (texto: string): string | null {
      const regex = /Bearer\s+([A-Za-z0-9\-\._]+)/;
      const match = texto.match(regex);
      return match ? match[1] : null;
   }
}