export class Variables {
   public static url = "http://localhost:80/core/core_gbmano/";
   //public static url = "core_gbmano/";
   demo: boolean = false;
   
   selectFile: File | null = null;
   fileName: string | null = null;

   expandedRows = {};
   
   meses: any[] = [
      { mes: 'Enero', value: 1 },
      { mes: 'Febrero', value: 2 },
      { mes: 'Marzo', value: 3 },
      { mes: 'Abril', value: 4 },
      { mes: 'Mayo', value: 5 },
      { mes: 'Junio', value: 6 },
      { mes: 'Julio', value: 7 },
      { mes: 'Agosto', value: 8 },
      { mes: 'Septiembre', value: 9 },
      { mes: 'Octubre', value: 10 },
      { mes: 'Noviembre', value: 11 },
      { mes: 'Diciembre', value: 12 }
   ];

   categoria: any[]  = [];
   encuesta: any[]   = [];
   formato: any[]    = [];
   marca: any[]      = [];
   producto: any[]   = [];
   proveedor: any[]  = [];
   regiones: any[]   = [];
   table: any[]      = [];
   table_2: any[]    = [];
   totalMeses: any[] = [];
   type: any[]       = [];
   sucursales: any[] = [];

   selectYear: any    = {Year: (new Date()).getFullYear()};
   selectMes: any     = this.meses[(new Date()).getMonth()];
   selectYearFin: any = {Year: (new Date()).getFullYear()};
   selectMesFin: any  = this.meses[(new Date()).getMonth()];

   productos: any;
   ponderacion: any;
   precioAplicar: any;
   selectCategoria: any;
   selectFormato: any;
   selectMarca: any;
   selectProd: any;
   selectProv: any;
   selectRegion: any;
   selectSuc: any;
   selectTipo: any;
   sucursal: any;
   tickets: any;
   user: any;

   almacen: any          = 0;
   caja: any             = 24;
   cantidad: any         = 0;
   cantidadMonto: any    = 0;
   califGeneral: any     = 0.0;
   crecimiento: any      = 0.0;
   crecimientoYTD: any   = 0.0;
   cobertura: any        = 0;
   DDI: any              = 0.0;
   filtroExistencia: any = 0;
   filtroImporte: any    = 0;
   filtroSKUS: any       = 0;
   filtroVenta: any      = 0;
   folioPromo: any       = 0;
   existencia: any       = 0;
   existencia2: any      = 0;
   existenciaCEDIS: any  = 0;
   inventario: any       = 0;
   kpi1: any             = 0;
   kpi2: any             = 0;
   kpi3: any             = 0;
   media: any            = 12;
   objetivo: any         = 0.0;
   participacion: any    = 0;
   precio: any           = 0;
   precioCaja: any       = 0;
   precioMedio: any      = 0;
   precioTri: any        = 0;
   precioSix: any        = 0;
   precioOfer: any       = 0;
   porcExistencia: any   = 0;
   porcImporte: any      = 0;
   porcSKUS: any         = 0;
   porcVenta: any        = 0;
   rotacion: any         = 0;
   tipoPromocion: any    = 0;
   total: any            = 0.0;
   totalExistencia: any  = 0;
   totalImporte: any     = 0;
   totalPuntos: any      = 0.0;
   totalPonderacion: any = 0.0;
   totalVenta: any       = 0;
   tri: any              = 3;
   six: any              = 6;
   skus: any             = 0;
   sinExistencia: any    = 0;
   sinVenta: any         = 0;
   ventaActual: any      = 0.0;
   ventaAnterior: any    = 0.0;
   ventaYTD: any         = 0.0;

   codigo: string          = "";
   cveCategoria: string    = "";
   cveMarca: string        = "";
   cveProducto: string     = "";
   cveProveedor: string    = "";
   descripcion: string     = "";
   evaluacion: string      = "";
   existenciaT: string     = "";
   existenciaST: string    = "";
   existenciaSV: string    = "";
   fecha: string           = "";
   fechaFin: string        = "";
   fechaPromocionF: string = "";
   fechaPromocionI: string = "";
   fechaOfertaF: string    = "";
   fechaOfertaI: string    = "";
   formatos: string        = "";
   horaFin: string         = "";
   horaInicio: string      = "";
   message: string         = "Sin Información.";
   message_2: string       = "Sin Información.";
   storageSesion: string   = "GB_Mano_Sesion";
   storageSucursal: string = "GB_Mano_Sucursal";
   sucursalesText: string  = "";
   tiempo: string          = "";
   
   alert: boolean       = false;
   alert_2: boolean     = false;
   loading: boolean     = false;
   loading_2: boolean   = true;
   loading_3: boolean   = true;
   loading_4: boolean   = true;
   loading_5: boolean   = true;
   loading_6: boolean   = true;
   modal: boolean       = false;
   view: boolean        = true;
   viewFormato: boolean = true;
   viewRegion: boolean  = true;
}