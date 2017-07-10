package com.kiltyj.electron.backend.rpc;

public interface EventEmitter {
    void emitEvent(String type, String service, Object payload);
}
