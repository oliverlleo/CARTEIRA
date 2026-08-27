import type { MetadataRoute } from 'next';
export default function manifest():MetadataRoute.Manifest{return{
  name:'Carteira — Controle Financeiro',short_name:'Carteira',description:'Controle financeiro pessoal e compartilhado.',start_url:'/',display:'standalone',background_color:'#f7f8f5',theme_color:'#142e24',orientation:'portrait-primary',
  icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any'}],
  shortcuts:[
    {name:'Nova despesa',short_name:'Despesa',url:'/transactions?new=expense'},
    {name:'Nova receita',short_name:'Receita',url:'/transactions?new=income'}
  ]
};}
