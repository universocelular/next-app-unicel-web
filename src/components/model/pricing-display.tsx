
"use client";

import type { Model, Service } from "@/lib/db/types";
import { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { carriers as allCarriers } from "@/lib/db/data";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertTriangle, Banknote, DollarSign } from "lucide-react";
import { getSettings } from "@/lib/actions/settings";

// Componente para la bandera de Argentina
const ArgentinaFlag = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="16" fill="#74ACDF"/>
    <rect y="5.33" width="24" height="5.33" fill="white"/>
    <rect y="10.67" width="24" height="5.33" fill="#74ACDF"/>
    <circle cx="12" cy="8" r="2" fill="#F4D03F" stroke="#E67E22" strokeWidth="0.5"/>
    <path d="M12 6.5L12.5 7.5H13.5L12.75 8.25L13 9.5L12 8.75L11 9.5L11.25 8.25L10.5 7.5H11.5L12 6.5Z" fill="#E67E22"/>
  </svg>
);

// Componente para el ícono de dólar
const DollarIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const getCategoryEmoji = (category: Model['category']) => {
  switch (category) {
    case 'Phone': return '📱';
    case 'Mac': return '💻';
    case 'iPad': return '📲';
    case 'Watch': return '⌚';
    default: return '📱';
  }
};

export function PricingDisplay({ model, service, subServiceId, carrierId }: { model: Model; service: Service; subServiceId?: string; carrierId?: string; }) {
  const router = useRouter();
  const { toast } = useToast();
  const [usdToArsRate, setUsdToArsRate] = useState<number>(1340); // Default rate

  useEffect(() => {
    async function fetchRate() {
      try {
        const settings = await getSettings();
        setUsdToArsRate(settings.usdToArsRate || 1340);
      } catch (error) {
        console.error('Error fetching conversion rate:', error);
      }
    }
    fetchRate();
  }, []);

  const emoji = useMemo(() => getCategoryEmoji(model.category), [model.category]);

  const serviceTitle = useMemo(() => {
    let title = service.name;
    if (subServiceId) {
      const subService = service.subServices?.find(s => s.id === subServiceId);
      if (subService) {
        title = `${service.name} - ${subService.name}`;
      }
    } else if (carrierId) {
      const carrier = allCarriers.find(c => c.id === carrierId);
      title = `Desbloqueo SIM - ${carrier?.name || 'Operadora'}`;
    }
    return title;
  }, [service, subServiceId, carrierId]);

  // Verificar si el precio está desactivado
  const isDisabled = useMemo(() => {
    if (!model.disabledPrices) return false;

    // Para subservicios
    if (subServiceId) {
      return model.disabledPrices[subServiceId] === true;
    }

    // Para SIM unlock (servicio ID 4)
    if (service.id === '4' && carrierId) {
      const simUnlockDisabled = model.disabledPrices['4'] as Record<string, boolean> | null;
      return simUnlockDisabled?.[carrierId] === true;
    }

    // Para servicios normales
    return model.disabledPrices[service.id] === true;
  }, [model.disabledPrices, service.id, subServiceId, carrierId]);

  const price = useMemo(() => {
    if (!model.priceOverrides) return null;

    // Si el precio está desactivado, retornar null
    if (isDisabled) return null;

    // Para subservicios
    if (subServiceId) {
      const subServicePrice = model.priceOverrides[subServiceId] as number | null;
      return subServicePrice;
    }

    // Para SIM unlock (servicio ID 4)
    if (service.id === '4' && carrierId) {
      const simUnlockOverrides = model.priceOverrides['4'] as Record<string, number | null> | null;
      if (simUnlockOverrides && carrierId in simUnlockOverrides) {
        return simUnlockOverrides[carrierId];
      }
      return null;
    }

    // Para servicios normales
    const servicePrice = model.priceOverrides[service.id] as number | null;
    return servicePrice;
  }, [model.priceOverrides, isDisabled, service.id, subServiceId, carrierId]);

  const handleConsult = () => {
    const deviceName = `${model.brand} ${model.name}`;
    let details = `Servicio: ${serviceTitle}\nModelo: ${deviceName}`;
    
    if (carrierId) {
      const carrier = allCarriers.find(c => c.id === carrierId);
      details += `\nOperadora: ${carrier?.name || 'No especificada'}`;
    }

    // Texto condicional según si hay precio o no
    let text;
    if (price !== null && price !== undefined) {
      text = `Hola, quiero solicitar el siguiente servicio:\n\n${details}\nPrecio: $${price.toLocaleString('es-ES')}`;
    } else {
      text = `Hola, quiero consultar el precio del siguiente servicio:\n\n${details}`;
    }

    const whatsappUrl = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  // Texto condicional para el botón
  const buttonText = useMemo(() => {
    if (price !== null && price !== undefined) {
      return `🔓 Desbloquear`;
    }
    return "💬 Consultar Precio";
  }, [price]);

  const showProcessorWarning = model.processor === 'Qualcomm' && service.id === '1';

  return (
    <motion.div 
      className="container mx-auto px-4 pt-2 pb-8 flex flex-col items-center gap-6 md:gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
        <div className="text-center">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              <span role="img" aria-label="device icon" className="mr-2">{emoji}</span> {model.brand} {model.name}
              {model.processor && <span className="text-base text-muted-foreground ml-2">({model.processor})</span>}
            </h1>
            <h2 className="mt-1 text-lg text-primary font-semibold text-center">
                {serviceTitle}
            </h2>
        </div>
        
      {showProcessorWarning && (
           <Alert variant="destructive" className="w-full max-w-2xl">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>¡Atención!</AlertTitle>
              <AlertDescription>
                  <p>Solo sale por server hasta Android 14. Android 15 NO SOPORTADO.</p>
              </AlertDescription>
          </Alert>
      )}
      
      <div className="text-center my-6">
        {price !== null && price !== undefined ? (
          <div className="space-y-3">
            {/* Precio en Pesos Argentinos */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Pesos Argentinos</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 flex items-center justify-center gap-2">
                <ArgentinaFlag className="w-8 h-6" />
                {(price * usdToArsRate).toLocaleString('es-AR')}
              </p>
            </div>
            
            {/* Precio en Dólares */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Dólares Estadounidenses</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100 flex items-center justify-center gap-2">
                💵 {price.toLocaleString('en-US')}
              </p>
            </div>
            
            <p className="text-xs text-muted-foreground mt-2">
              Tasa de conversión: 1 USD = ${usdToArsRate.toLocaleString('es-AR')} ARS
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Banknote className="h-8 w-8 text-muted-foreground" />
              <span className="text-lg font-semibold text-muted-foreground">Precio a consultar</span>
            </div>
            <p className="text-sm text-muted-foreground">Contacta con nosotros para obtener una cotización.</p>
          </>
        )}
      </div>

      <div className="mt-4 flex flex-col items-center gap-4 w-full max-w-sm">
        <Button size="lg" className="w-full rounded-full text-lg font-semibold" onClick={handleConsult} >
          <span role="img" aria-label="unlock icon" className="mr-2"></span> {buttonText}
        </Button>
        <Button variant="outline" size="lg" onClick={() => router.back()} className="w-full rounded-full text-lg border-secondary text-secondary hover:bg-secondary/10 hover:text-secondary">
          <span role="img" aria-label="back">👈🏻</span>&nbsp;Atrás
        </Button>
      </div>
    </motion.div>
  );
}
