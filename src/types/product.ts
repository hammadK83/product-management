export type Product = {
    name: string;
    description: string;
    price: number;
    imageData: string; // Base64 encoded image data
};

export type ProductRecord = {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    createdAt: string;
    updatedAt: string;
};