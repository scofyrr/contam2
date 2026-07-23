const N=["DIARIO_COMPRAS","DIARIO_VENTAS"],d="Centralización libro caja",g=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;function f(t){return t==="VENTA"?"DIARIO_VENTAS":"DIARIO_COMPRAS"}function R(t){return"principal"}function h(){return"cancelacion_caja"}function b(t){return Math.round(t*100)/100}function S(t){const n=String(t??"").trim();if(!n)return"";const e=n.replace(/\./g,""),r=e.match(/\d+/);return r?r[0]:e.replace(/[[\]]/g,"").trim()}function o(t){if(t===""||t==null)return 0;const n=Number(t);return Number.isFinite(n)?b(n):0}function u(t,n,e){const r=String(e??"").trim().toLowerCase();return r==="debe"||r==="haber"?r:t>0?"debe":n>0?"haber":"debe"}function I(t){const n=String(t??"").trim().toUpperCase();return n==="DIARIO_COMPRAS"?"DIARIO_COMPRAS":n==="DIARIO_VENTAS"?"DIARIO_VENTAS":n==="CAJA_BANCOS"?"CAJA_BANCOS":"DIARIO_MANUAL"}function C(t){return String(t??"").trim().toLowerCase()==="cancelacion_caja"?"cancelacion_caja":"principal"}function O(t){const n=String(t??"").trim().toUpperCase();return n==="VENTA"||n==="VENTAS"?"VENTA":"COMPRA"}function a(t){const n=String(t??"").trim();if(!n)return null;const e=n.replace(/\D/g,"");return e.length===11&&/^\d{11}$/.test(e)?null:g.test(n)?n:null}function T(t,n,e="insert"){const r=t;console.error("[asientos_contables] insert failed",{context:e,code:r?.code,message:r?.message,details:r?.details,hint:r?.hint,rowCount:n.length,payload:n,payloadJson:JSON.stringify(n,null,2)})}function m(t){const n=o(t.debe),e=o(t.haber);return{sire_registro_id:a(t.sire_registro_id),periodo:String(t.periodo??""),tipo_asiento:C(t.tipo_asiento),tipo_libro:I(t.tipo_libro),fecha_asiento:String(t.fecha_asiento??""),cuenta_contable:S(String(t.cuenta_contable??"")),glosa:t.glosa!=null&&String(t.glosa).trim()!==""?String(t.glosa):null,debe:n,haber:e,naturaleza:u(n,e,t.naturaleza),tipo_registro:O(t.tipo_registro),serie_cdp:t.serie_cdp!=null?String(t.serie_cdp):null,nro_cdp_inicial:t.nro_cdp_inicial!=null?String(t.nro_cdp_inicial):null,ruc_contraparte:t.ruc_contraparte!=null?String(t.ruc_contraparte):null,nombre_contraparte:t.nombre_contraparte!=null?String(t.nombre_contraparte):null}}function E(t){const{registro:n,registroId:e,lineas:r,tipoAsiento:s="principal",tipoLibro:_=f(n.tipo)}=t,p=a(e)??a(n.id),A=n.tipo==="VENTA"?"VENTA":"COMPRA";return r.map(i=>{const c=o(i.debe),l=o(i.haber);return m({sire_registro_id:p,periodo:n.periodo,tipo_asiento:s,tipo_libro:_,fecha_asiento:n.fecha_emision,cuenta_contable:i.cuenta,glosa:i.glosa,debe:c,haber:l,naturaleza:u(c,l),tipo_registro:A,serie_cdp:n.serie_cdp??null,nro_cdp_inicial:n.nro_cdp_inicial??null,ruc_contraparte:n.ruc??null,nombre_contraparte:n.nombre_contraparte??null})})}const L=`
  id,
  sire_registro_id,
  periodo,
  tipo_asiento,
  tipo_libro,
  tipo_registro,
  fecha_asiento,
  cuenta_contable,
  glosa,
  debe,
  haber,
  naturaleza,
  serie_cdp,
  nro_cdp_inicial,
  ruc_contraparte,
  nombre_contraparte,
  created_at
`;function z(t){return t.tipo_libro==="CAJA_BANCOS"?!0:(t.glosa??"").startsWith(d)}function D(t){return t.id}export{L as A,d as G,N as T,T as a,R as b,m as c,z as e,D as i,E as l,S as n,b as r,h as t};
