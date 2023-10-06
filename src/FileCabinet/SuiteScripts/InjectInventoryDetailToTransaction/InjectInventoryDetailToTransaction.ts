/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @developer Esteban Damazio edamazzio@gmail.com
 */

import {EntryPoints} from "N/types";
import {FieldDisplayType, FieldType, Form} from "N/ui/serverWidget";
import {log, record, search} from "N";
import {
    InventoryDetail,
    InventoryDetailById,
    InventoryDetailIdPerLine,
    IventoryDetailsByLine
} from "./InventoryDetail-Types";

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
    const inventoryDetailsPerLine = getInventoryDetailsPerLine(tranasctionRecord);
    const inventoryDetailData = searchInventoryDetails(Object.values(inventoryDetailsPerLine));
    const inventoryDetailsJSON = buildInventoryDetailsJSON(inventoryDetailData, inventoryDetailsPerLine);
    log.debug(`Inventory details for ${type} ${id}`, inventoryDetailsJSON);
    context.newRecord.setValue({fieldId: FIELD_ID, value: JSON.stringify(inventoryDetailsJSON)});
}

function addFormField(form: Form) {
    form.addField({
        id: FIELD_ID,
        label: FIELD_ID,
        type: FieldType.LONGTEXT
    }).updateDisplayType({displayType: FieldDisplayType.HIDDEN});
}

function getInventoryDetailsPerLine(transactionRecord: record.Record): InventoryDetailIdPerLine {
    const itemCount = transactionRecord.getLineCount({sublistId: "item"});
    const inventoryDetailIdPerLine = {};
    for (let line = 0; line < itemCount; line++) {
        const inventoryDetailId = transactionRecord.getSublistValue({
            sublistId: "item",
            line,
            fieldId: "inventorydetail"
        });
        if (inventoryDetailId) {
            inventoryDetailIdPerLine[line.toString()] = inventoryDetailId
        }
    }
    return inventoryDetailIdPerLine;
}

function searchInventoryDetails(inventoryDetailIds: string[]): InventoryDetailById {
    if (!inventoryDetailIds || !inventoryDetailIds.length) {
        return {};
    }
    const inventorydetailSearchResults = search.create({
        type: "inventorydetail",
        filters:
            [
                search.createFilter({name: "internalid", operator: search.Operator.ANYOF, values: inventoryDetailIds})
            ],
        columns:
            [
                search.createColumn({
                    name: "inventorynumber",
                }),
                search.createColumn({name: "expirationdate"}),
                search.createColumn({name: "quantity"}),
            ]
    }).run().getRange({start: 0, end: 1000});
    const inventoryDetailsById: InventoryDetailById = {};
    for (const inventorydetailSearchResult of inventorydetailSearchResults) {
        const id = inventorydetailSearchResult.id;
        const inventoryDetail: InventoryDetail = {
            expirationdate: inventorydetailSearchResult.getValue("expirationdate")?.toString(),
            inventorynumber: inventorydetailSearchResult.getText("inventorynumber"),
            quantity: inventorydetailSearchResult.getValue("quantity")?.toString(),
        };
        if (!inventoryDetailsById[id.toString()]) {
            inventoryDetailsById[id.toString()] = [inventoryDetail]
        } else {
            inventoryDetailsById[id.toString()].push(inventoryDetail)
        }
    }
    return inventoryDetailsById;
}

function buildInventoryDetailsJSON(inventoryDetailById: InventoryDetailById, inventoryDetailIdPerLine: InventoryDetailIdPerLine): IventoryDetailsByLine {
    const inventoryDetail: IventoryDetailsByLine = {};
    for (const [line, inventoryId] of Object.entries(inventoryDetailIdPerLine)) {
        inventoryDetail[line] = inventoryDetailById[inventoryId]
    }
    return inventoryDetail;
}
