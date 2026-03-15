export interface IUser {
    userId: number;
    name: string;
    email: string;
    contact: string;
    passwordHash: string;
    role: string; // "Admin" or "Doctor"
    admin?: IAdmin; // Optional, since it's a one-to-one relation
    doctor?: IDoctor; // Optional, since it's a one-to-one relation
  }
  export interface IAdmin {
    adminId: number;
    adminName: string;
    userId: number;
    adminRole: string; 
    adminEmail:string;// "DrugAdmin", "OrderAdmin", etc.
    user?: IUser; // Optional to avoid circular reference
  }
  export interface IDoctor {
    doctorId: number;
    doctorName: string;
    userId: number;
    specialization: string;
    user?: IUser; // Optional to avoid circular reference
    orders?: IOrder[]; // Optional
    payments?: IPayment[]; // Optional
  }
  export interface IStockAlert{
    id:number;
    drugName:string;
    image:string;
    message:string;
    alertDate:Date
    isResolved:boolean;
  }
export interface IDrug {
  drugId: number;
  name: string;
  price: number;
  manufacturer: string;
  description: string;
  quantity: number;
  image: string;
  rating: number;
  reviewCount: number;
  ingredients: string;
  storage: string;
  warnings: string;
  quantityPerPack: string;
  expiryDate: Date;
  prescriptionRequired: boolean;
  category: string;
  usage: string;
}
// src/app/interfaces/review.model.ts
export interface Review {
  reviewId?: number;
  userEmail: string;
  drugName: string;
  comment: string;
  rating: number;
  date?: Date;
}


  export interface IInventory {
    inventoryId: number;
    drugName: string;
    stockQuantity: number;
    pricePerUnit: number;
    expiryDate: Date;
    lastUpdated: Date;
    image:string;
  }
  export interface ILogin {
    email: string;
    password: string;
  }
  export interface IOrder {
    orderId: number;
    drugName: string;
    doctorId: number;
    doctorName: string;
    status: string;
    isVerified: boolean;
    orderDate: string; // Date as string (ISO format)
    orderDetails: IOrderDetail[]; // Assuming OrderDetail interface exists
  }
  export interface IForgotPassword{
    email: string;
    newPassword: string;
    otp: string;
  }
  export interface IOrderDetail {
    orderDetailId: number;
    orderId: number;
    drugId: number;
    drugName: string;
    quantity: number;
    price: number;
    image:string;
  }
  export interface IOrderItem {
    //paymentId: number;
    OrderItemId:number;
    orderId?: number;
    drugName: string;  // Doctor provides only the Name
    quantity: number;
    price: number;
    image?: string;
    orderDate?: string;  // ✅ Added manually from `IOrder`
    orderStatus?: string; // ✅ Added manually from `IOrder`
}
  export interface IOrderRequest {
    orderItems: IOrderItem[];
  }
  export interface IOtpLogin {
    email: string;
    otp: string;
  }
  export interface IOtpRecords {
    id: number;
    email: string;
    otp: string;
    expirationTime: Date;
  }
  export interface IPayment {
    paymentId: number;
    orderId: number;
    drugName: string;
    doctorName: string;
    amount: number;
    paymentDate: Date;
    doctorId: number;
    isVerified: boolean;
    paymentMethod?: number; // 0: UPI, 1: Cash, 2: Debit Card, etc.
    upiApp?: string;
    transactionId?: string;

  }
  export interface IPaymentRequest {
    doctorEmail: string;
    drugNames: string[];
  }
  export interface IRegister {
    name: string;
    email: string;
    contact: string;
    password: string;
    role: string;
    adminRole?: string;
    specialization?: string;
  }
  export interface IRequestOtp {
    email: string;
  }
  export interface ISales {
    salesId: number;
    drugName: string;
    quantity: number;
    price: number;
    total: number;
    saleDate: Date;
    doctorId: number;
    image:string;
  }
  export interface ISupplier {
    supplierId: number;
    name: string;
    contactInfo: string;
    email: string;
    address: string;
  }
  export interface ISupplierDrug {
    supplierDrugId: number;
    supplierId: number;
    supplierName: string;
    supplierEmail: string;
    drugId: number;
    drugName: string;
    image:string;
  }
                                    
  interface ICartItem extends IOrderItem {
    image?: string;
  }
 
  // Example: Move cartItems inside a class or function
  class Cart {
    cartItems: ICartItem[] = [];
  }
  interface DrugWithStock extends IDrug {
  isOutOfStock?: boolean;
}
