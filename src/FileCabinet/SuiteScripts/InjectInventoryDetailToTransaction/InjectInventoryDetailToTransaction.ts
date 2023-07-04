/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @developer Esteban Damazio edamazzio@gmail.com
 */

import {EntryPoints} from "N/types";
import {FieldDisplayType, FieldType} from "N/ui/serverWidget";
import {log, record, search} from "N";
import {LookupValueObject} from "N/search";


export function beforeLoad(context: EntryPoints.UserEvent.beforeLoadContext) {

    log.debug("context.type", context.type);

    const inventoryDetailFieldId = "custpage_inj_inventory_detail";
    const {type, id} = context.newRecord;
    if (!type || !id) {
        return;
    }
    const currentRecord = record.load({id, type});

    context.form.addField({
        id: inventoryDetailFieldId,
        label: "",
        type: FieldType.LONGTEXT
    }).updateDisplayType({displayType: FieldDisplayType.HIDDEN});

    const itemCount = currentRecord.getLineCount({sublistId: "item"});
    const inventoryDetails = {};
    for (let line = 0; line < itemCount; line++) {
        const inventoryDetailId = currentRecord.getSublistValue({sublistId: "item", line, fieldId: "inventorydetail"});
        if (inventoryDetailId) {
            inventoryDetails[line] = getInventoryDetail(inventoryDetailId as string)
        }
    }

    context.newRecord.setValue({fieldId: inventoryDetailFieldId, value: JSON.stringify(inventoryDetails)});

}

function getInventoryDetail(inventoryDetailId: string) {
    const inventoryDetail = search.lookupFields({
        type: "inventorydetail",
        id: inventoryDetailId,
        columns: ["inventorynumber", "expirationdate"]
    });

    const inventoryNumber = inventoryDetail.inventorynumber as LookupValueObject[]

    inventoryDetail.inventorynumber = inventoryNumber && inventoryNumber.length ?
        inventoryDetail.inventorynumber[0].text
        : "";

    return inventoryDetail;

}