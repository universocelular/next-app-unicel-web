
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { addBrand, updateBrand, deleteBrand } from "@/lib/actions/brands";
import { addModel, updateModel, deleteModel, checkModelExists, searchModelsByName, debugModelExistence, forceClearCache } from "@/lib/actions/models";
import type { Brand, Model } from "@/lib/db/types";
import { PlusCircle, Trash, Edit, Loader2, Search } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "../ui/card";
import { useAdminData } from "@/contexts/admin-data-context";

export function BrandsAndModels() {
  const { brands: initialBrands, models, setModels, refreshData, refreshDataAfterDeletion } = useAdminData();
  const { toast } = useToast();
  const router = useRouter();
  
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [modelModalOpen, setModelModalOpen] = useState(false);
  
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null);
  const [currentModel, setCurrentModel] = useState<Model | null>(null);
  const [modelToDelete, setModelToDelete] = useState<Model | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  const [formKey, setFormKey] = useState(Date.now());
  
  // States for the new model form
  const [newModelName, setNewModelName] = useState('');
  const [newModelBrandId, setNewModelBrandId] = useState('');
  const [newModelCategory, setNewModelCategory] = useState<Model['category']>('Phone');

  const sortedBrands = useMemo(() => {
    return [...initialBrands].sort((a, b) => a.name.localeCompare(b.name));
  }, [initialBrands]);


  const handleBrandModalOpenChange = (isOpen: boolean) => {
    if (isSubmitting) return;
    setBrandModalOpen(isOpen);
    if (!isOpen) setCurrentBrand(null);
  };

  const handleModelModalOpenChange = (isOpen: boolean) => {
    if (isSubmitting) return;
    setModelModalOpen(isOpen);
    if (!isOpen) {
      setCurrentModel(null);
      // Reset new model form states
      setNewModelName('');
      setNewModelBrandId('');
      setNewModelCategory('Phone');
      // Force form re-render by updating a timestamp
      setFormKey(Date.now());
    }
  };

  // Brand handlers
  const handleAddOrUpdateBrand = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    try {
      if (currentBrand) {
        await updateBrand(currentBrand.id, name);
        toast({ title: "Éxito", description: "Marca actualizada correctamente." });
      } else {
        await addBrand(name);
        toast({ title: "Éxito", description: "Marca añadida correctamente." });
      }
      await refreshData();
      handleBrandModalOpenChange(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Algo salió mal." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBrand = async (brandToDelete: Brand) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la marca "${brandToDelete.name}" y todos sus modelos? Esta acción no se puede deshacer.`)) {
        return;
    }
    try {
      await deleteBrand(brandToDelete.id);
      toast({ title: "Éxito", description: `Marca "${brandToDelete.name}" y sus modelos eliminados.` });
      await refreshData();
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "Algo salió mal al eliminar la marca." });
    }
  };

  // Model handlers
  const handleAddOrUpdateModel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get("name") as string;
      const category = formData.get("category") as Model['category'];
      const brandId = formData.get("brand") as string;
      const processor = formData.get("processor") as string;

      console.log('Form data:', { name, category, brandId, processor });

      // Validaciones mejoradas
      if (!name || name.trim().length === 0) {
        toast({ variant: "destructive", title: "Error", description: "El nombre del modelo es requerido." });
        setIsSubmitting(false);
        return;
      }

      if (!brandId) {
        toast({ variant: "destructive", title: "Error", description: "Por favor selecciona una marca." });
        setIsSubmitting(false);
        return;
      }

      if (!category) {
        toast({ variant: "destructive", title: "Error", description: "Por favor selecciona una categoría." });
        setIsSubmitting(false);
        return;
      }

      const brandName = initialBrands.find(b => b.id === brandId)?.name;
      console.log('Brand lookup:', { brandId, brandName, initialBrands: initialBrands.map(b => ({ id: b.id, name: b.name })) });
      
      if (!brandName) {
        toast({ variant: "destructive", title: "Error", description: "Marca no válida. Por favor selecciona una marca válida." });
        setIsSubmitting(false);
        return;
      }

      const processorValue = processor === "No especificar" ? undefined : processor;
      console.log('Processor value:', { processor, processorValue });

      // Verificar si ya existe un modelo con el mismo nombre y marca
      const existingModel = models.find(m => 
        m.name.toLowerCase().trim() === name.toLowerCase().trim() && 
        m.brand === brandName && 
        (!currentModel || m.id !== currentModel.id)
      );

      if (existingModel) {
        toast({ 
          variant: "destructive", 
          title: "Error", 
          description: `Ya existe un modelo "${name}" para la marca "${brandName}".` 
        });
        setIsSubmitting(false);
        return;
      }

      if (currentModel) {
        const updateData = {
          name: name.trim(),
          brand: brandName,
          category: category,
          ...(processorValue && { processor: processorValue })
        };
        console.log('Updating model:', currentModel.id, updateData);
        const updatedModel = await updateModel(currentModel.id, updateData);
        
        // Actualizar el estado local inmediatamente
        if (updatedModel) {
          setModels(prevModels => 
            prevModels.map(model => 
              model.id === currentModel.id ? updatedModel : model
            )
          );
        }
        
        toast({ title: "Éxito", description: "Modelo actualizado correctamente." });
        
        // Pequeño delay para asegurar que la invalidación de caché se procese
        setTimeout(async () => {
          await refreshData();
        }, 100);
      } else {
        const modelData = {
          name: name.trim(),
          brand: brandName,
          category: category,
          ...(processorValue && { processor: processorValue })
        };
        console.log('Adding new model:', modelData);
        const newModel = await addModel(modelData);
        
        // Actualizar el estado local inmediatamente
        setModels(prevModels => [...prevModels, newModel]);
        
        toast({ title: "Éxito", description: "Modelo añadido correctamente." });
      }
      
      // Pequeño delay para asegurar que la invalidación de caché se procese
      setTimeout(async () => {
        await refreshData();
      }, 100);
      handleModelModalOpenChange(false);
    } catch (error) {
      console.error('Error al procesar modelo:', error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: `No se pudo procesar el modelo: ${errorMessage}` 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteModel = (model: Model) => {
    console.log('🎯 Usuario seleccionó eliminar modelo:', model.name, 'ID:', model.id);
    setModelToDelete(model);
  };

  const confirmDeleteModel = async () => {
    if (!modelToDelete) return;
    
    console.log('🗑️ Iniciando eliminación del modelo:', modelToDelete.name, 'ID:', modelToDelete.id);
    
    // Debug: Verificar el estado actual del modelo antes de eliminar
    console.log('🔍 Debugging estado inicial del modelo...');
    const initialDebug = await debugModelExistence(modelToDelete.id);
    console.log('📊 Estado inicial:', initialDebug);
    
    try {
        // Primero eliminar de la base de datos
        console.log('📡 Enviando solicitud de eliminación al servidor...');
        await deleteModel(modelToDelete.id);
        console.log('✅ Modelo eliminado del servidor exitosamente');
        
        // Esperar un momento para que se complete la invalidación del caché
        console.log('⏳ Esperando invalidación del caché...');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verificar una vez más que el modelo no existe en Firestore
        console.log('🔍 Verificación final: ¿Existe el modelo en Firestore?');
        const stillExists = await checkModelExists(modelToDelete.id);
        if (stillExists) {
          console.error('❌ ERROR CRÍTICO: El modelo aún existe en Firestore después de la eliminación');
          throw new Error('El modelo no se eliminó correctamente de la base de datos');
        } else {
          console.log('✅ Confirmado: El modelo ya no existe en Firestore');
        }
        
        // Buscar si hay otros modelos con el mismo nombre (posibles duplicados)
        console.log('🔍 Buscando modelos duplicados con el mismo nombre...');
        const duplicateModels = await searchModelsByName(modelToDelete.name);
        if (duplicateModels.length > 0) {
          console.warn(`⚠️ ADVERTENCIA: Se encontraron ${duplicateModels.length} modelos con el mismo nombre "${modelToDelete.name}":`, duplicateModels.map(m => m.id));
        } else {
          console.log('✅ No se encontraron modelos duplicados con el mismo nombre');
        }
        
        // Debug: Verificar el estado después de la eliminación
        console.log('🔍 Debugging estado después de eliminación...');
        const afterDeleteDebug = await debugModelExistence(modelToDelete.id);
        console.log('📊 Estado después de eliminación:', afterDeleteDebug);
        
        // Forzar limpieza completa del caché
        console.log('🧹 Forzando limpieza completa del caché...');
        await forceClearCache();
        
        // Refrescar los datos desde la base de datos usando función fresca
        console.log('🔄 Refrescando datos frescos desde la base de datos...');
        await refreshDataAfterDeletion(modelToDelete.id);
        console.log('✅ Datos frescos refrescados correctamente');
        
        toast({ title: "Éxito", description: "Modelo eliminado correctamente." });
        console.log('🎉 Eliminación completada exitosamente');
        
        // Redirigir para forzar una recarga completa de la página
        console.log('🔄 Redirigiendo para forzar recarga completa...');
        router.refresh();
        } catch (error) {
            console.error('❌ Error in confirmDeleteModel:', error);
            let errorMessage = 'Error desconocido al eliminar el modelo';
            let errorTitle = 'Error al eliminar modelo';
            
            if (error instanceof Error) {
                errorMessage = error.message;
                // Detectar si el modelo ya no existe
                if (error.message.includes('no existe') || error.message.includes('ya no existe')) {
                    errorTitle = 'Modelo ya eliminado';
                    errorMessage = 'El modelo ya no existe en la base de datos. Puede haber sido eliminado manualmente.';
                }
            }
            
            toast({ 
                variant: "destructive", 
                title: errorTitle, 
                description: errorMessage 
            });
        } finally {
            setModelToDelete(null);
            console.log('🏁 Proceso de eliminación finalizado');
        }
  };

  const filteredModels = models.filter(model =>
    `${model.brand} ${model.name} ${model.processor || ''}`.toLowerCase().includes(modelSearch.toLowerCase())
  );
  
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* Brand Modal */}
        <Dialog open={brandModalOpen} onOpenChange={handleBrandModalOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{currentBrand ? "Editar Marca" : "Añadir Marca"}</DialogTitle>
                </DialogHeader>
                <form id="brand-form" onSubmit={handleAddOrUpdateBrand}>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="name">Nombre</Label>
                        <Input id="name" name="name" defaultValue={currentBrand?.name} required />
                    </div>
                    <DialogFooter>
                        <Button type="submit" form="brand-form" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        {/* Model Modal */}
        <Dialog open={modelModalOpen} onOpenChange={handleModelModalOpenChange}>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>{currentModel ? "Editar Modelo" : `Añadir Nuevo Modelo`}</DialogTitle>
            </DialogHeader>
            <form key={formKey} id="model-form" onSubmit={handleAddOrUpdateModel}>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre del Modelo</Label>
                        <Input id="name" name="name" defaultValue={currentModel?.name} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="brand">Marca</Label>
                        <Select name="brand" defaultValue={currentModel ? initialBrands.find(b => b.name === currentModel.brand)?.id : undefined} required>
                            <SelectTrigger><SelectValue placeholder="Selecciona una marca" /></SelectTrigger>
                            <SelectContent>
                                {sortedBrands.map(brand => (
                                    <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">Categoría</Label>
                        <Select name="category" defaultValue={currentModel?.category || "Phone"} required>
                            <SelectTrigger><SelectValue placeholder="Selecciona una categoría" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Phone">Teléfono</SelectItem>
                                <SelectItem value="Mac">Mac</SelectItem>
                                <SelectItem value="iPad">iPad</SelectItem>
                                <SelectItem value="Watch">Watch</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="processor">Procesador (opcional)</Label>
                         <Select name="processor" defaultValue={currentModel?.processor}>
                            <SelectTrigger><SelectValue placeholder="No especificar" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="No especificar">No especificar</SelectItem>
                                <SelectItem value="Qualcomm">Qualcomm (Snapdragon)</SelectItem>
                                <SelectItem value="Exynos">Exynos</SelectItem>
                                <SelectItem value="MediaTek">MediaTek (Helio, Dimensity)</SelectItem>
                                <SelectItem value="Kirin">Kirin</SelectItem>
                                <SelectItem value="Tensor">Google Tensor</SelectItem>
                                <SelectItem value="Unisoc">Spreadtrum (Unisoc)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" form="model-form" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar
                    </Button>
                </DialogFooter>
            </form>
            </DialogContent>
        </Dialog>

      <div className="flex items-center">
        <h1 className="font-semibold text-3xl">🏷️ Marcas y Modelos</h1>
      </div>

      <Accordion type="multiple" className="w-full space-y-4">
        <AccordionItem value="brands-section">
          <Card>
            <AccordionTrigger className="text-lg font-medium p-6 hover:no-underline">
                <span className="flex-1 text-left">
                    <span className="mr-2">🗃️</span>Gestión de Marcas
                </span>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent>
                <div className="flex justify-end mb-4">
                    <Button size="sm" onClick={() => { setCurrentBrand(null); setBrandModalOpen(true); }}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Añadir Marca
                    </Button>
                </div>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre de la Marca</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialBrands.map((brand) => (
                                <TableRow key={brand.id}>
                                    <TableCell className="font-medium">{brand.name}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => {setCurrentBrand(brand); setBrandModalOpen(true)}}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteBrand(brand)}>
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>

        <AccordionItem value="models-section">
            <Card>
                <AccordionTrigger className="text-lg font-medium p-6 hover:no-underline">
                    <span className="flex-1 text-left">
                        <span className="mr-2">📱</span>Gestión de Modelos
                    </span>
                </AccordionTrigger>
                <AccordionContent>
                    <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                                placeholder="Buscar modelo, marca, procesador..." 
                                className="pl-10"
                                value={modelSearch}
                                onChange={(e) => setModelSearch(e.target.value)}
                            />
                        </div>
                        <Button size="sm" onClick={() => { setCurrentModel(null); setModelModalOpen(true); }}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Añadir Modelo
                        </Button>
                    </div>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre del Modelo</TableHead>
                                    <TableHead>Marca</TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead>Procesador</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredModels.map((model) => (
                                    <TableRow key={model.id}>
                                        <TableCell className="font-medium">{model.name}</TableCell>
                                        <TableCell>{model.brand}</TableCell>
                                        <TableCell>{model.category}</TableCell>
                                        <TableCell>{model.processor || '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => {setCurrentModel(model); setModelModalOpen(true)}}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive">
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta acción no se puede deshacer. Esto eliminará permanentemente el modelo "{model.name}" de la marca {model.brand}.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction 
                                                            onClick={() => {
                                                                setModelToDelete(model);
                                                                confirmDeleteModel();
                                                            }}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            Eliminar
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredModels.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No se encontraron modelos.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    </CardContent>
                </AccordionContent>
            </Card>
        </AccordionItem>
      </Accordion>
    </main>
  );
}

    
    