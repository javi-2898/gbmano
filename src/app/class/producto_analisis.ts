export class Productos {
   public cve_producto: string | any;
   public descripcion: string | any;
   public unidades: number | any;
   public importe_vta: number | any;
   public desplazamiento: number | any;
   public rotacion: number | any;
   public clasificacion: string | any;
   public existencia: number | any;
   public DiasInv: number | any;
   public participacion: number | any;
   public existencia80: number | any;
   public ultimaventa: string | any;
   public proveedor: number | any;
   public categoria: string | any;
   public marca: string  | any;

   constructor (
      cve_producto: string | any,
      descripcion: string | any,
      unidades: number | any,
      importe_vta: number | any,
      desplazamiento: number | any,
      rotacion: number | any,
      clasificacion: string | any,
      existencia: number | any,
      DiasInv: number | any,
      participacion: number | any,
      existencia80: number | any,
      ultimaventa: string | any,
      proveedor: number | any,
      categoria: string | any,
      marca: string | any
   ) {
      this.cve_producto = cve_producto;
      this.descripcion = descripcion;
      this.unidades = unidades;
      this.importe_vta = importe_vta;
      this.desplazamiento = desplazamiento;
      this.rotacion = rotacion;
      this.clasificacion = clasificacion;
      this.existencia = existencia;
      this.DiasInv = DiasInv;
      this.participacion = participacion;
      this.existencia80 = existencia80;
      this.ultimaventa = ultimaventa;
      this.proveedor = proveedor;
      this.categoria = categoria;
      this.marca = marca;
   }
}