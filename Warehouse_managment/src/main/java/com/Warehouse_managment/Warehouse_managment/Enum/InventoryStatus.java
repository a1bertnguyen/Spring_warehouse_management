package com.Warehouse_managment.Warehouse_managment.Enum;

import com.fasterxml.jackson.annotation.JsonValue;

public enum InventoryStatus {
    UNKNOWN("Not Determined"),
    OUT_OF_STOCK("Out of stock"),
    LOW_STOCK("Almost low stock"),
    AVAILABLE("Available");

    private final String label;

    InventoryStatus(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }
}
