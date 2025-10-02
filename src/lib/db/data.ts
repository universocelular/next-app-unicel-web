
import type { Brand, Model, Service, Country, Carrier } from './types';
import { ArgentinaFlag, BoliviaFlag, BrazilFlag, CanadaFlag, ChileFlag, ChinaFlag, ColombiaFlag, FranceFlag, GermanyFlag, IndiaFlag, ItalyFlag, JapanFlag, MexicoFlag, PeruFlag, SouthKoreaFlag, SpainFlag, UnitedKingdomFlag, UnitedStatesFlag } from '@/components/icons/flags';
import { AttLogo, BellLogo, ClaroLogo, DeutscheTelekomLogo, EeLogo, EntelLogo, KtLogo, MovistarLogo, NttDocomoLogo, O2Logo, OrangeLogo, PersonalLogo, RogersLogo, SfrLogo, SoftbankLogo, TelcelLogo, TigoLogo, TimLogo, TMobileLogo, VerizonLogo, VivoLogo, VodafoneLogo, WomLogo } from '@/components/icons/carriers';

// The 'brands' and 'models' arrays have been intentionally left empty.
// The data will now be managed directly in the Firestore database through the admin panel.
// The 'seedDatabase' function will no longer populate brands and models from this file,
// making Firestore the single source of truth.
export let brands: Brand[] = [];
export let models: Model[] = [];

export let services: Service[] = [
  { id: '1', name: 'Eliminar Cuenta Google', description: 'Eliminación completa de la cuenta de Google (FRP).', price: 25.00, 
    emoji: '🔒' },
  { id: '2', name: 'Reparacion de IMEI', description: 'Solución a problemas de IMEI (reporte, nul, etc).', price: 50.00, 
    emoji: '📡' },
  { id: '3', name: 'Eliminar Payjoy/MDM', description: 'Remoción de bloqueos de financiamiento o empresariales (MDM).', price: 40.00, 
    emoji: '🛡️' },
  { id: '4', name: 'Liberar SIM', description: 'Desbloqueo de red para usar cualquier operadora.', 
    emoji: '📲' },
  { id: '5', name: 'Eliminar Cuenta Huawei ID', description: 'Eliminación completa de la cuenta de Huawei.', price: 35.00, 
    emoji: '🆔' },
  { id: '6', name: 'Eliminar Cuenta Xiaomi', description: 'Eliminación completa de la cuenta Mi.', price: 35.00, 
    emoji: 'Ⓜ️' },
  { 
    id: '7', 
    name: 'Eliminar Cuenta iCloud', 
    description: 'Eliminación de bloqueo de activación de iCloud. Selecciona el estado de tu dispositivo.',
    emoji: '🍏',
    subServices: [
        { id: '7-1', name: 'iPhone en código/Desactivado', description: 'El dispositivo está en la pantalla de ingreso de código o desactivado', price: 120.00, imageUrl: 'https://images.unsplash.com/photo-1541929866681-94eb7c9a4c7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxwYXNzd29yZHxlbnwwfHx8fDE3NTI5ODMyMTd8MA&ixlib=rb-4.1.0&q=80&w=1080', dataAiHint: 'iphone passcode' },
        { id: '7-3', name: 'iPhone pantalla hola', description: 'El dispositivo está en la pantalla de bienvenida "Hola".', price: 150.00, imageUrl: 'https://images.unsplash.com/photo-1681395791877-e7186492ad3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxOXx8aXBob25lJTIwaGVsbG98ZW58MHx8fHwxNzUyOTgzMzc5fDA&ixlib=rb-4.1.0&q=80&w=1080', dataAiHint: 'iphone hello' },
    ]
  },
  { id: '8', name: 'Eliminar MDM (Administracion Remota)', description: 'Remoción de perfil de administración remota.', price: 60.00, 
    emoji: '⚙️' },
  { 
    id: '9', 
    name: 'Reporte de IMEI', 
    description: 'Servicios relacionados con el estado del IMEI de tu dispositivo.',
    emoji: '📶',
    subServices: [
        { id: '9-1', name: 'Verificar si tiene reporte', description: 'Informe completo para saber si un IMEI está en lista negra.', price: 5.00, 
          iconSvg: `<defs><linearGradient id="check-grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#bbf7d0" /><stop offset="100%" stopColor="#4ade80" /></linearGradient></defs><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="white" stroke="#d4d4d8" stroke-width="1.5" /><path d="M14 2v6h6" fill="none" stroke="#d4d4d8" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="15" r="5" fill="url(#check-grad)"/><path d="m10 15l1.5 1.5L14 14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` },
        { id: '9-2', name: 'Limpiar reporte', description: 'Servicio de limpieza de IMEI para dispositivos reportados.', price: 80.00, 
          iconSvg: `<defs><linearGradient id="clean-grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#fecaca" /><stop offset="100%" stopColor="#f87171" /></linearGradient></defs><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="white" stroke="#d4d4d8" stroke-width="1.5" /><path d="M14 2v6h6" fill="none" stroke="#d4d4d8" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="15" r="5" fill="url(#clean-grad)"/><path d="m10.5 13.5l3 3m0-3l-3 3" stroke="white" stroke-width="2" stroke-linecap="round"/>` },
    ]
  },
];

