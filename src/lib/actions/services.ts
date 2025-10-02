
"use server";

import { revalidatePath } from "next/cache";
import { collection, getDocs, getDoc, addDoc, doc, updateDoc, deleteDoc, orderBy, query } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import type { Service } from "@/lib/db/types";
import { v4 as uuidv4 } from 'uuid';
import { unstable_cache } from 'next/cache';

// Firestore collection reference
const servicesCollectionRef = collection(db, "services");

export async function uploadImageAndGetURL(imageFile: File): Promise<string> {
    const fileExtension = imageFile.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const storageRef = ref(storage, `services/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, imageFile);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
}

// Caché optimizado para servicios
const getCachedServices = unstable_cache(
  async (): Promise<Service[]> => {
    try {
      const querySnapshot = await getDocs(
        query(servicesCollectionRef, orderBy('name'))
      );
      const services: Service[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        services.push({ 
          id: doc.id, 
          ...data,
          // Asegurar que los campos requeridos existan
          name: data.name || '',
          type: data.type || 'unlock',
          description: data.description || ''
        } as Service);
      });
      return services;
    } catch (error) {
      console.error('Error fetching services:', error);
      return [];
    }
  },
  ['services-list'],
  {
    revalidate: 300, // 5 minutos
    tags: ['services']
  }
);

export async function getServices(): Promise<Service[]> {
  return getCachedServices();
}

// Caché optimizado para servicio individual
const getCachedServiceById = unstable_cache(
  async (id: string): Promise<Service | undefined> => {
    try {
      if (!id || typeof id !== 'string') {
        console.warn('Invalid service ID provided:', id);
        return undefined;
      }
      
      const serviceDoc = doc(db, "services", id);
      const docSnap = await getDoc(serviceDoc);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return { 
          id: docSnap.id, 
          ...data,
          // Asegurar que los campos requeridos existan
          name: data.name || '',
          type: data.type || 'unlock',
          description: data.description || ''
        } as Service;
      }
      return undefined;
    } catch (error) {
      console.error('Error fetching service by ID:', id, error);
      return undefined;
    }
  },
  ['service-by-id'],
  {
    revalidate: 600, // 10 minutos
    tags: ['services']
  }
);

export async function getServiceById(id: string): Promise<Service | undefined> {
  return getCachedServiceById(id);
}

export async function addService(data: Omit<Service, 'id' | 'description' > & { description?: string }): Promise<Service> {
  const serviceData = {
      ...data,
      description: data.description || "",
  };
  const docRef = await addDoc(servicesCollectionRef, serviceData);
  revalidatePath("/admin/services");
  revalidatePath(`/admin/services/${docRef.id}`);
  return { id: docRef.id, ...serviceData };
}

export async function updateService(id: string, data: Partial<Omit<Service, 'id'>>): Promise<Service | null> {
  const serviceDoc = doc(db, "services", id);
  // Firestore doesn't like `undefined` values. Let's clean the data.
  const cleanData = JSON.parse(JSON.stringify(data));
  await updateDoc(serviceDoc, cleanData);

  revalidatePath("/admin/services");
  revalidatePath(`/admin/services/${id}`);
  const updatedDoc = await getDoc(serviceDoc);
  if (updatedDoc.exists()){
      return { id: updatedDoc.id, ...updatedDoc.data() } as Service;
  }
  return null;
}

export async function deleteService(id: string): Promise<void> {
  const serviceDoc = doc(db, "services", id);
  await deleteDoc(serviceDoc);
  revalidatePath("/admin/services");
  return Promise.resolve();
}
