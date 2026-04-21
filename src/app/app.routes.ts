import { Routes } from '@angular/router';
import { Login } from "./login/login";

import { Home } from "./home/home";
import { Analisis } from "./home/analisis/analisis";
import { Asistencia } from "./home/asistencia/asistencia";
import { Dashboard } from "./home/dashboard/dashboard";
import { DashboardGeneral } from "./home/dashboard-general/dashboard-general";
import { Encuestas } from "./home/encuestas/encuestas";
import { Evaluaciones } from "./home/evaluaciones/evaluaciones";
import { GuiasEjecucion } from "./home/guias-ejecucion/guias-ejecucion";
import { HojasServicios } from "./home/hojas-servicios/hojas-servicios";
import { MonitorOfertas } from "./home/monitor-ofertas/monitor-ofertas";
import { PowerBi } from "./home/power-bi/power-bi";
import { ProduccionPanaderia } from "./home/produccion-panaderia/produccion-panaderia";
import { Productos } from "./home/productos/productos";
import { ResultadosGenerales } from "./home/resultados-generales/resultados-generales";

export const routes: Routes = [
   { path: '', redirectTo: '/login', pathMatch: 'full' },
   { path: 'login', title: 'GBMANO | Login', component: Login },
   {
      path: 'home',
      title: 'Inicio',
      component: Home,
      children: [
         { path:  '', redirectTo: 'dashboard', pathMatch: 'full' },
         { path:  'analisis', title: 'Análisis | GBMANO', component: Analisis },
         { path:  'asistencia', title: 'Asistencia | GBMANO', component: Asistencia },
         { path:  'dashboard', title: 'Dashboard | GBMANO', component: Dashboard },
         { path:  'dashboard_general', title: 'Dashboard General | GBMANO', component: DashboardGeneral },
         { path:  'encuestas', title: 'Encuestas | GBMANO', component: Encuestas },
         { path:  'evaluaciones', title: 'Evaluaciones | GBMANO', component: Evaluaciones },
         { path:  'guias_ejecucion', title: 'Guías de Ejecución | GBMANO', component: GuiasEjecucion },
         { path:  'hojas_servicios', title: 'Hojas de Servicios | GBMANO', component: HojasServicios },
         { path:  'monitor_ofertas', title: 'Monitor Ofertas | GBMANO', component: MonitorOfertas },
         { path:  'power_bi', title: 'Power BI | GBMANO', component: PowerBi },
         { path:  'produccion_panaderia', title:'Producción Panadería | GBMANO', component: ProduccionPanaderia },
         { path:  'productos', title:'Productos | GBMANO', component: Productos },
         { path:  'resultados_generales', title:'Resultados Generales | GBMANO', component: ResultadosGenerales }
      ]
   },
];