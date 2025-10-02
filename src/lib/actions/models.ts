
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { collection, getDocs, getDoc, addDoc, doc, updateDoc, deleteDoc, writeBatch, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Model } from "@/lib/db/types";
import { unstable_cache } from 'next/cache';

// Firestore collection reference
const modelsCollectionRef = collection(db, "models");

// Caché optimizado para modelos con revalidación automática
const getCachedModels = unstable_cache(
  async (): Promise<Model[]> => {
    try {
      // Usar una sola ordenación para evitar índices compuestos complejos
      const querySnapshot = await getDocs(
        query(modelsCollectionRef, orderBy('brand')) // Sin límite para obtener todos los modelos
      );
      const models: Model[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        models.push({ 
          id: doc.id, 
          ...data,
          // Asegurar que los campos requeridos existan
          brand: data.brand || '',
          name: data.name || '',
          category: data.category || 'Phone'
        } as Model);
      });
      
      // Ordenar por nombre en memoria para mejor rendimiento
      return models.sort((a, b) => {
        const brandCompare = a.brand.localeCompare(b.brand);
        if (brandCompare !== 0) return brandCompare;
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  },
  ['models-list'],
  {
    revalidate: 300, // 5 minutos
    tags: ['models']
  }
);

export async function getModels(): Promise<Model[]> {
  return getCachedModels();
}

// Caché optimizado para modelo individual
const getCachedModelById = unstable_cache(
  async (id: string): Promise<Model | undefined> => {
    try {
      if (!id || typeof id !== 'string') {
        console.warn('Invalid model ID provided:', id);
        return undefined;
      }
      
      const modelDoc = doc(db, "models", id);
      const docSnap = await getDoc(modelDoc);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return { 
          id: docSnap.id, 
          ...data,
          // Asegurar que los campos requeridos existan
          brand: data.brand || '',
          name: data.name || '',
          category: data.category || 'Phone'
        } as Model;
      }
      return undefined;
    } catch (error) {
      console.error('Error fetching model by ID:', id, error);
      return undefined;
    }
  },
  ['model-by-id'],
  {
    revalidate: 600, // 10 minutos para modelos individuales
    tags: ['models', 'model-by-id']
  }
);

export async function getModelById(id: string): Promise<Model | undefined> {
  return getCachedModelById(id);
}

export async function addModel(data: Omit<Model, 'id'>): Promise<Model> {
  try {
    console.log('addModel called with data:', data);
    
    // Validar datos antes de enviar a Firestore
    if (!data.name || !data.brand || !data.category) {
      console.log('Validation failed:', { name: data.name, brand: data.brand, category: data.category });
      throw new Error('Faltan campos requeridos: nombre, marca y categoría son obligatorios.');
    }

    const cleanData = JSON.parse(JSON.stringify(data));
    console.log('Clean data to be saved:', cleanData);
    
    const docRef = await addDoc(modelsCollectionRef, cleanData);
    console.log('Model added successfully with ID:', docRef.id);
    
    // Revalidar caché y rutas relacionadas de manera más agresiva
    revalidateTag('models');
    revalidateTag('models-list');
    revalidateTag('model-by-id');
    revalidatePath("/admin/brands", 'layout');
    revalidatePath("/admin/brands", 'page');
    revalidatePath("/admin/prices", 'layout');
    revalidatePath("/admin/prices", 'page');
    revalidatePath("/admin", 'layout');
    revalidatePath("/", 'layout');
    
    return { id: docRef.id, ...cleanData };
  } catch (error) {
    console.error('Error adding model:', error);
    throw new Error(`No se pudo añadir el modelo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

export async function updateModel(id: string, data: Partial<Omit<Model, 'id'>>): Promise<Model | null> {
    const modelDoc = doc(db, "models", id);
    
    // Firestore disallows undefined values. We need to clean the data object.
    const cleanData = JSON.parse(JSON.stringify(data));

    await updateDoc(modelDoc, cleanData);

    // Revalidar cache y páginas relacionadas
    revalidateTag('models');
    revalidateTag(`model-by-id-${id}`);
    revalidatePath("/admin/prices");
    revalidatePath('/model', 'layout');
    revalidatePath("/");
    // Invalidar específicamente el caché del modelo individual
    revalidatePath(`/model/${id}`, 'layout');

    const updatedDoc = await getDoc(modelDoc);
    if (updatedDoc.exists()) {
        return { id: updatedDoc.id, ...updatedDoc.data() } as Model;
    }
    return null;
}

export async function deleteModel(id: string): Promise<void> {
  const modelDoc = doc(db, "models", id);
  await deleteDoc(modelDoc);
  revalidatePath("/admin/brands");
  revalidatePath("/");
  return Promise.resolve();
}

export async function updatePricesInBatch(pricesToUpdate: Record<string, number>, serviceId: string): Promise<Model[]> {
    const modelIds = Object.keys(pricesToUpdate);
    if (modelIds.length === 0) {
        throw new Error("No prices provided for batch update.");
    }

    const batch = writeBatch(db);
    const modelRefs = modelIds.map(id => doc(db, "models", id));

    modelRefs.forEach(modelRef => {
        const newPrice = pricesToUpdate[modelRef.id];
        const fieldToUpdate = `priceOverrides.${serviceId}`;
        batch.update(modelRef, { [fieldToUpdate]: newPrice });
    });

    await batch.commit();

    // Re-fetch the updated models to return them
    const updatedDocsPromises = modelRefs.map(ref => getDoc(ref));
    const updatedDocsSnapshots = await Promise.all(updatedDocsPromises);
    
    const updatedModels = updatedDocsSnapshots
        .filter(snapshot => snapshot.exists())
        .map(snapshot => ({ id: snapshot.id, ...snapshot.data() } as Model));

    // Revalidar cache y páginas relacionadas
    revalidateTag('models');
    revalidatePath("/admin/prices");
    revalidatePath('/model', 'layout');
    return updatedModels;
}

export async function setAllPricesUnderConstruction(): Promise<void> {
    const querySnapshot = await getDocs(modelsCollectionRef);
    if (querySnapshot.empty) {
        return;
    }

    const batch = writeBatch(db);

    querySnapshot.forEach(modelDoc => {
        batch.update(modelDoc.ref, { priceOverrides: null });
    });

    await batch.commit();
    
    // Revalidar cache y páginas relacionadas
    revalidateTag('models');
    revalidatePath("/admin/prices");
    revalidatePath('/model', 'layout');
}

    

    