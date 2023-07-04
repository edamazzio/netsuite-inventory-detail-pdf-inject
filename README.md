# netsuite-inventory-detail-pdf-inject
A user event script that injects the inventory detail details (lol) to be able to extract mainly the lot expiration date and use it on PDF templates

This will create form field according to ID on `FIELD_ID`. This can then be used in an Advanced HTML/PDF template as follows:


```
...
<#if record.item?has_content>
  <#if record.custpage_inj_inventory_detail?? && record.custpage_inj_inventory_detail?has_content>
    <#assign inventoryDetail = (record.custpage_inj_inventory_detail!"{}")?eval_json>
  </#if>
  <#list record.item as item>
    ...
    <td>
      <#if inventoryDetail?? && inventoryDetail[item_index?string]?? && inventoryDetail[item_index?string]["expirationdate"]?has_content>
        ${inventoryDetail[item_index?string]["expirationdate"]}
      </#if>
    </td>
    ...
  </#list>
</#if>
...