export const countries: Country[] = [
    { id: 'us', name: 'Estados Unidos', flag: UnitedStatesFlag, phoneCode: '+1' },
    { id: 'mx', name: 'México', flag: MexicoFlag, phoneCode: '+52' },
    { id: 'es', name: 'España', flag: SpainFlag, phoneCode: '+34' },
    { id: 'ar', name: 'Argentina', flag: ArgentinaFlag, phoneCode: '+54' },
    { id: 'bo', name: 'Bolivia', flag: BoliviaFlag, phoneCode: '+591' },
    { id: 'br', name: 'Brasil', flag: BrazilFlag, phoneCode: '+55' },
    { id: 'ca', name: 'Canadá', flag: CanadaFlag, phoneCode: '+1' },
    { id: 'cl', name: 'Chile', flag: ChileFlag, phoneCode: '+56' },
    { id: 'co', name: 'Colombia', flag: ColombiaFlag, phoneCode: '+57' },
    { id: 'pe', name: 'Perú', flag: PeruFlag, phoneCode: '+51' },
    // Europe
    { id: 'de', name: 'Alemania', flag: GermanyFlag, phoneCode: '+49' },
    { id: 'fr', name: 'Francia', flag: FranceFlag, phoneCode: '+33' },
    { id: 'gb', name: 'Reino Unido', flag: UnitedKingdomFlag, phoneCode: '+44' },
    { id: 'it', name: 'Italia', flag: ItalyFlag, phoneCode: '+39' },
    // Asia
    { id: 'cn', name: 'China', flag: ChinaFlag, phoneCode: '+86' },
    { id: 'in', name: 'India', flag: IndiaFlag, phoneCode: '+91' },
    { id: 'jp', name: 'Japón', flag: JapanFlag, phoneCode: '+81' },
    { id: 'kr', name: 'Corea del Sur', flag: SouthKoreaFlag, phoneCode: '+82' },
];

