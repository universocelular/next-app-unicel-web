
"use server";

import { writeBatch, collection, getDocs, doc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { services } from "@/lib/db/data";
import { Brand, Model, Service } from "./db/types";

// This is a temporary list to add the new models.
// It will be merged with existing data in Firestore.
const newAlcatelModels: Omit<Model, 'id'>[] = [
    { name: '1X', brand: 'Alcatel', category: 'Phone' },
    { name: '3', brand: 'Alcatel', category: 'Phone' },
    { name: '3X', brand: 'Alcatel', category: 'Phone' },
    { name: '3V', brand: 'Alcatel', category: 'Phone' },
    { name: '5', brand: 'Alcatel', category: 'Phone' },
    { name: 'V3', brand: 'Alcatel', category: 'Phone' },
    { name: 'V3 Classic', brand: 'Alcatel', category: 'Phone' },
    { name: 'V3 Pro', brand: 'Alcatel', category: 'Phone' },
    { name: 'V3 Ultra', brand: 'Alcatel', category: 'Phone' },
    { name: '1', brand: 'Alcatel', category: 'Phone' },
    { name: '1c (2019)', brand: 'Alcatel', category: 'Phone' },
    { name: '1S (2020)', brand: 'Alcatel', category: 'Phone' },
    { name: '1SE (2020)', brand: 'Alcatel', category: 'Phone' },
    { name: '1V (2020)', brand: 'Alcatel', category: 'Phone' },
    { name: '3T 8', brand: 'Alcatel', category: 'iPad' },
    { name: '3v (2019)', brand: 'Alcatel', category: 'Phone' },
    { name: '5085C Pulsemix', brand: 'Alcatel', category: 'Phone' },
    { name: 'Axia QS5509A', brand: 'Alcatel', category: 'Phone' },
    { name: 'Go Flip 3 (4052W)', brand: 'Alcatel', category: 'Phone' },
    { name: 'Go Flip 4', brand: 'Alcatel', category: 'Phone' },
    { name: 'Insight', brand: 'Alcatel', category: 'Phone' },
    { name: 'MyFlip', brand: 'Alcatel', category: 'Phone' },
    { name: 'Onyx 5008R', brand: 'Alcatel', category: 'Phone' },
    { name: 'OT 20.00', brand: 'Alcatel', category: 'Phone' },
    { name: 'OT 4044N Go Flip 2', brand: 'Alcatel', category: 'Phone' },
    { name: 'Revvl 4 Plus 5062Z', brand: 'Alcatel', category: 'Phone' },
    { name: 'SmartFlip', brand: 'Alcatel', category: 'Phone' },
    { name: 'TCL 5004C Cricket Lumos', brand: 'Alcatel', category: 'Phone' },
];

const newHuaweiModels: Omit<Model, 'id'>[] = [
    { name: 'P20', brand: 'Huawei', category: 'Phone' },
    { name: 'P20 Pro', brand: 'Huawei', category: 'Phone' },
    { name: 'P20 Lite', brand: 'Huawei', category: 'Phone' },
    { name: 'P30', brand: 'Huawei', category: 'Phone' },
    { name: 'P30 Pro', brand: 'Huawei', category: 'Phone' },
    { name: 'P30 Lite', brand: 'Huawei', category: 'Phone' },
    { name: 'P Smart (2018)', brand: 'Huawei', category: 'Phone' },
    { name: 'P Smart (2019)', brand: 'Huawei', category: 'Phone' },
    { name: 'P Smart Z', brand: 'Huawei', category: 'Phone' },
    { name: 'P30 New Edition', brand: 'Huawei', category: 'Phone' },
    { name: 'P30 Lite New Edition', brand: 'Huawei', category: 'Phone' },
    { name: 'P Smart S', brand: 'Huawei', category: 'Phone' },
    { name: 'P40', brand: 'Huawei', category: 'Phone' },
    { name: 'P40 Lite', brand: 'Huawei', category: 'Phone' },
    { name: 'P40 Lite E', brand: 'Huawei', category: 'Phone' },
    { name: 'P40 Pro', brand: 'Huawei', category: 'Phone' },
    { name: 'P40 Pro+', brand: 'Huawei', category: 'Phone' },
    { name: 'P50', brand: 'Huawei', category: 'Phone' },
    { name: 'P50 Pro', brand: 'Huawei', category: 'Phone' },
    { name: 'P50 Pocket', brand: 'Huawei', category: 'Phone' },
    { name: 'P50E', brand: 'Huawei', category: 'Phone' },
    { name: 'P60', brand: 'Huawei', category: 'Phone' },
    { name: 'P60 Pro', brand: 'Huawei', category: 'Phone' },
    { name: 'Nova 13', brand: 'Huawei', category: 'Phone' },
    { name: 'Nova 13 Pro', brand: 'Huawei', category: 'Phone' },
    { name: 'Nova Flip', brand: 'Huawei', category: 'Phone' },
    { name: 'Nova 12', brand: 'Huawei', category: 'Phone' },
    { name: 'Nova 12 Pro', brand: 'Huawei', category: 'Phone' },
    { name: 'Nova 12 Ultra', brand: 'Huawei', category: 'Phone' },
    { name: 'Nova 12 SE', brand: 'Huawei', category: 'Phone' },
    { name: 'Nova 12s', brand: 'Huawei', category: 'Phone' },
    { name: 'Nova 12i', brand: 'Huawei', category: 'Phone' },
    { name: 'Nova Y72', brand: 'Huawei', category: 'Phone' },
    { name: 'Mate 20', brand: 'Huawei', category: 'Phone' },
    { name: 'Mate 20 Pro', brand: 'Huawei', category: 'Phone' },
    { name: 'Mate 20 X', brand: 'Huawei', category: 'Phone' },
    { name: 'Mate 20 RS Porsche', brand: 'Huawei', category: 'Phone' },
    { name: 'Mate 30', brand: 'Huawei', category: 'Phone' },
    { name: 'Mate 30 Pro', brand: 'Huawei', category: 'Phone' },
    { name: 'Mate 30E Pro', brand: 'Huawei', category: 'Phone' },
    { name: 'Mate 30 RS', brand: 'Huawei', category: 'Phone' },
    { name: 'Mate X', brand: 'Huawei', category: 'Phone' },
    { name: 'Mate Xs', brand: 'Huawei', category: 'Phone' },
    { name: 'Mate X2', brand: 'Huawei', category: 'Phone' },
    { name: 'Mate Xs2', brand: 'Huawei', category: 'Phone' },
    { name: 'Mate XT', brand: 'Huawei', category: 'Phone' },
    { name: 'Mate XT Ultimate', brand: 'Huawei', category: 'Phone' },
    { name: 'Mate 70', brand: 'Huawei', category: 'Phone' },
    { name: 'Mate 70 Pro', brand: 'Huawei', category: 'Phone' },
    { name: 'Mate 70 Pro+', brand: 'Huawei', category: 'Phone' },
    { name: 'Mate 70 RS', brand: 'Huawei', category: 'Phone' },
    { name: 'Mate X6', brand: 'Huawei', category: 'Phone' },
    { name: 'Pura 70', brand: 'Huawei', category: 'Phone' },
    { name: 'Pura 70 Pro', brand: 'Huawei', category: 'Phone' },
    { name: 'Pura 70 Ultra', brand: 'Huawei', category: 'Phone' },
    { name: 'Pura 80', brand: 'Huawei', category: 'Phone' },
    { name: 'Pura 80 Pro', brand: 'Huawei', category: 'Phone' },
    { name: 'Pura 80 Pro+', brand: 'Huawei', category: 'Phone' },
    { name: 'Pura 80 Ultra', brand: 'Huawei', category: 'Phone' },
    { name: 'Pocket 3', brand: 'Huawei', category: 'Phone' },
    { name: 'Pura X', brand: 'Huawei', category: 'Phone' },
];

const newIphoneModels: Omit<Model, 'id'>[] = [
    { name: 'iPhone 16', brand: 'Apple', category: 'Phone' },
    { name: 'iPhone 16 Plus', brand: 'Apple', category: 'Phone' },
    { name: 'iPhone 16 Pro', brand: 'Apple', category: 'Phone' },
    { name: 'iPhone 16 Pro Max', brand: 'Apple', category: 'Phone' },
    { name: 'iPhone 16e', brand: 'Apple', category: 'Phone' },
];

const newGoogleModels: Omit<Model, 'id'>[] = [
    { name: 'Pixel 5', brand: 'Google', category: 'Phone', processor: 'Qualcomm' },
    { name: 'Pixel 6', brand: 'Google', category: 'Phone', processor: 'Tensor' },
    { name: 'Pixel 6 Pro', brand: 'Google', category: 'Phone', processor: 'Tensor' },
    { name: 'Pixel 6a', brand: 'Google', category: 'Phone', processor: 'Tensor' },
    { name: 'Pixel 7', brand: 'Google', category: 'Phone', processor: 'Tensor' },
    { name: 'Pixel 7 Pro', brand: 'Google', category: 'Phone', processor: 'Tensor' },
    { name: 'Pixel 7a', brand: 'Google', category: 'Phone', processor: 'Tensor' },
    { name: 'Pixel 8', brand: 'Google', category: 'Phone', processor: 'Tensor' },
    { name: 'Pixel 8 Pro', brand: 'Google', category: 'Phone', processor: 'Tensor' },
    { name: 'Pixel 8a', brand: 'Google', category: 'Phone', processor: 'Tensor' },
    { name: 'Pixel 9', brand: 'Google', category: 'Phone', processor: 'Tensor' },
    { name: 'Pixel 9 Pro', brand: 'Google', category: 'Phone', processor: 'Tensor' },
    { name: 'Pixel 9 Pro Fold', brand: 'Google', category: 'Phone', processor: 'Tensor' },
    { name: 'Pixel 9 Pro XL', brand: 'Google', category: 'Phone', processor: 'Tensor' },
    { name: 'Pixel Fold', brand: 'Google', category: 'Phone', processor: 'Tensor' },
];

const newHonorModels: Omit<Model, 'id'>[] = [
    { name: '100', brand: 'Honor', category: 'Phone' },
    { name: '100 Pro', brand: 'Honor', category: 'Phone' },
    { name: '10X Lite', brand: 'Honor', category: 'Phone' },
    { name: '200', brand: 'Honor', category: 'Phone' },
    { name: '200 Lite', brand: 'Honor', category: 'Phone' },
    { name: '200 Pro', brand: 'Honor', category: 'Phone' },
    { name: '200 Smart', brand: 'Honor', category: 'Phone' },
    { name: '50', brand: 'Honor', category: 'Phone' },
    { name: '50 Lite', brand: 'Honor', category: 'Phone' },
    { name: '70', brand: 'Honor', category: 'Phone' },
    { name: '90', brand: 'Honor', category: 'Phone' },
    { name: '90 GT', brand: 'Honor', category: 'Phone' },
    { name: '90 Lite', brand: 'Honor', category: 'Phone' },
    { name: '90 Pro', brand: 'Honor', category: 'Phone' },
    { name: '90 Smart', brand: 'Honor', category: 'Phone' },
    { name: 'Magic Vs', brand: 'Honor', category: 'Phone' },
    { name: 'Magic Vs2', brand: 'Honor', category: 'Phone' },
    { name: 'Magic4 Lite', brand: 'Honor', category: 'Phone' },
    { name: 'Magic5 Lite', brand: 'Honor', category: 'Phone' },
    { name: 'Magic5 Pro', brand: 'Honor', category: 'Phone' },
    { name: 'Magic6', brand: 'Honor', category: 'Phone' },
    { name: 'Magic6 Lite', brand: 'Honor', category: 'Phone' },
    { name: 'Magic6 Pro', brand: 'Honor', category: 'Phone' },
    { name: 'Magic6 Ultimate', brand: 'Honor', category: 'Phone' },
    { name: 'Play 60 Plus', brand: 'Honor', category: 'Phone' },
    { name: 'Play 8T', brand: 'Honor', category: 'Phone' },
    { name: 'X5', brand: 'Honor', category: 'Phone' },
    { name: 'X5 Plus', brand: 'Honor', category: 'Phone' },
    { name: 'X50 GT', brand: 'Honor', category: 'Phone' },
    { name: 'X50 Pro', brand: 'Honor', category: 'Phone' },
    { name: 'X50i Plus', brand: 'Honor', category: 'Phone' },
    { name: 'X60i', brand: 'Honor', category: 'Phone' },
    { name: 'X6a', brand: 'Honor', category: 'Phone' },
    { name: 'X6b', brand: 'Honor', category: 'Phone' },
    { name: 'X6S', brand: 'Honor', category: 'Phone' },
    { name: 'X7b', brand: 'Honor', category: 'Phone' },
    { name: 'X8b', brand: 'Honor', category: 'Phone' },
    { name: 'X9 5G', brand: 'Honor', category: 'Phone' },
    { name: '7A', brand: 'Honor', category: 'Phone' },
    { name: '7C', brand: 'Honor', category: 'Phone' },
    { name: '7S', brand: 'Honor', category: 'Phone' },
    { name: '8A', brand: 'Honor', category: 'Phone' },
    { name: '8C', brand: 'Honor', category: 'Phone' },
    { name: '8S', brand: 'Honor', category: 'Phone' },
    { name: '8X', brand: 'Honor', category: 'Phone' },
    { name: '8X Max', brand: 'Honor', category: 'Phone' },
    { name: '9A', brand: 'Honor', category: 'Phone' },
    { name: '9C', brand: 'Honor', category: 'Phone' },
    { name: '9N', brand: 'Honor', category: 'Phone' },
    { name: '9S', brand: 'Honor', category: 'Phone' },
    { name: '9X', brand: 'Honor', category: 'Phone' },
    { name: '9X Pro', brand: 'Honor', category: 'Phone' },
    { name: '10', brand: 'Honor', category: 'Phone' },
    { name: '10 GT', brand: 'Honor', category: 'Phone' },
    { name: '10 Lite', brand: 'Honor', category: 'Phone' },
    { name: '20', brand: 'Honor', category: 'Phone' },
    { name: '20 Lite', brand: 'Honor', category: 'Phone' },
    { name: '20 Pro', brand: 'Honor', category: 'Phone' },
    { name: '20e', brand: 'Honor', category: 'Phone' },
    { name: '20i', brand: 'Honor', category: 'Phone' },
    { name: '30', brand: 'Honor', category: 'Phone' },
    { name: '30 Lite', brand: 'Honor', category: 'Phone' },
    { name: '30 Pro', brand: 'Honor', category: 'Phone' },
    { name: '30 Pro+', brand: 'Honor', category: 'Phone' },
    { name: '30i', brand: 'Honor', category: 'Phone' },
    { name: '30S', brand: 'Honor', category: 'Phone' },
    { name: '50 Pro', brand: 'Honor', category: 'Phone' },
    { name: '60', brand: 'Honor', category: 'Phone' },
    { name: '60 Pro', brand: 'Honor', category: 'Phone' },
    { name: '60 SE', brand: 'Honor', category: 'Phone' },
    { name: '70 Pro', brand: 'Honor', category: 'Phone' },
    { name: '70 Pro+', brand: 'Honor', category: 'Phone' },
    { name: '80', brand: 'Honor', category: 'Phone' },
    { name: '80 GT', brand: 'Honor', category: 'Phone' },
    { name: '80 Pro', brand: 'Honor', category: 'Phone' },
    { name: '80 SE', brand: 'Honor', category: 'Phone' },
    { name: 'Magic 2', brand: 'Honor', category: 'Phone' },
    { name: 'Magic 3', brand: 'Honor', category: 'Phone' },
    { name: 'Magic 3 Pro', brand: 'Honor', category: 'Phone' },
    { name: 'Magic 3 Pro+', brand: 'Honor', category: 'Phone' },
    { name: 'Magic 4', brand: 'Honor', category: 'Phone' },
    { name: 'Magic 4 Pro', brand: 'Honor', category: 'Phone' },
    { name: 'Magic 5', brand: 'Honor', category: 'Phone' },
    { name: 'Magic 6', brand: 'Honor', category: 'Phone' },
    { name: 'Magic 7', brand: 'Honor', category: 'Phone' },
    { name: 'Magic 7 Pro', brand: 'Honor', category: 'Phone' },
    { name: 'Magic V', brand: 'Honor', category: 'Phone' },
    { name: 'Magic V2', brand: 'Honor', category: 'Phone' },
    { name: 'Magic V3', brand: 'Honor', category: 'Phone' },
    { name: 'V20', brand: 'Honor', category: 'Phone' },
    { name: 'V30', brand: 'Honor', category: 'Phone' },
    { name: 'V30 Pro', brand: 'Honor', category: 'Phone' },
    { name: 'Play', brand: 'Honor', category: 'Phone' },
    { name: 'Play 3', brand: 'Honor', category: 'Phone' },
    { name: 'Play 3e', brand: 'Honor', category: 'Phone' },
    { name: 'Play 4', brand: 'Honor', category: 'Phone' },
    { name: 'Play 4 Pro', brand: 'Honor', category: 'Phone' },
    { name: 'Play 4T', brand: 'Honor', category: 'Phone' },
    { name: 'Play 4T Pro', brand: 'Honor', category: 'Phone' },
    { name: 'Play 5', brand: 'Honor', category: 'Phone' },
    { name: 'Play 5T', brand: 'Honor', category: 'Phone' },
    { name: 'Play 6T', brand: 'Honor', category: 'Phone' },
    { name: 'Play 6C', brand: 'Honor', category: 'Phone' },
    { name: 'Play 7', brand: 'Honor', category: 'Phone' },
    { name: 'Play 8', brand: 'Honor', category: 'Phone' },
    { name: 'Play 9A', brand: 'Honor', category: 'Phone' },
    { name: 'Play 9C', brand: 'Honor', category: 'Phone' },
    { name: 'Play 9X', brand: 'Honor', category: 'Phone' },
    { name: 'Play 10', brand: 'Honor', category: 'Phone' },
    { name: 'Play 20', brand: 'Honor', category: 'Phone' },
    { name: 'Play 30', brand: 'Honor', category: 'Phone' },
    { name: 'Play 40', brand: 'Honor', category: 'Phone' },
    { name: 'Play 50', brand: 'Honor', category: 'Phone' },
    { name: 'X10', brand: 'Honor', category: 'Phone' },
    { name: 'X10 Max', brand: 'Honor', category: 'Phone' },
    { name: 'X20', brand: 'Honor', category: 'Phone' },
    { name: 'X30', brand: 'Honor', category: 'Phone' },
    { name: 'X40', brand: 'Honor', category: 'Phone' },
    { name: 'X40 GT', brand: 'Honor', category: 'Phone' },
    { name: 'X50', brand: 'Honor', category: 'Phone' },
    { name: 'X60', brand: 'Honor', category: 'Phone' },
    { name: 'X60 Pro', brand: 'Honor', category: 'Phone' },
    { name: 'X6', brand: 'Honor', category: 'Phone' },
    { name: 'X7', brand: 'Honor', category: 'Phone' },
    { name: 'X7a', brand: 'Honor', category: 'Phone' },
    { name: 'X8', brand: 'Honor', category: 'Phone' },
    { name: 'X8a', brand: 'Honor', category: 'Phone' },
    { name: 'X9', brand: 'Honor', category: 'Phone' },
    { name: 'X9a', brand: 'Honor', category: 'Phone' },
    { name: 'X9b', brand: 'Honor', category: 'Phone' },
];

const newLgModels: Omit<Model, 'id'>[] = [
    { name: 'Arena 2 LM-X320APM', brand: 'LG', category: 'Phone' },
    { name: 'Aristo', brand: 'LG', category: 'Phone' },
    { name: 'Aristo 3 LM-X220MA', brand: 'LG', category: 'Phone' },
    { name: 'Aristo 3 Plus LM-X220MB', brand: 'LG', category: 'Phone' },
    { name: 'Aristo 4 Plus', brand: 'LG', category: 'Phone' },
    { name: 'Aristo 5', brand: 'LG', category: 'Phone' },
    { name: 'Aristo LV3', brand: 'LG', category: 'Phone' },
    { name: 'Ego', brand: 'LG', category: 'Phone' },
    { name: 'Escape 3', brand: 'LG', category: 'Phone' },
    { name: 'Escape Plus', brand: 'LG', category: 'Phone' },
    { name: 'Fortune', brand: 'LG', category: 'Phone' },
    { name: 'Fortune 3', brand: 'LG', category: 'Phone' },
    { name: 'G Pad 7.0', brand: 'LG', category: 'iPad' },
    { name: 'G Stylo', brand: 'LG', category: 'Phone' },
    { name: 'G Vista', brand: 'LG', category: 'Phone' },
    { name: 'G3 Vigor', brand: 'LG', category: 'Phone' },
    { name: 'G4', brand: 'LG', category: 'Phone' },
    { name: 'G5', brand: 'LG', category: 'Phone' },
    { name: 'G5 SE', brand: 'LG', category: 'Phone' },
    { name: 'G6', brand: 'LG', category: 'Phone' },
    { name: 'G8 ThinQ LM-G820UM', brand: 'LG', category: 'Phone' },
    { name: 'G8s ThinQ', brand: 'LG', category: 'Phone' },
    { name: 'G8X ThinQ', brand: 'LG', category: 'Phone' },
    { name: 'G Flex', brand: 'LG', category: 'Phone' },
    { name: 'GB102', brand: 'LG', category: 'Phone' },
    { name: 'Harmony', brand: 'LG', category: 'Phone' },
    { name: 'Harmony 3', brand: 'LG', category: 'Phone' },
    { name: 'Harmony 4', brand: 'LG', category: 'Phone' },
    { name: 'Journey', brand: 'LG', category: 'Phone' },
    { name: 'K7', brand: 'LG', category: 'Phone' },
    { name: 'K8', brand: 'LG', category: 'Phone' },
    { name: 'K10', brand: 'LG', category: 'Phone' },
    { name: 'K22', brand: 'LG', category: 'Phone' },
    { name: 'K30 (2019)', brand: 'LG', category: 'Phone' },
    { name: 'K31', brand: 'LG', category: 'Phone' },
    { name: 'K4 Lite', brand: 'LG', category: 'Phone' },
    { name: 'K40', brand: 'LG', category: 'Phone' },
    { name: 'K40S', brand: 'LG', category: 'Phone' },
    { name: 'K41S', brand: 'LG', category: 'Phone' },
    { name: 'K42', brand: 'LG', category: 'Phone' },
    { name: 'K50S', brand: 'LG', category: 'Phone' },
    { name: 'K51', brand: 'LG', category: 'Phone' },
    { name: 'K51S', brand: 'LG', category: 'Phone' },
    { name: 'K52', brand: 'LG', category: 'Phone' },
    { name: 'K20 Plus', brand: 'LG', category: 'Phone' },
    { name: 'Leon', brand: 'LG', category: 'Phone' },
    { name: 'Optimus F6', brand: 'LG', category: 'Phone' },
    { name: 'Optimus F60', brand: 'LG', category: 'Phone' },
    { name: 'Optimus G2', brand: 'LG', category: 'Phone' },
    { name: 'Optimus G mini', brand: 'LG', category: 'Phone' },
    { name: 'Optimus L3', brand: 'LG', category: 'Phone' },
    { name: 'Optimus L3 II', brand: 'LG', category: 'Phone' },
    { name: 'Optimus L70', brand: 'LG', category: 'Phone' },
    { name: 'Phoenix 5', brand: 'LG', category: 'Phone' },
    { name: 'Premiere Pro Plus', brand: 'LG', category: 'Phone' },
    { name: 'Q6 Plus', brand: 'LG', category: 'Phone' },
    { name: 'Q6 Prime', brand: 'LG', category: 'Phone' },
    { name: 'Q7', brand: 'LG', category: 'Phone' },
    { name: 'Q31', brand: 'LG', category: 'Phone' },
    { name: 'Q52', brand: 'LG', category: 'Phone' },
    { name: 'Q61', brand: 'LG', category: 'Phone' },
    { name: 'Q92 5G', brand: 'LG', category: 'Phone' },
    { name: 'Spirit', brand: 'LG', category: 'Phone' },
    { name: 'Spirit 4G', brand: 'LG', category: 'Phone' },
    { name: 'Stylus 2', brand: 'LG', category: 'Phone' },
    { name: 'Stylo 2', brand: 'LG', category: 'Phone' },
    { name: 'Stylo 3', brand: 'LG', category: 'Phone' },
    { name: 'Stylo 3 Plus', brand: 'LG', category: 'Phone' },
    { name: 'Stylo 4 LM-Q710AL', brand: 'LG', category: 'Phone' },
    { name: 'Stylo 4 LM-Q710CS', brand: 'LG', category: 'Phone' },
    { name: 'Stylo 4 LM-Q710MS', brand: 'LG', category: 'Phone' },
    { name: 'Stylo 4 LM-Q710TS', brand: 'LG', category: 'Phone' },
    { name: 'Stylo 4 Plus LM-Q710WA', brand: 'LG', category: 'Phone' },
    { name: 'Stylo 5', brand: 'LG', category: 'Phone' },
    { name: 'Stylo 5 Plus', brand: 'LG', category: 'Phone' },
    { name: 'Stylo 6', brand: 'LG', category: 'Phone' },
    { name: 'V20', brand: 'LG', category: 'Phone' },
    { name: 'V30', brand: 'LG', category: 'Phone' },
    { name: 'V50 ThinQ 5G', brand: 'LG', category: 'Phone' },
    { name: 'V60 ThinQ 5G', brand: 'LG', category: 'Phone' },
    { name: 'Velvet 5G', brand: 'LG', category: 'Phone' },
    { name: 'W11', brand: 'LG', category: 'Phone' },
    { name: 'W31', brand: 'LG', category: 'Phone' },
    { name: 'W31 Plus', brand: 'LG', category: 'Phone' },
    { name: 'W41', brand: 'LG', category: 'Phone' },
    { name: 'W41 Plus', brand: 'LG', category: 'Phone' },
    { name: 'W41 Pro', brand: 'LG', category: 'Phone' },
    { name: 'Wing 5G', brand: 'LG', category: 'Phone' },
    { name: 'X Power', brand: 'LG', category: 'Phone' },
    { name: 'X Power 2', brand: 'LG', category: 'Phone' },
    { name: 'X Venture', brand: 'LG', category: 'Phone' },
    { name: 'X Charge', brand: 'LG', category: 'Phone' },
    { name: 'X220g Q6', brand: 'LG', category: 'Phone' },
    { name: 'X230F K4', brand: 'LG', category: 'Phone' },
    { name: 'Xpression Plus 2', brand: 'LG', category: 'Phone' },
];

const newOppoModels: Omit<Model, 'id'>[] = [
    { name: 'A12', brand: 'Oppo', category: 'Phone' },
    { name: 'A15', brand: 'Oppo', category: 'Phone' },
    { name: 'A16', brand: 'Oppo', category: 'Phone' },
    { name: 'A16s', brand: 'Oppo', category: 'Phone' },
    { name: 'A17', brand: 'Oppo', category: 'Phone' },
    { name: 'A3', brand: 'Oppo', category: 'Phone' },
    { name: 'A3 4G', brand: 'Oppo', category: 'Phone' },
    { name: 'A3 Pro', brand: 'Oppo', category: 'Phone' },
    { name: 'A38', brand: 'Oppo', category: 'Phone' },
    { name: 'A3s', brand: 'Oppo', category: 'Phone' },
    { name: 'A3x', brand: 'Oppo', category: 'Phone' },
    { name: 'A3x 4G', brand: 'Oppo', category: 'Phone' },
    { name: 'A5', brand: 'Oppo', category: 'Phone' },
    { name: 'A5 (2020)', brand: 'Oppo', category: 'Phone' },
    { name: 'A53', brand: 'Oppo', category: 'Phone' },
    { name: 'A53 5G', brand: 'Oppo', category: 'Phone' },
    { name: 'A53s', brand: 'Oppo', category: 'Phone' },
    { name: 'A54', brand: 'Oppo', category: 'Phone' },
    { name: 'A54 5G', brand: 'Oppo', category: 'Phone' },
    { name: 'A57', brand: 'Oppo', category: 'Phone' },
    { name: 'A57 4G', brand: 'Oppo', category: 'Phone' },
    { name: 'A58', brand: 'Oppo', category: 'Phone' },
    { name: 'A60', brand: 'Oppo', category: 'Phone' },
    { name: 'A72', brand: 'Oppo', category: 'Phone' },
    { name: 'A72 5G', brand: 'Oppo', category: 'Phone' },
    { name: 'A77', brand: 'Oppo', category: 'Phone' },
    { name: 'A78', brand: 'Oppo', category: 'Phone' },
    { name: 'A78 4G', brand: 'Oppo', category: 'Phone' },
    { name: 'A79', brand: 'Oppo', category: 'Phone' },
    { name: 'A80', brand: 'Oppo', category: 'Phone' },
    { name: 'A9 (2020)', brand: 'Oppo', category: 'Phone' },
    { name: 'A93', brand: 'Oppo', category: 'Phone' },
    { name: 'A93 5G', brand: 'Oppo', category: 'Phone' },
    { name: 'A94 5G', brand: 'Oppo', category: 'Phone' },
    { name: 'F21 Pro', brand: 'Oppo', category: 'Phone' },
    { name: 'F27', brand: 'Oppo', category: 'Phone' },
    { name: 'Find N', brand: 'Oppo', category: 'Phone' },
    { name: 'Find X2', brand: 'Oppo', category: 'Phone' },
    { name: 'Find X2 Neo', brand: 'Oppo', category: 'Phone' },
    { name: 'Find X2 Pro', brand: 'Oppo', category: 'Phone' },
    { name: 'Find X3 Neo', brand: 'Oppo', category: 'Phone' },
    { name: 'Find X3 Pro', brand: 'Oppo', category: 'Phone' },
    { name: 'K12', brand: 'Oppo', category: 'Phone' },
    { name: 'K12x', brand: 'Oppo', category: 'Phone' },
    { name: 'Reno', brand: 'Oppo', category: 'Phone' },
    { name: 'Reno 5G', brand: 'Oppo', category: 'Phone' },
    { name: 'Reno10', brand: 'Oppo', category: 'Phone' },
    { name: 'Reno10 Pro', brand: 'Oppo', category: 'Phone' },
    { name: 'Reno11', brand: 'Oppo', category: 'Phone' },
    { name: 'Reno11 F', brand: 'Oppo', category: 'Phone' },
    { name: 'Reno11 Pro', brand: 'Oppo', category: 'Phone' },
    { name: 'Reno12', brand: 'Oppo', category: 'Phone' },
    { name: 'Reno12 F', brand: 'Oppo', category: 'Phone' },
    { name: 'Reno12 F 4G', brand: 'Oppo', category: 'Phone' },
    { name: 'Reno12 Pro', brand: 'Oppo', category: 'Phone' },
    { name: 'Reno2 Z', brand: 'Oppo', category: 'Phone' },
    { name: 'Reno3 Pro', brand: 'Oppo', category: 'Phone' },
    { name: 'Reno5 Lite', brand: 'Oppo', category: 'Phone' },
    { name: 'Reno5 Z', brand: 'Oppo', category: 'Phone' },
    { name: 'Reno6', brand: 'Oppo', category: 'Phone' },
    { name: 'Reno6 5G', brand: 'Oppo', category: 'Phone' },
    { name: 'Reno6 Lite', brand: 'Oppo', category: 'Phone' },
    { name: 'Reno7', brand: 'Oppo', category: 'Phone' },
    { name: 'Reno7 5G', brand: 'Oppo', category: 'Phone' },
    { name: 'Reno7 Lite', brand: 'Oppo', category: 'Phone' },
];

const newNokiaModels: Omit<Model, 'id'>[] = [
    { name: '1', brand: 'Nokia', category: 'Phone' },
    { name: '1 Plus', brand: 'Nokia', category: 'Phone' },
    { name: '2', brand: 'Nokia', category: 'Phone' },
    { name: '2.1', brand: 'Nokia', category: 'Phone' },
    { name: '2.2', brand: 'Nokia', category: 'Phone' },
    { name: '2.3', brand: 'Nokia', category: 'Phone' },
    { name: '3', brand: 'Nokia', category: 'Phone' },
    { name: '3.1', brand: 'Nokia', category: 'Phone' },
    { name: '3.2', brand: 'Nokia', category: 'Phone' },
    { name: '3.1 C', brand: 'Nokia', category: 'Phone' },
    { name: '3.1 Plus', brand: 'Nokia', category: 'Phone' },
    { name: '4.2', brand: 'Nokia', category: 'Phone' },
    { name: '5', brand: 'Nokia', category: 'Phone' },
    { name: '5.1', brand: 'Nokia', category: 'Phone' },
    { name: '5.3', brand: 'Nokia', category: 'Phone' },
    { name: '6', brand: 'Nokia', category: 'Phone' },
    { name: '6.1', brand: 'Nokia', category: 'Phone' },
    { name: '6.1 Plus', brand: 'Nokia', category: 'Phone' },
    { name: '6.2', brand: 'Nokia', category: 'Phone' },
    { name: '7', brand: 'Nokia', category: 'Phone' },
    { name: '7 Plus', brand: 'Nokia', category: 'Phone' },
    { name: '7.1', brand: 'Nokia', category: 'Phone' },
    { name: '7.2', brand: 'Nokia', category: 'Phone' },
    { name: '8', brand: 'Nokia', category: 'Phone' },
    { name: '8 Sirocco', brand: 'Nokia', category: 'Phone' },
    { name: '8.1', brand: 'Nokia', category: 'Phone' },
    { name: '8 V 5G UW', brand: 'Nokia', category: 'Phone' },
    { name: '9 PureView', brand: 'Nokia', category: 'Phone' },
    { name: '100', brand: 'Nokia', category: 'Phone' },
    { name: '108', brand: 'Nokia', category: 'Phone' },
    { name: '113', brand: 'Nokia', category: 'Phone' },
    { name: '1600', brand: 'Nokia', category: 'Phone' },
    { name: '1616', brand: 'Nokia', category: 'Phone' },
    { name: '1800', brand: 'Nokia', category: 'Phone' },
    { name: '2690', brand: 'Nokia', category: 'Phone' },
    { name: '2720 Fold', brand: 'Nokia', category: 'Phone' },
    { name: '2730 Classic', brand: 'Nokia', category: 'Phone' },
    { name: '2760', brand: 'Nokia', category: 'Phone' },
    { name: '300 Asha', brand: 'Nokia', category: 'Phone' },
    { name: '302 Asha', brand: 'Nokia', category: 'Phone' },
    { name: '3100', brand: 'Nokia', category: 'Phone' },
    { name: '3210', brand: 'Nokia', category: 'Phone' },
    { name: '3510i', brand: 'Nokia', category: 'Phone' },
    { name: '3710 Fold', brand: 'Nokia', category: 'Phone' },
    { name: '3720 Classic', brand: 'Nokia', category: 'Phone' },
    { name: '5310 XpressMusic', brand: 'Nokia', category: 'Phone' },
    { name: '6021', brand: 'Nokia', category: 'Phone' },
    { name: '6100', brand: 'Nokia', category: 'Phone' },
    { name: '6210 Navigator', brand: 'Nokia', category: 'Phone' },
    { name: '6230', brand: 'Nokia', category: 'Phone' },
    { name: '6555', brand: 'Nokia', category: 'Phone' },
    { name: '6700 Slide', brand: 'Nokia', category: 'Phone' },
    { name: '7230', brand: 'Nokia', category: 'Phone' },
    { name: 'C01 Plus', brand: 'Nokia', category: 'Phone' },
    { name: 'C2', brand: 'Nokia', category: 'Phone' },
    { name: 'C2 2nd Edition', brand: 'Nokia', category: 'Phone' },
    { name: 'C2 Tava', brand: 'Nokia', category: 'Phone' },
    { name: 'C2-01', brand: 'Nokia', category: 'Phone' },
    { name: 'C2-05', brand: 'Nokia', category: 'Phone' },
    { name: 'C20', brand: 'Nokia', category: 'Phone' },
    { name: 'C3', brand: 'Nokia', category: 'Phone' },
    { name: 'C30', brand: 'Nokia', category: 'Phone' },
    { name: 'C5', brand: 'Nokia', category: 'Phone' },
    { name: 'C5-03', brand: 'Nokia', category: 'Phone' },
    { name: 'C7', brand: 'Nokia', category: 'Phone' },
    { name: 'E72', brand: 'Nokia', category: 'Phone' },
    { name: 'G10', brand: 'Nokia', category: 'Phone' },
    { name: 'G310 5G', brand: 'Nokia', category: 'Phone' },
    { name: 'G50', brand: 'Nokia', category: 'Phone' },
    { name: 'N85', brand: 'Nokia', category: 'Phone' },
    { name: 'X10', brand: 'Nokia', category: 'Phone' },
    { name: 'X100', brand: 'Nokia', category: 'Phone' },
    { name: 'X2', brand: 'Nokia', category: 'Phone' },
    { name: 'X20', brand: 'Nokia', category: 'Phone' },
    { name: 'XR20', brand: 'Nokia', category: 'Phone' },
];

const newOnePlusModels: Omit<Model, 'id'>[] = [
    { name: '1', brand: 'OnePlus', category: 'Phone' },
    { name: '2', brand: 'OnePlus', category: 'Phone' },
    { name: 'X', brand: 'OnePlus', category: 'Phone' },
    { name: '3', brand: 'OnePlus', category: 'Phone' },
    { name: '3T', brand: 'OnePlus', category: 'Phone' },
    { name: '5', brand: 'OnePlus', category: 'Phone' },
    { name: '5T', brand: 'OnePlus', category: 'Phone' },
    { name: '6', brand: 'OnePlus', category: 'Phone' },
    { name: '6T', brand: 'OnePlus', category: 'Phone' },
    { name: '7', brand: 'OnePlus', category: 'Phone' },
    { name: '7 Pro', brand: 'OnePlus', category: 'Phone' },
    { name: '7T', brand: 'OnePlus', category: 'Phone' },
    { name: '7T Pro', brand: 'OnePlus', category: 'Phone' },
    { name: '7T Pro 5G McLaren', brand: 'OnePlus', category: 'Phone' },
    { name: '8', brand: 'OnePlus', category: 'Phone' },
    { name: '8 Pro', brand: 'OnePlus', category: 'Phone' },
    { name: '8T', brand: 'OnePlus', category: 'Phone' },
    { name: '8T Plus 5G', brand: 'OnePlus', category: 'Phone' },
    { name: '9', brand: 'OnePlus', category: 'Phone' },
    { name: '9 Pro', brand: 'OnePlus', category: 'Phone' },
    { name: '9R', brand: 'OnePlus', category: 'Phone' },
    { name: 'Ace 2 Pro', brand: 'OnePlus', category: 'Phone' },
    { name: 'Ace Pro', brand: 'OnePlus', category: 'Phone' },
    { name: 'Ace Racing', brand: 'OnePlus', category: 'Phone' },
    { name: 'Nord', brand: 'OnePlus', category: 'Phone' },
    { name: 'Nord 2', brand: 'OnePlus', category: 'Phone' },
    { name: 'Nord 2 5G', brand: 'OnePlus', category: 'Phone' },
    { name: 'Nord 4', brand: 'OnePlus', category: 'Phone' },
    { name: 'Nord CE', brand: 'OnePlus', category: 'Phone' },
    { name: 'Nord N10', brand: 'OnePlus', category: 'Phone' },
    { name: 'Nord N10 5G', brand: 'OnePlus', category: 'Phone' },
    { name: 'Nord N100', brand: 'OnePlus', category: 'Phone' },
    { name: 'Nord N20 5G', brand: 'OnePlus', category: 'Phone' },
    { name: 'Nord N200', brand: 'OnePlus', category: 'Phone' },
    { name: 'Nord N200 5G', brand: 'OnePlus', category: 'Phone' },
    { name: 'Nord N30', brand: 'OnePlus', category: 'Phone' },
    { name: 'Nord N30 SE', brand: 'OnePlus', category: 'Phone' },
    { name: 'Nord N300', brand: 'OnePlus', category: 'Phone' },
    { name: '10 Pro', brand: 'OnePlus', category: 'Phone' },
    { name: '10R', brand: 'OnePlus', category: 'Phone' },
    { name: '10T', brand: 'OnePlus', category: 'Phone' },
    { name: '11', brand: 'OnePlus', category: 'Phone' },
    { name: '11R', brand: 'OnePlus', category: 'Phone' },
];

const newTclModels: Omit<Model, 'id'>[] = [
    { name: '10', brand: 'TCL', category: 'Phone' },
    { name: '10L', brand: 'TCL', category: 'Phone' },
    { name: '10 Pro', brand: 'TCL', category: 'Phone' },
    { name: '20 5G', brand: 'TCL', category: 'Phone' },
    { name: '20 SE', brand: 'TCL', category: 'Phone' },
    { name: '20 Pro 5G', brand: 'TCL', category: 'Phone' },
    { name: '20S', brand: 'TCL', category: 'Phone' },
    { name: '30', brand: 'TCL', category: 'Phone' },
    { name: '30+', brand: 'TCL', category: 'Phone' },
    { name: '30 V', brand: 'TCL', category: 'Phone' },
    { name: '30 XE', brand: 'TCL', category: 'Phone' },
    { name: '30 XE 5G', brand: 'TCL', category: 'Phone' },
    { name: '40 SE', brand: 'TCL', category: 'Phone' },
    { name: '40 XE', brand: 'TCL', category: 'Phone' },
    { name: '40 Pro', brand: 'TCL', category: 'Phone' },
    { name: '40 R', brand: 'TCL', category: 'Phone' },
    { name: '40 XL', brand: 'TCL', category: 'Phone' },
    { name: '50 5G', brand: 'TCL', category: 'Phone' },
    { name: '50 XE', brand: 'TCL', category: 'Phone' },
    { name: '50 Pro', brand: 'TCL', category: 'Phone' },
    { name: '50 XE 5G', brand: 'TCL', category: 'Phone' },
    { name: '55', brand: 'TCL', category: 'Phone' },
    { name: '55 XE', brand: 'TCL', category: 'Phone' },
    { name: '55 Pro', brand: 'TCL', category: 'Phone' },
    { name: '60 XE', brand: 'TCL', category: 'Phone' },
    { name: '60 Pro', brand: 'TCL', category: 'Phone' },
    { name: '60 XE 5G', brand: 'TCL', category: 'Phone' },
    { name: 'Classic', brand: 'TCL', category: 'Phone' },
    { name: 'Flip 2', brand: 'TCL', category: 'Phone' },
    { name: 'Flip Go', brand: 'TCL', category: 'Phone' },
];

const newZteModels: Omit<Model, 'id'>[] = [
    { name: 'Avid 579', brand: 'ZTE', category: 'Phone' },
    { name: 'Avid 589', brand: 'ZTE', category: 'Phone' },
    { name: 'Avid 616', brand: 'ZTE', category: 'Phone' },
    { name: 'Avid 917', brand: 'ZTE', category: 'Phone' },
    { name: 'Axon 10 Pro', brand: 'ZTE', category: 'Phone' },
    { name: 'Axon 11', brand: 'ZTE', category: 'Phone' },
    { name: 'Axon 20 5G', brand: 'ZTE', category: 'Phone' },
    { name: 'Axon 30', brand: 'ZTE', category: 'Phone' },
    { name: 'Axon 30 Ultra', brand: 'ZTE', category: 'Phone' },
    { name: 'Axon 40', brand: 'ZTE', category: 'Phone' },
    { name: 'Axon 40 Ultra', brand: 'ZTE', category: 'Phone' },
    { name: 'Axon 50 Ultra', brand: 'ZTE', category: 'Phone' },
    { name: 'Axon 60 Ultra', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade 10', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade 11 Prime', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade A3', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade A3 Prime', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade A31', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade A31 Plus', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade A31 Lite', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade A321', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade A5', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade A5 2020', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade A51', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade A51 Prime', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade A52', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade A52 Lite', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade A53', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade A54', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade A54 5G', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade A7', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade A7 Prime', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade A71', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade A72', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade A72 5G', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade A73', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade A73 5G', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade V10', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade V2020', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade V2020 Smart', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade V30', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade V30 Vita', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade V40', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade V40 Vita', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade V41 Vita', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade X1 5G', brand: 'ZTE', category: 'Phone' },
    { name: 'Blade X Max', brand: 'ZTE', category: 'Phone' },
    { name: 'Grand X3', brand: 'ZTE', category: 'Phone' },
    { name: 'Libero 5G', brand: 'ZTE', category: 'Phone' },
    { name: 'Libero 5G II', brand: 'ZTE', category: 'Phone' },
    { name: 'Libero 5G III', brand: 'ZTE', category: 'Phone' },
    { name: 'Nubia RedMagic 6', brand: 'ZTE', category: 'Phone' },
    { name: 'Nubia RedMagic 6R', brand: 'ZTE', category: 'Phone' },
    { name: 'Nubia RedMagic 7', brand: 'ZTE', category: 'Phone' },
    { name: 'Nubia RedMagic 7S', brand: 'ZTE', category: 'Phone' },
    { name: 'Nubia Red Magic 8 Pro', brand: 'ZTE', category: 'Phone' },
    { name: 'Nubia RedMagic 9 Pro', brand: 'ZTE', category: 'Phone' },
    { name: 'Nubia Z20', brand: 'ZTE', category: 'Phone' },
    { name: 'Voyage 40', brand: 'ZTE', category: 'Phone' },
    { name: 'Voyage 41', brand: 'ZTE', category: 'Phone' },
    { name: 'Voyage 51', brand: 'ZTE', category: 'Phone' },
    { name: 'Voyage 60', brand: 'ZTE', category: 'Phone' },
    { name: 'ZMax 10', brand: 'ZTE', category: 'Phone' },
    { name: 'ZMax 11', brand: 'ZTE', category: 'Phone' },
    { name: 'ZMax Pro', brand: 'ZTE', category: 'Phone' },
    { name: 'Z832 Sonata 3', brand: 'ZTE', category: 'Phone' },
    { name: 'Z956 Grand X 4', brand: 'ZTE', category: 'Phone' },
    { name: 'Z959 Grand X 3', brand: 'ZTE', category: 'Phone' },
    { name: 'Z983 Blade X Max', brand: 'ZTE', category: 'Phone' },
];

const newInfinixModels: Omit<Model, 'id'>[] = [
    { name: 'Zero 2', brand: 'Infinix', category: 'Phone' },
    { name: 'Zero 3', brand: 'Infinix', category: 'Phone' },
    { name: 'Zero 4', brand: 'Infinix', category: 'Phone' },
    { name: 'Zero 4 Plus', brand: 'Infinix', category: 'Phone' },
    { name: 'Zero 5', brand: 'Infinix', category: 'Phone' },
    { name: 'Zero 5 Pro', brand: 'Infinix', category: 'Phone' },
    { name: 'Zero 6', brand: 'Infinix', category: 'Phone' },
    { name: 'Zero 6 Pro', brand: 'Infinix', category: 'Phone' },
    { name: 'Zero 8', brand: 'Infinix', category: 'Phone' },
    { name: 'Zero 8i', brand: 'Infinix', category: 'Phone' },
    { name: 'Zero 9', brand: 'Infinix', category: 'Phone' },
    { name: 'Zero X', brand: 'Infinix', category: 'Phone' },
    { name: 'Zero X Pro', brand: 'Infinix', category: 'Phone' },
    { name: 'Zero X Neo', brand: 'Infinix', category: 'Phone' },
    { name: 'Zero 5G', brand: 'Infinix', category: 'Phone' },
    { name: 'Zero 20', brand: 'Infinix', category: 'Phone' },
    { name: 'Zero Ultra', brand: 'Infinix', category: 'Phone' },
    { name: 'Zero 30', brand: 'Infinix', category: 'Phone' },
    { name: 'Zero 30 5G', brand: 'Infinix', category: 'Phone' },
    { name: 'Zero 40', brand: 'Infinix', category: 'Phone' },
    { name: 'Zero 40 5G', brand: 'Infinix', category: 'Phone' },
    { name: 'Zero Flip', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 2', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 3', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 3 Pro', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 4', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 4 Pro', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 5', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 5 Stylus', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 6', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 7', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 7 Lite', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 8', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 8i', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 9', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 10', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 10 Pro', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 11', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 11 Pro', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 11 Pro NFC', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 11i', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 11s', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 12', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 12 5G', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 12 Pro', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 12 Pro 5G', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 12 G96', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 12i', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 12 i 2022', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 12 2023', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 12 VIP', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 30', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 30 Pro', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 30 5G', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 30 VIP', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 30i', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 40', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 40 5G', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 40 Pro', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 40 Pro 5G', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 40 Pro+ 5G', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 40X 5G', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 40S', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 40 Racing Edition', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 50', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 50 Pro', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 50 Pro+ 5G', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 50x 5G', brand: 'Infinix', category: 'Phone' },
    { name: 'Note 50s 5G', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 2', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 3', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot S', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 4', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 4 LTE', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 4 Pro', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 5', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 5 Lite', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot S3', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 3X', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot S3X', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 6', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 6 Pro', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 6X', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 7', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 7 Pro', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 8', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 8 Lite', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 9', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 9 Play', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 9 Pro', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 9 Lite', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 10', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 10i', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 10 Pro', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 10s', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 10s NFC', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 10 Lite', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 10 Play', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 10T', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 11', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 11 Play', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 11s', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 11 2022', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 12', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 12 Play', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 12 Pro', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 12i', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 20', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 20 Play', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 20s', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 20 5G', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 20i', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 30', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 30i', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 30 5G', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 30 Play', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 40', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 40i', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 40 Pro', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 50', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 50i', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 50 5G+', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 50 Pro', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 50 Pro+', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 60', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 60i', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 60 5G+', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 60 Pro', brand: 'Infinix', category: 'Phone' },
    { name: 'Hot 60 Pro+', brand: 'Infinix', category: 'Phone' },
    { name: 'Smart 2', brand: 'Infinix', category: 'Phone' },
    { name: 'Smart 2 HD', brand: 'Infinix', category: 'Phone' },
    { name: 'Smart 2 Pro', brand: 'Infinix', category: 'Phone' },
    { name: 'Smart 3', brand: 'Infinix', category: 'Phone' },
    { name: 'Smart 3 Plus', brand: 'Infinix', category: 'Phone' },
    { name: 'Smart 4', brand: 'Infinix', category: 'Phone' },
    { name: 'Smart 4c', brand: 'Infinix', category: 'Phone' },
    { name: 'Smart 5', brand: 'Infinix', category: 'Phone' },
    { name: 'Smart 6', brand: 'Infinix', category: 'Phone' },
    { name: 'Smart 6 HD', brand: 'Infinix', category: 'Phone' },
    { name: 'Smart 6 Plus', brand: 'Infinix', category: 'Phone' },
    { name: 'Smart 7', brand: 'Infinix', category: 'Phone' },
    { name: 'Smart 7 HD', brand: 'Infinix', category: 'Phone' },
    { name: 'Smart 8', brand: 'Infinix', category: 'Phone' },
    { name: 'Smart 8 HD', brand: 'Infinix', category: 'Phone' },
    { name: 'Smart 8 Pro', brand: 'Infinix', category: 'Phone' },
    { name: 'Smart 8 Plus', brand: 'Infinix', category: 'Phone' },
    { name: 'Smart 9', brand: 'Infinix', category: 'Phone' },
    { name: 'Smart 9 HD', brand: 'Infinix', category: 'Phone' },
    { name: 'Smart 10', brand: 'Infinix', category: 'Phone' },
    { name: 'Smart 10 Plus', brand: 'Infinix', category: 'Phone' },
    { name: 'Smart 10 Pro', brand: 'Infinix', category: 'Phone' },
    { name: 'Smart 10 HD', brand: 'Infinix', category: 'Phone' },
    { name: 'GT 10 Pro', brand: 'Infinix', category: 'Phone' },
    { name: 'GT 20 Pro', brand: 'Infinix', category: 'Phone' },
    { name: 'GT 30 Pro', brand: 'Infinix', category: 'Phone' },
];

const newTecnoModels: Omit<Model, 'id'>[] = [
    { name: 'Camon 12', brand: 'Tecno', category: 'Phone' },
    { name: 'Camon 15', brand: 'Tecno', category: 'Phone' },
    { name: 'Camon 17', brand: 'Tecno', category: 'Phone' },
    { name: 'Camon 18', brand: 'Tecno', category: 'Phone' },
    { name: 'Camon 18P', brand: 'Tecno', category: 'Phone' },
    { name: 'Camon 18 Premier', brand: 'Tecno', category: 'Phone' },
    { name: 'Camon 19', brand: 'Tecno', category: 'Phone' },
    { name: 'Camon 19 Pro', brand: 'Tecno', category: 'Phone' },
    { name: 'Camon 19 Pro 5G', brand: 'Tecno', category: 'Phone' },
    { name: 'Camon 20', brand: 'Tecno', category: 'Phone' },
    { name: 'Camon 20 Pro', brand: 'Tecno', category: 'Phone' },
    { name: 'Camon 20 Pro 5G', brand: 'Tecno', category: 'Phone' },
    { name: 'Camon 20 Premier 5G', brand: 'Tecno', category: 'Phone' },
    { name: 'Camon 30', brand: 'Tecno', category: 'Phone' },
    { name: 'Camon 30 Pro 5G', brand: 'Tecno', category: 'Phone' },
    { name: 'Camon 30 Premier 5G', brand: 'Tecno', category: 'Phone' },
    { name: 'Camon 30S', brand: 'Tecno', category: 'Phone' },
    { name: 'Spark 4', brand: 'Tecno', category: 'Phone' },
    { name: 'Spark 4 Air', brand: 'Tecno', category: 'Phone' },
    { name: 'Spark 4 Lite', brand: 'Tecno', category: 'Phone' },
    { name: 'Spark 6', brand: 'Tecno', category: 'Phone' },
    { name: 'Spark 6 Go', brand: 'Tecno', category: 'Phone' },
    { name: 'Spark 7 Pro', brand: 'Tecno', category: 'Phone' },
    { name: 'Spark 7T', brand: 'Tecno', category: 'Phone' },
    { name: 'Spark 8', brand: 'Tecno', category: 'Phone' },
    { name: 'Spark 8P', brand: 'Tecno', category: 'Phone' },
    { name: 'Spark 8T', brand: 'Tecno', category: 'Phone' },
    { name: 'Spark 9', brand: 'Tecno', category: 'Phone' },
    { name: 'Spark 9T', brand: 'Tecno', category: 'Phone' },
    { name: 'Spark 9 Pro', brand: 'Tecno', category: 'Phone' },
    { name: 'Spark 10C', brand: 'Tecno', category: 'Phone' },
    { name: 'Spark 10', brand: 'Tecno', category: 'Phone' },
    { name: 'Spark 10 Pro', brand: 'Tecno', category: 'Phone' },
    { name: 'Spark 10 5G', brand: 'Tecno', category: 'Phone' },
    { name: 'Spark 20', brand: 'Tecno', category: 'Phone' },
    { name: 'Spark 20C', brand: 'Tecno', category: 'Phone' },
    { name: 'Spark 30', brand: 'Tecno', category: 'Phone' },
    { name: 'Spark 30C', brand: 'Tecno', category: 'Phone' },
    { name: 'Spark 40', brand: 'Tecno', category: 'Phone' },
    { name: 'Spark 40 Pro', brand: 'Tecno', category: 'Phone' },
    { name: 'Spark 40 Pro+', brand: 'Tecno', category: 'Phone' },
    { name: 'Pova', brand: 'Tecno', category: 'Phone' },
    { name: 'Pova 2', brand: 'Tecno', category: 'Phone' },
    { name: 'Pova 4', brand: 'Tecno', category: 'Phone' },
    { name: 'Pova 4 Pro', brand: 'Tecno', category: 'Phone' },
    { name: 'Pova Neo 3', brand: 'Tecno', category: 'Phone' },
    { name: 'Pova 5', brand: 'Tecno', category: 'Phone' },
    { name: 'Pova 5 Pro 5G', brand: 'Tecno', category: 'Phone' },
    { name: 'Pova 6', brand: 'Tecno', category: 'Phone' },
    { name: 'Pova 6 Neo', brand: 'Tecno', category: 'Phone' },
    { name: 'Pova 6 Neo 5G', brand: 'Tecno', category: 'Phone' },
    { name: 'Pova 6 Pro', brand: 'Tecno', category: 'Phone' },
    { name: 'Pova 6 Pro 5G', brand: 'Tecno', category: 'Phone' },
    { name: 'Pova 7', brand: 'Tecno', category: 'Phone' },
    { name: 'Pova 7 Pro', brand: 'Tecno', category: 'Phone' },
    { name: 'Pova 7 Ultra 5G', brand: 'Tecno', category: 'Phone' },
    { name: 'Pova Curve 5G', brand: 'Tecno', category: 'Phone' },
];

const newCatModels: Omit<Model, 'id'>[] = [
    { name: 'B10', brand: 'Caterpillar (Cat)', category: 'Phone' },
    { name: 'B15', brand: 'Caterpillar (Cat)', category: 'Phone' },
    { name: 'B15Q', brand: 'Caterpillar (Cat)', category: 'Phone' },
    { name: 'B25', brand: 'Caterpillar (Cat)', category: 'Phone' },
    { name: 'B26', brand: 'Caterpillar (Cat)', category: 'Phone' },
    { name: 'B30', brand: 'Caterpillar (Cat)', category: 'Phone' },
    { name: 'B35', brand: 'Caterpillar (Cat)', category: 'Phone' },
    { name: 'B100', brand: 'Caterpillar (Cat)', category: 'Phone' },
    { name: 'S22 Flip', brand: 'Caterpillar (Cat)', category: 'Phone' },
    { name: 'S30', brand: 'Caterpillar (Cat)', category: 'Phone' },
    { name: 'S31', brand: 'Caterpillar (Cat)', category: 'Phone' },
    { name: 'S32', brand: 'Caterpillar (Cat)', category: 'Phone' },
    { name: 'S40', brand: 'Caterpillar (Cat)', category: 'Phone' },
    { name: 'S41', brand: 'Caterpillar (Cat)', category: 'Phone' },
    { name: 'S42', brand: 'Caterpillar (Cat)', category: 'Phone' },
    { name: 'S48c', brand: 'Caterpillar (Cat)', category: 'Phone' },
    { name: 'S50', brand: 'Caterpillar (Cat)', category: 'Phone' },
    { name: 'S52', brand: 'Caterpillar (Cat)', category: 'Phone' },
    { name: 'S60', brand: 'Caterpillar (Cat)', category: 'Phone' },
    { name: 'S61', brand: 'Caterpillar (Cat)', category: 'Phone' },
    { name: 'S62 Pro', brand: 'Caterpillar (Cat)', category: 'Phone' },
    { name: 'S75', brand: 'Caterpillar (Cat)', category: 'Phone' },
];

const newSamsungModels: Omit<Model, 'id'>[] = [
    { name: 'M04', brand: 'Samsung', category: 'Phone' },
    { name: 'M10', brand: 'Samsung', category: 'Phone' },
    { name: 'M10s', brand: 'Samsung', category: 'Phone' },
    { name: 'M12', brand: 'Samsung', category: 'Phone' },
    { name: 'M13', brand: 'Samsung', category: 'Phone' },
    { name: 'M13 5G', brand: 'Samsung', category: 'Phone' },
    { name: 'M14 4G', brand: 'Samsung', category: 'Phone' },
    { name: 'M14 5G', brand: 'Samsung', category: 'Phone' },
    { name: 'M15', brand: 'Samsung', category: 'Phone' },
    { name: 'M20', brand: 'Samsung', category: 'Phone' },
    { name: 'M23', brand: 'Samsung', category: 'Phone' },
    { name: 'M30', brand: 'Samsung', category: 'Phone' },
    { name: 'M30s', brand: 'Samsung', category: 'Phone' },
    { name: 'M33 5G', brand: 'Samsung', category: 'Phone' },
    { name: 'M40', brand: 'Samsung', category: 'Phone' },
    { name: 'M53', brand: 'Samsung', category: 'Phone' },
    { name: 'M55 5G', brand: 'Samsung', category: 'Phone' },
    { name: 'Tab A 8.0', brand: 'Samsung', category: 'iPad' },
    { name: 'Tab A7', brand: 'Samsung', category: 'iPad' },
    { name: 'Tab A8', brand: 'Samsung', category: 'iPad' },
    { name: 'Tab A9', brand: 'Samsung', category: 'iPad' },
    { name: 'Tab A9+', brand: 'Samsung', category: 'iPad' },
    { name: 'A01', brand: 'Samsung', category: 'Phone' },
    { name: 'A02s', brand: 'Samsung', category: 'Phone' },
    { name: 'A03', brand: 'Samsung', category: 'Phone' },
    { name: 'A03 CORE', brand: 'Samsung', category: 'Phone' },
    { name: 'A04', brand: 'Samsung', category: 'Phone' },
    { name: 'A04s', brand: 'Samsung', category: 'Phone' },
    { name: 'A05', brand: 'Samsung', category: 'Phone' },
    { name: 'A10', brand: 'Samsung', category: 'Phone' },
    { name: 'A10e', brand: 'Samsung', category: 'Phone' },
    { name: 'A10s', brand: 'Samsung', category: 'Phone' },
    { name: 'A11', brand: 'Samsung', category: 'Phone' },
    { name: 'A12', brand: 'Samsung', category: 'Phone' },
    { name: 'A13', brand: 'Samsung', category: 'Phone' },
    { name: 'A14', brand: 'Samsung', category: 'Phone' },
    { name: 'A14 5G', brand: 'Samsung', category: 'Phone' },
    { name: 'A15', brand: 'Samsung', category: 'Phone' },
    { name: 'A20', brand: 'Samsung', category: 'Phone' },
    { name: 'A20e', brand: 'Samsung', category: 'Phone' },
    { name: 'A20s', brand: 'Samsung', category: 'Phone' },
    { name: 'A23', brand: 'Samsung', category: 'Phone' },
    { name: 'A23 5G', brand: 'Samsung', category: 'Phone' },
    { name: 'A24', brand: 'Samsung', category: 'Phone' },
    { name: 'A30', brand: 'Samsung', category: 'Phone' },
    { name: 'A30s', brand: 'Samsung', category: 'Phone' },
    { name: 'A31', brand: 'Samsung', category: 'Phone' },
    { name: 'A32', brand: 'Samsung', category: 'Phone' },
    { name: 'A32 5G', brand: 'Samsung', category: 'Phone' },
    { name: 'A33 5G', brand: 'Samsung', category: 'Phone' },
    { name: 'A34 5G', brand: 'Samsung', category: 'Phone' },
    { name: 'A35', brand: 'Samsung', category: 'Phone' },
    { name: 'A40', brand: 'Samsung', category: 'Phone' },
    { name: 'A40s', brand: 'Samsung', category: 'Phone' },
    { name: 'A50', brand: 'Samsung', category: 'Phone' },
    { name: 'A50s', brand: 'Samsung', category: 'Phone' },
    { name: 'A52', brand: 'Samsung', category: 'Phone' },
    { name: 'A53', brand: 'Samsung', category: 'Phone' },
    { name: 'A70', brand: 'Samsung', category: 'Phone' },
    { name: 'A71', brand: 'Samsung', category: 'Phone' },
    { name: 'A73 5G', brand: 'Samsung', category: 'Phone' },
    { name: 'A80', brand: 'Samsung', category: 'Phone' },
    { name: 'A90 5G', brand: 'Samsung', category: 'Phone' },
    { name: 'Xcover PRO', brand: 'Samsung', category: 'Phone' },
    { name: 'Xcover 6 PRO', brand: 'Samsung', category: 'Phone' },
    { name: 'Xcover 7', brand: 'Samsung', category: 'Phone' },
    { name: 'F13', brand: 'Samsung', category: 'Phone' },
    { name: 'F15', brand: 'Samsung', category: 'Phone' },
    { name: 'F23', brand: 'Samsung', category: 'Phone' },
    { name: 'F55', brand: 'Samsung', category: 'Phone' },
    { name: 'Z Flip 3', brand: 'Samsung', category: 'Phone' },
    { name: 'Note 9', brand: 'Samsung', category: 'Phone' },
    { name: 'Note 10', brand: 'Samsung', category: 'Phone' },
    { name: 'Note 10 5G', brand: 'Samsung', category: 'Phone' },
    { name: 'Note 10+', brand: 'Samsung', category: 'Phone' },
    { name: 'Note 20', brand: 'Samsung', category: 'Phone' },
    { name: 'Note 20 5G', brand: 'Samsung', category: 'Phone' },
    { name: 'Note 20 ULTRA', brand: 'Samsung', category: 'Phone' },
    { name: 'Z Flip 4', brand: 'Samsung', category: 'Phone' },
    { name: 'Z Flip 5', brand: 'Samsung', category: 'Phone' },
    { name: 'Z Fold 3', brand: 'Samsung', category: 'Phone' },
    { name: 'Z Fold 4', brand: 'Samsung', category: 'Phone' },
    { name: 'Z Fold 5', brand: 'Samsung', category: 'Phone' },
    { name: 'S10', brand: 'Samsung', category: 'Phone' },
    { name: 'S10 5G', brand: 'Samsung', category: 'Phone' },
    { name: 'S10+', brand: 'Samsung', category: 'Phone' },
    { name: 'S10e', brand: 'Samsung', category: 'Phone' },
    { name: 'S20 FE 2022', brand: 'Samsung', category: 'Phone' },
    { name: 'S20 ULTRA', brand: 'Samsung', category: 'Phone' },
    { name: 'S21', brand: 'Samsung', category: 'Phone' },
    { name: 'S21 FE 5G', brand: 'Samsung', category: 'Phone' },
    { name: 'S21+', brand: 'Samsung', category: 'Phone' },
    { name: 'S22', brand: 'Samsung', category: 'Phone' },
    { name: 'S22+', brand: 'Samsung', category: 'Phone' },
    { name: 'S22 ULTRA 5G', brand: 'Samsung', category: 'Phone' },
    { name: 'S23', brand: 'Samsung', category: 'Phone' },
    { name: 'S23 FE', brand: 'Samsung', category: 'Phone' },
    { name: 'S23+', brand: 'Samsung', category: 'Phone' },
    { name: 'S23 ULTRA', brand: 'Samsung', category: 'Phone' },
    { name: 'S24', brand: 'Samsung', category: 'Phone' },
    { name: 'S24+', brand: 'Samsung', category: 'Phone' },
    { name: 'S24 ULTRA', brand: 'Samsung', category: 'Phone' },
];

const newSonyModels: Omit<Model, 'id'>[] = [
    { name: 'Xperia Z3', brand: 'Sony', category: 'Phone' },
    { name: 'Xperia Z3 Compact', brand: 'Sony', category: 'Phone' },
    { name: 'Xperia Z5', brand: 'Sony', category: 'Phone' },
    { name: 'Xperia Z5 Compact', brand: 'Sony', category: 'Phone' },
    { name: 'Xperia XZ', brand: 'Sony', category: 'Phone' },
    { name: 'Xperia XZ1', brand: 'Sony', category: 'Phone' },
    { name: 'Xperia XZ2', brand: 'Sony', category: 'Phone' },
    { name: 'Xperia XZ3', brand: 'Sony', category: 'Phone' },
    { name: 'Xperia 1', brand: 'Sony', category: 'Phone' },
    { name: 'Xperia 1 II', brand: 'Sony', category: 'Phone' },
    { name: 'Xperia 1 III', brand: 'Sony', category: 'Phone' },
    { name: 'Xperia 1 IV', brand: 'Sony', category: 'Phone' },
    { name: 'Xperia 5', brand: 'Sony', category: 'Phone' },
    { name: 'Xperia 5 II', brand: 'Sony', category: 'Phone' },
    { name: 'Xperia 5 III', brand: 'Sony', category: 'Phone' },
    { name: 'Xperia 10', brand: 'Sony', category: 'Phone' },
    { name: 'Xperia 10 II', brand: 'Sony', category: 'Phone' },
    { name: 'Xperia 10 III', brand: 'Sony', category: 'Phone' },
    { name: 'Xperia 10 IV', brand: 'Sony', category: 'Phone' },
    { name: 'Xperia L1', brand: 'Sony', category: 'Phone' },
    { name: 'Xperia L2', brand: 'Sony', category: 'Phone' },
    { name: 'Xperia L3', brand: 'Sony', category: 'Phone' },
    { name: 'Xperia L4', brand: 'Sony', category: 'Phone' },
    { name: 'Xperia XA', brand: 'Sony', category: 'Phone' },
    { name: 'Xperia XA1', brand: 'Sony', category: 'Phone' },
    { name: 'Xperia XA2', brand: 'Sony', category: 'Phone' },
    { name: 'Xperia XA2 Ultra', brand: 'Sony', category: 'Phone' },
    { name: 'Xperia XZ Premium', brand: 'Sony', category: 'Phone' },
    { name: 'Xperia X Compact', brand: 'Sony', category: 'Phone' },
];

const processSamsungModels = (models: Omit<Model, 'id'>[]): Omit<Model, 'id'>[] => {
    const modelMap = new Map<string, Omit<Model, 'id'>>();

    models.forEach(model => {
        let name = model.name;
        if (!name.toLowerCase().startsWith('galaxy')) {
            name = `Galaxy ${name}`;
        }
        
        // Ensure consistency (e.g., "Galaxy Note 10+" instead of "Galaxy  Note 10 +")
        name = name.replace(/\s+/g, ' ').trim();

        // Use a consistent key for the map to prevent duplicates
        const key = name.toLowerCase();
        if (!modelMap.has(key)) {
            modelMap.set(key, { ...model, name });
        }
    });

    return Array.from(modelMap.values());
};

const finalSamsungModels = processSamsungModels(newSamsungModels);


export async function seedDatabase() {
    console.log("Checking database for seeding...");
    
    try {
        const batch = writeBatch(db);
        
        // --- Services Seeding ---
        const servicesCollection = collection(db, "services");
        const servicesSnapshot = await getDocs(servicesCollection);
        if (servicesSnapshot.empty) {
            services.forEach((service: Service) => {
                const docRef = doc(servicesCollection, service.id);
                const { id, ...serviceData } = service;
                const cleanService = JSON.parse(JSON.stringify(serviceData));
                batch.set(docRef, cleanService);
            });
            console.log("Services queued for initial seeding.");
        } else {
             console.log("Services collection is not empty, skipping service seeding.");
        }

        const modelsCollection = collection(db, "models");
        const brandsCollection = collection(db, "brands");
        const existingModelsSnapshot = await getDocs(modelsCollection);
        const existingModelNames = new Set(existingModelsSnapshot.docs.map(d => `${d.data().brand} ${d.data().name}`));

        // --- Alcatel Models Seeding ---
        const alcatelQuery = query(collection(db, 'brands'), where('name', '==', 'Alcatel'));
        const alcatelSnapshot = await getDocs(alcatelQuery);
        if (alcatelSnapshot.empty) {
            batch.set(doc(brandsCollection), { name: 'Alcatel' });
            console.log("Alcatel brand queued for seeding.");
        }
        
        newAlcatelModels.forEach(model => {
            const modelIdentifier = `${model.brand} ${model.name}`;
            if (!existingModelNames.has(modelIdentifier)) {
                const newModelRef = doc(modelsCollection);
                batch.set(newModelRef, model);
                console.log(`Model ${model.name} queued for seeding.`);
            }
        });
        
        // --- Huawei Models Seeding ---
        const huaweiQuery = query(collection(db, 'brands'), where('name', '==', 'Huawei'));
        const huaweiSnapshot = await getDocs(huaweiQuery);
        if (huaweiSnapshot.empty) {
            batch.set(doc(brandsCollection), { name: 'Huawei' });
            console.log("Huawei brand queued for seeding.");
        }
        
        newHuaweiModels.forEach(model => {
            const modelIdentifier = `${model.brand} ${model.name}`;
            if (!existingModelNames.has(modelIdentifier)) {
                const newModelRef = doc(modelsCollection);
                batch.set(newModelRef, model);
                console.log(`Model ${model.name} queued for seeding.`);
            }
        });

        // --- iPhone Models Seeding ---
        const appleQuery = query(collection(db, 'brands'), where('name', '==', 'Apple'));
        const appleSnapshot = await getDocs(appleQuery);
        if (appleSnapshot.empty) {
            batch.set(doc(brandsCollection), { name: 'Apple' });
            console.log("Apple brand queued for seeding.");
        }
        
        newIphoneModels.forEach(model => {
            const modelIdentifier = `${model.brand} ${model.name}`;
            if (!existingModelNames.has(modelIdentifier)) {
                const newModelRef = doc(modelsCollection);
                batch.set(newModelRef, model);
                console.log(`Model ${model.name} queued for seeding.`);
            }
        });
        
        // --- Google Models Seeding ---
        const googleQuery = query(collection(db, 'brands'), where('name', '==', 'Google'));
        const googleSnapshot = await getDocs(googleQuery);
        if (googleSnapshot.empty) {
            batch.set(doc(brandsCollection), { name: 'Google' });
            console.log("Google brand queued for seeding.");
        }
        
        newGoogleModels.forEach(model => {
            const modelIdentifier = `${model.brand} ${model.name}`;
            if (!existingModelNames.has(modelIdentifier)) {
                const newModelRef = doc(modelsCollection);
                batch.set(newModelRef, model);
                console.log(`Model ${model.name} queued for seeding.`);
            }
        });

        // --- Honor Models Seeding ---
        const honorQuery = query(collection(db, 'brands'), where('name', '==', 'Honor'));
        const honorSnapshot = await getDocs(honorQuery);
        if (honorSnapshot.empty) {
            batch.set(doc(brandsCollection), { name: 'Honor' });
            console.log("Honor brand queued for seeding.");
        }

        const uniqueHonorModels = new Map();
        newHonorModels.forEach(model => uniqueHonorModels.set(model.name, model));

        Array.from(uniqueHonorModels.values()).forEach(model => {
            const modelIdentifier = `${model.brand} ${model.name}`;
            if (!existingModelNames.has(modelIdentifier)) {
                const newModelRef = doc(modelsCollection);
                batch.set(newModelRef, model);
                console.log(`Model ${model.name} queued for seeding.`);
            }
        });

        // --- LG Models Seeding ---
        const lgQuery = query(collection(db, 'brands'), where('name', '==', 'LG'));
        const lgSnapshot = await getDocs(lgQuery);
        if (lgSnapshot.empty) {
            batch.set(doc(brandsCollection), { name: 'LG' });
            console.log("LG brand queued for seeding.");
        }

        const uniqueLgModels = new Map();
        newLgModels.forEach(model => uniqueLgModels.set(model.name, model));

        Array.from(uniqueLgModels.values()).forEach(model => {
            const modelIdentifier = `${model.brand} ${model.name}`;
            if (!existingModelNames.has(modelIdentifier)) {
                const newModelRef = doc(modelsCollection);
                batch.set(newModelRef, model);
                console.log(`Model ${model.name} queued for seeding.`);
            }
        });
        
        // --- Oppo Models Seeding ---
        const oppoQuery = query(collection(db, 'brands'), where('name', '==', 'Oppo'));
        const oppoSnapshot = await getDocs(oppoQuery);
        if (oppoSnapshot.empty) {
            batch.set(doc(brandsCollection), { name: 'Oppo' });
            console.log("Oppo brand queued for seeding.");
        }

        const uniqueOppoModels = new Map();
        newOppoModels.forEach(model => uniqueOppoModels.set(model.name, model));

        Array.from(uniqueOppoModels.values()).forEach(model => {
            const modelIdentifier = `${model.brand} ${model.name}`;
            if (!existingModelNames.has(modelIdentifier)) {
                const newModelRef = doc(modelsCollection);
                batch.set(newModelRef, model);
                console.log(`Model ${model.name} queued for seeding.`);
            }
        });

        // --- Nokia Models Seeding ---
        const nokiaQuery = query(collection(db, 'brands'), where('name', '==', 'Nokia'));
        const nokiaSnapshot = await getDocs(nokiaQuery);
        if (nokiaSnapshot.empty) {
            batch.set(doc(brandsCollection), { name: 'Nokia' });
            console.log("Nokia brand queued for seeding.");
        }

        const uniqueNokiaModels = new Map();
        newNokiaModels.forEach(model => uniqueNokiaModels.set(model.name, model));

        Array.from(uniqueNokiaModels.values()).forEach(model => {
            const modelIdentifier = `${model.brand} ${model.name}`;
            if (!existingModelNames.has(modelIdentifier)) {
                const newModelRef = doc(modelsCollection);
                batch.set(newModelRef, model);
                console.log(`Model ${model.name} queued for seeding.`);
            }
        });

        // --- OnePlus Models Seeding ---
        const oneplusQuery = query(collection(db, 'brands'), where('name', '==', 'OnePlus'));
        const oneplusSnapshot = await getDocs(oneplusQuery);
        if (oneplusSnapshot.empty) {
            batch.set(doc(brandsCollection), { name: 'OnePlus' });
            console.log("OnePlus brand queued for seeding.");
        }
        
        const uniqueOnePlusModels = new Map();
        newOnePlusModels.forEach(model => uniqueOnePlusModels.set(model.name, model));

        Array.from(uniqueOnePlusModels.values()).forEach(model => {
            const modelIdentifier = `${model.brand} ${model.name}`;
            if (!existingModelNames.has(modelIdentifier)) {
                const newModelRef = doc(modelsCollection);
                batch.set(newModelRef, model);
                console.log(`Model ${model.name} queued for seeding.`);
            }
        });

        // --- TCL Models Seeding ---
        const tclQuery = query(collection(db, 'brands'), where('name', '==', 'TCL'));
        const tclSnapshot = await getDocs(tclQuery);
        if (tclSnapshot.empty) {
            batch.set(doc(brandsCollection), { name: 'TCL' });
            console.log("TCL brand queued for seeding.");
        }
        
        const uniqueTclModels = new Map();
        newTclModels.forEach(model => uniqueTclModels.set(model.name, model));

        Array.from(uniqueTclModels.values()).forEach(model => {
            const modelIdentifier = `${model.brand} ${model.name}`;
            if (!existingModelNames.has(modelIdentifier)) {
                const newModelRef = doc(modelsCollection);
                batch.set(newModelRef, model);
                console.log(`Model ${model.name} queued for seeding.`);
            }
        });

        // --- ZTE Models Seeding ---
        const zteQuery = query(collection(db, 'brands'), where('name', '==', 'ZTE'));
        const zteSnapshot = await getDocs(zteQuery);
        if (zteSnapshot.empty) {
            batch.set(doc(brandsCollection), { name: 'ZTE' });
            console.log("ZTE brand queued for seeding.");
        }
        
        const uniqueZteModels = new Map();
        newZteModels.forEach(model => uniqueZteModels.set(model.name, model));

        Array.from(uniqueZteModels.values()).forEach(model => {
            const modelIdentifier = `${model.brand} ${model.name}`;
            if (!existingModelNames.has(modelIdentifier)) {
                const newModelRef = doc(modelsCollection);
                batch.set(newModelRef, model);
                console.log(`Model ${model.name} queued for seeding.`);
            }
        });

        // --- Infinix Models Seeding ---
        const infinixQuery = query(collection(db, 'brands'), where('name', '==', 'Infinix'));
        const infinixSnapshot = await getDocs(infinixQuery);
        if (infinixSnapshot.empty) {
            batch.set(doc(brandsCollection), { name: 'Infinix' });
            console.log("Infinix brand queued for seeding.");
        }
        
        const uniqueInfinixModels = new Map();
        newInfinixModels.forEach(model => uniqueInfinixModels.set(model.name, model));

        Array.from(uniqueInfinixModels.values()).forEach(model => {
            const modelIdentifier = `${model.brand} ${model.name}`;
            if (!existingModelNames.has(modelIdentifier)) {
                const newModelRef = doc(modelsCollection);
                batch.set(newModelRef, model);
                console.log(`Model ${model.name} queued for seeding.`);
            }
        });

        // --- Tecno Models Seeding ---
        const tecnoQuery = query(collection(db, 'brands'), where('name', '==', 'Tecno'));
        const tecnoSnapshot = await getDocs(tecnoQuery);
        if (tecnoSnapshot.empty) {
            batch.set(doc(brandsCollection), { name: 'Tecno' });
            console.log("Tecno brand queued for seeding.");
        }
        
        const uniqueTecnoModels = new Map();
        newTecnoModels.forEach(model => uniqueTecnoModels.set(model.name, model));

        Array.from(uniqueTecnoModels.values()).forEach(model => {
            const modelIdentifier = `${model.brand} ${model.name}`;
            if (!existingModelNames.has(modelIdentifier)) {
                const newModelRef = doc(modelsCollection);
                batch.set(newModelRef, model);
                console.log(`Model ${model.name} queued for seeding.`);
            }
        });

        // --- Caterpillar (Cat) Models Seeding ---
        const catQuery = query(collection(db, 'brands'), where('name', '==', 'Caterpillar (Cat)'));
        const catSnapshot = await getDocs(catQuery);
        if (catSnapshot.empty) {
            batch.set(doc(brandsCollection), { name: 'Caterpillar (Cat)' });
            console.log("Caterpillar (Cat) brand queued for seeding.");
        }
        
        const uniqueCatModels = new Map();
        newCatModels.forEach(model => uniqueCatModels.set(model.name, model));

        Array.from(uniqueCatModels.values()).forEach(model => {
            const modelIdentifier = `${model.brand} ${model.name}`;
            if (!existingModelNames.has(modelIdentifier)) {
                const newModelRef = doc(modelsCollection);
                batch.set(newModelRef, model);
                console.log(`Model ${model.name} queued for seeding.`);
            }
        });

        // --- Samsung Models Seeding ---
        const samsungQuery = query(collection(db, 'brands'), where('name', '==', 'Samsung'));
        const samsungSnapshot = await getDocs(samsungQuery);
        if (samsungSnapshot.empty) {
            batch.set(doc(brandsCollection), { name: 'Samsung' });
            console.log("Samsung brand queued for seeding.");
        }

        finalSamsungModels.forEach(model => {
            const modelIdentifier = `${model.brand} ${model.name}`;
            if (!existingModelNames.has(modelIdentifier)) {
                const newModelRef = doc(modelsCollection);
                batch.set(newModelRef, model);
                console.log(`Model ${model.name} queued for seeding.`);
            }
        });

        // --- Sony Models Seeding ---
        const sonyQuery = query(collection(db, 'brands'), where('name', '==', 'Sony'));
        const sonySnapshot = await getDocs(sonyQuery);
        if (sonySnapshot.empty) {
            batch.set(doc(brandsCollection), { name: 'Sony' });
            console.log("Sony brand queued for seeding.");
        }
        
        const uniqueSonyModels = new Map();
        newSonyModels.forEach(model => uniqueSonyModels.set(model.name, model));

        Array.from(uniqueSonyModels.values()).forEach(model => {
            const modelIdentifier = `${model.brand} ${model.name}`;
            if (!existingModelNames.has(modelIdentifier)) {
                const newModelRef = doc(modelsCollection);
                batch.set(newModelRef, model);
                console.log(`Model ${model.name} queued for seeding.`);
            }
        });

        await batch.commit();
        console.log("Database seed completed successfully!");


        return { success: true, message: "Database check/seed completed." };
    } catch (error) {
        console.error("Error seeding database:", error);
        return { success: false, message: "Error seeding database." };
    }
}

    

    
