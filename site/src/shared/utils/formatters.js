export const maskCpf=(value)=>String(value||'').replace(/\D/g,'').slice(0,11).replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2');
export const formatCurrency=(value)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(value)||0);
export const formatDate=(value)=>value?new Intl.DateTimeFormat('pt-BR').format(new Date(value)):'';