export const carriers: Carrier[] = [
    // Argentina
    { id: 'ar-claro', name: 'Claro', countryId: 'ar', logo: ClaroLogo },
    { id: 'ar-movistar', name: 'Movistar', countryId: 'ar', logo: MovistarLogo },
    { id: 'ar-personal', name: 'Personal', countryId: 'ar', logo: PersonalLogo },
    // Bolivia
    { id: 'bo-entel', name: 'Entel', countryId: 'bo', logo: EntelLogo },
    { id: 'bo-tigo', name: 'Tigo', countryId: 'bo', logo: TigoLogo },
    // Brasil
    { id: 'br-vivo', name: 'Vivo', countryId: 'br', logo: VivoLogo },
    { id: 'br-claro', name: 'Claro', countryId: 'br', logo: ClaroLogo },
    { id: 'br-tim', name: 'TIM', countryId: 'br', logo: TimLogo },
    // Canadá
    { id: 'ca-rogers', name: 'Rogers', countryId: 'ca', logo: RogersLogo },
    { id: 'ca-bell', name: 'Bell', countryId: 'ca', logo: BellLogo },
    { id: 'ca-telus', name: 'Telus', countryId: 'ca' },
    // Chile
    { id: 'cl-entel', name: 'Entel', countryId: 'cl', logo: EntelLogo },
    { id: 'cl-movistar', name: 'Movistar', countryId: 'cl', logo: MovistarLogo },
    { id: 'cl-wom', name: 'WOM', countryId: 'cl', logo: WomLogo },
    // Colombia
    { id: 'co-claro', name: 'Claro', countryId: 'co', logo: ClaroLogo },
    { id: 'co-movistar', name: 'Movistar', countryId: 'co', logo: MovistarLogo },
    { id: 'co-tigo', name: 'Tigo', countryId: 'co', logo: TigoLogo },
    // France
    { id: 'fr-orange', name: 'Orange', countryId: 'fr', logo: OrangeLogo },
    { id: 'fr-sfr', name: 'SFR', countryId: 'fr', logo: SfrLogo },
    { id: 'fr-bouygues', name: 'Bouygues Telecom', countryId: 'fr' },
    // Germany
    { id: 'de-telekom', name: 'Deutsche Telekom', countryId: 'de', logo: DeutscheTelekomLogo },
    { id: 'de-vodafone', name: 'Vodafone', countryId: 'de', logo: VodafoneLogo },
    { id: 'de-o2', name: 'O2', countryId: 'de', logo: O2Logo },
    // Italy
    { id: 'it-tim', name: 'TIM', countryId: 'it', logo: TimLogo },
    { id: 'it-vodafone', name: 'Vodafone', countryId: 'it', logo: VodafoneLogo },
    // Japan
    { id: 'jp-docomo', name: 'NTT Docomo', countryId: 'jp', logo: NttDocomoLogo },
    { id: 'jp-softbank', name: 'SoftBank', countryId: 'jp', logo: SoftbankLogo },
    // Mexico
    { id: 'mx-telcel', name: 'Telcel', countryId: 'mx', logo: TelcelLogo },
    { id: 'mx-att', name: 'AT&T Mexico', countryId: 'mx', logo: AttLogo },
    { id: 'mx-movistar', name: 'Movistar', countryId: 'mx', logo: MovistarLogo },
    // Perú
    { id: 'pe-claro', name: 'Claro', countryId: 'pe', logo: ClaroLogo },
    { id: 'pe-movistar', name: 'Movistar', countryId: 'pe', logo: MovistarLogo },
    { id: 'pe-entel', name: 'Entel', countryId: 'pe', logo: EntelLogo },
    // South Korea
    { id: 'kr-skt', name: 'SK Telecom', countryId: 'kr' },
    { id: 'kr-kt', name: 'KT', countryId: 'kr', logo: KtLogo },
    { id: 'kr-lgup', name: 'LG U+', countryId: 'kr' },
    // Spain
    { id: 'es-movistar', name: 'Movistar', countryId: 'es', logo: MovistarLogo },
    { id: 'es-orange', name: 'Orange', countryId: 'es', logo: OrangeLogo },
    { id: 'es-vodafone', name: 'Vodafone', countryId: 'es', logo: VodafoneLogo },
    // UK
    { id: 'gb-ee', name: 'EE', countryId: 'gb', logo: EeLogo },
    { id: 'gb-o2', name: 'O2', countryId: 'gb', logo: O2Logo },
    { id: 'gb-vodafone', name: 'Vodafone', countryId: 'gb', logo: VodafoneLogo },
    // United States
    { id: 'us-att', name: 'AT&T', countryId: 'us', logo: AttLogo },
    { id: 'us-tmobile', name: 'T-Mobile', countryId: 'us', logo: TMobileLogo },
    { id: 'us-verizon', name: 'Verizon', countryId: 'us', logo: VerizonLogo },
];
