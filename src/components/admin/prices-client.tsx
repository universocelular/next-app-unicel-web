
"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import type {  Model} from "@/lib/db/types";
import { updateModel, updatePricesInBatch, setAllPricesUnderConstruction } from "@/lib/actions/models";
import { getSettings, updateSettings } from "@/lib/actions/settings";
import { Loader2, Search } from "lucide-react";
import { getApplicableServices } from "@/lib/utils";
import { countries as allCountries, carriers as allCarriers } from "@/lib/db/data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Skeleton } from "../ui/skeleton";
import React from "react";
import { useAdminData } from "@/contexts/admin-data-context";

const ModelSearchComboBox = React.lazy(() => import('./model-search-combobox'));

interface SimUnlockPriceState {
    countryId?: string;
    carrierId?: string;
}

const getModelSeries = (modelName: string): string => {
    const name = modelName.toLowerCase().replace('galaxy', '').trim().split(' ')[0];
    if (name.startsWith('a')) return 'Línea A';
    if (name.startsWith('m')) return 'Línea M';
    if (name.startsWith('note')) return 'Línea Note';
    if (name.startsWith('s')) return 'Línea S';
    if (name.startsWith('f')) return 'Línea F';
    if (name.startsWith('z')) return 'Línea Z';
    if (name.startsWith('xcover')) return 'Línea Xcover';
    if (name.startsWith('tab')) return 'Línea Tab';
    return 'Otros';
};


