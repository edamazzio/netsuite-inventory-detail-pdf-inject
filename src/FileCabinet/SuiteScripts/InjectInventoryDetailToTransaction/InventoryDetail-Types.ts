/**
 * @NModuleScope SameAccount
 * @developer Esteban Damazio edamazzio@gmail.com
 */

export type InventoryDetail = {
    expirationdate: string;
    inventorynumber: string,
    quantity: string;
}

export type InventoryDetailById = { [inventoryDetailId: string]: InventoryDetail[] }

export type IventoryDetailsByLine = { [line: string]: InventoryDetail[] }

export type InventoryDetailIdPerLine = { [line: string]: string }