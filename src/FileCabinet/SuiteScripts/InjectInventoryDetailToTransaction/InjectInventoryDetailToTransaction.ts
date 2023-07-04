/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @developer Esteban Damazio edamazzio@gmail.com
 */

import {EntryPoints} from "N/types";
import {FieldDisplayType, FieldType, Form} from "N/ui/serverWidget";
import {log, record, search} from "N";
import {LookupValueObject} from "N/search";

const FIELD_ID = "custpage_inj_inventory_detail";

export function beforeLoad(context: EntryPoints.UserEvent.beforeLoadContext) {

    if (context.type == context.UserEventType.PRINT) {
        injectInventoryDetail(context)
    }
}

function injectInventoryDetail(context: EntryPoints.UserEvent.beforeLoadContext) {
    const {type, id} = context.newRecord;
    if (!type || !id) {
        return;
    }
    addFormField(context.form);
    const tranasctionRecord = record.load({id, type, isDynamic: false});
    const inventoryDetails = buildInventoryDetailJSON(tranasctionRecord);
    log.debug(`Inventory details for ${type} ${id}`, inventoryDetails);
    context.newRecord.setValue({fieldId: FIELD_ID, value: JSON.stringify(inventoryDetails)});
}

function addFormField(form: Form) {
    form.addField({
        id: FIELD_ID,
        label: FIELD_ID,
        type: FieldType.LONGTEXT
    }).updateDisplayType({displayType: FieldDisplayType.HIDDEN});
}

function buildInventoryDetailJSON(transactionRecord: record.Record) {
    const itemCount = transactionRecord.getLineCount({sublistId: "item"});
    const inventoryDetails = {};
    for (let line = 0; line < itemCount; line++) {
        const inventoryDetailId = transactionRecord.getSublistValue({
            sublistId: "item",
            line,
            fieldId: "inventorydetail"
        });
        if (inventoryDetailId) {
            inventoryDetails[line] = getInventoryDetail(inventoryDetailId as string)
        }
    }
    return inventoryDetails;
}

function getInventoryDetail(inventoryDetailId: string) {
    const inventoryDetail = search.lookupFields({
        type: "inventorydetail",
        id: inventoryDetailId,
        columns: ["inventorynumber", "expirationdate"]
    });

    return inventoryDetail;
}