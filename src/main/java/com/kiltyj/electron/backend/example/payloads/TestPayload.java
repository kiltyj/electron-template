package com.kiltyj.electron.backend.example.payloads;

import java.util.Map;

public class TestPayload {

    private final int integer;
    private final int[] array;
    private final String string;
    private final Map map;

    public TestPayload(int integer, int[] array, String string, Map map) {
        this.integer = integer;
        this.array = array;
        this.string = string;
        this.map = map;
    }
}