export function PricesClient() {
  const { brands: initialBrands, models, setModels, services: initialServices } = useAdminData();
  const { toast } = useToast();

  // State for "per-model" editing
  const [selectedBrandId, setSelectedBrandId] = useState<string | undefined>();
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>();
  const [prices, setPrices] = useState<Record<string, number | null | undefined>>({});
  const [disabledPrices, setDisabledPrices] = useState<Record<string, boolean | Record<string, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [simUnlockPriceState, setSimUnlockPriceState] = useState<SimUnlockPriceState>({});

  // State for "batch" editing
  const [batchBrandId, setBatchBrandId] = useState<string | undefined>();
  const [batchServiceId, setBatchServiceId] = useState<string | undefined>();
  const [batchPrices, setBatchPrices] = useState<Record<string, string>>({});
  const [isBatchSubmitting, setIsBatchSubmitting] = useState(false);
  const [batchModelSearch, setBatchModelSearch] = useState('');
  
  // State for currency conversion
  const [usdToArsRate, setUsdToArsRate] = useState<number>(1);
  const [isRateSaving, setIsRateSaving] = useState(false);
  
  useEffect(() => {
    async function fetchRate() {
        const settings = await getSettings();
        setUsdToArsRate(settings.usdToArsRate || 1340); // Default if not set
    }
    fetchRate();
  }, [])


  const sortedBrands = useMemo(() => {
    const priorityOrder = ["Samsung", "Motorola", "Xiaomi", "Huawei", "Apple"];
    return [...initialBrands].sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a.name);
      const bIndex = priorityOrder.indexOf(b.name);

      if (aIndex > -1 && bIndex > -1) {
        return aIndex - bIndex;
      }
      if (aIndex > -1) {
        return -1;
      }
      if (bIndex > -1) {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [initialBrands]);

  // ---- "Per-Model" Logic ----
  const availableModels = useMemo(() => {
    if (!selectedBrandId) return [];
    const brandName = initialBrands.find(b => b.id === selectedBrandId)?.name;
    if (!brandName) return [];

    const filtered = models.filter((model) => model.brand === brandName);

    if (brandName === 'Samsung') {
        return filtered.sort((a, b) => {
            const seriesA = getModelSeries(a.name);
            const seriesB = getModelSeries(b.name);
            const seriesOrder = ['Línea A', 'Línea M', 'Línea Note', 'Línea S', 'Línea F', 'Línea Z', 'Línea Xcover', 'Línea Tab', 'Otros'];
            const indexA = seriesOrder.indexOf(seriesA);
            const indexB = seriesOrder.indexOf(seriesB);

            if (indexA !== indexB) {
                return indexA - indexB;
            }
            return a.name.localeCompare(b.name, undefined, { numeric: true });
        });
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }, [selectedBrandId, models, initialBrands]);


  const selectedModel = useMemo(() => {
    if (!selectedModelId) return null;
    return models.find((model) => model.id === selectedModelId) || null;
  }, [selectedModelId, models]);

  const applicableServices = useMemo(() => {
    if (!selectedModel) return [];
    return getApplicableServices(selectedModel, initialServices);
  }, [selectedModel, initialServices]);

  const availableCarriers = useMemo(() => {
    if (!simUnlockPriceState.countryId) return [];
    return allCarriers.filter(c => c.countryId === simUnlockPriceState.countryId);
  }, [simUnlockPriceState.countryId]);

  useEffect(() => {
    if (selectedModel) {
      const initialPrices: Record<string, number | undefined> = {};
      const initialDisabledPrices: Record<string, boolean | Record<string, boolean>> = {};
      
      applicableServices.forEach(service => {
        if (service.subServices && service.subServices.length > 0) {
          service.subServices.forEach(sub => {
            const override = selectedModel.priceOverrides?.[sub.id] as number | null | undefined;
            // Si hay un override explícito (incluso null), usarlo; sino usar precio base
            const price = override !== undefined ? override : sub.price;
            const isDisabled = selectedModel.disabledPrices?.[sub.id] as boolean ?? false;
            initialPrices[sub.id] = price ?? undefined;
            initialDisabledPrices[sub.id] = isDisabled;
          });
        } else if (service.id !== '4') { // Not SIM Unlock
          const override = selectedModel.priceOverrides?.[service.id] as number | null | undefined;
          // Si hay un override explícito (incluso null), usarlo; sino usar precio base
          const price = override !== undefined ? override : service.price;
          const isDisabled = selectedModel.disabledPrices?.[service.id] as boolean ?? false;
          initialPrices[service.id] = price ?? undefined;
          initialDisabledPrices[service.id] = isDisabled;
        }
      });
      
      // For SIM unlock, we need to load all possible overrides
      const simUnlockOverrides = selectedModel.priceOverrides?.['4'] as Record<string, number | null> | undefined;
      const simUnlockDisabled = selectedModel.disabledPrices?.['4'] as Record<string, boolean> | undefined;
      if (simUnlockOverrides) {
          for (const carrierId in simUnlockOverrides) {
              initialPrices[`4-${carrierId}`] = simUnlockOverrides[carrierId] ?? undefined;
              initialDisabledPrices[`4-${carrierId}`] = simUnlockDisabled?.[carrierId] ?? false;
          }
      }
      
      setPrices(initialPrices);
      setDisabledPrices(initialDisabledPrices);
    } else {
      setPrices({});
      setDisabledPrices({});
    }
  }, [selectedModel, applicableServices]);
  
  useEffect(() => {
    setSimUnlockPriceState({});
  }, [selectedModelId])


  const handlePriceChange = (id: string, value: string) => {
    const newPrice = value === '' ? undefined : parseFloat(value);
    if (value === '' || !isNaN(newPrice!)) {
      setPrices(prev => ({ ...prev, [id]: newPrice }));
    }
  };

  const handlePriceToggle = (id: string, enabled: boolean) => {
    if (id.startsWith('4-')) {
      // For SIM unlock services
      const carrierId = id.substring(2);
      setDisabledPrices(prev => ({
        ...prev,
        '4': {
          ...(prev['4'] as Record<string, boolean> || {}),
          [carrierId]: !enabled
        }
      }));
    } else {
      // For regular services and subservices
      setDisabledPrices(prev => ({ ...prev, [id]: !enabled }));
    }
  };

  const handleSaveAllChanges = async () => {
    if (!selectedModel) return;

    setIsSubmitting(true);
    const updatedOverrides = JSON.parse(JSON.stringify(selectedModel.priceOverrides || {}));
    const updatedDisabledPrices = JSON.parse(JSON.stringify(disabledPrices));

    for (const key in prices) {
        const newPrice = prices[key];

        if (key.startsWith('4-')) {
            const carrierId = key.substring(2);
            if (!updatedOverrides['4']) updatedOverrides['4'] = {};
            // Para SIM unlock, guardamos null en lugar de eliminar la entrada
            updatedOverrides['4'][carrierId] = newPrice === undefined ? null : newPrice;
        } else {
            // Para servicios normales y subservicios, guardamos null en lugar de eliminar la entrada
            updatedOverrides[key] = newPrice === undefined ? null : newPrice;
        }
    }
    
    try {
      const updatedModel = await updateModel(selectedModel.id, { 
        priceOverrides: updatedOverrides,
        disabledPrices: updatedDisabledPrices
      });
      if (updatedModel) {
        setModels(currentModels => 
            currentModels.map(m => m.id === updatedModel.id ? updatedModel : m)
        );
      }
      toast({ title: "Éxito", description: "Todos los precios han sido actualizados." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "No se pudieron actualizar los precios." });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const currentCountry = useMemo(() => {
    return allCountries.find(c => c.id === simUnlockPriceState.countryId);
  }, [simUnlockPriceState.countryId]);
  
  // ---- Batch Logic ----
    const normalizedBatchModels = useMemo(() => {
        const brandName = initialBrands.find(b => b.id === batchBrandId)?.name;
        if (!brandName) return [];

        let brandModels = models.filter((model) => model.brand === brandName);

        if (brandName === 'Samsung') {
            const modelMap = new Map<string, Model>();
            brandModels.forEach(model => {
                let normalizedName = model.name;
                if (!normalizedName.toLowerCase().startsWith('galaxy')) {
                    normalizedName = `Galaxy ${normalizedName}`;
                }
                const key = `${model.brand} ${normalizedName}`.toLowerCase();
                if (!modelMap.has(key)) {
                    modelMap.set(key, { ...model, name: normalizedName });
                }
            });
            brandModels = Array.from(modelMap.values());
            
            // Sort by series
             brandModels.sort((a, b) => {
                const seriesA = getModelSeries(a.name);
                const seriesB = getModelSeries(b.name);
                const seriesOrder = ['Línea A', 'Línea M', 'Línea Note', 'Línea S', 'Línea F', 'Línea Z', 'Línea Xcover', 'Línea Tab', 'Otros'];
                const indexA = seriesOrder.indexOf(seriesA);
                const indexB = seriesOrder.indexOf(seriesB);
                if (indexA !== indexB) {
                    return indexA - indexB;
                }
                return a.name.localeCompare(b.name, undefined, { numeric: true });
            });
        }
        
        return brandModels;
    }, [batchBrandId, models, initialBrands]);


    const batchFilteredModels = useMemo(() => {
        if (!batchModelSearch) return normalizedBatchModels;
        return normalizedBatchModels.filter(model => 
            model.name.toLowerCase().includes(batchModelSearch.toLowerCase())
        );
    }, [normalizedBatchModels, batchModelSearch]);

    const groupedBatchModels = useMemo(() => {
        const brandName = initialBrands.find(b => b.id === batchBrandId)?.name;
        if (brandName !== 'Samsung') return null;

        const groups: Record<string, Model[]> = {};
        batchFilteredModels.forEach(model => {
            const series = getModelSeries(model.name);
            if (!groups[series]) {
                groups[series] = [];
            }
            groups[series].push(model);
        });
        const seriesOrder = ['Línea A', 'Línea M', 'Línea Note', 'Línea S', 'Línea F', 'Línea Z', 'Línea Xcover', 'Línea Tab', 'Otros'];
        const orderedGroups: Record<string, Model[]> = {};
        seriesOrder.forEach(series => {
            if (groups[series]) {
                orderedGroups[series] = groups[series];
            }
        });
        return orderedGroups;

    }, [batchFilteredModels, batchBrandId, initialBrands]);

    // Pre-fill batch prices when models or service changes
    useEffect(() => {
        if (batchServiceId && normalizedBatchModels.length > 0) {
            const initialBatchPrices: Record<string, string> = {};
            normalizedBatchModels.forEach(model => {
                const override = model.priceOverrides?.[batchServiceId] as number | undefined;
                if (override !== undefined) {
                    initialBatchPrices[model.id] = String(override);
                }
            });
            setBatchPrices(initialBatchPrices);
        } else {
            setBatchPrices({});
        }
    }, [normalizedBatchModels, batchServiceId]);

    const handleBatchPriceChange = (modelId: string, value: string) => {
        setBatchPrices(prev => ({ ...prev, [modelId]: value }));
    };

    const handleSeriesPriceChange = (series: string, value: string) => {
        if (!groupedBatchModels) return;

        const modelsInSeries = groupedBatchModels[series];
        if (!modelsInSeries) return;

        const newBatchPrices = { ...batchPrices };
        modelsInSeries.forEach(model => {
            newBatchPrices[model.id] = value;
        });
        setBatchPrices(newBatchPrices);
    };

    const handleBatchUpdate = async () => {
        if (!batchServiceId) {
            toast({ variant: "destructive", title: "Error", description: "Selecciona un servicio primero." });
            return;
        }

        const pricesToUpdate: Record<string, number> = {};
        for (const modelId in batchPrices) {
            const priceStr = batchPrices[modelId];
            if (priceStr && priceStr.trim() !== '') {
                const priceNum = parseFloat(priceStr);
                if (!isNaN(priceNum)) {
                    pricesToUpdate[modelId] = priceNum;
                }
            }
        }
        
        if (Object.keys(pricesToUpdate).length === 0) {
            toast({ title: "Información", description: "No hay precios para actualizar." });
            return;
        }

        setIsBatchSubmitting(true);
        try {
            const updatedModels = await updatePricesInBatch(pricesToUpdate, batchServiceId);
            setModels(currentModels => 
              currentModels.map(m => updatedModels.find(um => um.id === m.id) || m)
            );
            toast({ title: "Éxito", description: `Precios actualizados para ${Object.keys(pricesToUpdate).length} modelo(s).` });
        } catch (error) {
            console.error("Error en la actualización por lote:", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo completar la operación." });
        } finally {
            setIsBatchSubmitting(false);
        }
    };
  
  const handleSaveRate = async () => {
    setIsRateSaving(true);
    try {
        await updateSettings({ usdToArsRate });
        toast({ title: "Éxito", description: "Tasa de cambio guardada correctamente." });
    } catch (error) {
        console.error("Error saving rate:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo guardar la tasa de cambio." });
    } finally {
        setIsRateSaving(false);
    }
  };

  const handleUnderConstruction = async () => {
    setIsBatchSubmitting(true);
    try {
        await setAllPricesUnderConstruction();
        toast({ title: "Éxito", description: "Todos los precios se han marcado como 'En construcción'." });
    } catch (error) {
        console.error("Error setting prices to under construction:", error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo completar la operación." });
    } finally {
        setIsBatchSubmitting(false);
    }
  };


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-3xl">💵 Gestión de Precios</h1>
      </div>

       <Accordion type="multiple" defaultValue={["item-1", "item-2", "item-3"]} className="w-full space-y-4">
        <AccordionItem value="item-1">
          <Card>
            <AccordionTrigger className="text-lg font-medium p-6 hover:no-underline">
              <span className="flex-1 text-left">
                <span className="mr-2">🔍</span>Precios por Modelo
              </span>
            </AccordionTrigger>
            <AccordionContent asChild>
                <div className="p-6 pt-0">
                    <CardDescription className="mb-6">
                        Elige una marca y luego un modelo para ver y editar los precios de los servicios aplicables.
                    </CardDescription>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="brand-select">Marca</Label>
                            <Select onValueChange={(value) => { setSelectedBrandId(value); setSelectedModelId(undefined); }} value={selectedBrandId}>
                            <SelectTrigger id="brand-select"><SelectValue placeholder="Selecciona una marca" /></SelectTrigger>
                            <SelectContent>
                                {sortedBrands.map(brand => (
                                <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="model-select">Modelo</Label>
                            <Suspense fallback={<Skeleton className="h-10 w-full" />}>
                                <ModelSearchComboBox 
                                    models={availableModels}
                                    selectedModelId={selectedModelId}
                                    onSelectModel={setSelectedModelId}
                                    disabled={!selectedBrandId}
                                />
                            </Suspense>
                        </div>
                        </div>
                    </div>

                    {selectedModel && (
                    <div className="mt-6">
                        <CardHeader className="p-0 mb-4">
                        <CardTitle className="text-xl">Servicios para {selectedModel.name}</CardTitle>
                        <CardDescription>
                            Ajusta los precios para este modelo. Los campos vacíos usarán el precio base del servicio.
                        </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                        <div className="space-y-4">
                            {applicableServices.map(service => (
                            <div key={service.id}>
                                {service.subServices && service.subServices.length > 0 ? (
                                <>
                                    <h4 className="font-semibold text-lg mb-2">{service.name}</h4>
                                    <div className="pl-4 space-y-4 border-l-2 border-muted">
                                    {service.subServices.map(sub => {
                                        const isEnabled = !disabledPrices[sub.id];
                                        return (
                                        <div key={sub.id} className="flex items-center gap-4">
                                        <Label htmlFor={`price-${sub.id}`} className="flex-1">{sub.name}</Label>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={isEnabled}
                                                    onCheckedChange={(checked) => handlePriceToggle(sub.id, checked)}
                                                />
                                                <span className="text-sm text-muted-foreground">
                                                    {isEnabled ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                            <span className="text-muted-foreground">$</span>
                                            <Input 
                                                id={`price-${sub.id}`} 
                                                type="number" 
                                                className="w-32"
                                                value={prices[sub.id] ?? ''}
                                                onChange={e => handlePriceChange(sub.id, e.target.value)}
                                                placeholder="Precio base"
                                                disabled={!isEnabled}
                                            />
                                        </div>
                                        </div>
                                        );
                                    })}
                                    </div>
                                </>
                                ) : service.id === '4' ? ( // SIM UNLOCK SERVICE
                                    <>
                                    <h4 className="font-semibold text-lg mb-2">{service.name}</h4>
                                    <div className="pl-4 space-y-4 border-l-2 border-muted">
                                        <div className="flex items-end gap-4">
                                            <div className="grid gap-2 flex-1">
                                                <Label>País</Label>
                                                <Select 
                                                    value={simUnlockPriceState.countryId} 
                                                    onValueChange={countryId => setSimUnlockPriceState({ countryId, carrierId: undefined })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue>
                                                            <div className="flex items-center gap-2">
                                                                {currentCountry ? (
                                                                    <>
                                                                        <currentCountry.flag />
                                                                        <span>{currentCountry.name}</span>
                                                                    </>
                                                                ) : (
                                                                    <span>Selecciona País</span>
                                                                )}
                                                            </div>
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {allCountries.map(c => {
                                                            const Flag = c.flag;
                                                            return (
                                                                <SelectItem key={c.id} value={c.id}>
                                                                    <div className="flex items-center gap-2">
                                                                        <Flag />
                                                                        <span>{c.name}</span>
                                                                    </div>
                                                                </SelectItem>
                                                            )
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid gap-2 flex-1">
                                                <Label>Operadora</Label>
                                                <Select 
                                                    value={simUnlockPriceState.carrierId}
                                                    onValueChange={carrierId => setSimUnlockPriceState(s => ({ ...s, carrierId }))}
                                                    disabled={!simUnlockPriceState.countryId}
                                                >
                                                    <SelectTrigger><SelectValue placeholder="Selecciona Operadora"/></SelectTrigger>
                                                    <SelectContent>
                                                        {availableCarriers.map(c => {
                                                            const Logo = c.logo;
                                                            return (
                                                                <SelectItem key={c.id} value={c.id}>
                                                                    <div className="flex items-center gap-2 h-6">
                                                                        {Logo ? <Logo className="h-full w-auto" /> : <span>{c.name}</span>}
                                                                    </div>
                                                                </SelectItem>
                                                            )
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        {simUnlockPriceState.carrierId && (() => {
                                            const carrierId = `4-${simUnlockPriceState.carrierId}`;
                                            const isEnabled = !(disabledPrices['4'] as Record<string, boolean> || {})[simUnlockPriceState.carrierId!];
                                            return (
                                            <div className="flex items-center gap-4 pt-2">
                                                <Label htmlFor={`price-${carrierId}`} className="flex-1">
                                                    Precio para {allCarriers.find(c => c.id === simUnlockPriceState.carrierId)?.name}
                                                </Label>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            checked={isEnabled}
                                                            onCheckedChange={(checked) => handlePriceToggle(carrierId, checked)}
                                                        />
                                                        <span className="text-sm text-muted-foreground">
                                                            {isEnabled ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </div>
                                                    <span className="text-muted-foreground">$</span>
                                                    <Input
                                                        id={`price-${carrierId}`}
                                                        type="number"
                                                        className="w-32"
                                                        value={prices[carrierId] ?? ''}
                                                        onChange={e => handlePriceChange(carrierId, e.target.value)}
                                                        placeholder="Sin precio"
                                                        disabled={!isEnabled}
                                                    />
                                                </div>
                                            </div>
                                            );
                                        })()}
                                    </div>
                                    </>
                                ) : (() => {
                                    const isEnabled = !disabledPrices[service.id];
                                    return (
                                <div className="flex items-center gap-4">
                                    <Label htmlFor={`price-${service.id}`} className="flex-1">{service.name}</Label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={isEnabled}
                                                onCheckedChange={(checked) => handlePriceToggle(service.id, checked)}
                                            />
                                            <span className="text-sm text-muted-foreground">
                                                {isEnabled ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                        <span className="text-muted-foreground">$</span>
                                        <Input 
                                            id={`price-${service.id}`} 
                                            type="number" 
                                            className="w-32"
                                            value={prices[service.id] ?? ''}
                                            onChange={e => handlePriceChange(service.id, e.target.value)}
                                            placeholder={service.price === undefined ? "Sin precio" : "Precio base"}
                                            disabled={!isEnabled}
                                        />
                                    </div>
                                </div>
                                    );
                                })()}
                            </div>
                            ))}
                        </div>
                        </CardContent>
                        <CardFooter className="border-t px-0 pt-6 mt-6">
                            <Button onClick={handleSaveAllChanges} disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Guardar Cambios para {selectedModel.name}
                            </Button>
                        </CardFooter>
                    </div>
                    )}
                </div>
            </AccordionContent>
          </Card>
        </AccordionItem>
        
        <AccordionItem value="item-2">
           <Card>
             <AccordionTrigger className="text-lg font-medium p-6 hover:no-underline">
               <span className="flex-1 text-left">
                  <span className="mr-2">⚡</span>Edición de Precios en Lote
               </span>
            </AccordionTrigger>
            <AccordionContent asChild>
                <div className="p-6 pt-0">
                    <CardDescription className="mb-6">
                      Selecciona una marca y un servicio. Luego, ingresa los nuevos precios para cada modelo en la tabla.
                    </CardDescription>
                    <form onSubmit={(e) => { e.preventDefault(); handleBatchUpdate(); }}>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                                <div className="grid gap-2">
                                    <Label htmlFor="batch-brand-select">Marca</Label>
                                    <Select onValueChange={setBatchBrandId} value={batchBrandId}>
                                        <SelectTrigger id="batch-brand-select"><SelectValue placeholder="Selecciona una marca" /></SelectTrigger>
                                        <SelectContent>
                                        {sortedBrands.map(brand => (
                                            <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                                        ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="batch-service-select">Servicio</Label>
                                    <Select onValueChange={setBatchServiceId} value={batchServiceId}>
                                        <SelectTrigger id="batch-service-select"><SelectValue placeholder="Selecciona un servicio" /></SelectTrigger>
                                        <SelectContent>
                                        {initialServices.flatMap(service => 
                                            service.subServices && service.subServices.length > 0
                                                ? service.subServices.map(sub => <SelectItem key={sub.id} value={sub.id}>{service.name} - {sub.name}</SelectItem>)
                                                : <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                                        )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2 relative">
                                    <Label htmlFor="batch-model-search">Buscar Modelo</Label>
                                    <Search className="absolute left-3 top-10 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input 
                                        id="batch-model-search"
                                        placeholder="Filtrar modelos..." 
                                        className="pl-10"
                                        value={batchModelSearch}
                                        onChange={(e) => setBatchModelSearch(e.target.value)}
                                        disabled={!batchBrandId || !batchServiceId}
                                    />
                                </div>
                            </div>

                            {batchBrandId && batchServiceId && (
                            <>
                                <div className="border rounded-lg max-h-96 overflow-y-auto">
                                    <Table>
                                        <TableHeader className="sticky top-0 bg-muted/95 z-10">
                                            <TableRow>
                                                <TableHead>Modelo</TableHead>
                                                <TableHead className="w-[250px]">Nuevo Precio ($)</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                        {groupedBatchModels ? (
                                            Object.entries(groupedBatchModels).map(([series, modelsInGroup]) => (
                                                <React.Fragment key={series}>
                                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                                        <TableCell className="font-bold text-primary">
                                                            {series}
                                                        </TableCell>
                                                         <TableCell>
                                                            <Input
                                                                type="number"
                                                                placeholder={`Precio para toda la ${series}`}
                                                                onChange={(e) => handleSeriesPriceChange(series, e.target.value)}
                                                                className="h-8 w-full"
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                    {modelsInGroup.map(model => (
                                                        <TableRow key={model.id}>
                                                            <TableCell className="font-medium pl-8">{model.name}</TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="Sin cambio"
                                                                    value={batchPrices[model.id] ?? ''}
                                                                    onChange={(e) => handleBatchPriceChange(model.id, e.target.value)}
                                                                    className="h-8"
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </React.Fragment>
                                            ))
                                        ) : (
                                            batchFilteredModels.map(model => (
                                                <TableRow key={model.id}>
                                                    <TableCell className="font-medium">{model.name}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            placeholder="Sin cambio"
                                                            value={batchPrices[model.id] ?? ''}
                                                            onChange={(e) => handleBatchPriceChange(model.id, e.target.value)}
                                                            className="h-8"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                        </TableBody>
                                    </Table>
                                </div>

                                <Button type="submit" disabled={isBatchSubmitting}>
                                    {isBatchSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Guardar Cambios en Lote
                                </Button>
                            </>
                            )}
                        </div>
                    </form>
                </div>
            </AccordionContent>
           </Card>
        </AccordionItem>
        
        <AccordionItem value="item-3">
            <Card>
                <AccordionTrigger className="text-lg font-medium p-6 hover:no-underline">
                    <span className="flex-1 text-left">
                        <span className="mr-2">💱</span>Configuraciones Globales
                    </span>
                </AccordionTrigger>
                <AccordionContent asChild>
                    <div className="p-6 pt-0 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Conversión USD a ARS</CardTitle>
                                <CardDescription>
                                    Establece la tasa de conversión para mostrar precios en monedas locales.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <Label>1 USD =</Label>
                                    <Input 
                                        type="number" 
                                        className="w-40"
                                        value={usdToArsRate}
                                        onChange={(e) => setUsdToArsRate(Number(e.target.value))}
                                    />
                                    <Label>ARS</Label>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleSaveRate} disabled={isRateSaving}>
                                    {isRateSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Guardar Tasa de Cambio
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Precios en Construcción</CardTitle>
                                 <CardDescription>
                                    Esta acción eliminará todos los precios personalizados de todos los modelos. El frontend mostrará "En construcción 🚧".
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" disabled={isBatchSubmitting}>
                                            {isBatchSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Poner todos los precios en construcción
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción no se puede deshacer. Esto eliminará permanentemente todas las
                                            sobrescrituras de precios para todos los modelos y servicios.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleUnderConstruction}>Continuar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardContent>
                        </Card>
                    </div>
                </AccordionContent>
            </Card>
        </AccordionItem>

      </Accordion>
    </main>
  );
}
