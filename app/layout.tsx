import type { Metadata, Viewport } from 'next';
import { ServiceWorkerRegister } from '@/components/service-worker-register';
import './globals.css';

export const metadata: Metadata = {
  title: { default:'Carteira', template:'%s · Carteira' },
  description:'Controle financeiro pessoal e compartilhado, simples por fora e robusto por dentro.',
  applicationName:'Carteira',
  appleWebApp:{ capable:true, statusBarStyle:'default', title:'Carteira' },
};
export const viewport: Viewport = { width:'device-width', initialScale:1, viewportFit:'cover', themeColor:[{media:'(prefers-color-scheme: light)',color:'#f7f8f5'},{media:'(prefers-color-scheme: dark)',color:'#0d100f'}] };
export default function RootLayout({children}:{children:React.ReactNode}){ return <html lang="pt-BR"><body><ServiceWorkerRegister/>{children}</body></html>; }
